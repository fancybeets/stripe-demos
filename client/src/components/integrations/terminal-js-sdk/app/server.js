// Make sure to replace this with your own Stripe Sandbox secret key.
const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('.'));

// Create a connection token for the Terminal JS SDK
app.post('/connection-token', async (req, res) => {
  try {
    const token = await stripe.terminal.connectionTokens.create();
    res.json({ secret: token.secret });
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
    res.json({ paymentIntentId: paymentIntent.id, clientSecret: paymentIntent.client_secret });
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
