import React from 'react';
import { reactSnippets } from '../registry.js';
import { snippetPorts } from '../ports.js';

// Module-level fetch interceptor — rewrites bare /paths to /api/<port>/path
// based on the currently active snippet port.
const _origFetch = window.fetch.bind(window);
let _activePort = null;
window.fetch = (url, init) => {
  if (_activePort && typeof url === 'string' && url.startsWith('/') && !url.startsWith('/api/'))
    return _origFetch(`/api/${_activePort}${url}`, init);
  return _origFetch(url, init);
};

const ReactSnippetRunner = ({ snippetKey }) => {
  // Set the port synchronously during render so it's in place when the
  // snippet's useEffect fires on the same tick.
  _activePort = snippetPorts[snippetKey] ?? null;

  const SnippetComponent = reactSnippets[snippetKey];

  if (!SnippetComponent) {
    return <div>No React snippet found for: {snippetKey}</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <SnippetComponent />
    </div>
  );
};

export default ReactSnippetRunner;
