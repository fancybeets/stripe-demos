import React, { useState } from 'react';
import { allKeys } from './registry.js';
import ReactSnippetRunner from './runners/ReactSnippetRunner.jsx';
import JSSnippetRunner from './runners/JSSnippetRunner.jsx';

const sidebarStyle = {
  width: '240px',
  minWidth: '240px',
  borderRight: '1px solid #e0e0e0',
  overflowY: 'auto',
  background: '#f8f9fa',
  padding: '16px 0',
};

const itemStyle = (active) => ({
  display: 'block',
  padding: '8px 16px',
  cursor: 'pointer',
  background: active ? '#e3f2fd' : 'transparent',
  borderLeft: active ? '3px solid #1976d2' : '3px solid transparent',
  fontSize: '13px',
  fontFamily: 'monospace',
  color: active ? '#1976d2' : '#333',
  userSelect: 'none',
});

const mainStyle = {
  flex: 1,
  overflowY: 'auto',
};

const App = () => {
  const [selected, setSelected] = useState(allKeys[0]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <nav style={sidebarStyle}>
        <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', color: '#555' }}>
          Snippet Tester
        </div>
        {allKeys.map(({ key, type }) => (
          <div
            key={key}
            style={itemStyle(selected?.key === key)}
            onClick={() => setSelected({ key, type })}
          >
            {key}
            <span style={{ marginLeft: '6px', fontSize: '11px', color: '#888' }}>
              [{type}]
            </span>
          </div>
        ))}
      </nav>
      <main style={mainStyle}>
        {selected && (
          selected.type === 'react'
            ? <ReactSnippetRunner snippetKey={selected.key} />
            : <JSSnippetRunner snippetKey={selected.key} />
        )}
      </main>
    </div>
  );
};

export default App;
