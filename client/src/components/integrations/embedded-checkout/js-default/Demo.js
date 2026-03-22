import { useEffect, useRef, useState } from 'react';
import { waitForStripe } from '../../../../utils/waitForStripe';
import '../../Integration.css';
import API_BASE_URL from '../../../../config/api';

const EmbeddedCheckoutJSDefaultDemo = ({ paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '4242', paymentMethods = 'auto' } = paymentOptions;
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);
  const checkoutRef = useRef(null);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    if (requestInFlightRef.current) return;

    const abortController = new AbortController();
    requestInFlightRef.current = true;

    setError(null);
    setLoaded(false);

    waitForStripe()
      .then(() => fetch(`${API_BASE_URL}/embedded-checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          currency,
          country,
          paymentMethods: paymentMethods === 'auto' ? null : paymentMethods.split(','),
          currentQueryString: window.location.search,
          theme: localStorage.getItem('theme') || 'simple',
        }),
        signal: abortController.signal,
      }))
      .then((res) => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to create session'); });
        return res.json();
      })
      .then(async (data) => {
        if (abortController.signal.aborted) return;
        const stripe = window.Stripe(data.publishableKey);
        const checkout = await stripe.initEmbeddedCheckout({ clientSecret: data.clientSecret });
        checkoutRef.current = checkout;
        if (containerRef.current) {
          checkout.mount(containerRef.current);
          setLoaded(true);
        }
      })
      .catch((err) => {
        if (!abortController.signal.aborted) setError(err.message);
      })
      .finally(() => {
        requestInFlightRef.current = false;
      });

    return () => {
      abortController.abort();
      requestInFlightRef.current = false;
      if (checkoutRef.current) {
        checkoutRef.current.destroy();
        checkoutRef.current = null;
      }
    };
  }, [amount, currency, country, paymentMethods]);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-title">ERROR</div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {!loaded && <div className="loading-message">Loading...</div>}
      <div ref={containerRef} />
    </div>
  );
};

export default EmbeddedCheckoutJSDefaultDemo;
