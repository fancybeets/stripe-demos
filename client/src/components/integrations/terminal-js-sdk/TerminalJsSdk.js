import React from 'react';
import TerminalJsSdkDemo from './Demo';
import TerminalJsSdkCode from './Code';
import TerminalJsSdkAbout from './About';
import '../Integration.css';

const TerminalJsSdkIntegration = ({ activeView = 'demo', onViewChange, paymentOptions = {} }) => {
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
        TERMINAL (JAVASCRIPT SDK)
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
          <TerminalJsSdkDemo paymentOptions={paymentOptions} />
        </div>
      )}
      {activeView === 'code' && (
        <div className="view-content">
          <TerminalJsSdkCode />
        </div>
      )}
      {activeView === 'about' && (
        <div className="view-content">
          <TerminalJsSdkAbout />
        </div>
      )}
    </div>
  );
};

TerminalJsSdkIntegration.sidebarOptions = ['readerMode', 'country', 'currency', 'amount'];

export default TerminalJsSdkIntegration;
