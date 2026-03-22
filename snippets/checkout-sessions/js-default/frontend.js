// Initialize Stripe.js
const stripe = Stripe(window._STRIPE_PK || 'pk_test_...');

let checkout;

initialize();

document
  .querySelector('#submit')
  .addEventListener('click', handleSubmit);

async function initialize() {
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: 'xl-tshirt' }] }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };

  checkout = await stripe.initCheckout({
    clientSecret,
    elementsOptions: { appearance }
  });

  const paymentElement = checkout.createPaymentElement({ layout: 'tabs' });
  paymentElement.mount('#payment-element');
}

async function handleSubmit(e) {
  e.preventDefault();

  const email = document.querySelector('#email').value;
  if (!email) return;

  setLoading(true);

  // Update email first
  const emailResult = await checkout.updateEmail(email);
  if (emailResult.type === 'error') {
    showMessage(emailResult.error.message);
    setLoading(false);
    return;
  }

  // Then confirm payment
  const result = await checkout.confirm();

  if (result.type === 'error') {
    showMessage(result.error.message);
  } else {
    showMessage('Payment successful!');
  }

  setLoading(false);
}

function setLoading(isLoading) {
  const submitButton = document.querySelector('#submit');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Processing...' : 'Pay now';
}

function showMessage(messageText) {
  const messageContainer = document.querySelector('#payment-message');
  messageContainer.textContent = messageText;
}
