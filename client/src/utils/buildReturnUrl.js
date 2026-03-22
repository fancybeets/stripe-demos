/**
 * Builds a return URL that preserves query parameters for post-payment redirect
 * @param {string} basePath - The base path to return to (e.g., '/payment-element', '/express-checkout-element')
 * @param {object} options - Optional payment options to include in the URL
 * @returns {string} - The full return URL with preserved query parameters
 */
export const buildReturnUrl = (basePath, options = {}) => {
  const params = new URLSearchParams(window.location.search);

  // Override with provided options to ensure they're included
  if (options.implementation) params.set('implementation', options.implementation);
  if (options.mode) params.set('mode', options.mode);
  if (options.country) params.set('country', options.country);
  if (options.currency) params.set('currency', options.currency);
  if (options.amount) params.set('amount', options.amount);
  if (options.paymentMethods) params.set('paymentMethods', options.paymentMethods);

  const queryString = params.toString();

  return queryString
    ? `${window.location.origin}${basePath}?${queryString}`
    : `${window.location.origin}${basePath}`;
};
