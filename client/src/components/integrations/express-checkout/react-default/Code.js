import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const ExpressCheckoutReactDefaultCodeSamples = () => {
  const { frontend, backend } = snippets['express-checkout']['react-default'];
  return (
    <>
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default ExpressCheckoutReactDefaultCodeSamples;
