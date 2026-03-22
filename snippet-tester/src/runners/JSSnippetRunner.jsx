import React from 'react';
import { jsSnippets } from '../registry.js';
import { snippetPorts } from '../ports.js';

const JSSnippetRunner = ({ snippetKey }) => {
  const snippet = jsSnippets[snippetKey];

  if (!snippet) {
    return <div>No JS snippet found for: {snippetKey}</div>;
  }

  const pk = import.meta.env.VITE_STRIPE_PK || 'pk_test_...';
  const port = snippetPorts[snippetKey];
  const apiBase = `/api/${port}`;
  const { html, js } = snippet;

  // Inject the real PK, rewrite bare API paths, and fix window.location.origin
  // (srcdoc iframes have origin "null", so we substitute the real parent origin)
  const hydratedJs = js
    .replace(/window\._STRIPE_PK \|\| 'pk_test_\.\.\.'/g, `'${pk}'`)
    .replace(/fetch\('(\/.+?)'/g, (_, p) => `fetch('${apiBase}${p}'`)
    .replace(/window\.location\.origin/g, `'${window.location.origin}'`);
  const srcdoc = html.replace('</body>', `<script>${hydratedJs}<\/script></body>`);

  return (
    <iframe
      key={snippetKey}
      srcDoc={srcdoc}
      style={{ width: '100%', height: '600px', border: 'none' }}
      title={snippetKey}
    />
  );
};

export default JSSnippetRunner;
