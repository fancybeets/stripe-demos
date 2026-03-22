import React from 'react';
import TerminalDemo from './Demo';
import TerminalCode from './Code';
import TerminalAbout from './About';
import '../Integration.css';

const TerminalIntegration = ({ activeView = 'demo', onViewChange, paymentOptions = {} }) => {
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
        TERMINAL (SERVER DRIVEN)
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
          <TerminalDemo paymentOptions={paymentOptions} />
        </div>
      )}
      {activeView === 'code' && (
        <div className="view-content">
          <TerminalCode />
        </div>
      )}
      {activeView === 'about' && (
        <div className="view-content">
          <TerminalAbout />
        </div>
      )}
    </div>
  );
};

TerminalIntegration.sidebarOptions = ['readerMode', 'country', 'currency', 'amount'];

export default TerminalIntegration;
