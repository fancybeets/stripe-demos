/**
 * Navigates back to checkout page with query params stripped
 * @param {string} returnPath - The base path to return to (e.g., '/payment-element')
 */
export const returnToCheckout = (returnPath) => {
  const params = new URLSearchParams(window.location.search);

  // Remove all payment-related query params
  params.delete('redirect_status');
  params.delete('payment_intent');
  params.delete('payment_intent_client_secret');
  params.delete('client_secret');
  params.delete('session_id');

  const queryString = params.toString();
  window.location.href = queryString ? `${returnPath}?${queryString}` : returnPath;
};
