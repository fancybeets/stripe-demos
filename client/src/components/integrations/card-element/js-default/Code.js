import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const CardElementJSDefaultCodeSamples = () => {
  const { html, frontend, backend } = snippets['card-element']['js-default'];
  return (
    <>
      <CodeBlock title="HTML Code" code={html} />
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default CardElementJSDefaultCodeSamples;
