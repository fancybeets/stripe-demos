import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceContext } from '../../context/DeviceContext';
import { waitForStripe } from '../../utils/waitForStripe';
import { collectFinancialConnectionsAccounts } from '../../utils/stripeLogger';
import API_BASE_URL from '../../config/api';
import './FcOAuthDisconnect.css';

const CHECKLIST_URL = 'https://docs.stripe.com/financial-connections/deployment-checklist';

// Served with Cross-Origin-Opener-Policy: same-origin by client/src/setupProxy.js
// (local dev) and client/public/_headers (hosting). COOP only applies on a full
// document load, so this page must be opened with a real navigation, not the router.
const COOP_PATH = '/misc/fc-oauth-disconnect/coop';

const WARNING_TEXT = `The Financial Connections OAuth pop-up window disconnected very quickly after opening. This may indicate a CORS, COOP, webview, or iframe configuration issue. See ${CHECKLIST_URL} for troubleshooting guidance.`;

const LaunchButton = () => {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);

  const handleLaunch = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      await waitForStripe();
      const res = await fetch(`${API_BASE_URL}/financial-connections/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'US' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create Financial Connections Session');

      const stripe = window.Stripe(data.publishableKey);
      const { error } = await collectFinancialConnectionsAccounts(stripe, {
        clientSecret: data.clientSecret,
      });

      if (error) setErrorText(error.message);
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="fc-oauth-button" onClick={handleLaunch} disabled={loading}>
        {loading ? 'Waiting for Financial Connections…' : 'Link bank account'}
      </button>
      {errorText && <div className="fc-oauth-result result-fail">{errorText}</div>}
    </>
  );
};

const ManualContent = () => (
  <>
    <div className="fc-oauth-section">
      <div className="fc-oauth-section-header">Default experience</div>
      <div className="fc-oauth-section-text">
        The page you are currently on is configured correctly and should allow you to successfully connect to an OAuth test institution. Click the button and select any of the options with <strong>(OAuth)</strong> next to the name and confirm the next few pages. The bank pop-up opens, stays connected to this page, and returns you to the flow once you finish. No warning is logged. (You can still trigger the warning here by closing the OAuth pop-up within 3 seconds of it opening.)
      </div>
      <LaunchButton />
    </div>

    <div className="fc-oauth-section">
      <div className="fc-oauth-section-header">Broken experience</div>
      <div className="fc-oauth-section-text">
        The button below opens a standalone HTML file with a <code>Cross-Origin-Opener-Policy: same-origin</code> header. This header will result in the OAuth pop-up immediately being disconnected from the page that opened it, so Stripe.js sees the pop-up as closed almost right away, which will in turn trigger the warning being logged in your browser's Developer Tools console. Click the button below and follow the instructions to reproduce the issue.
      </div>
      {/* Full page load (not router navigation) so the COOP header is applied */}
      <button className="fc-oauth-button" onClick={() => { window.location.href = `${COOP_PATH}${window.location.search}`; }}>
        Open broken COOP page
      </button>
    </div>
  </>
);

const CoopContent = () => (
  <div className="fc-oauth-section">
    <div className="fc-oauth-section-header">Steps to reproduce</div>
    <div className="fc-oauth-section-text">
      This page is served with <code>Cross-Origin-Opener-Policy: same-origin</code>.
    </div>
    <ol className="fc-oauth-steps">
      <li>Open DevTools → Console.</li>
      <li>Click <strong>Link bank account</strong>.</li>
      <li>Choose an <strong>OAuth</strong> test institution and continue to the bank pop-up.</li>
      <li>The pop-up disconnects right away, and this warning appears in the console (js.stripe.com frame):</li>
    </ol>
    <pre className="fc-oauth-code-block fc-oauth-warning">{`⚠ ${WARNING_TEXT}`}</pre>
    <LaunchButton />
  </div>
);

const FcOAuthDisconnect = ({ onNavigate, coop = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenTiltStyle, screenFalling, theme } = useDeviceContext();

  const tiltTransform = screenTiltStyle.transform
    ? `translateY(-50%) ${screenTiltStyle.transform}`
    : 'translateY(-50%)';

  const handleBackClick = () => {
    if (onNavigate) onNavigate();
    const currentParams = new URLSearchParams(location.search);
    const logsParam = currentParams.get('logs');
    const params = new URLSearchParams();
    if (logsParam) params.set('logs', logsParam);
    const queryString = params.toString();
    const target = `${coop ? '/misc/fc-oauth-disconnect' : '/misc'}${queryString ? `?${queryString}` : ''}`;
    if (coop) {
      // Full reload so the rest of the site isn't left running under the broken COOP header
      window.location.href = target;
    } else {
      navigate(target);
    }
  };

  const backTitle = coop ? 'Back to Financial Connections OAuth demo' : 'Back to Misc';

  return (
    <div className="fc-oauth-content">
      <div className="fc-oauth-header">
        {theme !== 'apocalypse' && (
          <button className="sub-page-back-btn" onClick={handleBackClick} title={backTitle}>←</button>
        )}
        <div className="fc-oauth-title">Financial Connections OAuth Pop-up Rapid Disconnect</div>
      </div>

      <div className="fc-oauth-body">
        {coop ? (
          <CoopContent />
        ) : (
          <>
            <div className="fc-oauth-subtitle">
              Some banks in the Financial Connections auth flow use an OAuth pop-up. If Stripe.js sees that pop-up close less than 3 seconds after it opens, the cause is usually a misconfigured page (a COOP header, CORS, a webview, or an iframe), not the user. Stripe.js logs a warning to the browser console when this happens:
            </div>

            <pre className="fc-oauth-code-block fc-oauth-warning">{`⚠ ${WARNING_TEXT}`}</pre>

            <div className="fc-oauth-subtitle fc-oauth-followup">
              Visit the link below for a complete guide of all known cases that can lead to this issue and how to resolve them:
              <br />
              <a href={CHECKLIST_URL} target="_blank" rel="noopener noreferrer" className="fc-oauth-link">{CHECKLIST_URL}</a>
            </div>

            <ManualContent />
          </>
        )}
      </div>

      {theme === 'apocalypse' && ReactDOM.createPortal(
        <button
          className={`theme-${theme} misc-tools-arrow${screenFalling ? ' screen-falling' : ''}`}
          style={{ transform: tiltTransform }}
          onClick={handleBackClick}
          title={backTitle}
        >
          <div className="arrow-symbol">←</div>
          <div className="arrow-label">BACK</div>
        </button>,
        document.body
      )}
    </div>
  );
};

export default FcOAuthDisconnect;
