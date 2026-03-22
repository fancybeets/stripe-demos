import React from 'react';
import CheckoutSessionsReactDefault from './react-default/Code';
import CheckoutSessionsJSDefault from './js-default/Code';

const CheckoutSessionsCode = ({ implementation, mode, paymentOptions }) => {
  const key = `${implementation}-default`;
  const components = {
    'react-default': CheckoutSessionsReactDefault,
    'javascript-default': CheckoutSessionsJSDefault,
  };

  const Component = components[key];

  return (
    <div className="view-content">
      <Component />
    </div>
  );
};

export default CheckoutSessionsCode;
