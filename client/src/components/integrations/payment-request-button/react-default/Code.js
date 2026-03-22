import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const PaymentRequestButtonReactDefaultCodeSamples = () => {
  const { frontend, backend } = snippets['payment-request-button']['react-default'];
  return (
    <>
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default PaymentRequestButtonReactDefaultCodeSamples;
