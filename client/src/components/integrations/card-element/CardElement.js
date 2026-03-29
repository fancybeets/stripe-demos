import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardElementDemo from './Demo';
import CardElementCode from './Code';
import CardElementAbout from './About';
import '../Integration.css';

const CardElementIntegration = ({ initialParams = {}, activeView = 'demo', onViewChange, implementation: propImplementation, mode: propMode, paymentOptions = {} }) => {
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
    navigate(`/card-element?${params.toString()}`, { replace: true });
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
      <h2>Card Element</h2>

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
        THE CARD ELEMENT
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
      {activeView === 'demo' && <CardElementDemo implementation={implementation} mode={mode} paymentOptions={paymentOptions} />}
      {activeView === 'code' && (
        <div className="view-content">
          <CardElementCode implementation={implementation} />
        </div>
      )}
      {activeView === 'about' && (
        <div className="view-content">
          <CardElementAbout />
        </div>
      )}
    </div>
  );
};

CardElementIntegration.sidebarOptions = ['implementation', 'country', 'currency', 'amount'];

export default CardElementIntegration;
