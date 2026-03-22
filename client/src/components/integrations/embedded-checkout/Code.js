import React from 'react';
import EmbeddedCheckoutReactDefaultCode from './react-default/Code';
import EmbeddedCheckoutJSDefaultCode from './js-default/Code';

const EmbeddedCheckoutCode = ({ implementation }) => {
  const components = {
    'react': EmbeddedCheckoutReactDefaultCode,
    'javascript': EmbeddedCheckoutJSDefaultCode,
  };

  const Component = components[implementation] || EmbeddedCheckoutReactDefaultCode;

  return (
    <div className="view-content">
      <Component />
    </div>
  );
};

export default EmbeddedCheckoutCode;
