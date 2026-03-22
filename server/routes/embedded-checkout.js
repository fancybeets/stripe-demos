const express = require('express');
const router = express.Router();
const { extractStripeRequestId } = require('../middleware/stripeResponseLogger');
const { createStripeInstance, getStripeConfig } = require('../middleware/stripeInstance');

router.post('/create-session', async (req, res) => {
  try {
    const { amount, currency = 'usd', paymentMethods, country = 'US', currentQueryString, theme = 'apocalypse' } = req.body;

    const brandingByTheme = {
      apocalypse: {
        background_color: '#0a0a0a',
        button_color: '#ffb000',
        border_style: 'rectangular',
        font_family: 'inconsolata',
      },
      simple: {
        background_color: '#ffffff',
        button_color: '#635BFF',
        border_style: 'rounded',
        font_family: 'inter',
      },
      dark: {
        background_color: '#16161f',
        button_color: '#a78bfa',
        border_style: 'rounded',
        font_family: 'inter',
      },
    };
    const branding_settings = brandingByTheme[theme] || brandingByTheme.simple;
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

    const baseUrl = `${req.headers.origin || 'http://localhost:3000'}/embedded-checkout`;
    const queryString = returnParams.toString();
    const returnUrl = queryString
      ? `${baseUrl}?${queryString}`
      : baseUrl;

    const sessionParams = {
      mode: 'payment',
      ui_mode: 'embedded',
      return_url: returnUrl,
      branding_settings,
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

module.exports = router;
