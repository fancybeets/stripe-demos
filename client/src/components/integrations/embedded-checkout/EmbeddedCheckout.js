import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmbeddedCheckoutDemo from './Demo';
import EmbeddedCheckoutCode from './Code';
import EmbeddedCheckoutAbout from './About';
import SuccessMessage from '../../shared/SuccessMessage';
import '../Integration.css';

const EmbeddedCheckoutIntegration = ({ initialParams = {}, activeView = 'demo', onViewChange, implementation: propImplementation, paymentOptions = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [implementation, setImplementation] = useState(propImplementation || initialParams.implementation || 'react');
  const sessionId = initialParams.session_id || null;

  React.useEffect(() => {
    if (propImplementation) setImplementation(propImplementation);
  }, [propImplementation]);

  if (sessionId) {
    const handleBack = () => {
      const params = new URLSearchParams(location.search);
      params.delete('session_id');
      const qs = params.toString();
      navigate(`/embedded-checkout${qs ? '?' + qs : ''}`);
    };
    return (
      <div className="integration-content-wrapper">
        <div className="view-content" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <SuccessMessage
            title="PAYMENT COMPLETE"
            message="Payment successful! Your order has been confirmed."
            intentId={`Session: ${sessionId}`}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="integration-content-wrapper">
      <h2>Embedded Checkout</h2>

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
                    onChange={(e) => setImplementation(e.target.value)}
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
                    onChange={(e) => setImplementation(e.target.value)}
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
        EMBEDDED CHECKOUT
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
      {activeView === 'demo' && <EmbeddedCheckoutDemo implementation={implementation} paymentOptions={paymentOptions} />}
      {activeView === 'code' && <EmbeddedCheckoutCode implementation={implementation} />}
      {activeView === 'about' && (
        <div className="view-content">
          <EmbeddedCheckoutAbout />
        </div>
      )}
    </div>
  );
};

EmbeddedCheckoutIntegration.sidebarOptions = ['implementation', 'country', 'currency', 'amount', 'quantity'];

export default EmbeddedCheckoutIntegration;
