const express = require('express');
const router = express.Router();
const { extractStripeRequestId } = require('../middleware/stripeResponseLogger');
const { createStripeInstance, getStripeConfig } = require('../middleware/stripeInstance');

router.post('/create-session', async (req, res) => {
  try {
    const { amount, currency = 'usd', paymentMethods, country = 'US', currentQueryString } = req.body;

    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    const cleanQueryString = currentQueryString?.startsWith('?')
      ? currentQueryString.slice(1)
      : currentQueryString;

    const returnParams = cleanQueryString
      ? new URLSearchParams(cleanQueryString)
      : new URLSearchParams();

    if (country) returnParams.set('country', country);
    if (currency) returnParams.set('currency', currency);
    if (amount) returnParams.set('amount', amount);
    if (paymentMethods) {
      returnParams.set('paymentMethods', Array.isArray(paymentMethods) ? paymentMethods.join(',') : paymentMethods);
    }

    const baseUrl = `${req.headers.origin || 'http://localhost:3000'}/hosted-checkout`;
    const queryString = returnParams.toString();

    const sessionParams = {
      mode: 'payment',
      ui_mode: 'hosted',
      success_url: `${baseUrl}?session_id={CHECKOUT_SESSION_ID}${queryString ? '&' + queryString : ''}`,
      cancel_url: queryString ? `${baseUrl}?${queryString}` : baseUrl,
      line_items: [{
        price_data: {
          currency,
          product_data: { name: 'Demo Product' },
          unit_amount: amount || 2000,
        },
        quantity: 1,
      }],
    };

    if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      sessionParams.payment_method_types = paymentMethods;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      url: session.url,
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

module.exports = router;
