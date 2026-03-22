import React from 'react';
import ConnectEmbeddedDemo from './Demo';
import ConnectEmbeddedCode from './Code';
import ConnectEmbeddedAbout from './About';
import '../Integration.css';

const ConnectEmbeddedIntegration = ({ activeView = 'demo', onViewChange, paymentOptions = {} }) => {
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
        CONNECT EMBEDDED COMPONENTS
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
          <ConnectEmbeddedDemo paymentOptions={paymentOptions} />
        </div>
      )}
      {activeView === 'code' && (
        <div className="view-content">
          <ConnectEmbeddedCode />
        </div>
      )}
      {activeView === 'about' && (
        <div className="view-content">
          <ConnectEmbeddedAbout />
        </div>
      )}
    </div>
  );
};

ConnectEmbeddedIntegration.sidebarOptions = ['country', 'connectComponent'];

export default ConnectEmbeddedIntegration;
