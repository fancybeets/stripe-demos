import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSessionsDemo from './Demo';
import CheckoutSessionsCode from './Code';
import CheckoutSessionsAbout from './About';
import CheckoutSessionsReturn from './Return';
import '../Integration.css';

const CheckoutSessionsIntegration = ({ initialParams = {}, activeView = 'demo', onViewChange, implementation: propImplementation, mode: propMode, paymentOptions = {} }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(propMode || initialParams.mode || 'default');
  const [implementation, setImplementation] = useState(propImplementation || initialParams.implementation || 'react');
  const sessionId = initialParams.session_id || null;

  React.useEffect(() => {
    if (propMode) setMode(propMode);
    if (propImplementation) setImplementation(propImplementation);
  }, [propMode, propImplementation]);

  const updateURLParams = (newMode, newImplementation) => {
    const params = new URLSearchParams();
    params.set('implementation', newImplementation);
    params.set('mode', newMode);
    navigate(`/checkout-sessions?${params.toString()}`, { replace: true });
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    updateURLParams(newMode, implementation);
  };

  const handleImplementationChange = (newImplementation) => {
    setImplementation(newImplementation);
    updateURLParams(mode, newImplementation);
  };


  // If there's a session_id, show the return/success page
  if (sessionId) {
    return (
      <div className="integration-content-wrapper">
        <h2>Elements + Checkout Sessions</h2>
        <CheckoutSessionsReturn sessionId={sessionId} />
      </div>
    );
  }

  return (
    <div className="integration-content-wrapper">
      <h2>Elements + Checkout Sessions</h2>

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
        ELEMENTS + CHECKOUT SESSIONS
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
      {activeView === 'demo' && <CheckoutSessionsDemo implementation={implementation} mode={mode} paymentOptions={paymentOptions} />}
      {activeView === 'code' && <CheckoutSessionsCode implementation={implementation} mode={mode} paymentOptions={paymentOptions} />}
      {activeView === 'about' && (
        <div className="view-content">
          <CheckoutSessionsAbout />
        </div>
      )}
    </div>
  );
};

CheckoutSessionsIntegration.sidebarOptions = ['implementation', 'country', 'currency', 'amount', 'quantity', 'paymentMethods'];

export default CheckoutSessionsIntegration;
