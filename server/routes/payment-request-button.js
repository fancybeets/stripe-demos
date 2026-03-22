const express = require('express');
const router = express.Router();
const { extractStripeRequestId } = require('../middleware/stripeResponseLogger');
const { createStripeInstance, getStripeConfig } = require('../middleware/stripeInstance');

// Payment Request Button uses card payment_method_types (legacy integration)
router.post('/create-payment-intent/default', async (req, res) => {
  try {
    const { amount, currency = 'usd', country = 'US' } = req.body;
    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 2000,
      currency,
      payment_method_types: ['card'],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey,
      stripeRequestId: paymentIntent.lastResponse?.requestId || null,
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
