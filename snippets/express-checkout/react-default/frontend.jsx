import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(window._STRIPE_PK || 'pk_test_...');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');

  const onConfirm = async (event) => {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/completion',
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Payment successful!');
  };

  const onClick = (event) => {
    // Inspect the button that was clicked, then resolve to proceed
    console.log('Button clicked:', event.expressPaymentType);
    event.resolve();
  };

  return (
    <>
      <ExpressCheckoutElement
        onConfirm={onConfirm}
        onClick={onClick}
        options={{
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          },
        }}
      />
      {message && <div>{message}</div>}
    </>
  );
};

export default function App() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch('/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'potato' }] }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const options = { clientSecret };

  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}
