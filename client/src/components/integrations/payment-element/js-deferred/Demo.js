import { useEffect, useRef, useState } from 'react';
import { getStripeAppearance } from '../../../../config/stripeAppearance';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { buildReturnUrl } from '../../../../utils/buildReturnUrl';
import { waitForStripe } from '../../../../utils/waitForStripe';
import { createElements, confirmPayment } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const PaymentElementJSDeferredDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto', additionalElements = '' } = paymentOptions;
  const additionalElementsArray = additionalElements ? additionalElements.split(',').filter(e => e) : [];
  const [stripePromise, setStripePromise] = useState(null);
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

    // Fetch publishableKey from config
    waitForStripe()
      .then(() => fetch(`${API_BASE_URL}/config?country=${country}`, {
        signal: abortController.signal,
      }))
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load Stripe configuration');
        }
        return res.json();
      })
      .then((data) => {
        if (!abortController.signal.aborted) {
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
  }, [country, redirectStatus]);

  useEffect(() => {
    if (!stripePromise || !containerRef.current) return;

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

    const elementsOptions = {
      mode: 'payment',
      amount: parseInt(amount),
      currency: currency,
      appearance: getStripeAppearance(),
    };

    if (paymentMethods !== 'auto') {
      elementsOptions.paymentMethodCreation = 'manual';
      elementsOptions.paymentMethodTypes = paymentMethods.split(',');
    }

    const elements = createElements(stripePromise, elementsOptions);
    stripeElementsRef.current = elements;

    const form = document.getElementById('payment-form-js-deferred');
    const submitButton = document.getElementById('submit-button-js-deferred');
    const messageDiv = document.getElementById('payment-message-js-deferred');

    const payButtonText = `Pay ${formatCurrency(amount, currency)}`;

    const handleExpressConfirm = async (event) => {
      try {
        // Submit the form to validate fields
        const { error: submitError } = await elements.submit();
        if (submitError) {
          messageDiv.textContent = submitError.message;
          messageDiv.style.display = 'block';
          return;
        }

        // Create the PaymentIntent on the server
        const response = await fetch(`${API_BASE_URL}/payment-element/create-payment-intent/deferred`, {
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
        const { error } = await confirmPayment(stripePromise, {
          elements,
          clientSecret,
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
      } catch (err) {
        messageDiv.textContent = err.message;
        messageDiv.style.display = 'block';
      }
    };

    // Create and mount additional elements
    if (additionalElementsArray.includes('express')) {
      const expressElement = elements.create('expressCheckout');
      expressElementRef.current = expressElement;
      expressElement.mount('#express-element-js-deferred');
      expressElement.on('confirm', handleExpressConfirm);
    }

    if (additionalElementsArray.includes('shipping')) {
      const shippingElement = elements.create('address', { mode: 'shipping' });
      shippingElementRef.current = shippingElement;
      shippingElement.mount('#shipping-element-js-deferred');
    }

    if (additionalElementsArray.includes('billing')) {
      const billingElement = elements.create('address', { mode: 'billing' });
      billingElementRef.current = billingElement;
      billingElement.mount('#billing-element-js-deferred');
    }

    const paymentElement = elements.create('payment', { layout: 'tabs' });
    paymentElementRef.current = paymentElement;
    paymentElement.mount('#payment-element-js-deferred');

    const handleSubmit = async (e) => {
      e.preventDefault();
      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';
      messageDiv.textContent = '';
      messageDiv.style.display = 'none';

      try {
        // Submit the form to validate fields
        const { error: submitError } = await elements.submit();
        if (submitError) {
          messageDiv.textContent = submitError.message;
          messageDiv.style.display = 'block';
          submitButton.disabled = false;
          submitButton.textContent = payButtonText;
          return;
        }

        // Create the PaymentIntent on the server
        const response = await fetch(`${API_BASE_URL}/payment-element/create-payment-intent/deferred`, {
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
        const { error} = await confirmPayment(stripePromise, {
          elements,
          clientSecret,
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
        } else {
          messageDiv.textContent = 'Payment authorized! (Capture required)';
          messageDiv.style.display = 'block';
        }
      } catch (err) {
        messageDiv.textContent = err.message;
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
  }, [stripePromise, amount, currency, country, paymentMethods, additionalElements]);

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
    <div ref={containerRef}>
      {error ? (
        <div className="error-container">
          <div className="error-title">ERROR</div>
          <div className="error-message">{error}</div>
        </div>
      ) : stripePromise ? (
        <form id="payment-form-js-deferred">
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
                  <div id="express-element-js-deferred"></div>
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
                  <div id="shipping-element-js-deferred"></div>
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
                  <div id="billing-element-js-deferred"></div>
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
              <div id="payment-element-js-deferred"></div>
            </div>
          </div>
          <div id="payment-message-js-deferred" className="payment-message" style={{ display: 'none' }}></div>
          <button id="submit-button-js-deferred" className="pay-button">
            Pay {formatCurrency(amount, currency)}
          </button>
        </form>
      ) : (
        <div className="loading">Loading payment form...</div>
      )}
    </div>
  );
};

export default PaymentElementJSDeferredDemo;
