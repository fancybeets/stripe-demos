// Make sure to replace this with your own Stripe Sandbox publishable key.
const PUBLISHABLE_KEY = 'pk_test_...';

const stripe = Stripe(PUBLISHABLE_KEY);

let checkout;

initialize();

document.querySelector('#submit').addEventListener('click', handleSubmit);

async function initialize() {
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 2000, currency: 'usd' }),
  });
  const { clientSecret } = await response.json();

  checkout = await stripe.initCheckout({ clientSecret });

  const paymentElement = checkout.createPaymentElement({ layout: 'tabs' });
  paymentElement.mount('#payment-element');
}

async function handleSubmit() {
  setLoading(true);

  const email = document.querySelector('#email').value;

  const emailResult = await checkout.updateEmail(email);
  if (emailResult.type === 'error') {
    showMessage(emailResult.error.message);
    setLoading(false);
    return;
  }

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
