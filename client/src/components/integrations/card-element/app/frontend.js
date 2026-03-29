// Make sure to replace this with your own Stripe Sandbox publishable key.
const stripe = Stripe('pk_test_...');
const elements = stripe.elements();

const cardElement = elements.create('card', {
  style: {
    base: {
      color: '#32325d',
      fontSize: '16px',
    },
    invalid: {
      color: '#fa755a',
    },
  },
});

cardElement.mount('#card-element');

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit');

// Fetch clientSecret on page load
let clientSecret;
fetch('/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 4242, currency: 'usd' }),
})
  .then((res) => res.json())
  .then((data) => { clientSecret = data.clientSecret; });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitButton.disabled = true;

  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: cardElement },
  });

  if (error) {
    document.getElementById('card-errors').textContent = error.message;
    submitButton.disabled = false;
  } else if (paymentIntent.status === 'succeeded') {
    document.getElementById('payment-message').textContent = 'Payment succeeded!';
  }
});
