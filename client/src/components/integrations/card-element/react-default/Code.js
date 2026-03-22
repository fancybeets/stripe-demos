import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const CardElementReactDefaultCodeSamples = () => {
  const { frontend, backend } = snippets['card-element']['react-default'];
  return (
    <>
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default CardElementReactDefaultCodeSamples;
