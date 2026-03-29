import React from 'react';
import CheckoutSessionsJSDefault from './js-default/Code';

const CheckoutSessionsCode = ({ implementation, mode, paymentOptions }) => {
  const isReact = implementation === 'react';

  return (
    <div className="view-content">
      {isReact && <div className="react-unavailable-notice">React code examples are not available for this demo yet. Showing vanilla JavaScript instead.</div>}
      <CheckoutSessionsJSDefault />
    </div>
  );
};

export default CheckoutSessionsCode;
