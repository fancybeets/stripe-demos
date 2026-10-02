// Payment Element (us_bank_account only) for the broken COOP page.
// API calls are relative because this page is served by the Express server.

const result = document.getElementById('result');
const backLink = document.getElementById('back-link');

const showError = (text) => {
  result.hidden = false;
  result.textContent = text;
};

// The React app passes its own URL so this page can link back to it
const returnUrl = new URLSearchParams(window.location.search).get('return_url');
if (returnUrl) {
  try {
    const url = new URL(returnUrl);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      backLink.href = url.href;
      backLink.hidden = false;
    }
  } catch (e) {
    // Invalid return_url; leave the back link hidden
  }
}

const init = async () => {
  const res = await fetch('../payment-element/create-payment-intent/default', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 4242,
      currency: 'usd',
      country: 'US',
      paymentMethods: ['us_bank_account'],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create PaymentIntent');

  const stripe = Stripe(data.publishableKey);
  const elements = stripe.elements({ clientSecret: data.clientSecret });
  elements.create('payment').mount('#payment-element');
};

init().catch((err) => showError(err.message));
