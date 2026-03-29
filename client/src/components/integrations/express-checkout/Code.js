import React from 'react';
import ExpressCheckoutJSDefault from './js-default/Code';
import ExpressCheckoutJSDeferred from './js-deferred/Code';

const ExpressCheckoutCode = ({ implementation, mode, paymentOptions }) => {
  const isReact = implementation === 'react';
  const components = {
    'javascript-default': ExpressCheckoutJSDefault,
    'javascript-deferred': ExpressCheckoutJSDeferred,
  };

  const Component = components[`javascript-${mode}`];

  return (
    <div className="view-content">
      {isReact && <div className="react-unavailable-notice">React code examples are not available for this demo yet. Showing vanilla JavaScript instead.</div>}
      <Component />
    </div>
  );
};

export default ExpressCheckoutCode;
