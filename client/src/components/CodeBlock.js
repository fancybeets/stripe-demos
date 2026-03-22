import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useTheme } from '../context/ThemeContext';
import './CodeBlock.css';

const simpleTheme = {
  'code[class*="language-"]': {
    color: '#1a1a1a',
    background: 'transparent',
    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: 2,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#1a1a1a',
    background: 'transparent',
    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: 2,
    hyphens: 'none',
    padding: '12px',
    margin: '0',
    overflow: 'auto',
  },
  'comment': { color: '#6b7280', fontStyle: 'italic', background: 'transparent' },
  'prolog': { color: '#6b7280', background: 'transparent' },
  'doctype': { color: '#6b7280', background: 'transparent' },
  'cdata': { color: '#6b7280', background: 'transparent' },
  'punctuation': { color: '#374151', background: 'transparent' },
  'property': { color: '#2563eb', background: 'transparent' },
  'tag': { color: '#2563eb', background: 'transparent' },
  'boolean': { color: '#d97706', background: 'transparent' },
  'number': { color: '#d97706', background: 'transparent' },
  'constant': { color: '#d97706', background: 'transparent' },
  'symbol': { color: '#d97706', background: 'transparent' },
  'deleted': { color: '#dc2626', background: 'transparent' },
  'selector': { color: '#7c3aed', background: 'transparent' },
  'attr-name': { color: '#7c3aed', background: 'transparent' },
  'string': { color: '#059669', background: 'transparent' },
  'char': { color: '#059669', background: 'transparent' },
  'builtin': { color: '#059669', background: 'transparent' },
  'inserted': { color: '#059669', background: 'transparent' },
  'operator': { color: '#374151', background: 'transparent' },
  'entity': { color: '#374151', cursor: 'help', background: 'transparent' },
  'url': { color: '#2563eb', background: 'transparent' },
  'atrule': { color: '#7c3aed', background: 'transparent' },
  'attr-value': { color: '#059669', background: 'transparent' },
  'keyword': { color: '#7c3aed', fontWeight: 'bold', background: 'transparent' },
  'function': { color: '#2563eb', background: 'transparent' },
  'class-name': { color: '#d97706', background: 'transparent' },
  'regex': { color: '#059669', background: 'transparent' },
  'important': { color: '#7c3aed', fontWeight: 'bold', background: 'transparent' },
  'variable': { color: '#1a1a1a', background: 'transparent' },
};

const darkTheme = {
  'code[class*="language-"]': {
    color: '#e0e0f0',
    background: 'transparent',
    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: 2,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#e0e0f0',
    background: 'transparent',
    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: 2,
    hyphens: 'none',
    padding: '12px',
    margin: '0',
    overflow: 'auto',
  },
  'comment': { color: '#6b7a99', fontStyle: 'italic', background: 'transparent' },
  'prolog': { color: '#6b7a99', background: 'transparent' },
  'doctype': { color: '#6b7a99', background: 'transparent' },
  'cdata': { color: '#6b7a99', background: 'transparent' },
  'punctuation': { color: '#9090a8', background: 'transparent' },
  'property': { color: '#7bbcf7', background: 'transparent' },
  'tag': { color: '#7bbcf7', background: 'transparent' },
  'boolean': { color: '#e5a55e', background: 'transparent' },
  'number': { color: '#e5a55e', background: 'transparent' },
  'constant': { color: '#e5a55e', background: 'transparent' },
  'symbol': { color: '#e5a55e', background: 'transparent' },
  'deleted': { color: '#ff6b7a', background: 'transparent' },
  'selector': { color: '#a78bfa', background: 'transparent' },
  'attr-name': { color: '#a78bfa', background: 'transparent' },
  'string': { color: '#87d096', background: 'transparent' },
  'char': { color: '#87d096', background: 'transparent' },
  'builtin': { color: '#87d096', background: 'transparent' },
  'inserted': { color: '#87d096', background: 'transparent' },
  'operator': { color: '#9090a8', background: 'transparent' },
  'entity': { color: '#9090a8', cursor: 'help', background: 'transparent' },
  'url': { color: '#7bbcf7', background: 'transparent' },
  'atrule': { color: '#a78bfa', background: 'transparent' },
  'attr-value': { color: '#87d096', background: 'transparent' },
  'keyword': { color: '#a78bfa', fontWeight: 'bold', background: 'transparent' },
  'function': { color: '#7bbcf7', background: 'transparent' },
  'class-name': { color: '#e5a55e', background: 'transparent' },
  'regex': { color: '#87d096', background: 'transparent' },
  'important': { color: '#a78bfa', fontWeight: 'bold', background: 'transparent' },
  'variable': { color: '#e0e0f0', background: 'transparent' },
};

