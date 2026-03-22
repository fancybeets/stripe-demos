import { useEffect, useRef, useState } from 'react';
import { getStripeAppearance } from '../../../../config/stripeAppearance';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { buildReturnUrl } from '../../../../utils/buildReturnUrl';
import { waitForStripe } from '../../../../utils/waitForStripe';
import { createElements, confirmPayment } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const PaymentElementJSDefaultDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto', additionalElements = '' } = paymentOptions;
  const additionalElementsArray = additionalElements ? additionalElements.split(',').filter(e => e) : [];
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const stripeElementsRef = useRef(null);
  const paymentElementRef = useRef(null);
  const expressElementRef = useRef(null);
  const billingElementRef = useRef(null);
  const shippingElementRef = useRef(null);
  const requestInFlightRef = useRef(false);

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

    waitForStripe()
      .then(() => fetch(`${API_BASE_URL}/payment-element/create-payment-intent/default`, {
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

    // Properly unmount existing elements before creating new ones
    if (paymentElementRef.current) {
      try {
        paymentElementRef.current.unmount();
      } catch (e) {
        // Element already unmounted
      }
      paymentElementRef.current = null;
    }
    if (expressElementRef.current) {
      try {
        expressElementRef.current.unmount();
      } catch (e) {
        // Element already unmounted
      }
      expressElementRef.current = null;
    }
    if (billingElementRef.current) {
      try {
        billingElementRef.current.unmount();
      } catch (e) {
        // Element already unmounted
      }
      billingElementRef.current = null;
    }
    if (shippingElementRef.current) {
      try {
        shippingElementRef.current.unmount();
      } catch (e) {
        // Element already unmounted
      }
      shippingElementRef.current = null;
    }

    const elements = createElements(stripePromise, { clientSecret, appearance: getStripeAppearance() });
    stripeElementsRef.current = elements;

    const form = document.getElementById('payment-form-js-default');
    const submitButton = document.getElementById('submit-button-js-default');
    const messageDiv = document.getElementById('payment-message-js-default');

    const payButtonText = `Pay ${formatCurrency(amount, currency)}`;

    const handleExpressConfirm = async (event) => {
      const { error } = await confirmPayment(stripePromise, {
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
        messageDiv.textContent = error.message;
        messageDiv.style.display = 'block';
      }
    };

    // Create and mount additional elements
    if (additionalElementsArray.includes('express')) {
      const expressElement = elements.create('expressCheckout');
      expressElementRef.current = expressElement;
      expressElement.mount('#express-element-js-default');
      expressElement.on('confirm', handleExpressConfirm);
    }

    if (additionalElementsArray.includes('shipping')) {
      const shippingElement = elements.create('address', { mode: 'shipping' });
      shippingElementRef.current = shippingElement;
      shippingElement.mount('#shipping-element-js-default');
    }

    if (additionalElementsArray.includes('billing')) {
      const billingElement = elements.create('address', { mode: 'billing' });
      billingElementRef.current = billingElement;
      billingElement.mount('#billing-element-js-default');
    }

    const paymentElement = elements.create('payment', { layout: 'tabs' });
    paymentElementRef.current = paymentElement;
    paymentElement.mount('#payment-element-js-default');

    const handleSubmit = async (e) => {
      e.preventDefault();
      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';
      messageDiv.textContent = '';

      const { error } = await confirmPayment(stripePromise, {
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
        messageDiv.textContent = error.message;
        messageDiv.style.display = 'block';
      }

      submitButton.disabled = false;
      submitButton.textContent = payButtonText;
    };

    form.addEventListener('submit', handleSubmit);

    return () => {
      form.removeEventListener('submit', handleSubmit);
      if (expressElementRef.current) {
        try {
          expressElementRef.current.unmount();
        } catch (e) {
          // Element already unmounted
        }
        expressElementRef.current = null;
      }
      if (billingElementRef.current) {
        try {
          billingElementRef.current.unmount();
        } catch (e) {
          // Element already unmounted
        }
        billingElementRef.current = null;
      }
      if (shippingElementRef.current) {
        try {
          shippingElementRef.current.unmount();
        } catch (e) {
          // Element already unmounted
        }
        shippingElementRef.current = null;
      }
      if (paymentElementRef.current) {
        try {
          paymentElementRef.current.unmount();
        } catch (e) {
          // Element already unmounted
        }
        paymentElementRef.current = null;
      }
    };
  }, [stripePromise, clientSecret, additionalElements]);

  if (redirectStatus === 'succeeded') {
    const paymentIntentId = urlParams.get('payment_intent');
    return (
      <SuccessMessage
        title="PAYMENT COMPLETE"
        message="Your payment was successful!"
        intentId={paymentIntentId}
        returnPath="/payment-element"
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
        <form id="payment-form-js-default">
          {additionalElementsArray.includes('express') && (
            <>
              {additionalElementsArray.length > 0 && (
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
                  Express checkout for {formatCurrency(amount, currency)}
                </h3>
              )}
              <div className="stripe-element-container">
                {additionalElementsArray.length === 0 && <label className="stripe-element-label">Express Checkout</label>}
                <div className="stripe-element-wrapper">
                  <div id="express-element-js-default"></div>
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
          {additionalElementsArray.includes('shipping') && (
            <>
              {additionalElementsArray.length > 0 && (
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
                  Shipping Address
                </h3>
              )}
              <div className="stripe-element-container">
                {additionalElementsArray.length === 0 && <label className="stripe-element-label">Shipping Address</label>}
                <div className="stripe-element-wrapper">
                  <div id="shipping-element-js-default"></div>
                </div>
              </div>
            </>
          )}
          {additionalElementsArray.includes('billing') && (
            <>
              {additionalElementsArray.length > 0 && (
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0', marginTop: '20px' }}>
                  Billing Address
                </h3>
              )}
              <div className="stripe-element-container">
                {additionalElementsArray.length === 0 && <label className="stripe-element-label">Billing Address</label>}
                <div className="stripe-element-wrapper">
                  <div id="billing-element-js-default"></div>
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
              <div id="payment-element-js-default"></div>
            </div>
          </div>
          <div id="payment-message-js-default" className="payment-message" style={{ display: 'none' }}></div>
          <button id="submit-button-js-default" className="pay-button">
            Pay {formatCurrency(amount, currency)}
          </button>
        </form>
      ) : (
        <div className="loading">Loading payment form...</div>
      )}
    </div>
  );
};

export default PaymentElementJSDefaultDemo;
