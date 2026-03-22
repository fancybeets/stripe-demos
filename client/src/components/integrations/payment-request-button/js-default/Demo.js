import { useEffect, useRef, useState } from 'react';
import { waitForStripe } from '../../../../utils/waitForStripe';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const PaymentRequestButtonJSDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242' } = paymentOptions;
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [intentId, setIntentId] = useState(null);
  const [noWallet, setNoWallet] = useState(false);
  const containerRef = useRef(null);
  const prButtonRef = useRef(null);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    if (requestInFlightRef.current) return;

    const abortController = new AbortController();
    requestInFlightRef.current = true;

    setError(null);
    setStripePromise(null);
    setClientSecret('');
    setNoWallet(false);

    waitForStripe()
      .then(() => fetch(`${API_BASE_URL}/payment-request-button/create-payment-intent/default`, {
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

    if (prButtonRef.current) {
      try {
        prButtonRef.current.unmount();
      } catch (e) {
        // Element already unmounted
      }
      prButtonRef.current = null;
    }

    const paymentRequest = stripePromise.paymentRequest({
      country: country || 'US',
      currency: currency || 'usd',
      total: {
        label: 'Demo total',
        amount: parseInt(amount) || 4242,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const elements = stripePromise.elements();
    const prButton = elements.create('paymentRequestButton', { paymentRequest });
    prButtonRef.current = prButton;

    const messageDiv = document.getElementById('prb-message-js-default');

    paymentRequest.canMakePayment().then((result) => {
      if (result) {
        prButton.mount('#prb-js-default');
      } else {
        setNoWallet(true);
      }
    });

    paymentRequest.on('paymentmethod', async (ev) => {
      if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';
      }

      const { error: confirmError, paymentIntent } = await stripePromise.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
      );

      if (confirmError) {
        ev.complete('fail');
        if (messageDiv) {
          messageDiv.textContent = confirmError.message;
          messageDiv.style.display = 'block';
        }
      } else {
        ev.complete('success');
        setIntentId(paymentIntent.id);
        setSucceeded(true);
      }
    });

    return () => {
      if (prButtonRef.current) {
        try {
          prButtonRef.current.unmount();
        } catch (e) {
          // Element already unmounted
        }
        prButtonRef.current = null;
      }
    };
  }, [stripePromise, clientSecret]);

  if (succeeded) {
    return (
      <SuccessMessage
        title="PAYMENT COMPLETE"
        message="Your payment has been processed successfully!"
        intentId={intentId}
        returnPath="/payment-request-button"
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
        <>
          <div className="stripe-element-container">
            <label className="stripe-element-label">Payment Request Button</label>
            <div className="stripe-element-wrapper">
              {noWallet ? (
                <div className="payment-message">
                  No compatible wallet detected. Try in a browser with Apple Pay, Google Pay, or a saved card.
                </div>
              ) : (
                <div id="prb-js-default"></div>
              )}
            </div>
          </div>
          <div id="prb-message-js-default" className="payment-message" style={{ display: 'none' }}></div>
        </>
      ) : (
        <div className="loading">Loading payment form...</div>
      )}
    </div>
  );
};

export default PaymentRequestButtonJSDefaultDemo;
