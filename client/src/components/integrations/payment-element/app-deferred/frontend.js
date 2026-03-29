// Make sure to replace this with your own Stripe Sandbox publishable key.
const PUBLISHABLE_KEY = 'pk_test_...';

const stripe = Stripe(PUBLISHABLE_KEY);

const amount = 2000;
const currency = 'usd';

// Initialize Elements with mode/amount/currency — no clientSecret upfront.
const elements = stripe.elements({ mode: 'payment', amount, currency });

const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element');

document.querySelector('#payment-form').addEventListener('submit', handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  // Validate fields before creating the PaymentIntent.
  const { error: submitError } = await elements.submit();
  if (submitError) {
    showMessage(submitError.message);
    setLoading(false);
    return;
  }

  // Create the PaymentIntent on the server.
  const response = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency }),
  });
  const { clientSecret } = await response.json();

  // Confirm the payment using the clientSecret from the server.
  const { error } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: window.location.origin + '/completion',
    },
  });

  if (error) {
    showMessage(error.message);
  }

  setLoading(false);
}

function showMessage(message) {
  const messageContainer = document.querySelector('#payment-message');
  messageContainer.textContent = message;
  messageContainer.style.display = '';
}

function setLoading(isLoading) {
  const submitButton = document.querySelector('#submit');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Processing...' : 'Pay now';
}
