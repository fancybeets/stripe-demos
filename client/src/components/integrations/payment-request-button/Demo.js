import React from 'react';
import PaymentRequestButtonReactDefault from './react-default/Demo';
import PaymentRequestButtonJSDefault from './js-default/Demo';

const PaymentRequestButtonDemo = ({ implementation, mode, paymentOptions }) => {
  const key = `${implementation}-default`;
  const components = {
    'react-default': PaymentRequestButtonReactDefault,
    'javascript-default': PaymentRequestButtonJSDefault,
  };

  const Component = components[key];

  return (
    <div className="view-content">
      <Component implementation={implementation} mode={mode} paymentOptions={paymentOptions} />
    </div>
  );
};

export default PaymentRequestButtonDemo;
