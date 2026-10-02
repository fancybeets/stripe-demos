const express = require('express');
const router = express.Router();
const { extractStripeRequestId } = require('../middleware/stripeResponseLogger');
const { createStripeInstance, getStripeConfig } = require('../middleware/stripeInstance');

// Create a Financial Connections Session for a new customer
router.post('/create-session', async (req, res) => {
  try {
    const { country = 'US' } = req.body || {};
    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    const customer = await stripe.customers.create();

    const session = await stripe.financialConnections.sessions.create({
      account_holder: {
        type: 'customer',
        customer: customer.id,
      },
      permissions: ['balances'],
    });

    res.json({
      clientSecret: session.client_secret,
      publishableKey,
      stripeRequestId: session.lastResponse?.requestId || null,
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
