import React from 'react';

const HostedCheckoutAbout = () => {
  return (
    <div className="about-content">
      <h3>Documentation</h3>
      <ul>
        <li>
          <a href="https://docs.stripe.com/checkout/quickstart" target="_blank" rel="noopener noreferrer">
            Quickstart
          </a>
        </li>
        <li>
          <a href="https://docs.stripe.com/payments/checkout" target="_blank" rel="noopener noreferrer">
            Accept a Payment with Checkout
          </a>
        </li>
        <li>
          <a href="https://docs.stripe.com/checkout/how-checkout-works" target="_blank" rel="noopener noreferrer">
            How Checkout Works
          </a>
        </li>
      </ul>
    </div>
  );
};

export default HostedCheckoutAbout;
