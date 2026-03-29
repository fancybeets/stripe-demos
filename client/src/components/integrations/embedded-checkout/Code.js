import React from 'react';
import EmbeddedCheckoutJSDefaultCode from './js-default/Code';

const EmbeddedCheckoutCode = ({ implementation }) => {
  const isReact = implementation === 'react';

  return (
    <div className="view-content">
      {isReact && <div className="react-unavailable-notice">React code examples are not available for this demo yet. Showing vanilla JavaScript instead.</div>}
      <EmbeddedCheckoutJSDefaultCode />
    </div>
  );
};

export default EmbeddedCheckoutCode;
