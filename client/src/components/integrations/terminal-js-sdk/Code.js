import React from 'react';
import CodeBlock from '../../CodeBlock';
import { snippets } from '../../../config/snippets.generated';

const TerminalJsSdkCode = () => {
  const { html, frontend, backend } = snippets['terminal-js-sdk']['js'];
  return (
    <>
      <CodeBlock title="index.html" code={html} language="html" />
      <CodeBlock title="terminal.js" code={frontend} language="javascript" />
      <CodeBlock title="server.js" code={backend} language="javascript" />
    </>
  );
};

export default TerminalJsSdkCode;
