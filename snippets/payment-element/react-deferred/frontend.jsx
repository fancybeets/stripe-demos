import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(window._STRIPE_PK || 'pk_test_...');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Submit form to validate fields
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setMessage(submitError.message);
        setIsLoading(false);
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
        setMessage(error.message);
      } else {
        setMessage('Payment successful!');
      }
    } catch (err) {
      setMessage(err.message);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={isLoading || !stripe || !elements}>
        {isLoading ? 'Processing...' : 'Pay now'}
      </button>
      {message && <div>{message}</div>}
    </form>
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
