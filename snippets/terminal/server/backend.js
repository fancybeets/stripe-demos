const express = require('express');
const Stripe = require('stripe');

const router = express.Router();
const stripe = Stripe('sk_test_...');

// Create a simulated Terminal reader
router.post('/create-reader', async (req, res) => {
  const reader = await stripe.terminal.readers.create({
    registration_code: 'simulated-wpe',
    label: 'Simulated Reader',
  });
  res.json({ readerId: reader.id, readerLabel: reader.label });
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
  res.json({ paymentIntentId: paymentIntent.id });
});

// Send payment intent to the reader
router.post('/process-payment-intent', async (req, res) => {
  const { readerId, paymentIntentId } = req.body;
  const reader = await stripe.terminal.readers.processPaymentIntent(readerId, {
    payment_intent: paymentIntentId,
  });
  res.json({ reader });
});

// Cancel the current reader action
router.post('/cancel-reader-action', async (req, res) => {
  const { readerId } = req.body;
  const reader = await stripe.terminal.readers.cancelAction(readerId);
  res.json({ reader });
});

// Simulate a card tap (test mode only)
router.post('/simulate-tap', async (req, res) => {
  const { readerId } = req.body;
  const reader = await stripe.testHelpers.terminal.readers.presentPaymentMethod(readerId);
  res.json({ reader });
});

// Capture the authorized payment
router.post('/capture-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;
  const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
  res.json({ paymentIntent });
});

module.exports = router;
