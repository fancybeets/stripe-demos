import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStripeAppearance } from '../../../../hooks/useStripeAppearance';
import { buildReturnUrl } from '../../../../utils/buildReturnUrl';
import { confirmPayment, logElementsCreation } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const ExpressCheckoutForm = ({ amount, currency, country, paymentMethods, implementation, mode }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const hasLoggedRef = React.useRef(false);

  useEffect(() => {
    if (!hasLoggedRef.current) {
      logElementsCreation();
      hasLoggedRef.current = true;
    }
  }, []);

  const onConfirm = async (event) => {
    setMessage('');

    try {
      // Submit the form to validate fields
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setMessage(submitError.message);
        return;
      }

      // Create the PaymentIntent on the server
      const response = await fetch(`${API_BASE_URL}/express-checkout-element/create-payment-intent/deferred`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          currency,
          country,
          paymentMethods: paymentMethods === 'auto' ? null : paymentMethods.split(',')
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Then, confirm the payment with the clientSecret
      const { error } = await confirmPayment(stripe, {
        elements,
        clientSecret,
        confirmParams: {
          return_url: buildReturnUrl('/express-checkout-element', {
            implementation,
            mode,
            country,
            currency,
            amount,
            paymentMethods
          }),
        },
        redirect: 'always',
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Payment authorized! (Capture required)');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <div className="stripe-element-container">
        <label className="stripe-element-label">Express Checkout Options</label>
        <div className="stripe-element-wrapper">
          <ExpressCheckoutElement
            onConfirm={onConfirm}
            options={{
              buttonType: {
                applePay: 'buy',
                googlePay: 'buy',
                paypal: 'buynow'
              }
            }}
          />
        </div>
      </div>
      {message && <div className="payment-message">{message}</div>}
    </>
  );
};

const ExpressCheckoutReactDeferredDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto' } = paymentOptions;
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState(null);
  const stripeAppearance = useStripeAppearance();
  const requestInFlightRef = React.useRef(false);

  // Check if we're returning from a successful payment
  const urlParams = new URLSearchParams(window.location.search);
  const redirectStatus = urlParams.get('redirect_status');

  useEffect(() => {
    // Don't fetch if showing success message
    if (redirectStatus === 'succeeded') {
      return;
    }
    // Prevent duplicate requests
    if (requestInFlightRef.current) {
      return;
    }

    const abortController = new AbortController();
    requestInFlightRef.current = true;

    setError(null);
    setStripePromise(null);

    // Fetch publishableKey from config
    fetch(`${API_BASE_URL}/config?country=${country}`, {
      signal: abortController.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load Stripe configuration');
        }
        return res.json();
      })
      .then((data) => {
        if (!abortController.signal.aborted) {
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
  }, [country, redirectStatus]);

  if (redirectStatus === 'succeeded') {
    const paymentIntentId = urlParams.get('payment_intent');
    return (
      <SuccessMessage
        title="PAYMENT COMPLETE"
        message="Your payment has been processed successfully!"
        intentId={paymentIntentId}
        returnPath="/express-checkout-element"
        className="view-content"
      />
    );
  }

  const elementsOptions = {
    mode: 'payment',
    amount: parseInt(amount),
    currency: currency,
    appearance: stripeAppearance,
    ...(paymentMethods !== 'auto' && {
      paymentMethodCreation: 'manual',
      paymentMethodTypes: paymentMethods.split(',')
    })
  };

  return (
    <>
      {error ? (
        <div className="error-container">
          <div className="error-title">ERROR</div>
          <div className="error-message">{error}</div>
        </div>
      ) : stripePromise ? (
        <Elements stripe={stripePromise} options={elementsOptions}>
          <ExpressCheckoutForm
            amount={amount}
            currency={currency}
            country={country}
            paymentMethods={paymentMethods}
            implementation={implementation}
            mode={mode}
          />
        </Elements>
      ) : (
        <div className="loading">Loading express checkout...</div>
      )}
    </>
  );
};

export default ExpressCheckoutReactDeferredDemo;
