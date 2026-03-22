import React from 'react';

const PaymentElementAbout = () => {
  return (
    <div className="about-content">
      <h3>Documentation</h3>
      <ul>
        <li>
          <a href="https://docs.stripe.com/payments/quickstart" target="_blank" rel="noopener noreferrer">
            Quickstart
          </a>
        </li>
        <li>
          <a href="https://docs.stripe.com/payments/accept-a-payment?payment-ui=elements&api-integration=paymentintents" target="_blank" rel="noopener noreferrer">
            Accept a Payment
          </a>
        </li>
      </ul>
    </div>
  );
};

export default PaymentElementAbout;
