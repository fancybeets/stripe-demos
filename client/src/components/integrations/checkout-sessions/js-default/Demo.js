import { useEffect, useRef, useState } from 'react';
import { getStripeAppearance } from '../../../../config/stripeAppearance';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { waitForStripe } from '../../../../utils/waitForStripe';
import { logCheckoutCreation, logCheckoutActionsConfirm } from '../../../../utils/stripeLogger';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const CheckoutSessionsJSDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto' } = paymentOptions;
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [isCheckoutReady, setIsCheckoutReady] = useState(false);
  const containerRef = useRef(null);
  const checkoutRef = useRef(null);
  const requestInFlightRef = useRef(false);

  // First effect: Fetch the checkout session
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

    waitForStripe()
      .then(() => fetch(`${API_BASE_URL}/checkout-sessions/create-session/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          currency,
          country,
          paymentMethods: paymentMethods === 'auto' ? null : paymentMethods.split(','),
          implementation,
          mode,
          currentQueryString: window.location.search
        }),
        signal: abortController.signal,
      }))
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
  }, [country, currency, amount, paymentMethods]);

  // Second effect: Initialize checkout and mount payment element
  useEffect(() => {
    if (!stripePromise || !clientSecret || !containerRef.current) return;

    const initCheckout = async () => {
      logCheckoutCreation();

      const checkout = stripePromise.initCheckout({
        clientSecret,
        elementsOptions: {
          appearance: getStripeAppearance()
        }
      });

      checkoutRef.current = checkout;

      // Mount the payment element
      const paymentElement = checkout.createPaymentElement({ layout: 'tabs' });
      paymentElement.mount('#payment-element-js-checkout');

      setIsCheckoutReady(true);
    };

    initCheckout();

    return () => {
      setIsCheckoutReady(false);
      if (checkoutRef.current) {
        checkoutRef.current = null;
      }
    };
  }, [stripePromise, clientSecret]);

  // Third effect: Setup form submission handler
  useEffect(() => {
    if (!isCheckoutReady || !checkoutRef.current) return;

    const form = document.getElementById('checkout-form-js-default');
    const emailInput = document.getElementById('email-input-js-checkout');
    const submitButton = document.getElementById('submit-button-js-checkout');
    const messageDiv = document.getElementById('payment-message-js-checkout');

    if (!form || !emailInput || !submitButton || !messageDiv) return;

    const payButtonText = `Pay ${formatCurrency(amount, currency)}`;

    const handleSubmit = async (e) => {
      e.preventDefault();

      const email = emailInput.value;
      if (!email) {
        messageDiv.textContent = 'Please enter your email address';
        messageDiv.style.display = 'block';
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';
      messageDiv.textContent = '';
      messageDiv.style.display = 'none';

      try {
        const checkout = checkoutRef.current;

        // Load actions to get updateEmail and confirm methods
        const actionsResult = await checkout.loadActions();

        if (actionsResult.type === 'error') {
          messageDiv.textContent = actionsResult.error.message;
          messageDiv.style.display = 'block';
          submitButton.disabled = false;
          submitButton.textContent = payButtonText;
          return;
        }

        const { actions } = actionsResult;

        // Update email first
        const emailResult = await actions.updateEmail(email);
        if (emailResult && emailResult.type === 'error') {
          messageDiv.textContent = emailResult.error.message;
          messageDiv.style.display = 'block';
          submitButton.disabled = false;
          submitButton.textContent = payButtonText;
          return;
        }

        // Then confirm payment
        // Log the confirmation request (JS implementation uses actions.confirm())
        logCheckoutActionsConfirm();
        const result = await actions.confirm();

        if (result && result.error) {
          messageDiv.textContent = result.error.message;
          messageDiv.style.display = 'block';
        } else {
          // On success, Stripe will redirect to return_url
          messageDiv.textContent = 'Payment processing...';
          messageDiv.style.display = 'block';
        }
      } catch (error) {
        console.error('Payment error:', error);
        messageDiv.textContent = error.message || 'An error occurred';
        messageDiv.style.display = 'block';
      }

      submitButton.disabled = false;
      submitButton.textContent = payButtonText;
    };

    submitButton.addEventListener('click', handleSubmit);

    return () => {
      submitButton.removeEventListener('click', handleSubmit);
    };
  }, [isCheckoutReady, stripePromise, clientSecret]);

  return (
    <div ref={containerRef}>
      {error ? (
        <div className="error-container">
          <div className="error-title">ERROR</div>
          <div className="error-message">{error}</div>
        </div>
      ) : stripePromise && clientSecret ? (
        <form id="checkout-form-js-default">
          <div className="stripe-element-container">
            <label className="stripe-element-label">Email</label>
            <input
              id="email-input-js-checkout"
              type="email"
              placeholder="email@example.com"
              required
              className="email-input"
            />
          </div>
          <div className="stripe-element-container">
            <label className="stripe-element-label">Payment Details</label>
            <div className="stripe-element-wrapper">
              <div id="payment-element-js-checkout"></div>
            </div>
          </div>
          <div id="payment-message-js-checkout" className="payment-message" style={{ display: 'none' }}></div>
          <button id="submit-button-js-checkout" type="button" className="pay-button">
            Pay {formatCurrency(amount, currency)}
          </button>
        </form>
      ) : (
        <div className="loading">Loading checkout form...</div>
      )}
    </div>
  );
};

export default CheckoutSessionsJSDefaultDemo;
