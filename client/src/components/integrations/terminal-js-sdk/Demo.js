import React, { useState, useCallback, useRef, useEffect } from 'react';
import FakeReader from '../terminal/FakeReader';
import { useApiLogger } from '../../../context/ApiLoggerContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import API_BASE_URL from '../../../config/api';
import '../terminal/Demo.css';

const TERMINAL_API = `${API_BASE_URL}/terminal-js-sdk`;

const storageKey = (country) => `terminal_reader_${country}`;

const loadSavedReader = (country) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(country))) || null;
  } catch {
    return null;
  }
};

const TerminalJsSdkDemo = ({ paymentOptions = {} }) => {
  const { amount: rawAmount = 4242, currency = 'usd', country = 'US', readerMode = 'simulated' } = paymentOptions;
  const amount = parseInt(rawAmount, 10) || 4242;
  const isPhysical = readerMode === 'physical';
  const { addLog: addApiLog } = useApiLogger();

  const [registrationCode, setRegistrationCode] = useState('');

  const saved = isPhysical ? loadSavedReader(country) : null;
  const [terminal, setTerminal] = useState(null);
  const [readerId, setReaderId] = useState(saved?.readerId || null);
  const [readerLabel, setReaderLabel] = useState(saved?.readerLabel || null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [readerState, setReaderState] = useState('none');
  const [connectionStatus, setConnectionStatus] = useState('not_connected');
  const [paymentStatus, setPaymentStatus] = useState('not_ready');
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);

  const terminalRef = useRef(null);
  const countryRef = useRef(country);
  countryRef.current = country;

  useEffect(() => {
    return () => {
      if (terminalRef.current) {
        terminalRef.current.disconnectReader().catch(() => {});
      }
    };
  }, []);

  const addLog = (step, status, message) => {
    setLog(prev => [...prev, { step, status, message, id: Date.now() }]);
  };

  const apiCall = useCallback(async (endpoint, body, logStep) => {
    const url = `${TERMINAL_API}/${endpoint}`;
    const start = Date.now();
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
        url: `/terminal-js-sdk/${endpoint}`,
        status: res.status,
        timestamp: Date.now(),
        request: body,
        response: data,
        duration,
        stripeRequestId: data.stripeRequestId || null,
      });

      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      addLog(logStep, 'error', err.message);
      setError(err.message);
      throw err;
    }
  }, [addApiLog]);

  const createTerminalInstance = useCallback(async () => {
    const { loadStripeTerminal } = await import('@stripe/terminal-js');
    const StripeTerminal = await loadStripeTerminal();

    return StripeTerminal.create({
      onFetchConnectionToken: async () => {
        const data = await apiCall('connection-token', { country: countryRef.current }, 'Fetch Connection Token');
        return data.secret;
      },
      onConnectionStatusChange: (event) => {
        setConnectionStatus(event.status);
      },
      onPaymentStatusChange: (event) => {
        setPaymentStatus(event.status);
      },
      onUnexpectedReaderDisconnect: () => {
        addLog('Reader Disconnected', 'error', 'Reader disconnected unexpectedly');
        setReaderState('none');
        setPaymentIntent(null);
        setTerminal(null);
        setConnectionStatus('not_connected');
        setPaymentStatus('not_ready');
        terminalRef.current = null;
      },
    });
  }, [apiCall]);

  const discoverAndConnect = useCallback(async (term, targetReaderId) => {
    const discoverResult = await term.discoverReaders({ simulated: !isPhysical });
    if (discoverResult.error) throw new Error(discoverResult.error.message);
    if (!discoverResult.discoveredReaders.length) throw new Error('No readers found');
    addLog('Discover Readers', 'ok', `Found ${discoverResult.discoveredReaders.length} reader(s)`);

    const reader = targetReaderId
      ? discoverResult.discoveredReaders.find(r => r.id === targetReaderId)
      : discoverResult.discoveredReaders[0];

    if (!reader) throw new Error(`Reader ${targetReaderId} not found — make sure it is online`);

    const connectResult = await term.connectReader(reader);
    if (connectResult.error) throw new Error(connectResult.error.message);
    return connectResult.reader;
  }, [isPhysical]);

  // Simulated: discover + connect
  const handleConnect = async () => {
    setLoading(true);
    setReaderState('connecting');
    setError(null);
    try {
      const term = await createTerminalInstance();
      const reader = await discoverAndConnect(term, null);

      terminalRef.current = term;
      setTerminal(term);
      setReaderId(reader.id);
      setReaderLabel(reader.label || 'Simulated Reader');
      setReaderState('idle');
      setConnectionStatus(term.getConnectionStatus());
      setPaymentStatus(term.getPaymentStatus());
      addLog('Connect Reader', 'ok', `Connected: ${reader.id}`);
    } catch (err) {
      setReaderState('none');
      if (err.message !== 'Request failed') {
        addLog('Connect', 'error', err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Physical: register via server, then discover by ID + connect
  const handleRegisterAndConnect = async () => {
    setLoading(true);
    setReaderState('connecting');
    setError(null);
    try {
      const regData = await apiCall('create-reader', { country, registrationCode: registrationCode.trim() }, 'Register Reader');
      addLog('Register Reader', 'ok', `Reader registered: ${regData.readerId}`);

      const term = await createTerminalInstance();
      const reader = await discoverAndConnect(term, regData.readerId);

      localStorage.setItem(storageKey(country), JSON.stringify({ readerId: reader.id, readerLabel: reader.label }));
      terminalRef.current = term;
      setTerminal(term);
      setReaderId(reader.id);
      setReaderLabel(reader.label || 'Demo Reader');
      setReaderState('idle');
      setConnectionStatus(term.getConnectionStatus());
      setPaymentStatus(term.getPaymentStatus());
      addLog('Connect Reader', 'ok', `Connected: ${reader.id}`);
    } catch (err) {
      setReaderState('none');
      if (err.message !== 'Request failed') {
        addLog('Connect', 'error', err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Physical: reconnect a previously registered reader
  const handleReconnect = async () => {
    setLoading(true);
    setReaderState('connecting');
    setError(null);
    try {
      const term = await createTerminalInstance();
      const reader = await discoverAndConnect(term, readerId);

      terminalRef.current = term;
      setTerminal(term);
      setReaderState('idle');
      setConnectionStatus(term.getConnectionStatus());
      setPaymentStatus(term.getPaymentStatus());
      addLog('Reconnect Reader', 'ok', `Connected: ${reader.id}`);
    } catch (err) {
      setReaderState('none');
      if (err.message !== 'Request failed') {
        addLog('Reconnect', 'error', err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForget = async () => {
    if (terminalRef.current) {
      await terminalRef.current.disconnectReader().catch(() => {});
      terminalRef.current = null;
    }
    localStorage.removeItem(storageKey(country));
    try {
      await apiCall('delete-reader', { readerId, country }, 'Delete Reader');
    } catch {}
    setTerminal(null);
    setReaderId(null);
    setReaderLabel(null);
    setPaymentIntent(null);
    setReaderState('none');
    setConnectionStatus('not_connected');
    setPaymentStatus('not_ready');
    setError(null);
    setLog([]);
  };

  const handleDisconnect = async () => {
    if (terminalRef.current) {
      await terminalRef.current.disconnectReader().catch(() => {});
    }
    terminalRef.current = null;
    setTerminal(null);
    setReaderId(null);
    setReaderLabel(null);
    setPaymentIntent(null);
    setReaderState('none');
    setConnectionStatus('not_connected');
    setPaymentStatus('not_ready');
    setError(null);
    setLog([]);
  };

  const handleCreatePaymentIntent = async () => {
    setLoading(true);
    try {
      const data = await apiCall('create-payment-intent', { amount, currency, country }, 'Create Payment Intent');
      setPaymentIntent({ id: data.paymentIntentId, client_secret: data.clientSecret });
      addLog('Create Payment Intent', 'ok', `PI created: ${data.paymentIntentId}`);
    } catch {
      // error already logged in apiCall
    } finally {
      setLoading(false);
    }
  };

  const handleCollectPaymentMethod = async () => {
    setCollecting(true);
    setReaderState('waiting_for_card');
    setError(null);
    try {
      const result = await terminal.collectPaymentMethod(paymentIntent.client_secret);
      if (result.error) {
        setReaderState('idle');
        addLog('Collect Payment Method', 'error', result.error.message);
        setError(result.error.message);
        return;
      }
      setPaymentIntent(result.paymentIntent);
      setReaderState('card_detected');
      addLog('Collect Payment Method', 'ok', 'Card collected — ready to process');
    } finally {
      setCollecting(false);
    }
  };

  const handleCancelCollect = async () => {
    const result = await terminal.cancelCollectPaymentMethod();
    if (result.error) {
      addLog('Cancel Collect', 'error', result.error.message);
      return;
    }
    setReaderState('idle');
    setPaymentIntent(null);
    addLog('Cancel Collect', 'ok', 'Collection cancelled');
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await terminal.processPayment(paymentIntent);
      if (result.error) {
        addLog('Process Payment', 'error', result.error.message);
        setError(result.error.message);
        return;
      }
      setPaymentIntent(result.paymentIntent);
      setReaderState('payment_authorized');
      addLog('Process Payment', 'ok', 'Payment authorized — ready to capture');
    } catch (err) {
      addLog('Process Payment', 'error', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    setLoading(true);
    try {
      await apiCall('capture-payment-intent', { paymentIntentId: paymentIntent.id, country }, 'Capture Payment');
      setReaderState('captured');
      addLog('Capture Payment', 'ok', 'Payment captured successfully');
    } catch {
      // error already logged in apiCall
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPaymentIntent(null);
    setReaderState(terminal ? 'idle' : 'none');
    setError(null);
    setLog([]);
  };

  const isConnected = !!terminal;
  const canCreatePI = !loading && isConnected && !paymentIntent && readerState === 'idle';
  const canCollect = !loading && !collecting && !!paymentIntent && readerState === 'idle' && paymentStatus === 'ready';
  const canCancelCollect = collecting && readerState === 'waiting_for_card';
  const canProcess = !loading && !collecting && readerState === 'card_detected';
  const canCapture = !loading && !collecting && readerState === 'payment_authorized';
  const canReset = !loading && !collecting && (readerState !== 'none' || log.length > 0);

  const renderStep1 = () => {
    if (!isPhysical) {
      if (isConnected) {
        return (
          <div className="terminal-step-actions">
            <div className="terminal-reader-id-label">{readerId}</div>
            <button className="terminal-btn terminal-btn-danger terminal-btn-forget" onClick={handleDisconnect} disabled={loading || collecting}>
              Disconnect
            </button>
          </div>
        );
      }
      return (
        <button className="terminal-btn" onClick={handleConnect} disabled={loading}>
          Connect Reader
        </button>
      );
    }

    // Physical — saved reader, not yet connected via JS SDK
    if (readerId && !isConnected) {
      return (
        <div className="terminal-step-actions">
          <div className="terminal-reader-id-label">{readerId}</div>
          <button className="terminal-btn" onClick={handleReconnect} disabled={loading}>
            Connect
          </button>
          <button className="terminal-btn terminal-btn-danger terminal-btn-forget" onClick={handleForget} disabled={loading}>
            Forget
          </button>
        </div>
      );
    }

    // Physical — connected
    if (isConnected) {
      return (
        <div className="terminal-step-actions">
          <div className="terminal-reader-id-label">{readerId}</div>
          <button className="terminal-btn terminal-btn-danger terminal-btn-forget" onClick={handleForget} disabled={loading || collecting}>
            Forget
          </button>
        </div>
      );
    }

    // Physical — no reader yet, show registration input
    return (
      <div className="terminal-step-actions">
        <input
          className="terminal-code-input"
          type="text"
          placeholder="Registration code"
          value={registrationCode}
          onChange={e => setRegistrationCode(e.target.value)}
          disabled={loading}
        />
        <button className="terminal-btn" onClick={handleRegisterAndConnect} disabled={loading || !registrationCode.trim()}>
          Register
        </button>
      </div>
    );
  };

  return (
    <div className="terminal-demo">
      <div className="terminal-demo-main">
        <div className="terminal-steps">

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${isConnected ? 'done' : ''}`}>1</span>
              {isPhysical ? 'Register Reader' : 'Connect to Simulated Reader'}
              {isPhysical && (
                <a
                  className="terminal-help-link"
                  href="https://docs.stripe.com/terminal/payments/setup-reader/stripe-reader-s700-s710#settings"
                  target="_blank"
                  rel="noopener noreferrer"
                >?</a>
              )}
            </div>
            {renderStep1()}
          </div>

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${paymentIntent ? 'done' : ''}`}>2</span>
              Create Payment Intent
            </div>
            <button className="terminal-btn" onClick={handleCreatePaymentIntent} disabled={!canCreatePI}>
              {paymentIntent ? 'PI Created' : `Create PI (${formatCurrency(amount, currency)})`}
            </button>
          </div>

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${readerState === 'card_detected' || readerState === 'payment_authorized' || readerState === 'captured' ? 'done' : ''}`}>3</span>
              Collect Payment Method
            </div>
            <div className="terminal-step-actions">
              {isPhysical && collecting ? (
                <div className="terminal-waiting-label">WAITING FOR CARD...</div>
              ) : (
                <button className="terminal-btn terminal-btn-primary" onClick={handleCollectPaymentMethod} disabled={!canCollect}>
                  Collect Payment Method
                </button>
              )}
              <button className="terminal-btn terminal-btn-danger" onClick={handleCancelCollect} disabled={!canCancelCollect}>
                Cancel
              </button>
            </div>
          </div>

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${readerState === 'payment_authorized' || readerState === 'captured' ? 'done' : ''}`}>4</span>
              Process Payment
            </div>
            <button className="terminal-btn" onClick={handleProcessPayment} disabled={!canProcess}>
              Process Payment
            </button>
          </div>

          <div className="terminal-step">
            <div className="terminal-step-label">
              <span className={`terminal-step-num ${readerState === 'captured' ? 'done' : ''}`}>5</span>
              Capture Payment
            </div>
            <button className="terminal-btn terminal-btn-capture" onClick={handleCapture} disabled={!canCapture}>
              Capture Payment
            </button>
          </div>

          <div className="terminal-step terminal-step-reset">
            <button className="terminal-btn terminal-btn-reset" onClick={handleReset} disabled={!canReset}>
              Reset
            </button>
          </div>
        </div>

        <FakeReader
          readerState={readerState}
          readerId={readerId}
          amount={paymentIntent ? amount : null}
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

export default TerminalJsSdkDemo;
