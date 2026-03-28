// Initialize Stripe.js
const stripe = Stripe(window._STRIPE_PK || 'pk_test_...');

let elements;

initialize();

document
  .querySelector('#payment-form')
  .addEventListener('submit', handleSubmit);

async function initialize() {
  const response = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: 'potato' }] }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

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
  }

  setLoading(false);
}

function setLoading(isLoading) {
  const submitButton = document.querySelector('#submit');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Processing...' : 'Pay now';
}
