import { useEffect, useRef, useState } from 'react';
import { getStripeAppearance } from '../../../../config/stripeAppearance';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { waitForStripe } from '../../../../utils/waitForStripe';
import { createElements } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const CardElementJSDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242' } = paymentOptions;
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [intentId, setIntentId] = useState(null);
  const containerRef = useRef(null);
  const stripeElementsRef = useRef(null);
  const cardElementRef = useRef(null);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    if (requestInFlightRef.current) return;

    const abortController = new AbortController();
    requestInFlightRef.current = true;

    setError(null);
    setStripePromise(null);
    setClientSecret('');

    waitForStripe()
      .then(() => fetch(`${API_BASE_URL}/card-element/create-payment-intent/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(amount), currency, country }),
        signal: abortController.signal,
      }))
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
          const stripe = window.Stripe(data.publishableKey);
          setStripePromise(stripe);
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

  useEffect(() => {
    if (!stripePromise || !clientSecret || !containerRef.current) return;

    if (cardElementRef.current) {
      try {
        cardElementRef.current.unmount();
      } catch (e) {
        // Element already unmounted
      }
      cardElementRef.current = null;
    }

    const elements = createElements(stripePromise, { appearance: getStripeAppearance() });
    stripeElementsRef.current = elements;

    const isSimple = localStorage.getItem('theme') === 'simple';
    const cardElement = elements.create('card', {
      style: isSimple ? {
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
    });
    cardElementRef.current = cardElement;
    cardElement.mount('#card-element-js-default');

    const form = document.getElementById('card-form-js-default');
    const submitButton = document.getElementById('submit-button-card-js-default');
    const messageDiv = document.getElementById('card-message-js-default');

    const payButtonText = `Pay ${formatCurrency(amount, currency)}`;

    const handleSubmit = async (e) => {
      e.preventDefault();
      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';
      messageDiv.textContent = '';
      messageDiv.style.display = 'none';

      const { error, paymentIntent } = await stripePromise.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        messageDiv.textContent = error.message;
        messageDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = payButtonText;
      } else if (paymentIntent.status === 'succeeded') {
        setIntentId(paymentIntent.id);
        setSucceeded(true);
      }
    };

    form.addEventListener('submit', handleSubmit);

    return () => {
      form.removeEventListener('submit', handleSubmit);
      if (cardElementRef.current) {
        try {
          cardElementRef.current.unmount();
        } catch (e) {
          // Element already unmounted
        }
        cardElementRef.current = null;
      }
    };
  }, [stripePromise, clientSecret]);

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

  return (
    <div ref={containerRef}>
      {error ? (
        <div className="error-container">
          <div className="error-title">ERROR</div>
          <div className="error-message">{error}</div>
        </div>
      ) : stripePromise && clientSecret ? (
        <form id="card-form-js-default">
          <div className="stripe-element-container">
            <label className="stripe-element-label">Card Details</label>
            <div className="stripe-element-wrapper">
              <div id="card-element-js-default"></div>
            </div>
          </div>
          <div id="card-message-js-default" className="payment-message" style={{ display: 'none' }}></div>
          <button id="submit-button-card-js-default" className="pay-button">
            Pay {formatCurrency(amount, currency)}
          </button>
        </form>
      ) : (
        <div className="loading">Loading payment form...</div>
      )}
    </div>
  );
};

export default CardElementJSDefaultDemo;
