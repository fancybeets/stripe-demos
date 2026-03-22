import React from 'react';
import ExpressCheckoutReactDefault from './react-default/Demo';
import ExpressCheckoutReactDeferred from './react-deferred/Demo';
import ExpressCheckoutJSDefault from './js-default/Demo';
import ExpressCheckoutJSDeferred from './js-deferred/Demo';

const ExpressCheckoutDemo = ({ implementation, mode, paymentOptions }) => {
  const key = `${implementation}-${mode}`;
  const components = {
    'react-default': ExpressCheckoutReactDefault,
    'react-deferred': ExpressCheckoutReactDeferred,
    'javascript-default': ExpressCheckoutJSDefault,
    'javascript-deferred': ExpressCheckoutJSDeferred,
  };

  const Component = components[key];

  return (
    <div className="view-content">
      <Component implementation={implementation} mode={mode} paymentOptions={paymentOptions} />
    </div>
  );
};

export default ExpressCheckoutDemo;
