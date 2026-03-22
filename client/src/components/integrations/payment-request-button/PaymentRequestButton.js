import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentRequestButtonDemo from './Demo';
import PaymentRequestButtonCode from './Code';
import PaymentRequestButtonAbout from './About';
import '../Integration.css';

const PaymentRequestButtonIntegration = ({ initialParams = {}, activeView = 'demo', onViewChange, implementation: propImplementation, mode: propMode, paymentOptions = {} }) => {
  const navigate = useNavigate();
  const [implementation, setImplementation] = useState(propImplementation || initialParams.implementation || 'react');

  React.useEffect(() => {
    if (propImplementation) setImplementation(propImplementation);
  }, [propImplementation]);

  const updateURLParams = (newImplementation) => {
    const params = new URLSearchParams();
    params.set('implementation', newImplementation);
    params.set('mode', 'default');
    navigate(`/payment-request-button?${params.toString()}`, { replace: true });
  };

  const handleImplementationChange = (newImplementation) => {
    setImplementation(newImplementation);
    updateURLParams(newImplementation);
  };

  return (
    <div className="integration-content-wrapper">
      <h2>Payment Request Button</h2>

      <table className="mode-selector-table">
        <tbody>
          <tr>
            <td>
              <div className="mode-selector-title">Implementation</div>
            </td>
            <td>
              <div className="mode-selector">
                <label>
                  <input
                    type="radio"
                    value="react"
                    checked={implementation === 'react'}
                    onChange={(e) => handleImplementationChange(e.target.value)}
                  />
                  <div className="mode-label-content">
                    <div className="mode-label-title">React</div>
                  </div>
                </label>
                <label>
                  <input
                    type="radio"
                    value="javascript"
                    checked={implementation === 'javascript'}
                    onChange={(e) => handleImplementationChange(e.target.value)}
                  />
                  <div className="mode-label-content">
                    <div className="mode-label-title">JavaScript</div>
                  </div>
                </label>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="view-title">
        {activeView === 'code' && (
          <button className="view-nav-button view-nav-prev" onClick={() => onViewChange('demo')}>
            ← DEMO
          </button>
        )}
        {activeView === 'about' && (
          <button className="view-nav-button view-nav-prev" onClick={() => onViewChange('code')}>
            ← CODE
          </button>
        )}
        THE PAYMENT REQUEST BUTTON
        {activeView === 'demo' && (
          <button className="view-nav-button view-nav-next" onClick={() => onViewChange('code')}>
            CODE →
          </button>
        )}
        {activeView === 'code' && (
          <button className="view-nav-button view-nav-next" onClick={() => onViewChange('about')}>
            ABOUT →
          </button>
        )}
      </div>
      {activeView === 'demo' && <PaymentRequestButtonDemo implementation={implementation} mode="default" paymentOptions={paymentOptions} />}
      {activeView === 'code' && <PaymentRequestButtonCode implementation={implementation} mode="default" paymentOptions={paymentOptions} />}
      {activeView === 'about' && (
        <div className="view-content">
          <PaymentRequestButtonAbout />
        </div>
      )}
    </div>
  );
};

PaymentRequestButtonIntegration.sidebarOptions = ['implementation', 'country', 'currency', 'amount'];

export default PaymentRequestButtonIntegration;
