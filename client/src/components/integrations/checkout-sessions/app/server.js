// Make sure to replace this with your own Stripe Sandbox secret key.
const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount = 2000, currency = 'usd' } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'custom',
      line_items: [{
        price_data: {
          currency,
          product_data: { name: 'Potato' },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      return_url: `http://localhost:4242/?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    res.status(400).json({
      error: {
        message: `${error.message} - make sure you've replaced sk_test_... in server.js with your secret key from https://dashboard.stripe.com/test/apikeys`,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));
