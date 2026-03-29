// Make sure to replace this with your own Stripe Sandbox publishable key.
const stripe = Stripe('pk_test_...');

async function initCheckout() {
  const res = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 4242, currency: 'usd' }),
  });
  const { clientSecret } = await res.json();

  const checkout = await stripe.initEmbeddedCheckout({ clientSecret });
  checkout.mount('#checkout');
}

initCheckout();
