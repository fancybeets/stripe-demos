import React from 'react';
import CodeBlock from '../../../CodeBlock';
import { snippets } from '../../../../config/snippets.generated';

const EmbeddedCheckoutReactDefaultCode = () => {
  const { frontend, backend } = snippets['embedded-checkout']['react-default'];
  return (
    <>
      <CodeBlock title="Frontend Code" code={frontend} />
      <CodeBlock title="Backend Code" code={backend} />
    </>
  );
};

export default EmbeddedCheckoutReactDefaultCode;
