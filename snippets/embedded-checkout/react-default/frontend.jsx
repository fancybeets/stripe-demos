import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

const CheckoutPage = () => {
  const fetchClientSecret = async () => {
    const res = await fetch('/embedded-checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 4242, currency: 'usd' }),
    });
    const data = await res.json();
    return data.clientSecret;
  };

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
};

export default CheckoutPage;
