import React from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceContext } from '../../context/DeviceContext';
import './NetworkTools.css';

const networkTools = [
  {
    id: 'stripe-connectivity',
    title: 'Terminal Reachability',
    description: 'Test connectivity to required Terminal domains',
  },
];

const NetworkTools = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenTiltStyle, screenFalling, theme } = useDeviceContext();
  const tiltTransform = screenTiltStyle.transform
    ? `translateY(-50%) ${screenTiltStyle.transform}`
    : 'translateY(-50%)';

  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    const currentParams = new URLSearchParams(location.search);
    const logsParam = currentParams.get('logs');
    const params = new URLSearchParams();
    if (logsParam) {
      params.set('logs', logsParam);
    }
    const queryString = params.toString();
    navigate(`/${queryString ? `?${queryString}` : ''}`);
  };

  const handleToolClick = (toolId) => {
    if (onNavigate) {
      onNavigate();
    }
    const currentParams = new URLSearchParams(location.search);
    const logsParam = currentParams.get('logs');
    const params = new URLSearchParams();
    if (logsParam) {
      params.set('logs', logsParam);
    }
    const queryString = params.toString();
    navigate(`/tools/${toolId}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="network-tools-content">
      <div className="network-tools-header">
        <div className="network-tools-title">Testing Tools</div>
      </div>

      <div className="tools-grid-area">
        <div className="tools-subtitle-row">
          {theme !== 'apocalypse' && (
            <button
              className="tools-nav-btn"
              onClick={handleBackClick}
              title="Back to Demos"
            >
              <span className="tools-nav-arrow">←</span>
              <span className="tools-nav-label">DEMOS</span>
            </button>
          )}
          <div className="network-tools-subtitle">
            EXPERIMENTAL - use and trust with caution
          </div>
        </div>

        <div className="tools-grid">
          {networkTools.map((tool) => (
            <div
              key={tool.id}
              className="tool-card"
              onClick={() => handleToolClick(tool.id)}
            >
              <div className="tool-card-title">{tool.title}</div>
              <div className="tool-card-description">{tool.description}</div>
            </div>
          ))}
        </div>
      </div>

      {theme === 'apocalypse' && ReactDOM.createPortal(
        <button
          className={`theme-${theme} demos-arrow${screenFalling ? ' screen-falling' : ''}`}
          style={{ transform: tiltTransform }}
          onClick={handleBackClick}
          title="Back to Demos"
        >
          <div className="arrow-symbol">←</div>
          <div className="arrow-label">DEMOS</div>
        </button>,
        document.body
      )}
    </div>
  );
};

export default NetworkTools;
