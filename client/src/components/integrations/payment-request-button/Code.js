import React from 'react';
import PaymentRequestButtonReactDefault from './react-default/Code';
import PaymentRequestButtonJSDefault from './js-default/Code';

const PaymentRequestButtonCode = ({ implementation, mode, paymentOptions }) => {
  const key = `${implementation}-default`;
  const components = {
    'react-default': PaymentRequestButtonReactDefault,
    'javascript-default': PaymentRequestButtonJSDefault,
  };

  const Component = components[key];

  return (
    <div className="view-content">
      <Component />
    </div>
  );
};

export default PaymentRequestButtonCode;
