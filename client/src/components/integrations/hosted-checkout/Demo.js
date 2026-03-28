import React, { useState } from 'react';
import { useApiLogger } from '../../../context/ApiLoggerContext';
import API_BASE_URL from '../../../config/api';
import '../Integration.css';
import './Demo.css';

const HostedCheckoutDemo = ({ paymentOptions = {} }) => {
  const { country = 'US', currency = 'usd', amount = '2000', quantity = '1' } = paymentOptions;
  const { addLog: addApiLog } = useApiLogger();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    const start = Date.now();

    try {
      const body = {
        amount: parseInt(amount),
        currency,
        country,
        quantity: parseInt(quantity) || 1,
        currentQueryString: window.location.search,
      };

      const res = await fetch(`${API_BASE_URL}/hosted-checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const duration = Date.now() - start;

      addApiLog({
        id: `${Date.now()}-${Math.random()}`,
        method: 'POST',
        url: '/hosted-checkout/create-session',
        status: res.status,
        timestamp: Date.now(),
        request: body,
        response: data,
        duration,
        stripeRequestId: data.stripeRequestId || null,
      });

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format((parseInt(amount) * (parseInt(quantity) || 1)) / 100);

  return (
    <div className="hosted-checkout-demo">
      {error && (
        <div className="error-container">
          <div className="error-title">ERROR</div>
          <div className="error-message">{error}</div>
        </div>
      )}
      <div className="hosted-checkout-product">
        <div className="hosted-checkout-product-name">{parseInt(quantity) > 1 ? `${parseInt(quantity)}x ` : ''}Potato</div>
        <div className="hosted-checkout-product-price">{formattedAmount}</div>
      </div>
      <button
        className="hosted-checkout-button"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? 'Redirecting...' : 'Checkout'}
      </button>
    </div>
  );
};

export default HostedCheckoutDemo;
