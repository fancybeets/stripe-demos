import React from 'react';
import EmbeddedCheckoutReactDefault from './react-default/Demo';
import EmbeddedCheckoutJSDefault from './js-default/Demo';

const EmbeddedCheckoutDemo = ({ implementation, paymentOptions }) => {
  const components = {
    'react': EmbeddedCheckoutReactDefault,
    'javascript': EmbeddedCheckoutJSDefault,
  };

  const Component = components[implementation] || EmbeddedCheckoutReactDefault;

  return (
    <div className="view-content">
      <Component implementation={implementation} paymentOptions={paymentOptions} />
    </div>
  );
};

export default EmbeddedCheckoutDemo;
