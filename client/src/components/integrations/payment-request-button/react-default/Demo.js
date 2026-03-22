import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import { useStripeAppearance } from '../../../../hooks/useStripeAppearance';
import { logElementsCreation } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const PaymentRequestForm = ({ clientSecret, amount, currency, country }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [walletChecked, setWalletChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const [intentId, setIntentId] = useState(null);
  const hasLoggedRef = React.useRef(false);

  useEffect(() => {
    if (!hasLoggedRef.current) {
      logElementsCreation();
      hasLoggedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const pr = stripe.paymentRequest({
      country: country || 'US',
      currency: currency || 'usd',
      total: {
        label: 'Demo total',
        amount: parseInt(amount) || 4242,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
      setWalletChecked(true);
    });

    pr.on('paymentmethod', async (ev) => {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
      );

      if (confirmError) {
        ev.complete('fail');
        setMessage(confirmError.message);
      } else {
        ev.complete('success');
        setIntentId(paymentIntent.id);
        setSucceeded(true);
      }
    });
  }, [stripe, clientSecret, country, currency, amount]);

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
    <>
      <div className="stripe-element-container">
        <label className="stripe-element-label">Payment Request Button</label>
        <div className="stripe-element-wrapper">
          {paymentRequest ? (
            <PaymentRequestButtonElement options={{ paymentRequest }} />
          ) : walletChecked ? (
            <div className="payment-message">
              No compatible wallet detected. Try in a browser with Apple Pay, Google Pay, or a saved card.
            </div>
          ) : null}
        </div>
      </div>
      {message && <div className="payment-message">{message}</div>}
    </>
  );
};

const PaymentRequestButtonReactDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
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

    fetch(`${API_BASE_URL}/payment-request-button/create-payment-intent/default`, {
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
          <PaymentRequestForm
            clientSecret={clientSecret}
            amount={amount}
            currency={currency}
            country={country}
          />
        </Elements>
      ) : (
        <div className="loading">Loading payment form...</div>
      )}
    </>
  );
};

export default PaymentRequestButtonReactDefaultDemo;
