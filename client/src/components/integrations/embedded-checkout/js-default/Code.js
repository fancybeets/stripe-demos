import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const EmbeddedCheckoutJSDefaultCode = () => {
  const { html, frontend, backend } = snippets['embedded-checkout']['js-default'];
  return (
    <>
      <CodeBlock title="HTML Code" code={html} />
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default EmbeddedCheckoutJSDefaultCode;
