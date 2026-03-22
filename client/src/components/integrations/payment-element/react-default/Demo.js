import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement, ExpressCheckoutElement, AddressElement } from '@stripe/react-stripe-js';
import { useStripeAppearance } from '../../../../hooks/useStripeAppearance';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { buildReturnUrl } from '../../../../utils/buildReturnUrl';
import { confirmPayment, logElementsCreation } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const CheckoutForm = ({ amount, currency, implementation, mode, country, paymentMethods, additionalElements = [] }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasLoggedRef = React.useRef(false);

  // Log Elements creation once when component mounts
  useEffect(() => {
    if (!hasLoggedRef.current) {
      logElementsCreation();
      hasLoggedRef.current = true;
    }
  }, []);

  const handleExpressConfirm = async (event) => {
    if (!stripe || !elements) {
      return;
    }

    const { error } = await confirmPayment(stripe, {
      elements,
      confirmParams: {
        return_url: buildReturnUrl('/payment-element', {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await confirmPayment(stripe, {
      elements,
      confirmParams: {
        return_url: buildReturnUrl('/payment-element', {
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
    }

    setIsLoading(false);
  };

  const hasAdditionalElements = additionalElements.length > 0;

  return (
    <form onSubmit={handleSubmit}>
      {additionalElements.includes('express') && (
        <>
          {hasAdditionalElements && (
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
              Express checkout for {formatCurrency(amount, currency)}
            </h3>
          )}
          <div className="stripe-element-container">
            {!hasAdditionalElements && <label className="stripe-element-label">Express Checkout</label>}
            <div className="stripe-element-wrapper">
              <ExpressCheckoutElement onConfirm={handleExpressConfirm} />
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0',
            gap: '10px'
          }}>
            <div style={{ flex: 1, borderTop: '1px solid #e0e0e0' }}></div>
            <span style={{
              color: '#6b7280',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}>or use the form below</span>
            <div style={{ flex: 1, borderTop: '1px solid #e0e0e0' }}></div>
          </div>
        </>
      )}
      {additionalElements.includes('shipping') && (
        <>
          {hasAdditionalElements && (
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
              Shipping Address
            </h3>
          )}
          <div className="stripe-element-container">
            {!hasAdditionalElements && <label className="stripe-element-label">Shipping Address</label>}
            <div className="stripe-element-wrapper">
              <AddressElement options={{ mode: 'shipping' }} />
            </div>
          </div>
        </>
      )}
      {additionalElements.includes('billing') && (
        <>
          {hasAdditionalElements && (
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
              Billing Address
            </h3>
          )}
          <div className="stripe-element-container">
            {!hasAdditionalElements && <label className="stripe-element-label">Billing Address</label>}
            <div className="stripe-element-wrapper">
              <AddressElement options={{ mode: 'billing' }} />
            </div>
          </div>
        </>
      )}
      {hasAdditionalElements && (
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
          Payment Method
        </h3>
      )}
      <div className="stripe-element-container">
        {!hasAdditionalElements && <label className="stripe-element-label">Payment Details</label>}
        <div className="stripe-element-wrapper">
          <PaymentElement onReady={() => setIsReady(true)} options={{ layout: 'tabs' }} />
        </div>
      </div>
      {message && <div className="payment-message">{message}</div>}
      <button disabled={isLoading || !stripe || !elements || !isReady} className="pay-button">
        {isLoading ? 'Processing...' : isReady ? `Pay ${formatCurrency(amount, currency)}` : 'Loading...'}
      </button>
    </form>
  );
};

const PaymentElementReactDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto', additionalElements = '' } = paymentOptions;
  const additionalElementsArray = additionalElements ? additionalElements.split(',').filter(e => e) : [];
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
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
    setClientSecret('');

    fetch(`${API_BASE_URL}/payment-element/create-payment-intent/default`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseInt(amount),
        currency,
        country,
        paymentMethods: paymentMethods === 'auto' ? null : paymentMethods.split(',')
      }),
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
        if (!abortController.signal.aborted) {
          requestInFlightRef.current = false;
        }
      });

    return () => {
      abortController.abort();
      // Don't rely on finally to reset this - do it in cleanup too
      requestInFlightRef.current = false;
    };
  }, [country, currency, amount, paymentMethods, redirectStatus]);

  if (redirectStatus === 'succeeded') {
    const paymentIntentId = urlParams.get('payment_intent');
    return (
      <SuccessMessage
        title="PAYMENT COMPLETE"
        message="Your payment has been processed successfully!"
        intentId={paymentIntentId}
        returnPath="/payment-element"
      />
    );
  }

  return (
    <>
      {error ? (
        <div className="error-container">
          <div className="error-title">ERROR</div>
          <div className="error-message">{error}</div>
        </div>
      ) : stripePromise && clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
          <CheckoutForm
            amount={amount}
            currency={currency}
            implementation={implementation}
            mode={mode}
            country={country}
            paymentMethods={paymentMethods}
            additionalElements={additionalElementsArray}
          />
        </Elements>
      ) : (
        <div className="loading">Loading payment form...</div>
      )}
    </>
  );
};

export default PaymentElementReactDefaultDemo;
