import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceContext } from '../../context/DeviceContext';
import { waitForStripe } from '../../utils/waitForStripe';
import { collectFinancialConnectionsAccounts } from '../../utils/stripeLogger';
import API_BASE_URL from '../../config/api';
import './FcOAuthDisconnect.css';

const CHECKLIST_URL = 'https://docs.stripe.com/financial-connections/deployment-checklist';

const WARNING_TEXT = `The Financial Connections OAuth pop-up window disconnected very quickly after opening. This may indicate a CORS, COOP, webview, or iframe configuration issue. See ${CHECKLIST_URL} for troubleshooting guidance.`;

const FcOAuthDisconnect = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenTiltStyle, screenFalling, theme } = useDeviceContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
    navigate(`/misc${queryString ? `?${queryString}` : ''}`);
  };

  const handleManualLaunch = async () => {
    setLoading(true);
    setResult(null);
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
      const { financialConnectionsSession, error } = await collectFinancialConnectionsAccounts(stripe, {
        clientSecret: data.clientSecret,
      });

      if (error) {
        setResult({ ok: false, text: error.message });
      } else {
        const count = financialConnectionsSession.accounts.length;
        setResult({ ok: true, text: `Session complete: ${count} account(s) linked.` });
      }
    } catch (err) {
      setResult({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCoopLaunch = () => {
    window.open(`${API_BASE_URL}/financial-connections/coop-demo`, '_blank', 'noopener');
  };

  return (
    <div className="fc-oauth-content">
      <div className="fc-oauth-header">
        {theme !== 'apocalypse' && (
          <button className="sub-page-back-btn" onClick={handleBackClick} title="Back to Misc">←</button>
        )}
        <div className="fc-oauth-title">FC OAuth Pop-up Rapid Disconnect</div>
      </div>

      <div className="fc-oauth-body">
        <div className="fc-oauth-subtitle">
          Some banks in the Financial Connections auth flow use an OAuth pop-up. If Stripe.js sees that pop-up close less than 3 seconds after it opens, the cause is usually a misconfigured page (a COOP header, CORS, a webview, or an iframe), not the user. Stripe.js now logs a warning to the browser console when this happens. Open DevTools → Console before trying the demos below. The warning is logged from inside the Stripe.js iframe, so it will show up under the js.stripe.com frame.
        </div>

        <pre className="fc-oauth-code-block fc-oauth-warning">{`⚠ ${WARNING_TEXT}`}</pre>

        <div className="fc-oauth-section">
          <div className="fc-oauth-section-header">Manual quick close</div>
          <div className="fc-oauth-section-text">
            This page has no misconfiguration, so you can trigger the warning by closing the pop-up yourself. Click the button, pick an <strong>OAuth</strong> test institution, and close the bank pop-up within 3 seconds of it opening. To compare, try again and wait more than 3 seconds before closing. You shouldn't see the warning that time.
          </div>
          <button className="fc-oauth-button" onClick={handleManualLaunch} disabled={loading}>
            {loading ? 'Waiting for Financial Connections…' : 'Link bank account'}
          </button>
          {result && (
            <div className={`fc-oauth-result${result.ok ? ' result-ok' : ' result-fail'}`}>{result.text}</div>
          )}
        </div>

        <div className="fc-oauth-section">
          <div className="fc-oauth-section-header">Broken COOP header</div>
          <div className="fc-oauth-section-text">
            This reproduces the real-world failure. A page served with <code>Cross-Origin-Opener-Policy: same-origin</code> is cut off from any cross-origin pop-up it opens, including the bank's OAuth window, so Stripe.js sees the pop-up as closed almost right away. The button opens a separate page with that header set. Headers only apply to the top-level page, so this can't run on this page. Start the same flow there and the warning appears without you closing anything. See the <a href={CHECKLIST_URL} target="_blank" rel="noopener noreferrer" className="fc-oauth-link">deployment checklist</a> for the recommended settings.
          </div>
          <pre className="fc-oauth-code-block">{`HTTP/1.1 200 OK
Content-Type: text/html
Cross-Origin-Opener-Policy: same-origin   ← breaks the OAuth pop-up`}</pre>
          <button className="fc-oauth-button" onClick={handleCoopLaunch}>
            Open broken COOP page ↗
          </button>
        </div>
      </div>

      {theme === 'apocalypse' && ReactDOM.createPortal(
        <button
          className={`theme-${theme} misc-tools-arrow${screenFalling ? ' screen-falling' : ''}`}
          style={{ transform: tiltTransform }}
          onClick={handleBackClick}
          title="Back to Misc"
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
