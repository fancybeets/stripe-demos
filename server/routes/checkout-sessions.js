const express = require('express');
const router = express.Router();
const { extractStripeRequestId } = require('../middleware/stripeResponseLogger');
const { createStripeInstance, getStripeConfig } = require('../middleware/stripeInstance');

// Default checkout session - created upfront with all details
router.post('/create-session/default', async (req, res) => {
  try {
    const { amount, currency = 'usd', paymentMethods, country = 'US', quantity = 1, implementation, mode, currentQueryString } = req.body;
    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    // Build return URL with query parameters
    // Start from the current query string (if provided) to preserve things like logs=open
    // Don't encode the session_id placeholder - Stripe needs the literal string
    // Remove leading ? if present, as URLSearchParams handles the query string without it
    const cleanQueryString = currentQueryString?.startsWith('?')
      ? currentQueryString.slice(1)
      : currentQueryString;

    const returnParams = cleanQueryString
      ? new URLSearchParams(cleanQueryString)
      : new URLSearchParams();

    // Override with current payment options
    if (implementation) returnParams.set('implementation', implementation);
    if (mode) returnParams.set('mode', mode);
    if (country) returnParams.set('country', country);
    if (currency) returnParams.set('currency', currency);
    if (amount) returnParams.set('amount', amount);
    if (paymentMethods) {
      returnParams.set('paymentMethods', Array.isArray(paymentMethods) ? paymentMethods.join(',') : paymentMethods);
    }

    const baseUrl = `${req.headers.origin || 'http://localhost:3000'}/checkout-sessions`;
    const queryString = returnParams.toString();
    const returnUrl = queryString
      ? `${baseUrl}?session_id={CHECKOUT_SESSION_ID}&${queryString}`
      : `${baseUrl}?session_id={CHECKOUT_SESSION_ID}`;

    const sessionParams = {
      mode: 'payment',
      ui_mode: 'custom',
      return_url: returnUrl,
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: 'Potato',
            images: ['https://stripe.erintaylor.dev/potato.png'],
          },
          unit_amount: amount || 2000,
        },
        quantity: parseInt(quantity) || 1,
      }],
    };

    // If specific payment methods are provided, use payment_method_types
    // Otherwise let Stripe automatically enable payment methods
    if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      sessionParams.payment_method_types = paymentMethods;
    }
    // If no payment methods specified, don't set payment_method_types
    // This allows Stripe to automatically enable appropriate payment methods

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      publishableKey,
      stripeRequestId: session.lastResponse?.requestId || null,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      stripeRequestId: extractStripeRequestId(error),
    });
  }
});

// Config endpoint
router.get('/config', (req, res) => {
  try {
    const country = req.query.country || 'US';
    const { publishableKey } = getStripeConfig(country);

    res.json({
      publishableKey,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

module.exports = router;
