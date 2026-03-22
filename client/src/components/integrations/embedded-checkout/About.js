import React from 'react';

const EmbeddedCheckoutAbout = () => {
  return (
    <div className="about-content">
      <h3>Documentation</h3>
      <ul>
        <li>
          <a href="https://stripe.com/docs/checkout/embedded/quickstart" target="_blank" rel="noopener noreferrer">
            Quickstart
          </a>
        </li>
        <li>
          <a href="https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=embedded-form" target="_blank" rel="noopener noreferrer">
            Accept a Payment
          </a>
        </li>
      </ul>
    </div>
  );
};

export default EmbeddedCheckoutAbout;
