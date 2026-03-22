import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutProvider, PaymentElement, useCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(window._STRIPE_PK || 'pk_test_...');

const CheckoutForm = () => {
  const checkout = useCheckout();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkout) return;

    setIsLoading(true);

    const { error } = await checkout.confirm({
      return_url: window.location.origin + '/completion',
    });

    if (error) {
      setMessage(error.message);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={isLoading || !checkout}>
        {isLoading ? 'Processing...' : 'Pay now'}
      </button>
      {message && <div>{message}</div>}
    </form>
  );
};

export default function App() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'xl-tshirt' }] }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  return (
    <>
      {clientSecret && (
        <CheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </CheckoutProvider>
      )}
    </>
  );
}
