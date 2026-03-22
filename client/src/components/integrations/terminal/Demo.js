import React, { useState, useCallback, useRef, useEffect } from 'react';
import FakeReader from './FakeReader';
import { useApiLogger } from '../../../context/ApiLoggerContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import API_BASE_URL from '../../../config/api';
import './Demo.css';

const TERMINAL_API = `${API_BASE_URL}/terminal`;

const storageKey = (country) => `terminal_reader_${country}`;

const loadSavedReader = (country) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(country))) || null;
  } catch {
    return null;
  }
};

const TerminalDemo = ({ paymentOptions = {} }) => {
  const { amount: rawAmount = 4242, currency = 'usd', country = 'US', readerMode = 'simulated' } = paymentOptions;
  const amount = parseInt(rawAmount, 10) || 4242;
  const isPhysical = readerMode === 'physical';
  const [registrationCode, setRegistrationCode] = useState('');
  const { addLog: addApiLog } = useApiLogger();

  const saved = isPhysical ? loadSavedReader(country) : null;
  const [readerId, setReaderId] = useState(saved?.readerId || null);
  const [readerLabel, setReaderLabel] = useState(saved?.readerLabel || null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [readerState, setReaderState] = useState(saved?.readerId ? 'idle' : 'none');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [readerOnline, setReaderOnline] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);
  const pollIntervalRef = useRef(null);
  const statusPollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setPolling(false);
  }, []);

  const stopStatusPoll = useCallback(() => {
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
    }
  }, []);

  const startStatusPoll = useCallback((currentReaderId, currentCountry) => {
    stopStatusPoll();
    statusPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${TERMINAL_API}/reader-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readerId: currentReaderId, country: currentCountry }),
        });
        const data = await res.json();
        setReaderOnline(data.readerStatus === 'online');
      } catch {
        setReaderOnline(false);
      }
    }, 2000);
  }, [stopStatusPoll]);

  // Clean up polling on unmount
  useEffect(() => () => { stopPolling(); stopStatusPoll(); }, [stopPolling, stopStatusPoll]);

  // Start status poll for saved physical reader on mount
  useEffect(() => {
    if (saved?.readerId) {
      startStatusPoll(saved.readerId, country);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addLog = (step, status, message) => {
    setLog(prev => [...prev, { step, status, message, id: Date.now() }]);
  };

  const apiCall = useCallback(async (endpoint, body, logStep) => {
    const url = `${TERMINAL_API}/${endpoint}`;
    const start = Date.now();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const duration = Date.now() - start;

      addApiLog({
        id: `${Date.now()}-${Math.random()}`,
        method: 'POST',
        url: `/terminal/${endpoint}`,
        status: res.status,
        timestamp: Date.now(),
        request: body,
        response: data,
        duration,
        stripeRequestId: data.stripeRequestId || null,
      });

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }
      return data;
    } catch (err) {
      addLog(logStep, 'error', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addApiLog]);

  const handleCreateReader = async () => {
    setReaderState('connecting');
    try {
      const body = { country };
      if (isPhysical) body.registrationCode = registrationCode.trim();
      const data = await apiCall('create-reader', body, 'Register Reader');
      setReaderId(data.readerId);
      setReaderLabel(data.readerLabel);
      setReaderState('idle');
      setReaderOnline(false);
      if (isPhysical) localStorage.setItem(storageKey(country), JSON.stringify({ readerId: data.readerId, readerLabel: data.readerLabel }));
      addLog('Register Reader', 'ok', `Reader registered: ${data.readerId}`);
      startStatusPoll(data.readerId, country);
    } catch {
      setReaderState('none');
    }
  };

  const handleForget = async () => {
    stopPolling();
    stopStatusPoll();
    setReaderOnline(false);
    localStorage.removeItem(storageKey(country));
    try {
      await apiCall('delete-reader', { readerId, country }, 'Delete Reader');
    } catch {}
    setReaderId(null);
    setReaderLabel(null);
    setReaderState('none');
    setPaymentIntentId(null);
    setError(null);
    setLog([]);
  };

  const handleCreatePaymentIntent = async () => {
    try {
      const data = await apiCall('create-payment-intent', { amount, currency, country }, 'Create Payment Intent');
      setPaymentIntentId(data.paymentIntentId);
      addLog('Create Payment Intent', 'ok', `PI created: ${data.paymentIntentId}`);
    } catch {}
  };

  const startPolling = useCallback((currentReaderId) => {
    setPolling(true);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${TERMINAL_API}/reader-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readerId: currentReaderId, country }),
        });
        const data = await res.json();
        if (data.actionStatus === 'succeeded') {
          stopPolling();
          setReaderState('payment_authorized');
          addLog('Reader Status', 'ok', 'Payment authorized — ready to capture');
        } else if (data.actionStatus === 'failed') {
          stopPolling();
          setReaderState('error');
          addLog('Reader Status', 'error', 'Reader action failed');
        }
      } catch {
        stopPolling();
      }
    }, 1500);
  }, [country, stopPolling]);

  const handleProcessPaymentIntent = async () => {
    try {
      await apiCall('process-payment-intent', { readerId, paymentIntentId, country }, 'Process Payment Intent');
      setReaderState('waiting_for_card');
      addLog('Process Payment Intent', 'ok', 'Reader is waiting for card');
      if (isPhysical) {
        addLog('Waiting for Card', 'ok', 'Present card on reader — polling for authorization...');
        startPolling(readerId);
      }
    } catch {}
  };

  const handleSimulateTap = async () => {
    try {
      await apiCall('simulate-tap', { readerId, country }, 'Simulate Card Tap');
      setReaderState('card_detected');
      addLog('Simulate Card Tap', 'ok', 'Card detected — polling for authorization...');
      startPolling(readerId);
    } catch {}
  };

  const handleCancelReaderAction = async () => {
    stopPolling();
    try {
      await apiCall('cancel-reader-action', { readerId, country }, 'Cancel Reader Action');
      setReaderState('idle');
      setPaymentIntentId(null);
      addLog('Cancel Reader Action', 'ok', 'Reader action cancelled');
    } catch {}
  };

  const handleCapture = async () => {
    try {
      await apiCall('capture-payment-intent', { paymentIntentId, country }, 'Capture Payment');
      setReaderState('captured');
      addLog('Capture Payment', 'ok', 'Payment captured successfully');
    } catch {}
  };

  const handleReset = () => {
    stopPolling();
    setPaymentIntentId(null);
    setReaderState(readerId ? 'idle' : 'none');
    setError(null);
    setLog([]);
  };

  const canCreateReader = !loading;
  const canCreatePI = !loading && !!readerId && !paymentIntentId && readerState === 'idle';
  const canProcess = !loading && !!readerId && !!paymentIntentId && readerState === 'idle' && readerOnline;
  const canSimulateTap = !loading && !polling && readerState === 'waiting_for_card';
  const canCancel = !loading && (isPhysical ? (readerState === 'waiting_for_card' || readerState === 'card_detected') : (!polling && readerState === 'waiting_for_card'));
  const canCapture = !loading && !polling && readerState === 'payment_authorized';
  const canReset = !loading && (readerState !== 'none' || log.length > 0);

  return (
    <div className="terminal-demo">
      <div className="terminal-demo-main">
        <div className="terminal-steps">

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${readerId ? 'done' : ''}`}>1</span>
              {isPhysical ? 'Register Reader' : 'Create Simulated Reader'}
              {isPhysical && (
                <a
                  className="terminal-help-link"
                  href="https://docs.stripe.com/terminal/payments/setup-reader/stripe-reader-s700-s710#settings"
                  target="_blank"
                  rel="noopener noreferrer"
                >?</a>
              )}
            </div>
            {readerId ? (
              <div className="terminal-step-actions">
                <div className="terminal-reader-id-label">{readerId}</div>
                <button
                  className="terminal-btn terminal-btn-danger terminal-btn-forget"
                  onClick={handleForget}
                  disabled={loading}
                >
                  Forget
                </button>
              </div>
            ) : isPhysical ? (
              <div className="terminal-step-actions">
                <input
                  className="terminal-code-input"
                  type="text"
                  placeholder="Registration code"
                  value={registrationCode}
                  onChange={e => setRegistrationCode(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="terminal-btn"
                  onClick={handleCreateReader}
                  disabled={!canCreateReader || !registrationCode.trim()}
                >
                  Register
                </button>
              </div>
            ) : (
              <button
                className="terminal-btn"
                onClick={handleCreateReader}
                disabled={!canCreateReader}
              >
                Create Simulated Reader
              </button>
            )}
          </div>

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${paymentIntentId ? 'done' : ''}`}>2</span>
              Create Payment Intent
            </div>
            <button
              className="terminal-btn"
              onClick={handleCreatePaymentIntent}
              disabled={!canCreatePI}
            >
              {paymentIntentId ? 'PI Created' : `Create PI (${formatCurrency(amount, currency)})`}
            </button>
          </div>

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${readerState === 'waiting_for_card' || readerState === 'card_detected' || readerState === 'payment_authorized' || readerState === 'captured' ? 'done' : ''}`}>3</span>
              Send to Reader
            </div>
            <button
              className="terminal-btn"
              onClick={handleProcessPaymentIntent}
              disabled={!canProcess}
            >
              Process Payment Intent
            </button>
          </div>

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${readerState === 'payment_authorized' || readerState === 'captured' ? 'done' : ''}`}>4</span>
              Collect Payment
            </div>
            {isPhysical ? (
              <div className="terminal-step-actions">
                <div className="terminal-waiting-label">
                  {readerState === 'waiting_for_card' || readerState === 'card_detected'
                    ? (polling ? 'WAITING FOR CARD...' : 'PRESENT CARD ON READER')
                    : readerState === 'payment_authorized' ? 'CARD AUTHORIZED'
                    : '—'}
                </div>
                <button
                  className="terminal-btn terminal-btn-danger"
                  onClick={handleCancelReaderAction}
                  disabled={!canCancel}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="terminal-step-actions">
                <button
                  className="terminal-btn terminal-btn-primary"
                  onClick={handleSimulateTap}
                  disabled={!canSimulateTap}
                >
                  Simulate Card Tap
                </button>
                <button
                  className="terminal-btn terminal-btn-danger"
                  onClick={handleCancelReaderAction}
                  disabled={!canCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${readerState === 'captured' ? 'done' : ''}`}>5</span>
              Capture Payment
            </div>
            <button
              className="terminal-btn terminal-btn-capture"
              onClick={handleCapture}
              disabled={!canCapture}
            >
              Capture Payment
            </button>
          </div>

          <div className="terminal-step terminal-step-reset">
            <button
              className="terminal-btn terminal-btn-reset"
              onClick={handleReset}
              disabled={!canReset}
            >
              Reset
            </button>
          </div>
        </div>

        <FakeReader
          readerState={readerState}
          readerId={readerId}
          amount={paymentIntentId ? amount : null}
          currency={currency}
        />
      </div>

      {error && (
        <div className="terminal-error">
          <span className="terminal-error-label">ERROR</span> {error}
        </div>
      )}

      {log.length > 0 && (
        <div className="terminal-log">
          {log.map((entry) => (
            <div key={entry.id} className={`terminal-log-entry terminal-log-${entry.status}`}>
              <span className="terminal-log-step">{entry.step}</span>
              <span className="terminal-log-msg">{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TerminalDemo;
