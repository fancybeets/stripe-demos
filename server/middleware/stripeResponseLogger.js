// Middleware to extract and attach Stripe request ID to responses
const extractStripeRequestId = (error) => {
  // Stripe errors have a requestId property
  if (error && error.requestId) {
    return error.requestId;
  }
  return null;
};

module.exports = { extractStripeRequestId };
