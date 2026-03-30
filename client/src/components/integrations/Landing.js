import React from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceContext } from '../../context/DeviceContext';
import { elements } from '../../config/elements';
import './Landing.css';

const LandingIntegration = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenTiltStyle, screenFalling, theme } = useDeviceContext();
  const tiltTransform = screenTiltStyle.transform
    ? `translateY(-50%) ${screenTiltStyle.transform}`
    : 'translateY(-50%)';

  const handleElementClick = (route) => {
    if (onNavigate) {
      onNavigate();
    }
    // Preserve logs param
    const currentParams = new URLSearchParams(location.search);
    const logsParam = currentParams.get('logs');
    const newParams = new URLSearchParams(route.split('?')[1]);
    if (logsParam) {
      newParams.set('logs', logsParam);
    }
    navigate(`${route.split('?')[0]}?${newParams.toString()}`);
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate();
    }
    // Preserve logs param
    const currentParams = new URLSearchParams(location.search);
    const logsParam = currentParams.get('logs');
    const params = new URLSearchParams();
    if (logsParam) {
      params.set('logs', logsParam);
    }
    const queryString = params.toString();
    navigate(`/about${queryString ? `?${queryString}` : ''}`);
  };

  const handleToolsClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    // Preserve logs param
    const currentParams = new URLSearchParams(location.search);
    const logsParam = currentParams.get('logs');
    const params = new URLSearchParams();
    if (logsParam) {
      params.set('logs', logsParam);
    }
    const queryString = params.toString();
    navigate(`/tools${queryString ? `?${queryString}` : ''}`);
  };

  const handleMiscClick = () => {
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
    navigate(`/misc${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="landing-content">
      <div className="landing-header">
        <div className="landing-title">Stripe Elements</div>
      </div>

      <div className="landing-grid-area">
        <div className="landing-subtitle-row">
          {theme !== 'apocalypse' && (
            <button
              className="landing-nav-btn-misc"
              onClick={handleMiscClick}
              title="Misc"
            >
              <span className="landing-nav-arrow">←</span>
              <span className="landing-nav-label">MISC</span>
            </button>
          )}
          <div className="landing-subtitle">
            Made by Erin Taylor | Inspired by <a href="https://4242.io" target="_blank" rel="noopener noreferrer" className="landing-link">4242.io</a> | <a href="mailto:me@erintaylor.dev" className="landing-link">Contact</a> | <a href="/about" className="landing-link" onClick={handleAboutClick}>About</a>
          </div>
          {theme !== 'apocalypse' && (
            <button
              className="landing-nav-btn landing-nav-btn-tools"
              onClick={handleToolsClick}
              title="Testing Tools"
            >
              <span className="landing-nav-label">TOOLS</span>
              <span className="landing-nav-arrow">→</span>
            </button>
          )}
        </div>
        <div className="elements-grid">
        {elements.map((element) => (
          <div
            key={element.id}
            className="element-card"
            onClick={() => handleElementClick(element.route)}
          >
            <div className="element-card-title">{element.title}</div>
            <div className="element-card-description">{element.description}</div>
          </div>
        ))}
        </div>
      </div>

      {theme === 'apocalypse' && ReactDOM.createPortal(
        <button
          className={`theme-${theme} misc-landing-arrow${screenFalling ? ' screen-falling' : ''}`}
          style={{ transform: tiltTransform }}
          onClick={handleMiscClick}
          title="Misc"
        >
          <div className="arrow-symbol">←</div>
          <div className="arrow-label">MISC</div>
        </button>,
        document.body
      )}

      {theme === 'apocalypse' && ReactDOM.createPortal(
        <button
          className={`theme-${theme} network-tools-arrow${screenFalling ? ' screen-falling' : ''}`}
          style={{ transform: tiltTransform }}
          onClick={handleToolsClick}
          title="Testing Tools"
        >
          <div className="arrow-symbol">→</div>
          <div className="arrow-label">TOOLS</div>
        </button>,
        document.body
      )}
    </div>
  );
};

export default LandingIntegration;
