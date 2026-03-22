import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const PaymentElementReactDefaultCodeSamples = () => {
  const { frontend, backend } = snippets['payment-element']['react-default'];
  return (
    <>
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default PaymentElementReactDefaultCodeSamples;
