import React from 'react';
import { returnToCheckout } from '../../utils/returnToCheckout';
import './SuccessMessage.css';

/**
 * Success message component for completed payments
 * @param {Object} props
 * @param {string} props.title - Main title text (e.g., "PAYMENT COMPLETE")
 * @param {string} props.message - Success message text
 * @param {string} [props.intentId] - Optional Payment Intent ID to display
 * @param {string} props.returnPath - Path to return to (e.g., '/payment-element')
 * @param {string} [props.className] - Additional CSS class names
 */
const SuccessMessage = ({ title, message, intentId, returnPath, onBack, className = '' }) => {
  const handleBackClick = () => {
    if (onBack) onBack();
    else returnToCheckout(returnPath);
  };

  return (
    <div className={`success-container ${className}`}>
      <div className="success-box">
        <div className="success-icon">✓</div>
        <div className="success-title">{title}</div>
        <div className="success-message">{message}</div>
        {intentId && (
          <div className="success-intent-id">
            Payment Intent: {intentId}
          </div>
        )}
        <button
          onClick={handleBackClick}
          className="pay-button success-back-button"
        >
          BACK TO CHECKOUT
        </button>
      </div>
    </div>
  );
};

export default SuccessMessage;
