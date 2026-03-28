import React from 'react';
import CardElementJSDefault from './js-default/Code';

const CardElementCode = ({ implementation, mode, paymentOptions }) => {
  const isReact = implementation === 'react';

  return (
    <div className="view-content">
      {isReact && <div className="react-unavailable-notice">React code examples are not available for this demo yet. Showing vanilla JavaScript instead.</div>}
      <CardElementJSDefault />
    </div>
  );
};

export default CardElementCode;
