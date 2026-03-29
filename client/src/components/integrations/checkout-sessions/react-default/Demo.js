import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutProvider, PaymentElement, ExpressCheckoutElement, ShippingAddressElement, BillingAddressElement, useCheckout } from '@stripe/react-stripe-js/checkout';
import { useStripeAppearance } from '../../../../hooks/useStripeAppearance';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { logCheckoutCreation, checkoutUpdateEmail, checkoutConfirm } from '../../../../utils/stripeLogger';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const CheckoutForm = ({ amount, currency, quantity = '1', additionalElementsArray = [] }) => {
  const checkoutState = useCheckout();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasLoggedRef = React.useRef(false);

  useEffect(() => {
    if (!hasLoggedRef.current) {
      logCheckoutCreation();
      hasLoggedRef.current = true;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkoutState?.checkout || !email) {
      setMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);

    // Update email first
    const emailResult = await checkoutUpdateEmail(checkoutState.checkout, email);
    if (emailResult.type === 'error') {
      setMessage(emailResult.error.message);
      setIsLoading(false);
      return;
    }

    // Then confirm payment
    const result = await checkoutConfirm(checkoutState.checkout);

    if (result.type === 'error') {
      setMessage(result.error.message);
    } else {
      setMessage('Payment successful!');
    }

    setIsLoading(false);
  };

  const hasAdditionalElements = additionalElementsArray.length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
        Email
      </h3>
      <div className="stripe-element-container">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="email-input"
        />
      </div>
      {additionalElementsArray.includes('express') && (
        <>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
            Express checkout for {formatCurrency(String(parseInt(amount) * (parseInt(quantity) || 1)), currency)}
          </h3>
          <div className="stripe-element-container">
            <div className="stripe-element-wrapper">
              <ExpressCheckoutElement />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
            <div style={{ flex: 1, borderTop: '1px solid #e0e0e0' }}></div>
            <span style={{ color: '#6b7280', fontSize: '14px', whiteSpace: 'nowrap' }}>or use the form below</span>
            <div style={{ flex: 1, borderTop: '1px solid #e0e0e0' }}></div>
          </div>
        </>
      )}
      {additionalElementsArray.includes('shipping') && (
        <>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
            Shipping Address
          </h3>
          <div className="stripe-element-container">
            <div className="stripe-element-wrapper">
              <ShippingAddressElement />
            </div>
          </div>
        </>
      )}
      {additionalElementsArray.includes('billing') && (
        <>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
            Billing Address
          </h3>
          <div className="stripe-element-container">
            <div className="stripe-element-wrapper">
              <BillingAddressElement />
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
      <button disabled={isLoading || !checkoutState?.checkout || !isReady || !email} className="pay-button">
        {isLoading ? 'Processing...' : isReady ? `Pay ${formatCurrency(String(parseInt(amount) * (parseInt(quantity) || 1)), currency)}` : 'Loading...'}
      </button>
    </form>
  );
};

const CheckoutSessionsReactDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto', quantity = '1', additionalElements = '' } = paymentOptions;
  const additionalElementsArray = additionalElements ? additionalElements.split(',').filter(e => e) : [];
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const stripeAppearance = useStripeAppearance();
  const requestInFlightRef = React.useRef(false);

  useEffect(() => {
    // Prevent duplicate requests
    if (requestInFlightRef.current) {
      return;
    }

    const abortController = new AbortController();
    requestInFlightRef.current = true;

    setError(null);
    setStripePromise(null);
    setClientSecret('');

    fetch(`${API_BASE_URL}/checkout-sessions/create-session/default`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseInt(amount),
        currency,
        country,
        quantity: parseInt(quantity) || 1,
        paymentMethods: paymentMethods === 'auto' ? null : paymentMethods.split(','),
        implementation,
        mode,
        currentQueryString: window.location.search
      }),
      signal: abortController.signal,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || 'Failed to create checkout session');
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
      .catch((error) => {
        if (!abortController.signal.aborted) {
          setError(error.message);
          console.error('Error creating checkout session:', error);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          requestInFlightRef.current = false;
        }
      });

    return () => {
      abortController.abort();
      requestInFlightRef.current = false;
    };
  }, [amount, currency, country, paymentMethods, quantity]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!clientSecret || !stripePromise) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: {
          appearance: stripeAppearance
        }
      }}
    >
      <CheckoutForm amount={amount} currency={currency} quantity={quantity} additionalElementsArray={additionalElementsArray} />
    </CheckoutProvider>
  );
};

export default CheckoutSessionsReactDefaultDemo;
