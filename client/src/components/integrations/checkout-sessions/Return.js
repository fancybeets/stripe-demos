import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SuccessMessage from '../../shared/SuccessMessage';
import '../Integration.css';

const CheckoutSessionsReturn = ({ sessionId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  const handleBackToCheckout = () => {
    const params = new URLSearchParams(location.search);
    params.delete('session_id');
    navigate(`/checkout-sessions?${params.toString()}`);
  };

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID provided');
      return;
    }

    setStatus('success');
    setMessage('Payment successful! Your order has been confirmed.');
  }, [sessionId]);

  return (
    <div className="view-content" style={{ padding: '40px 20px', textAlign: 'center' }}>
      {status === 'loading' && (
        <div className="loading">
          <div style={{ fontSize: '16px', marginBottom: '20px' }}>VERIFYING PAYMENT...</div>
        </div>
      )}

      {status === 'success' && (
        <SuccessMessage
          title="PAYMENT COMPLETE"
          message={message}
          intentId={`Session: ${sessionId}`}
          returnPath="/checkout-sessions"
          onBack={handleBackToCheckout}
        />
      )}

      {status === 'error' && (
        <div className="error-container">
          <div className="error-title">ERROR</div>
          <div className="error-message">{message}</div>
        </div>
      )}
    </div>
  );
};

export default CheckoutSessionsReturn;
