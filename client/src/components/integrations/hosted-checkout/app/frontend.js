// Make sure to replace this with your own Stripe Sandbox publishable key.
const PUBLISHABLE_KEY = 'pk_test_...';

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('checkout-button');
  const errorContainer = document.getElementById('error-container');

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Redirecting...';
    errorContainer.style.display = 'none';

    try {
      const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 2000, currency: 'usd' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (err) {
      errorContainer.textContent = err.message;
      errorContainer.style.display = '';
      button.disabled = false;
      button.textContent = 'Checkout';
    }
  });
});
