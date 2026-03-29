// Make sure to replace this with your own Stripe Sandbox publishable key.
const PUBLISHABLE_KEY = 'pk_test_...';

const stripe = Stripe(PUBLISHABLE_KEY);

initialize();

async function initialize() {
  const response = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 2000, currency: 'usd' }),
  });
  const { clientSecret } = await response.json();

  const elements = stripe.elements({ clientSecret });

  const expressCheckoutElement = elements.create('expressCheckout');

  expressCheckoutElement.on('confirm', async () => {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/completion',
      },
      redirect: 'if_required',
    });

    if (error) {
      document.querySelector('#error-message').textContent = error.message;
    } else {
      document.querySelector('#success-message').textContent = 'Payment successful!';
    }
  });

  expressCheckoutElement.mount('#express-checkout-element');
}
