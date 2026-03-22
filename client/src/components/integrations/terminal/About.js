import React from 'react';

const TerminalAbout = () => {
  return (
    <div className="about-content">
      <h3>Documentation</h3>
      <ul>
        <li>
          <a href="https://docs.stripe.com/terminal/quickstart?platform=server-driven" target="_blank" rel="noopener noreferrer">
            Quickstart
          </a>
        </li>
        <li>
          <a href="https://docs.stripe.com/terminal/payments/setup-integration?terminal-sdk-platform=server-driven" target="_blank" rel="noopener noreferrer">
            Set up your integration
          </a>
        </li>
        <li>
          <a href="https://docs.stripe.com/terminal/network-requirements" target="_blank" rel="noopener noreferrer">
            Troubleshooting networking issues
          </a>
          <ul>
            <li>
              <a href="https://docs.stripe.com/terminal/readers/bbpos-wisepos-e#troubleshooting" target="_blank" rel="noopener noreferrer">
                WisePOS E Troubleshooting
              </a>
            </li>
            <li>
              <a href="https://docs.stripe.com/terminal/readers/stripe-reader-s700-s710#troubleshooting" target="_blank" rel="noopener noreferrer">
                S700/710 Troubleshooting
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default TerminalAbout;
