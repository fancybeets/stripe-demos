import { useEffect, useRef, useState } from 'react';
import { getStripeAppearance } from '../../../../config/stripeAppearance';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { waitForStripe } from '../../../../utils/waitForStripe';
import { logCheckoutCreation, logCheckoutActionsConfirm } from '../../../../utils/stripeLogger';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const CheckoutSessionsJSDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto', quantity = '1', additionalElements = '' } = paymentOptions;
  const additionalElementsArray = additionalElements ? additionalElements.split(',').filter(e => e) : [];
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
          quantity: parseInt(quantity) || 1,
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
  }, [country, currency, amount, paymentMethods, quantity]);

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

      // Mount optional express checkout element
      if (additionalElementsArray.includes('express')) {
        const expressElement = checkout.createExpressCheckoutElement();
        expressElement.mount('#express-element-js-checkout');
      }

      // Mount optional address elements
      if (additionalElementsArray.includes('shipping')) {
        const shippingElement = checkout.createShippingAddressElement();
        shippingElement.mount('#shipping-element-js-checkout');
      }

      if (additionalElementsArray.includes('billing')) {
        const billingElement = checkout.createBillingAddressElement();
        billingElement.mount('#billing-element-js-checkout');
      }

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

    const payButtonText = `Pay ${formatCurrency(String(parseInt(amount) * (parseInt(quantity) || 1)), currency)}`;

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
          {additionalElementsArray.includes('express') && (
            <>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
                Express checkout for {formatCurrency(String(parseInt(amount) * (parseInt(quantity) || 1)), currency)}
              </h3>
              <div className="stripe-element-container">
                <div className="stripe-element-wrapper">
                  <div id="express-element-js-checkout"></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
                <div style={{ flex: 1, borderTop: '1px solid #e0e0e0' }}></div>
                <span style={{ color: '#6b7280', fontSize: '14px', whiteSpace: 'nowrap' }}>or use the form below</span>
                <div style={{ flex: 1, borderTop: '1px solid #e0e0e0' }}></div>
              </div>
            </>
          )}
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
            Email
          </h3>
          <div className="stripe-element-container">
            <input
              id="email-input-js-checkout"
              type="email"
              placeholder="email@example.com"
              required
              className="email-input"
            />
          </div>
          {additionalElementsArray.includes('shipping') && (
            <>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
                Shipping Address
              </h3>
              <div className="stripe-element-container">
                <div className="stripe-element-wrapper">
                  <div id="shipping-element-js-checkout"></div>
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
                  <div id="billing-element-js-checkout"></div>
                </div>
              </div>
            </>
          )}
          {additionalElementsArray.length > 0 && (
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
              Payment Method
            </h3>
          )}
          <div className="stripe-element-container">
            {additionalElementsArray.length === 0 && <label className="stripe-element-label">Payment Details</label>}
            <div className="stripe-element-wrapper">
              <div id="payment-element-js-checkout"></div>
            </div>
          </div>
          <div id="payment-message-js-checkout" className="payment-message" style={{ display: 'none' }}></div>
          <button id="submit-button-js-checkout" type="button" className="pay-button">
            Pay {formatCurrency(String(parseInt(amount) * (parseInt(quantity) || 1)), currency)}
          </button>
        </form>
      ) : (
        <div className="loading">Loading checkout form...</div>
      )}
    </div>
  );
};

export default CheckoutSessionsJSDefaultDemo;
