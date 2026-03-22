const express = require('express');
const router = express.Router();
const { extractStripeRequestId } = require('../middleware/stripeResponseLogger');
const { createStripeInstance, getStripeConfig } = require('../middleware/stripeInstance');


router.post('/create-account', async (req, res) => {
  try {
    const { country = 'US' } = req.body;
    const stripe = createStripeInstance(country);

    const account = await stripe.accounts.create({
      type: 'custom',
      country,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    res.json({
      accountId: account.id,
      stripeRequestId: account.lastResponse?.requestId || null,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      stripeRequestId: extractStripeRequestId(error),
    });
  }
});

router.post('/delete-account', async (req, res) => {
  try {
    const { accountId, country = 'US' } = req.body;
    const stripe = createStripeInstance(country);

    const deleted = await stripe.accounts.del(accountId);

    res.json({
      deleted: deleted.deleted,
      stripeRequestId: deleted.lastResponse?.requestId || null,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      stripeRequestId: extractStripeRequestId(error),
    });
  }
});

router.post('/create-test-payment', async (req, res) => {
  try {
    const { accountId, country = 'US' } = req.body;
    const stripe = createStripeInstance(country);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
      payment_method: 'pm_card_visa',
      payment_method_types: ['card'],
      confirm: true,
      transfer_data: { destination: accountId },
    });

    res.json({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      stripeRequestId: paymentIntent.lastResponse?.requestId || null,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      stripeRequestId: extractStripeRequestId(error),
    });
  }
});

router.post('/create-account-session', async (req, res) => {
  try {
    const { accountId, component = 'payments', country = 'US' } = req.body;
    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    const components = { [component]: { enabled: true } };
    if (component !== 'notification_banner') {
      components.notification_banner = { enabled: true };
    }

    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components,
    });

    res.json({
      clientSecret: accountSession.client_secret,
      publishableKey,
      stripeRequestId: accountSession.lastResponse?.requestId || null,
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
