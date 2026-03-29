// Make sure to replace this with your own Stripe Sandbox publishable key.
const stripe = Stripe('pk_test_...');

initialize();

async function initialize() {
  const response = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 4242, currency: 'usd' }),
  });
  const { clientSecret } = await response.json();

  const paymentRequest = stripe.paymentRequest({
    country: 'US',
    currency: 'usd',
    total: {
      label: 'Demo total',
      amount: 4242,
    },
    requestPayerName: true,
    requestPayerEmail: true,
  });

  const elements = stripe.elements();
  const prButton = elements.create('paymentRequestButton', { paymentRequest });

  paymentRequest.canMakePayment().then((result) => {
    if (result) {
      prButton.mount('#payment-request-button');
    } else {
      document.getElementById('payment-request-button').style.display = 'none';
    }
  });

  paymentRequest.on('paymentmethod', async (ev) => {
    const { error: confirmError } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: ev.paymentMethod.id },
      { handleActions: false }
    );

    if (confirmError) {
      ev.complete('fail');
      document.getElementById('error-message').textContent = confirmError.message;
    } else {
      ev.complete('success');
      document.getElementById('success-message').textContent = 'Payment succeeded!';
    }
  });
}
