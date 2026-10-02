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

// Standalone page served with a misconfigured Cross-Origin-Opener-Policy.
// COOP: same-origin severs the link between this page and the cross-origin
// OAuth pop-up, so Stripe.js sees the pop-up as closed almost immediately.
// This must be a top-level document (COOP is ignored in iframes), which is
// why it's served from Express instead of the React app.
router.get('/coop-demo', (req, res) => {
  res.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FC OAuth Pop-up: Broken COOP</title>
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 720px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1a1a2e;
      line-height: 1.6;
    }
    code, pre {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background: #f4f4fb;
      border: 1px solid #e0e0f0;
      border-radius: 4px;
    }
    code { padding: 1px 4px; }
    pre { padding: 12px 16px; white-space: pre-wrap; }
    button {
      font-size: 15px;
      background: #635BFF;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 12px 24px;
      cursor: pointer;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #d92d20; }
  </style>
</head>
<body>
  <h1>Financial Connections with a broken COOP header</h1>
  <p>
    This page is served with <code>Cross-Origin-Opener-Policy: same-origin</code>.
    That header cuts this page off from the cross-origin bank OAuth pop-up, so
    Stripe.js sees the pop-up as closed right after it opens.
  </p>
  <ol>
    <li>Open DevTools and switch to the <strong>Console</strong> tab.</li>
    <li>Click <strong>Link bank account</strong> below.</li>
    <li>Choose an <strong>OAuth</strong> test institution and continue to the bank pop-up.</li>
    <li>Look for the Financial Connections warning in the console. You don't need to close the pop-up yourself.</li>
  </ol>
  <p><button id="launch">Link bank account</button></p>
  <pre id="result" hidden></pre>

  <script>
    const button = document.getElementById('launch');
    const result = document.getElementById('result');

    const show = (text, isError) => {
      result.hidden = false;
      result.className = isError ? 'error' : '';
      result.textContent = text;
    };

    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const res = await fetch('create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: 'US' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create session');

        const stripe = Stripe(data.publishableKey);
        const { financialConnectionsSession, error } =
          await stripe.collectFinancialConnectionsAccounts({ clientSecret: data.clientSecret });

        if (error) {
          show(error.message, true);
        } else {
          const count = financialConnectionsSession.accounts.length;
          show('Session complete: ' + count + ' account(s) linked.', false);
        }
      } catch (err) {
        show(err.message, true);
      } finally {
        button.disabled = false;
      }
    });
  </script>
</body>
</html>`);
});

module.exports = router;
