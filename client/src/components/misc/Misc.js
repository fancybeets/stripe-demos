import React from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceContext } from '../../context/DeviceContext';
import './Misc.css';

const miscItems = [
  {
    id: 'ece-timing',
    title: 'ECE Click-To-Resolve Timing',
    description: 'See what happens when your Express Checkout Element \'click\' listener resolves under vs. over 1 second',
  },
];

const Misc = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenTiltStyle, screenFalling, theme } = useDeviceContext();
  const tiltTransform = screenTiltStyle.transform
    ? `translateY(-50%) ${screenTiltStyle.transform}`
    : 'translateY(-50%)';

  const handleToolsClick = () => {
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
    navigate(`/tools${queryString ? `?${queryString}` : ''}`);
  };

  const handleDemosClick = () => {
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

  const handleItemClick = (itemId) => {
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
    navigate(`/misc/${itemId}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="misc-content">
      <div className="misc-header">
        <div className="misc-title">Miscellaneous</div>
      </div>

      <div className="misc-grid-area">
        <div className="misc-subtitle-row">
          {theme !== 'apocalypse' && (
            <button
              className="misc-nav-btn"
              onClick={handleToolsClick}
              title="Testing Tools"
            >
              <span className="misc-nav-arrow">←</span>
              <span className="misc-nav-label">TOOLS</span>
            </button>
          )}
          <div className="misc-subtitle">
            Odds and ends
          </div>
          {theme !== 'apocalypse' && (
            <button
              className="misc-nav-btn misc-nav-btn-right"
              onClick={handleDemosClick}
              title="Back to Demos"
            >
              <span className="misc-nav-label">DEMOS</span>
              <span className="misc-nav-arrow">→</span>
            </button>
          )}
        </div>

        <div className="misc-grid">
          {miscItems.map((item) => (
            <div
              key={item.id}
              className="misc-card"
              onClick={() => handleItemClick(item.id)}
            >
              <div className="misc-card-title">{item.title}</div>
              <div className="misc-card-description">{item.description}</div>
            </div>
          ))}
        </div>
      </div>

      {theme === 'apocalypse' && ReactDOM.createPortal(
        <button
          className={`theme-${theme} misc-tools-arrow${screenFalling ? ' screen-falling' : ''}`}
          style={{ transform: tiltTransform }}
          onClick={handleToolsClick}
          title="Testing Tools"
        >
          <div className="arrow-symbol">←</div>
          <div className="arrow-label">TOOLS</div>
        </button>,
        document.body
      )}

      {theme === 'apocalypse' && ReactDOM.createPortal(
        <button
          className={`theme-${theme} misc-demos-arrow${screenFalling ? ' screen-falling' : ''}`}
          style={{ transform: tiltTransform }}
          onClick={handleDemosClick}
          title="Back to Demos"
        >
          <div className="arrow-symbol">→</div>
          <div className="arrow-label">DEMOS</div>
        </button>,
        document.body
      )}
    </div>
  );
};

export default Misc;
