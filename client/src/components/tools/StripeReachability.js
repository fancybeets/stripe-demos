import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceContext } from '../../context/DeviceContext';
import './StripeReachability.css';

const StripeReachability = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenTiltStyle, screenFalling, theme } = useDeviceContext();
  const tiltTransform = screenTiltStyle.transform
    ? `translateY(-50%) ${screenTiltStyle.transform}`
    : 'translateY(-50%)';
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const endpoints = [
    { name: 'Armada', url: 'https://armada.stripe.com', description: 'Terminal device management' },
    { name: 'Gator', url: 'https://gator.stripe.com', description: 'Terminal configuration service' },
    { name: 'BBPOS EMMS', url: 'https://api.emms.bbpos.com', description: 'BBPOS reader management' },
    { name: 'Terminal S3', url: 'https://stripe-point-of-sale-us-west-2.s3.us-west-2.amazonaws.com', description: 'Terminal firmware/assets' },
    { name: 'Android Time', url: 'https://time.android.com', description: 'NTP time synchronization (hardware only)', ntp: true },
    { name: 'Cloudflare Time', url: 'https://time.cloudflare.com', description: 'NTP time synchronization (hardware only)', ntp: true },
  ];

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
    navigate(`/tools${queryString ? `?${queryString}` : ''}`);
  };

  const testEndpoint = async (endpoint) => {
    if (endpoint.ntp) {
      return {
        name: endpoint.name,
        description: endpoint.description,
        url: endpoint.url,
        status: 'ntp',
        latency: null,
        message: 'NTP/UDP — not testable from a browser. Physical readers only.',
      };
    }

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(endpoint.url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const latency = endTime - startTime;

      return {
        name: endpoint.name,
        description: endpoint.description,
        url: endpoint.url,
        status: 'reachable',
        latency: latency,
        message: `Successfully reached endpoint (${latency}ms)`,
      };
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (error.name === 'AbortError') {
        return {
          name: endpoint.name,
          description: endpoint.description,
          url: endpoint.url,
          status: 'timeout',
          latency: latency,
          message: 'Request timed out after 30 seconds',
        };
      }

      return {
        name: endpoint.name,
        description: endpoint.description,
        url: endpoint.url,
        status: 'unreachable',
        latency: latency,
        message: `Network error: ${error.message}`,
      };
    }
  };

  const runTests = async () => {
    setTesting(true);
    setTestComplete(false);
    setTestResults([]);
    setTimeElapsed(0);

    // Start timer
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setTimeElapsed(elapsed);
    }, 100);

    // Run all tests in parallel
    const testPromises = endpoints.map(endpoint => testEndpoint(endpoint));
    const results = await Promise.all(testPromises);

    clearInterval(timerInterval);
    setTestResults(results);
    setTesting(false);
    setTestComplete(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reachable': return '✓';
      case 'unreachable': return '✗';
      case 'timeout': return '⏱';
      case 'ntp': return '—';
      default: return '?';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'reachable': return 'status-success';
      case 'unreachable': return 'status-error';
      case 'timeout': return 'status-warning';
      case 'ntp': return 'status-na';
      default: return '';
    }
  };

  return (
    <div className="stripe-reachability-content">
      <div className="stripe-reachability-header">
        <div className="stripe-reachability-title">Terminal Reachability</div>
      </div>

      <div className="reachability-subtitle-area">
        <div className="reachability-subtitle-row">
          {theme !== 'apocalypse' && (
            <button
              className="tools-nav-btn"
              onClick={handleBackClick}
              title="Back to Tools"
            >
              <span className="tools-nav-arrow">←</span>
              <span className="tools-nav-label">BACK</span>
            </button>
          )}
          <div className="stripe-reachability-subtitle">
            EXPERIMENTAL - use and trust with caution
          </div>
        </div>
      </div>

      <div className="stripe-reachability-body">
        <div className="test-controls">
          <button
            className="run-test-button"
            onClick={runTests}
            disabled={testing}
          >
            {testing ? 'TESTING...' : 'RUN DOMAIN TEST'}
          </button>
        </div>

        {testing && (
          <div className="countdown-container">
            <svg className="countdown-circle" viewBox="0 0 120 120">
              <circle
                className="countdown-circle-bg"
                cx="60"
                cy="60"
                r="54"
              />
              <circle
                className={`countdown-circle-progress ${timeElapsed > 25 ? 'pulsing' : ''}`}
                cx="60"
                cy="60"
                r="54"
                style={{
                  strokeDasharray: 339.292,
                  strokeDashoffset: 339.292 * (1 - Math.min(timeElapsed / 30, 1)),
                  transform: 'rotate(-90deg)',
                  transformOrigin: '60px 60px',
                }}
              />
            </svg>
            <div className="countdown-text">
              {(Math.max(0, 30 - timeElapsed)).toFixed(1)}s
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="test-results">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Domain</th>
                  <th>Description</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr key={index} className={getStatusClass(result.status)}>
                    <td className="status-cell">
                      <span className="status-icon">{getStatusIcon(result.status)}</span>
                    </td>
                    <td className="domain-cell">{new URL(result.url).hostname}</td>
                    <td className="description-cell">{result.description}</td>
                    <td className="latency-cell">{result.latency !== null ? `${result.latency}ms` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {testComplete && testResults.length > 0 && (
          <div className="test-summary">
            <div className="summary-title">Summary</div>
            <div className="summary-stats">
              <div className="summary-stat">
                <div className="stat-value">{testResults.filter(r => r.status === 'reachable').length}</div>
                <div className="stat-label">Reachable</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{testResults.filter(r => r.status === 'unreachable').length}</div>
                <div className="stat-label">Unreachable</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">{testResults.filter(r => r.status === 'timeout').length}</div>
                <div className="stat-label">Timeouts</div>
              </div>
              <div className="summary-stat">
                <div className="stat-value">
                  {(() => {
                    const tested = testResults.filter(r => r.latency !== null);
                    return tested.length ? `${Math.round(tested.reduce((sum, r) => sum + r.latency, 0) / tested.length)}ms` : '—';
                  })()}
                </div>
                <div className="stat-label">Avg Latency</div>
              </div>
            </div>
          </div>
        )}

        {!testing && testResults.length === 0 && (
          <div className="test-instructions">
            <div className="instructions-title">About This Test</div>
            <div className="instructions-text">
              This tool tests connectivity to required Stripe Terminal domains including device management
              services (Armada, Gator), BBPOS reader APIs, firmware storage, and NTP time servers.
            </div>
            <div className="instructions-list">
              <div className="instruction-item">• Tests Terminal-specific domains</div>
              <div className="instruction-item">• All tests run in parallel</div>
              <div className="instruction-item">• Measures network latency</div>
              <div className="instruction-item">• 30 second timeout threshold</div>
            </div>
          </div>
        )}
      </div>

      {theme === 'apocalypse' && ReactDOM.createPortal(
        <button
          className={`theme-${theme} demos-arrow${screenFalling ? ' screen-falling' : ''}`}
          style={{ transform: tiltTransform }}
          onClick={handleBackClick}
          title="Back to Tools"
        >
          <div className="arrow-symbol">←</div>
          <div className="arrow-label">BACK</div>
        </button>,
        document.body
      )}
    </div>
  );
};

export default StripeReachability;
