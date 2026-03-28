import React from 'react';
import PaymentElementJSDefault from './js-default/Code';
import PaymentElementJSDeferred from './js-deferred/Code';

const PaymentElementCode = ({ implementation, mode, paymentOptions }) => {
  const isReact = implementation === 'react';
  const components = {
    'javascript-default': PaymentElementJSDefault,
    'javascript-deferred': PaymentElementJSDeferred,
  };

  const Component = components[`javascript-${mode}`];

  return (
    <div className="view-content">
      {isReact && <div className="react-unavailable-notice">React code examples are not available for this demo yet. Showing vanilla JavaScript instead.</div>}
      <Component />
    </div>
  );
};

export default PaymentElementCode;
