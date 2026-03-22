const express = require('express');
const router = express.Router();
const { extractStripeRequestId } = require('../middleware/stripeResponseLogger');
const { createStripeInstance, getStripeConfig } = require('../middleware/stripeInstance');

// Default payment intent - created upfront with all details
router.post('/create-payment-intent/default', async (req, res) => {
  try {
    const { amount, currency = 'usd', paymentMethods, country = 'US' } = req.body;
    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    const paymentIntentParams = {
      amount: amount || 2000,
      currency,
    };

    // If specific payment methods are provided, use payment_method_types
    // Otherwise use automatic_payment_methods
    if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      paymentIntentParams.payment_method_types = paymentMethods;
    } else {
      paymentIntentParams.automatic_payment_methods = {
        enabled: true,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey,
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

// Deferred payment intent - created after user provides payment details
router.post('/create-payment-intent/deferred', async (req, res) => {
  try {
    const { amount, currency = 'usd', paymentMethods, country = 'US' } = req.body;
    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    const paymentIntentParams = {
      amount: amount || 2000,
      currency,
    };

    // If specific payment methods are provided, use payment_method_types
    // Otherwise use automatic_payment_methods
    if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      paymentIntentParams.payment_method_types = paymentMethods;
    } else {
      paymentIntentParams.automatic_payment_methods = {
        enabled: true,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey,
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

// Update payment intent
router.post('/update-payment-intent', async (req, res) => {
  try {
    const { paymentIntentId, amount, metadata, country = 'US' } = req.body;
    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    const paymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      {
        amount,
        metadata,
      }
    );

    res.json({
      success: true,
      paymentIntent,
      publishableKey,
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

// Capture payment intent
router.post('/capture-payment-intent', async (req, res) => {
  try {
    const { paymentIntentId, country = 'US' } = req.body;
    const stripe = createStripeInstance(country);
    const { publishableKey } = getStripeConfig(country);

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    res.json({
      success: true,
      paymentIntent,
      publishableKey,
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
