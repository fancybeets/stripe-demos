import React from 'react';
import JSZip from 'jszip';
import CodeBlock from '../../CodeBlock';
import { snippets } from '../../../config/snippets.generated';
import '../connect-embedded/Code.css';

const EmbeddedCheckoutCode = ({ implementation }) => {
  const { html, styles, frontend, server, packageJson, readme } = snippets['embedded-checkout']['js'];

  const handleDownload = async () => {
    const zip = new JSZip();
    zip.file('index.html', html);
    zip.file('styles.css', styles);
    zip.file('frontend.js', frontend);
    zip.file('server.js', server);
    zip.file('package.json', packageJson);
    zip.file('README.md', readme);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'embedded-checkout-demo.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {implementation === 'react' && (
        <div className="react-unavailable-notice">React code examples are not available for this demo yet. Showing vanilla JavaScript instead.</div>
      )}
      <div className="setup-section">
        <div className="setup-header">
          <span className="setup-title">QUICK SETUP</span>
          <button className="download-button" onClick={handleDownload}>
            DOWNLOAD PROJECT
          </button>
        </div>
        <ol className="setup-steps">
          <li>
            Ensure you have a{' '}
            <a href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm" target="_blank" rel="noopener noreferrer" className="setup-link">
              Node.js installation
            </a>.
          </li>
          <li>Download the project, unzip it, and <code>cd</code> into the project folder.</li>
          <li>Open the project in your text editor of choice (e.g. <code>code .</code>, <code>cursor .</code>)</li>
          <li>
            Create or log into your Stripe sandbox account, then get your API keys from{' '}
            <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="setup-link">
              dashboard.stripe.com/test/apikeys
            </a>.
          </li>
          <li>
            Replace <code>sk_test_...</code> in <code>server.js</code> and{' '}
            <code>pk_test_...</code> in <code>frontend.js</code> with their respective Sandbox keys from the dashboard.
          </li>
          <li>Install dependencies and start the server: <code>npm install && npm start</code></li>
          <li>
            Open{' '}
            <a href="http://localhost:4242" target="_blank" rel="noopener noreferrer" className="setup-link">
              http://localhost:4242
            </a>{' '}
            in a browser
          </li>
        </ol>
      </div>

      <CodeBlock title="HTML (index.html)" code={html} />
      <CodeBlock title="Client Code (frontend.js)" code={frontend} />
      <CodeBlock title="Server Code (server.js)" code={server} />
    </>
  );
};

export default EmbeddedCheckoutCode;
