const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/embedded-checkout/create-session', async (req, res) => {
  const { amount, currency } = req.body;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded',
    return_url: `${req.headers.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    line_items: [{
      price_data: {
        currency,
        product_data: { name: 'Potato', images: ['https://stripe.erintaylor.dev/potato.png'] },
        unit_amount: amount,
      },
      quantity: 1,
    }],
  });
  res.json({ clientSecret: session.client_secret });
});
