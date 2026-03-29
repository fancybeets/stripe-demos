const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { items } = req.body;

  const calculateOrderAmount = (items) => {
    return 1400;
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'custom',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Potato',
            images: ['https://stripe.erintaylor.dev/potato.png'],
          },
          unit_amount: calculateOrderAmount(items),
        },
        quantity: 1,
      }],
      return_url: `${req.headers.origin}/checkout-sessions?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.send({
      clientSecret: session.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(process.env.PORT || 4242, () => console.log('Server running on port ' + (process.env.PORT || 4242)));
