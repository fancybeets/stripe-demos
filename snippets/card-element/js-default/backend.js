const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 4242, () => console.log('Server running on port ' + (process.env.PORT || 4242)));
