require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getStripeConfig } = require('./middleware/stripeInstance');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Config endpoint - returns publishable key based on country
app.get('/config', (req, res) => {
  try {
    const country = req.query.country || 'US';
    const { publishableKey } = getStripeConfig(country);

    res.json({
      publishableKey,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Mount integration routes
const cardElementRoutes = require('./routes/card-element');
const paymentElementRoutes = require('./routes/payment-element');
const expressCheckoutRoutes = require('./routes/express-checkout-element');
const checkoutSessionsRoutes = require('./routes/checkout-sessions');
const paymentRequestButtonRoutes = require('./routes/payment-request-button');
const embeddedCheckoutRoutes = require('./routes/embedded-checkout');
const terminalRoutes = require('./routes/terminal');
const terminalJsSdkRoutes = require('./routes/terminal-js-sdk');
const connectEmbeddedRoutes = require('./routes/connect-embedded');

app.use('/card-element', cardElementRoutes);
app.use('/payment-element', paymentElementRoutes);
app.use('/express-checkout-element', expressCheckoutRoutes);
app.use('/checkout-sessions', checkoutSessionsRoutes);
app.use('/payment-request-button', paymentRequestButtonRoutes);
app.use('/embedded-checkout', embeddedCheckoutRoutes);
app.use('/terminal', terminalRoutes);
app.use('/terminal-js-sdk', terminalJsSdkRoutes);
app.use('/connect-embedded', connectEmbeddedRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
