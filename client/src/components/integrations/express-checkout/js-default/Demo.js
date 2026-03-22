import { useEffect, useRef, useState } from 'react';
import { getStripeAppearance } from '../../../../config/stripeAppearance';
import { buildReturnUrl } from '../../../../utils/buildReturnUrl';
import { waitForStripe } from '../../../../utils/waitForStripe';
import { createElements } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const ExpressCheckoutJSDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto' } = paymentOptions;
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const stripeElementsRef = useRef(null);
  const expressCheckoutRef = useRef(null);
  const requestInFlightRef = useRef(false);

  const urlParams = new URLSearchParams(window.location.search);
  const redirectStatus = urlParams.get('redirect_status');

  useEffect(() => {
    if (redirectStatus === 'succeeded') return;
    if (requestInFlightRef.current) return;

    const abortController = new AbortController();
    requestInFlightRef.current = true;

    setError(null);
    setStripePromise(null);
    setClientSecret('');

    waitForStripe()
      .then(() => fetch(`${API_BASE_URL}/express-checkout-element/create-payment-intent/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          currency,
          country,
          paymentMethods: paymentMethods === 'auto' ? null : paymentMethods.split(',')
        }),
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
  }, [country, currency, amount, paymentMethods, redirectStatus]);

  useEffect(() => {
    if (!stripePromise || !clientSecret || !containerRef.current) return;

    if (expressCheckoutRef.current) {
      try {
        expressCheckoutRef.current.unmount();
      } catch (e) {
        // Element already unmounted
      }
      expressCheckoutRef.current = null;
    }

    const elements = createElements(stripePromise, { clientSecret, appearance: getStripeAppearance() });
    stripeElementsRef.current = elements;

    const expressCheckoutElement = elements.create('expressCheckout', {
      buttonType: {
        applePay: 'buy',
        googlePay: 'buy',
        paypal: 'buynow'
      }
    });
    expressCheckoutRef.current = expressCheckoutElement;

    const messageDiv = document.getElementById('express-message-js-default');

    expressCheckoutElement.on('confirm', async () => {
      messageDiv.textContent = '';
      messageDiv.style.display = 'none';

      const { error } = await stripePromise.confirmPayment({
        elements,
        confirmParams: {
          return_url: buildReturnUrl('/express-checkout-element', {
            implementation,
            mode,
            country,
            currency,
            amount,
            paymentMethods,
          }),
        },
        redirect: 'always',
      });

      if (error) {
        messageDiv.textContent = error.message;
        messageDiv.style.display = 'block';
      }
    });

    expressCheckoutElement.mount('#express-checkout-js-default');

    return () => {
      if (expressCheckoutRef.current) {
        try {
          expressCheckoutRef.current.unmount();
        } catch (e) {
          // Element already unmounted
        }
        expressCheckoutRef.current = null;
      }
    };
  }, [stripePromise, clientSecret]);

  if (redirectStatus === 'succeeded') {
    const paymentIntentId = urlParams.get('payment_intent');
    return (
      <SuccessMessage
        title="PAYMENT COMPLETE"
        message="Your payment has been processed successfully!"
        intentId={paymentIntentId}
        returnPath="/express-checkout-element"
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
            <label className="stripe-element-label">Express Checkout Options</label>
            <div className="stripe-element-wrapper">
              <div id="express-checkout-js-default"></div>
            </div>
          </div>
          <div id="express-message-js-default" className="payment-message" style={{ display: 'none' }}></div>
        </>
      ) : (
        <div className="loading">Loading express checkout...</div>
      )}
    </div>
  );
};

export default ExpressCheckoutJSDefaultDemo;
