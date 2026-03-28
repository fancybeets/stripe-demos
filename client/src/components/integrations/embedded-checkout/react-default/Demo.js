import React, { useEffect, useState, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useTheme } from '../../../../context/ThemeContext';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const EmbeddedCheckoutReactDefaultDemo = ({ paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto', quantity = '1' } = paymentOptions;
  const { theme } = useTheme();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    if (requestInFlightRef.current) return;

    const abortController = new AbortController();
    requestInFlightRef.current = true;

    setError(null);
    setStripePromise(null);
    setClientSecret('');

    fetch(`${API_BASE_URL}/embedded-checkout/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseInt(amount),
        currency,
        country,
        quantity: parseInt(quantity) || 1,
        paymentMethods: paymentMethods === 'auto' ? null : paymentMethods.split(','),
        currentQueryString: window.location.search,
        theme,
      }),
      signal: abortController.signal,
    })
      .then((res) => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to create session'); });
        return res.json();
      })
      .then((data) => {
        if (!abortController.signal.aborted) {
          setClientSecret(data.clientSecret);
          setStripePromise(loadStripe(data.publishableKey));
        }
      })
      .catch((err) => {
        if (!abortController.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) requestInFlightRef.current = false;
      });

    return () => {
      abortController.abort();
      requestInFlightRef.current = false;
    };
  }, [amount, currency, country, paymentMethods, quantity, theme]);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-title">ERROR</div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
};

export default EmbeddedCheckoutReactDefaultDemo;
