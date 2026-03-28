import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HostedCheckoutDemo from './Demo';
import HostedCheckoutCode from './Code';
import HostedCheckoutAbout from './About';
import SuccessMessage from '../../shared/SuccessMessage';
import '../Integration.css';

const HostedCheckoutIntegration = ({ initialParams = {}, activeView = 'demo', onViewChange, paymentOptions = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = initialParams.session_id || null;

  if (sessionId) {
    const handleBack = () => {
      const params = new URLSearchParams(location.search);
      params.delete('session_id');
      const qs = params.toString();
      navigate(`/hosted-checkout${qs ? '?' + qs : ''}`);
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
        HOSTED CHECKOUT
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
      {activeView === 'demo' && (
        <div className="view-content">
          <HostedCheckoutDemo paymentOptions={paymentOptions} />
        </div>
      )}
      {activeView === 'code' && (
        <div className="view-content">
          <HostedCheckoutCode />
        </div>
      )}
      {activeView === 'about' && (
        <div className="view-content">
          <HostedCheckoutAbout />
        </div>
      )}
    </div>
  );
};

HostedCheckoutIntegration.sidebarOptions = ['country', 'currency', 'amount'];

export default HostedCheckoutIntegration;
