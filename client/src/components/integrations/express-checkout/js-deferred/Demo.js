import { useEffect, useRef, useState } from 'react';
import { getStripeAppearance } from '../../../../config/stripeAppearance';
import { buildReturnUrl } from '../../../../utils/buildReturnUrl';
import { waitForStripe } from '../../../../utils/waitForStripe';
import { createElements, confirmPayment } from '../../../../utils/stripeLogger';
import SuccessMessage from '../../../shared/SuccessMessage';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const ExpressCheckoutJSDeferredDemo = ({ implementation, mode, paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto' } = paymentOptions;
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const stripeElementsRef = useRef(null);
  const expressCheckoutRef = useRef(null);
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

    // Properly unmount existing element before creating a new one
    if (expressCheckoutRef.current) {
      try {
        expressCheckoutRef.current.unmount();
      } catch (e) {
        // Element already unmounted
      }
      expressCheckoutRef.current = null;
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

    const expressCheckoutElement = elements.create('expressCheckout', {
      buttonType: {
        applePay: 'buy',
        googlePay: 'buy',
        paypal: 'buynow'
      }
    });
    expressCheckoutRef.current = expressCheckoutElement;

    const messageDiv = document.getElementById('express-message-js-deferred');

    expressCheckoutElement.on('confirm', async (event) => {
      messageDiv.textContent = '';
      messageDiv.style.display = 'none';

      try {
        // Submit the form to validate fields
        const { error: submitError } = await elements.submit();
        if (submitError) {
          messageDiv.textContent = submitError.message;
          messageDiv.style.display = 'block';
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
        const { error } = await confirmPayment(stripePromise, {
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
    });

    expressCheckoutElement.mount('#express-checkout-js-deferred');

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
  }, [stripePromise, amount, currency, country, paymentMethods]);

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
      ) : stripePromise ? (
        <>
          <div className="stripe-element-container">
            <label className="stripe-element-label">Express Checkout Options</label>
            <div className="stripe-element-wrapper">
              <div id="express-checkout-js-deferred"></div>
            </div>
          </div>
          <div id="express-message-js-deferred" className="payment-message" style={{ display: 'none' }}></div>
        </>
      ) : (
        <div className="loading">Loading express checkout...</div>
      )}
    </div>
  );
};

export default ExpressCheckoutJSDeferredDemo;
