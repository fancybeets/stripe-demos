// Initialize Stripe.js
const stripe = Stripe(window._STRIPE_PK || 'pk_test_...');

let elements;

initialize();

document
  .querySelector('#payment-form')
  .addEventListener('submit', handleSubmit);

async function initialize() {
  const appearance = {
    theme: 'stripe',
  };

  // Initialize with mode: 'payment'
  elements = stripe.elements({
    mode: 'payment',
    amount: 1400,
    currency: 'usd',
    appearance
  });

  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    // Submit form to validate fields
    const { error: submitError } = await elements.submit();
    if (submitError) {
      const messageContainer = document.querySelector('#payment-message');
      messageContainer.textContent = submitError.message;
      setLoading(false);
      return;
    }

    // Create PaymentIntent on submit
    const response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1400,
        currency: 'usd'
      }),
    });

    const { clientSecret } = await response.json();

    // Confirm payment with clientSecret
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin + '/completion',
      },
      redirect: 'if_required',
    });

    if (error) {
      const messageContainer = document.querySelector('#payment-message');
      messageContainer.textContent = error.message;
    } else {
      const messageContainer = document.querySelector('#payment-message');
      messageContainer.textContent = 'Payment successful!';
    }
  } catch (err) {
    const messageContainer = document.querySelector('#payment-message');
    messageContainer.textContent = err.message;
  }

  setLoading(false);
}

function setLoading(isLoading) {
  const submitButton = document.querySelector('#submit');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Processing...' : 'Pay now';
}
