import React from 'react';
import PaymentElementReactDefault from './react-default/Demo';
import PaymentElementReactDeferred from './react-deferred/Demo';
import PaymentElementJSDefault from './js-default/Demo';
import PaymentElementJSDeferred from './js-deferred/Demo';

const PaymentElementDemo = ({ implementation, mode, paymentOptions }) => {
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
      <Component implementation={implementation} mode={mode} paymentOptions={paymentOptions} />
    </div>
  );
};

export default PaymentElementDemo;
