const express = require('express');
const router = express.Router();
const { extractStripeRequestId } = require('../middleware/stripeResponseLogger');
const { createStripeInstance } = require('../middleware/stripeInstance');

const LOCATION_ADDRESSES = {
  US: { line1: '354 Oyster Point Blvd', city: 'South San Francisco', state: 'CA', postal_code: '94080', country: 'US' },
  GB: { line1: '7 Handyside St',         city: 'London',             postal_code: 'N1C 4DN',            country: 'GB' },
  CA: { line1: '363 Adelaide St W',       city: 'Toronto',            state: 'ON', postal_code: 'M5V 1R7', country: 'CA' },
  MX: { line1: 'Amores 1425',             city: 'Mexico City',        state: 'CDMX', postal_code: '03810', country: 'MX' },
};

router.post('/create-reader', async (req, res) => {
  try {
    const { country = 'US', registrationCode } = req.body;
    const stripe = createStripeInstance(country);

    const address = LOCATION_ADDRESSES[country] || LOCATION_ADDRESSES.US;
    const location = await stripe.terminal.locations.create({
      display_name: 'Demo Store',
      address,
    });

    const reader = await stripe.terminal.readers.create({
      registration_code: registrationCode || 'simulated-wpe',
      label: 'Demo Reader',
      location: location.id,
    });

    res.json({
      readerId: reader.id,
      readerLabel: reader.label,
      locationId: location.id,
      stripeRequestId: reader.lastResponse?.requestId || null,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      stripeRequestId: extractStripeRequestId(error),
    });
  }
});

router.post('/delete-reader', async (req, res) => {
  try {
    const { readerId, country = 'US' } = req.body;
    const stripe = createStripeInstance(country);

    const deleted = await stripe.terminal.readers.del(readerId);

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

router.post('/connection-token', async (req, res) => {
  try {
    const { country = 'US' } = req.body;
    const stripe = createStripeInstance(country);

    const token = await stripe.terminal.connectionTokens.create();

    res.json({
      secret: token.secret,
      stripeRequestId: token.lastResponse?.requestId || null,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      stripeRequestId: extractStripeRequestId(error),
    });
  }
});

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount = 2000, currency = 'usd', country = 'US' } = req.body;
    const stripe = createStripeInstance(country);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card_present'],
      capture_method: 'manual',
    });

    res.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
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

router.post('/capture-payment-intent', async (req, res) => {
  try {
    const { paymentIntentId, country = 'US' } = req.body;
    const stripe = createStripeInstance(country);

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    res.json({
      paymentIntent,
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

module.exports = router;
