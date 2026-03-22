import React, { useState } from 'react';
import { useApiLogger } from '../context/ApiLoggerContext';
import './ApiLoggerDrawer.css';

const ApiLoggerDrawer = () => {
  const { logs, clearLogs, isDrawerOpen, toggleDrawer } = useApiLogger();
  const [selectedLog, setSelectedLog] = useState(null);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    if (status === 'FYI') return 'status-fyi';
    if (status >= 200 && status < 300) return 'status-success';
    if (status >= 400) return 'status-error';
    return 'status-info';
  };

  const handleLogClick = (log) => {
    // Don't allow expanding FYI logs (they have no details)
    if (log.status === 'FYI') return;
    setSelectedLog(selectedLog?.id === log.id ? null : log);
  };

  return (
    <>
      <div className={`api-logger-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <button
          className="api-logger-toggle"
          onClick={toggleDrawer}
          title="Toggle API Logger"
        >
          LOGS
        </button>

        <div className="api-logger-header">
          <div className="api-logger-title">API REQUEST LOG</div>
          <div className="api-logger-actions">
            <button className="api-logger-clear-btn" onClick={clearLogs}>
              CLEAR
            </button>
          </div>
        </div>

        <div className="api-logger-content">
          {logs.length === 0 ? (
            <div className="api-logger-empty">No requests logged yet</div>
          ) : (
            <div className="api-logger-list">
              {logs.map((log) => (
                <div key={log.id} className="api-logger-item">
                  <div
                    className={`api-logger-summary ${log.status === 'FYI' ? 'non-expandable' : ''}`}
                    onClick={() => handleLogClick(log)}
                  >
                    <div className="api-logger-summary-line">
                      <span className={`api-logger-method ${log.method.toLowerCase()}`}>
                        {log.method}
                      </span>
                      <span className="api-logger-time">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className={`api-logger-status ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="api-logger-url">{log.url}</div>
                    {log.duration && (
                      <div className="api-logger-duration">{log.duration}ms</div>
                    )}
                    {log.stripeRequestId && (
                      <div className="api-logger-stripe-id">
                        Stripe ID: {log.stripeRequestId}
                      </div>
                    )}
                  </div>

                  {selectedLog?.id === log.id && (
                    <div className="api-logger-details">
                      <div className="api-logger-section">
                        <div className="api-logger-section-title">REQUEST</div>
                        <pre className="api-logger-code">
                          {JSON.stringify(log.request, null, 2)}
                        </pre>
                      </div>
                      <div className="api-logger-section">
                        <div className="api-logger-section-title">RESPONSE</div>
                        <pre className="api-logger-code">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApiLoggerDrawer;
