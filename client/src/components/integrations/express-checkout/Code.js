import React from 'react';
import ExpressCheckoutReactDefault from './react-default/Code';
import ExpressCheckoutReactDeferred from './react-deferred/Code';
import ExpressCheckoutJSDefault from './js-default/Code';
import ExpressCheckoutJSDeferred from './js-deferred/Code';

const ExpressCheckoutCode = ({ implementation, mode, paymentOptions }) => {
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
      <Component />
    </div>
  );
};

export default ExpressCheckoutCode;
