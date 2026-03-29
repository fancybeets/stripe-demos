// Make sure to replace this with your own Stripe Sandbox publishable key.
const PUBLISHABLE_KEY = 'pk_test_...';

const stripe = Stripe(PUBLISHABLE_KEY);

let elements;

initialize();

document.querySelector('#payment-form').addEventListener('submit', handleSubmit);

async function initialize() {
  const response = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 2000, currency: 'usd' }),
  });
  const { clientSecret } = await response.json();

  elements = stripe.elements({ clientSecret });

  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.origin + '/completion',
    },
  });

  if (error) {
    const messageContainer = document.querySelector('#payment-message');
    messageContainer.textContent = error.message;
    messageContainer.style.display = '';
  }

  setLoading(false);
}

function setLoading(isLoading) {
  const submitButton = document.querySelector('#submit');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Processing...' : 'Pay now';
}
