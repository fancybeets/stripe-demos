import React from 'react';
import PaymentElementReactDefault from './react-default/Code';
import PaymentElementReactDeferred from './react-deferred/Code';
import PaymentElementJSDefault from './js-default/Code';
import PaymentElementJSDeferred from './js-deferred/Code';

const PaymentElementCode = ({ implementation, mode, paymentOptions }) => {
  const key = `${implementation}-${mode}`;
  const components = {
    'react-default': PaymentElementReactDefault,
    'react-deferred': PaymentElementReactDeferred,
    'javascript-default': PaymentElementJSDefault,
    'javascript-deferred': PaymentElementJSDeferred,
  };

  const Component = components[key];

  return (
    <div className="view-content">
      <Component />
    </div>
  );
};

export default PaymentElementCode;
