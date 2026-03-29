// Make sure to replace this with your own Stripe Sandbox secret key.
const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('.'));

// Create a simulated Terminal reader
app.post('/create-reader', async (req, res) => {
  try {
    const reader = await stripe.terminal.readers.create({
      registration_code: 'simulated-wpe',
      label: 'Simulated Reader',
    });
    res.json({ readerId: reader.id, readerLabel: reader.label });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a payment intent for in-person capture
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount = 4242, currency = 'usd' } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card_present'],
      capture_method: 'manual',
    });
    res.json({ paymentIntentId: paymentIntent.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send payment intent to the reader
app.post('/process-payment-intent', async (req, res) => {
  try {
    const { readerId, paymentIntentId } = req.body;
    const reader = await stripe.terminal.readers.processPaymentIntent(readerId, {
      payment_intent: paymentIntentId,
    });
    res.json({ reader });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancel the current reader action
app.post('/cancel-reader-action', async (req, res) => {
  try {
    const { readerId } = req.body;
    const reader = await stripe.terminal.readers.cancelAction(readerId);
    res.json({ reader });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Simulate a card tap (test mode only)
app.post('/simulate-tap', async (req, res) => {
  try {
    const { readerId } = req.body;
    const reader = await stripe.testHelpers.terminal.readers.presentPaymentMethod(readerId);
    res.json({ reader });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Poll reader status
app.post('/reader-status', async (req, res) => {
  try {
    const { readerId } = req.body;
    const reader = await stripe.terminal.readers.retrieve(readerId);
    res.json({ actionStatus: reader.action?.status });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Capture the authorized payment
app.post('/capture-payment-intent', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    res.json({ paymentIntent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(4242, () => console.log('Server running on port ' + (4242)));
