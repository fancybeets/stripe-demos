import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStripeAppearance } from '../../../../hooks/useStripeAppearance';
import { useTheme } from '../../../../context/ThemeContext';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { buildReturnUrl } from '../../../../utils/buildReturnUrl';
import { logElementsCreation } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const CardForm = ({ amount, currency, clientSecret, implementation, mode, country }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [intentId, setIntentId] = useState(null);
  const hasLoggedRef = React.useRef(false);

  useEffect(() => {
    if (!hasLoggedRef.current) {
      logElementsCreation();
      hasLoggedRef.current = true;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage('');

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      setMessage(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      setIntentId(paymentIntent.id);
      setSucceeded(true);
    }

    setIsLoading(false);
  };

  if (succeeded) {
    return (
      <SuccessMessage
        title="PAYMENT COMPLETE"
        message="Your payment has been processed successfully!"
        intentId={intentId}
        returnPath="/card-element"
      />
    );
  }

  const cardElementOptions = {
    style: theme === 'simple' ? {
      base: {
        color: '#1a1a1a',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        '::placeholder': { color: '#9ca3af' },
      },
      invalid: { color: '#dc2626' },
    } : {
      base: {
        color: '#e0e0e0',
        fontFamily: '"Share Tech Mono", monospace',
        fontSize: '16px',
        '::placeholder': { color: '#666' },
      },
      invalid: { color: '#ff4444' },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="stripe-element-container">
        <label className="stripe-element-label">Card Details</label>
        <div className="stripe-element-wrapper">
          <CardElement options={cardElementOptions} onReady={() => setIsReady(true)} />
        </div>
      </div>
      {message && <div className="payment-message">{message}</div>}
      <button disabled={isLoading || !stripe || !elements || !isReady} className="pay-button">
        {isLoading ? 'Processing...' : isReady ? `Pay ${formatCurrency(amount, currency)}` : 'Loading...'}
      </button>
    </form>
  );
};

const CardElementReactDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242' } = paymentOptions;
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const stripeAppearance = useStripeAppearance();
  const requestInFlightRef = React.useRef(false);

  useEffect(() => {
    if (requestInFlightRef.current) return;

    const abortController = new AbortController();
    requestInFlightRef.current = true;

    setError(null);
    setStripePromise(null);
    setClientSecret('');

    fetch(`${API_BASE_URL}/card-element/create-payment-intent/default`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(amount), currency, country }),
      signal: abortController.signal,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || 'Failed to create payment intent');
          });
        }
        return res.json();
      })
      .then((data) => {
        if (!abortController.signal.aborted) {
          setClientSecret(data.clientSecret);
          setStripePromise(loadStripe(data.publishableKey));
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && !abortController.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        requestInFlightRef.current = false;
      });

    return () => {
      abortController.abort();
      requestInFlightRef.current = false;
    };
  }, [country, currency, amount]);

  return (
    <>
      {error ? (
        <div className="error-container">
          <div className="error-title">ERROR</div>
          <div className="error-message">{error}</div>
        </div>
      ) : stripePromise && clientSecret ? (
        <Elements stripe={stripePromise} options={{ appearance: stripeAppearance }}>
          <CardForm
            amount={amount}
            currency={currency}
            clientSecret={clientSecret}
            implementation={implementation}
            mode={mode}
            country={country}
          />
        </Elements>
      ) : (
        <div className="loading">Loading payment form...</div>
      )}
    </>
  );
};

export default CardElementReactDefaultDemo;
