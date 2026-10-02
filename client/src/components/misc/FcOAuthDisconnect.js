import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceContext } from '../../context/DeviceContext';
import { getStripeAppearance } from '../../config/stripeAppearance';
import { waitForStripe } from '../../utils/waitForStripe';
import { createElements } from '../../utils/stripeLogger';
import API_BASE_URL from '../../config/api';
import './FcOAuthDisconnect.css';

const CHECKLIST_URL = 'https://docs.stripe.com/financial-connections/deployment-checklist';

// Served by the Express server (server/routes/pages.js) with
// Cross-Origin-Opener-Policy: same-origin. COOP only applies on a full
// document load, so this page must be opened with a real navigation.
const COOP_PAGE_URL = `${API_BASE_URL}/pages/fc-oauth-disconnect-coop`;

const AMOUNT = 4242;
const CURRENCY = 'usd';

const WARNING_TEXT = `The Financial Connections OAuth pop-up window disconnected very quickly after opening. This may indicate a CORS, COOP, webview, or iframe configuration issue. See ${CHECKLIST_URL} for troubleshooting guidance.`;

const BankPaymentElement = () => {
  const [elements, setElements] = useState(null);
  const [errorText, setErrorText] = useState(null);
  const mountRef = useRef(null);

  useEffect(() => {
    const abortController = new AbortController();
    let paymentElement = null;

    const init = async () => {
      await waitForStripe();
      const res = await fetch(`${API_BASE_URL}/payment-element/create-payment-intent/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: AMOUNT,
          currency: CURRENCY,
          country: 'US',
          paymentMethods: ['us_bank_account'],
        }),
        signal: abortController.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PaymentIntent');
      if (abortController.signal.aborted) return;

      const stripeInstance = window.Stripe(data.publishableKey);
      const elementsInstance = createElements(stripeInstance, {
        clientSecret: data.clientSecret,
        appearance: getStripeAppearance(),
      });
      paymentElement = elementsInstance.create('payment');
      paymentElement.mount(mountRef.current);
      setElements(elementsInstance);
    };

    init().catch((err) => {
      if (err.name !== 'AbortError' && !abortController.signal.aborted) {
        setErrorText(err.message);
      }
    });

    return () => {
      abortController.abort();
      if (paymentElement) {
        try {
          paymentElement.unmount();
        } catch (e) {
          // Element already unmounted
        }
      }
    };
  }, []);

  return (
    <>
      {!elements && !errorText && <div className="fc-oauth-loading">Loading Payment Element…</div>}
      <div ref={mountRef} />
      {errorText && <div className="fc-oauth-result result-fail">{errorText}</div>}
    </>
  );
};

const FcOAuthDisconnect = ({ onNavigate }) => {
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
    navigate(`/misc${queryString ? `?${queryString}` : ''}`);
  };

  const openCoopPage = () => {
    const params = new URLSearchParams({ return_url: window.location.href });
    window.location.href = `${COOP_PAGE_URL}?${params.toString()}`;
  };

  return (
    <div className="fc-oauth-content">
      <div className="fc-oauth-header">
        {theme !== 'apocalypse' && (
          <button className="sub-page-back-btn" onClick={handleBackClick} title="Back to Misc">←</button>
        )}
        <div className="fc-oauth-title">Financial Connections OAuth Pop-up Rapid Disconnect</div>
      </div>

      <div className="fc-oauth-body">
        <div className="fc-oauth-subtitle">
          Some banks in the Financial Connections auth flow use an OAuth pop-up. If Stripe.js sees that pop-up close less than 3 seconds after it opens, the cause is usually a misconfigured page (a COOP header, CORS, a webview, or an iframe). Stripe.js logs a warning to the browser console when this happens:
        </div>

        <pre className="fc-oauth-code-block fc-oauth-warning">{`⚠ ${WARNING_TEXT}`}</pre>

        <div className="fc-oauth-subtitle fc-oauth-followup">
          Visit the link below for a complete guide of all known cases that can lead to this issue and how to resolve them:
          <br />
          <a href={CHECKLIST_URL} target="_blank" rel="noopener noreferrer" className="fc-oauth-link">{CHECKLIST_URL}</a>
        </div>

        <div className="fc-oauth-section">
          <div className="fc-oauth-section-header">Broken OAuth Pop-up</div>
          <div className="fc-oauth-section-text">
            The button below opens a standalone HTML page with a <code>Cross-Origin-Opener-Policy: same-origin</code> header. This header will result in the OAuth pop-up immediately being disconnected from the page that opened it, so Stripe.js sees the pop-up as closed almost right away, which will in turn trigger the warning being logged in your browser's Developer Tools console. Click the button below and follow the instructions to reproduce the issue.
          </div>
          <button className="fc-oauth-button" onClick={openCoopPage}>
            Open the test page
          </button>
        </div>

        <div className="fc-oauth-section">
          <div className="fc-oauth-section-header">Functional OAuth Pop-up</div>
          <div className="fc-oauth-section-text">
            The page you are currently on is configured correctly and should allow you to successfully connect to an OAuth test institution. Select any of the bank options with <strong>(OAuth)</strong> next to the name and confirm the next few pages. The bank pop-up opens, stays connected to this page, and returns you to the flow once you finish. No warning is logged. (You can still trigger the warning here by closing the OAuth pop-up within 3 seconds of it opening.)
          </div>
          <BankPaymentElement />
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
