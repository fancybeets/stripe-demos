import React from 'react';
import CardElementReactDefault from './react-default/Code';
import CardElementJSDefault from './js-default/Code';

const CardElementCode = ({ implementation, mode, paymentOptions }) => {
  const key = `${implementation}-default`;
  const components = {
    'react-default': CardElementReactDefault,
    'javascript-default': CardElementJSDefault,
  };

  const Component = components[key];

  return (
    <div className="view-content">
      <Component />
    </div>
  );
};

export default CardElementCode;
