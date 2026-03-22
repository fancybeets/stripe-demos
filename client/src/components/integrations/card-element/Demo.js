import React from 'react';
import CardElementReactDefault from './react-default/Demo';
import CardElementJSDefault from './js-default/Demo';

const CardElementDemo = ({ implementation, mode, paymentOptions }) => {
  const key = `${implementation}-default`;
  const components = {
    'react-default': CardElementReactDefault,
    'javascript-default': CardElementJSDefault,
  };

  const Component = components[key];

  return (
    <div className="view-content">
      <Component implementation={implementation} mode={mode} paymentOptions={paymentOptions} />
    </div>
  );
};

export default CardElementDemo;
