import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpressCheckoutDemo from './Demo';
import ExpressCheckoutCode from './Code';
import ExpressCheckoutAbout from './About';
import '../Integration.css';

const ExpressCheckoutIntegration = ({ initialParams = {}, activeView = 'demo', onViewChange, implementation: propImplementation, mode: propMode, paymentOptions = {} }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(propMode || initialParams.mode || 'default');
  const [implementation, setImplementation] = useState(propImplementation || initialParams.implementation || 'react');

  React.useEffect(() => {
    if (propMode) setMode(propMode);
    if (propImplementation) setImplementation(propImplementation);
  }, [propMode, propImplementation]);

  const updateURLParams = (newMode, newImplementation) => {
    const params = new URLSearchParams();
    params.set('implementation', newImplementation);
    params.set('mode', newMode);
    navigate(`/express-checkout-element?${params.toString()}`, { replace: true });
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    updateURLParams(newMode, implementation);
  };

  const handleImplementationChange = (newImplementation) => {
    setImplementation(newImplementation);
    updateURLParams(mode, newImplementation);
  };


  return (
    <div className="integration-content-wrapper">
      <h2>Express Checkout</h2>

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
          <tr>
            <td>
              <div className="mode-selector-title">Payment Mode</div>
            </td>
            <td>
              <div className="mode-selector">
                <label>
                  <input
                    type="radio"
                    value="default"
                    checked={mode === 'default'}
                    onChange={(e) => handleModeChange(e.target.value)}
                  />
                  <div className="mode-label-content">
                    <div className="mode-label-title">Default</div>
                  </div>
                </label>
                <label>
                  <input
                    type="radio"
                    value="deferred"
                    checked={mode === 'deferred'}
                    onChange={(e) => handleModeChange(e.target.value)}
                  />
                  <div className="mode-label-content">
                    <div className="mode-label-title">Deferred</div>
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
        THE EXPRESS CHECKOUT ELEMENT
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
      {activeView === 'demo' && <ExpressCheckoutDemo implementation={implementation} mode={mode} paymentOptions={paymentOptions} />}
      {activeView === 'code' && (
        <div className="view-content">
          <ExpressCheckoutCode mode={mode} implementation={implementation} />
        </div>
      )}
      {activeView === 'about' && (
        <div className="view-content">
          <ExpressCheckoutAbout />
        </div>
      )}
    </div>
  );
};

ExpressCheckoutIntegration.sidebarOptions = ['implementation', 'mode', 'country', 'currency', 'amount', 'paymentMethods'];

export default ExpressCheckoutIntegration;
