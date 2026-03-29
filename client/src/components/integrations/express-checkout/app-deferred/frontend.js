// Make sure to replace this with your own Stripe Sandbox publishable key.
const PUBLISHABLE_KEY = 'pk_test_...';

const stripe = Stripe(PUBLISHABLE_KEY);

const amount = 2000;
const currency = 'usd';

// Initialize Elements with mode/amount/currency — no clientSecret upfront.
const elements = stripe.elements({ mode: 'payment', amount, currency });

const expressCheckoutElement = elements.create('expressCheckout');

expressCheckoutElement.on('confirm', async () => {
  // Validate fields before creating the PaymentIntent.
  const { error: submitError } = await elements.submit();
  if (submitError) {
    document.querySelector('#error-message').textContent = submitError.message;
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
    redirect: 'if_required',
  });

  if (error) {
    document.querySelector('#error-message').textContent = error.message;
  } else {
    document.querySelector('#success-message').textContent = 'Payment successful!';
  }
});

expressCheckoutElement.mount('#express-checkout-element');
