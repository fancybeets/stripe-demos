// Make sure to replace this with your own Stripe Sandbox secret key.
const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('.'));

// Enable every embedded component we're showing in the demo
const DEMO_ACCOUNT_SESSION_COMPONENTS = {
  account_onboarding: { enabled: true },
  account_management: { enabled: true },
  payments: { enabled: true },
  payouts: { enabled: true },
  balances: { enabled: true },
  notification_banner: { enabled: true },
  documents: { enabled: true },
  tax_registrations: { enabled: true },
  tax_settings: { enabled: true },
};

// Create a connected account
app.post('/create-connected-account', async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    res.json({
      accountId: account.id,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: `${error.message} - make sure you've replaced sk_test_... in server.js with your secret key from https://dashboard.stripe.com/test/apikeys`,
      },
    });
  }
});

// Fetch a client secret for the demo account session
app.post('/create-account-session', async (req, res) => {
  try {
    const { accountId } = req.body;

    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: DEMO_ACCOUNT_SESSION_COMPONENTS,
    });

    res.json({
      clientSecret: accountSession.client_secret,
    });

  } catch (error) {
    res.status(400).send({
      error: {
        message: `${error.message} - make sure you've replaced sk_test_... in server.js with your secret key from https://dashboard.stripe.com/test/apikeys`,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port ' + (4242)));
