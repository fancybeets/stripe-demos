import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(window._STRIPE_PK || 'pk_test_...');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');

  const onConfirm = async (event) => {
    setMessage('');

    try {
      // Submit form to validate fields
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setMessage(submitError.message);
        return;
      }

      // Create PaymentIntent on confirm
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
        setMessage(error.message);
      } else {
        setMessage('Payment successful!');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <ExpressCheckoutElement
        onConfirm={onConfirm}
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
  const options = {
    mode: 'payment',
    amount: 1400,
    currency: 'usd',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}
