import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const PaymentRequestButtonJSDefaultCodeSamples = () => {
  const { html, frontend, backend } = snippets['payment-request-button']['js-default'];
  return (
    <>
      <CodeBlock title="index.html" code={html} />
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default PaymentRequestButtonJSDefaultCodeSamples;
