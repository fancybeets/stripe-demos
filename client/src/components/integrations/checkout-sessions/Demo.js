import React from 'react';
import CheckoutSessionsReactDefault from './react-default/Demo';
import CheckoutSessionsJSDefault from './js-default/Demo';

const CheckoutSessionsDemo = ({ implementation, mode, paymentOptions }) => {
  const key = `${implementation}-default`;
  const components = {
    'react-default': CheckoutSessionsReactDefault,
    'javascript-default': CheckoutSessionsJSDefault,
  };

  const Component = components[key];

  return (
    <div className="view-content">
      <Component implementation={implementation} mode={mode} paymentOptions={paymentOptions} />
    </div>
  );
};

export default CheckoutSessionsDemo;