const CodeBlock = ({ title, code }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  // Detect language from title
  const getLanguage = () => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('html')) return 'html';
    if (lowerTitle.includes('backend') || lowerTitle.includes('server')) return 'javascript';
    return 'javascript';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Custom Device themed syntax highlighting
  const deviceTheme = {
    'code[class*="language-"]': {
      color: '#ffdd66',
      background: 'transparent',
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.5',
      textAlign: 'left',
      whiteSpace: 'pre',
      wordSpacing: 'normal',
      wordBreak: 'normal',
      wordWrap: 'normal',
      tabSize: 2,
      hyphens: 'none',
    },
    'pre[class*="language-"]': {
      color: '#ffdd66',
      background: 'transparent',
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.5',
      textAlign: 'left',
      whiteSpace: 'pre',
      wordSpacing: 'normal',
      wordBreak: 'normal',
      wordWrap: 'normal',
      tabSize: 2,
      hyphens: 'none',
      padding: '12px',
      margin: '0',
      overflow: 'auto',
    },
    'comment': { color: '#99cc99', fontStyle: 'italic', background: 'transparent' },
    'prolog': { color: '#99cc99', background: 'transparent' },
    'doctype': { color: '#99cc99', background: 'transparent' },
    'cdata': { color: '#99cc99', background: 'transparent' },
    'punctuation': { color: '#ffdd66', background: 'transparent' },
    'property': { color: '#ffcc77', background: 'transparent' },
    'tag': { color: '#ffcc77', background: 'transparent' },
    'boolean': { color: '#ffaa55', background: 'transparent' },
    'number': { color: '#ffaa55', background: 'transparent' },
    'constant': { color: '#ffaa55', background: 'transparent' },
    'symbol': { color: '#ffaa55', background: 'transparent' },
    'deleted': { color: '#ffaa55', background: 'transparent' },
    'selector': { color: '#77eeff', background: 'transparent' },
    'attr-name': { color: '#77eeff', background: 'transparent' },
    'string': { color: '#aaffaa', background: 'transparent' },
    'char': { color: '#aaffaa', background: 'transparent' },
    'builtin': { color: '#aaffaa', background: 'transparent' },
    'inserted': { color: '#aaffaa', background: 'transparent' },
    'operator': { color: '#ffdd66', background: 'transparent' },
    'entity': { color: '#ffdd66', cursor: 'help', background: 'transparent' },
    'url': { color: '#aaffaa', background: 'transparent' },
    'atrule': { color: '#ffcc55', background: 'transparent' },
    'attr-value': { color: '#aaffaa', background: 'transparent' },
    'keyword': { color: '#ffcc55', fontWeight: 'bold', background: 'transparent' },
    'function': { color: '#77eeff', background: 'transparent' },
    'class-name': { color: '#ffcc77', background: 'transparent' },
    'regex': { color: '#aaffaa', background: 'transparent' },
    'important': { color: '#ffcc55', fontWeight: 'bold', background: 'transparent' },
    'variable': { color: '#ffdd66', background: 'transparent' },
  };

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <div className="code-block-title">{title}</div>
        <button className="code-block-copy-button" onClick={handleCopy}>
          {copied ? 'COPIED!' : 'COPY'}
        </button>
      </div>
      <SyntaxHighlighter
        language={getLanguage()}
        style={theme === 'simple' ? simpleTheme : theme === 'dark' ? darkTheme : deviceTheme}
        customStyle={{
          background: 'transparent',
          padding: '12px',
          margin: '0',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
