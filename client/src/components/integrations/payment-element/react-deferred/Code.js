import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const PaymentElementReactDeferredCodeSamples = () => {
  const { frontend, backend } = snippets['payment-element']['react-deferred'];
  return (
    <>
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default PaymentElementReactDeferredCodeSamples;
