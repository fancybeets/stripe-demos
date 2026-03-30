import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceContext } from '../../context/DeviceContext';
import { getStripeAppearance } from '../../config/stripeAppearance';
import { waitForStripe } from '../../utils/waitForStripe';
import { createElements } from '../../utils/stripeLogger';
import API_BASE_URL from '../../config/api';
import './EceClickTiming.css';

const SECTIONS = [
  {
    id: 'slow',
    delay: 1.5,
    label: '1.5 second delay: the payment sheet fails to load',
    domId: 'ece-timing-slow',
    resultOk: false,
  },
  {
    id: 'fast',
    delay: 0.5,
    label: '0.5 second delay: the payment sheet loads',
    domId: 'ece-timing-fast',
    resultOk: true,
  },
];

const CIRCUMFERENCE = 339.292;

const EceSection = ({ section, stripe }) => {
  const [timerActive, setTimerActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const eceRef = useRef(null);

  useEffect(() => {
    if (!stripe) return;

    if (eceRef.current) {
      try { eceRef.current.unmount(); } catch (e) {}
      eceRef.current = null;
    }

    const el = createElements(stripe, {
      mode: 'payment',
      amount: 4242,
      currency: 'usd',
      appearance: getStripeAppearance(),
    });

    const ece = el.create('expressCheckout', {
      buttonType: { applePay: 'buy', googlePay: 'buy', paypal: 'buynow' },
    });
    eceRef.current = ece;

    ece.on('click', async (event) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      console.log("click")
      setTimerDone(false);
      setElapsed(0);
      setTimerActive(true);
      startTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        setElapsed((Date.now() - startTimeRef.current) / 1000);
      }, 50);

      await new Promise(resolve => setTimeout(resolve, section.delay * 1000));

      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(section.delay);
      setTimerActive(false);
      setTimerDone(true);
      console.log("resolve")

      event.resolve({});
    });

    ece.mount(`#${section.domId}`);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (eceRef.current) {
        try { eceRef.current.unmount(); } catch (e) {}
        eceRef.current = null;
      }
    };
  }, [stripe, section]);

  const progress = Math.min(elapsed / section.delay, 1);
  const offset = CIRCUMFERENCE * (1 - progress);
  const displayTime = timerActive
    ? Math.max(0, section.delay - elapsed).toFixed(1) + 's'
    : timerDone
    ? (section.resultOk ? '✓' : '✗')
    : section.delay.toFixed(1) + 's';

  return (
    <div className="ece-section">
      <div className="ece-section-header">{section.label}</div>
      <div className="ece-demo-row">
        <div className="ece-element-area">
          <div id={section.domId}></div>
        </div>
        <div className="ece-timer-area">
          <div className="ece-countdown-container">
            <svg className="ece-countdown-circle" viewBox="0 0 120 120">
              <circle className="ece-countdown-circle-bg" cx="60" cy="60" r="54" />
              {!timerDone && (
                <circle
                  className="ece-countdown-circle-progress"
                  cx="60"
                  cy="60"
                  r="54"
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: offset,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '60px 60px',
                  }}
                />
              )}
            </svg>
            <div className={`ece-countdown-text${timerDone ? (section.resultOk ? ' result-ok' : ' result-fail') : ''}`}>
              {displayTime}
            </div>
          </div>
        </div>
      </div>
      <pre className="ece-code-block">{`expressCheckoutElement.on('click', async (event) => {
  // do something that takes ${section.delay}s to complete
  await new Promise(resolve => setTimeout(resolve, ${section.delay * 1000}));
  event.resolve();
});`}</pre>
    </div>
  );
};

const EceClickTiming = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenTiltStyle, screenFalling, theme } = useDeviceContext();
  const [stripe, setStripe] = useState(null);
  const [error, setError] = useState(null);

  const tiltTransform = screenTiltStyle.transform
    ? `translateY(-50%) ${screenTiltStyle.transform}`
    : 'translateY(-50%)';

  useEffect(() => {
    waitForStripe()
      .then(() => fetch(`${API_BASE_URL}/config?country=US`))
      .then(res => {
        if (!res.ok) throw new Error('Failed to load Stripe configuration');
        return res.json();
      })
      .then(data => setStripe(window.Stripe(data.publishableKey)))
      .catch(err => setError(err.message));
  }, []);

  const handleBackClick = () => {
    if (onNavigate) onNavigate();
    const currentParams = new URLSearchParams(location.search);
    const logsParam = currentParams.get('logs');
    const params = new URLSearchParams();
    if (logsParam) params.set('logs', logsParam);
    const queryString = params.toString();
    navigate(`/misc${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="ece-timing-content">
      <div className="ece-timing-header">
        {theme !== 'apocalypse' && (
          <button className="sub-page-back-btn" onClick={handleBackClick} title="Back to Misc">←</button>
        )}
        <div className="ece-timing-title">ECE Click-To-Resolve Timing</div>
      </div>

      <div className="ece-timing-body">
        <div className="ece-timing-subtitle">
          The <a href="https://docs.stripe.com/js/element/events/on_click?type=expressCheckoutElement" target="_blank" rel="noopener noreferrer" className="ece-timing-link">expressCheckoutElement.on('click')</a> listener gives you a brief window of time to adjust Line Items, Shipping Rates, and other options before the payment sheet opens. However, you need to call event.resolve() within 1 second, otherwise the payment UI will silently fail to load. Avoid long-running or highly variable network requests during this time to prevent a buggy user experience.

          (Note that you can't complete payment in these demos since they don't have confirm handlers configured)
        </div>

        {error ? (
          <div className="ece-error">{error}</div>
        ) : (
          SECTIONS.map(section => (
            <EceSection key={section.id} section={section} stripe={stripe} />
          ))
        )}
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

export default EceClickTiming;
