const express = require('express');
const Stripe = require('stripe');

const router = express.Router();
const stripe = Stripe('sk_test_...');

// Create a connection token for the Terminal JS SDK
router.post('/connection-token', async (req, res) => {
  const token = await stripe.terminal.connectionTokens.create();
  res.json({ secret: token.secret });
});

// Create a payment intent for in-person capture
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    payment_method_types: ['card_present'],
    capture_method: 'manual',
  });
  res.json({ paymentIntentId: paymentIntent.id, clientSecret: paymentIntent.client_secret });
});

// Capture the authorized payment
router.post('/capture-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;
  const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
  res.json({ paymentIntent });
});

module.exports = router;
