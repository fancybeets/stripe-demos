// Helper to get Stripe keys and instance based on country
const getStripeConfig = (country = 'US') => {
  const countryUpper = country.toUpperCase();
  const secretKey = process.env[`STRIPE_SECRET_KEY_${countryUpper}`];
  const publishableKey = process.env[`STRIPE_PUBLISHABLE_KEY_${countryUpper}`];

  if (!secretKey || !publishableKey) {
    throw new Error(`Stripe keys not configured for country: ${countryUpper}`);
  }

  return {
    secretKey,
    publishableKey,
  };
};

const createStripeInstance = (country = 'US') => {
  const { secretKey } = getStripeConfig(country);
  const stripe = require('stripe')(secretKey);
  return stripe;
};

module.exports = {
  getStripeConfig,
  createStripeInstance,
};
