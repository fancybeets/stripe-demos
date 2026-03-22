/**
 * Waits for Stripe.js to load from the CDN with polling
 * @returns {Promise<void>} Resolves when window.Stripe is available
 * @throws {Error} If Stripe.js fails to load after 5 seconds
 */
export const waitForStripe = () => {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max (50 × 100ms)
    const checkStripe = setInterval(() => {
      attempts++;
      if (window.Stripe) {
        clearInterval(checkStripe);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkStripe);
        reject(new Error('Stripe.js failed to load'));
      }
    }, 100);
  });
};
