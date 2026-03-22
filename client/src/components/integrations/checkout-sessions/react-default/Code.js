import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const CheckoutSessionsReactDefaultCode = () => {
  const { frontend, backend } = snippets['checkout-sessions']['react-default'];
  return (
    <>
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default CheckoutSessionsReactDefaultCode;
