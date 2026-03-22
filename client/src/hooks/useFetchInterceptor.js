import { useEffect, useRef } from 'react';
import { useApiLogger } from '../context/ApiLoggerContext';

// Check if URL should be logged (only Stripe-related endpoints)
const shouldLogRequest = (url) => {
  if (typeof url !== 'string') return false;
  // Log backend API calls (exclude /config)
  return url.includes('/card-element/') ||
         url.includes('/payment-element/') ||
         url.includes('/express-checkout-element/') ||
         url.includes('/checkout-sessions/');
};

// Module-level — runs synchronously before any React component renders
const originalFetch = window.fetch;
const pendingLogs = [];
let addLogCallback = null;

window.fetch = async (...args) => {
  const [url, options = {}] = args;

  if (!shouldLogRequest(url)) {
    return originalFetch(...args);
  }

  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  let requestBody = null;
  if (options.body) {
    try {
      requestBody = JSON.parse(options.body);
    } catch (e) {
      requestBody = options.body;
    }
  }

  const logEntry = {
    id: requestId,
    timestamp: new Date().toISOString(),
    url: url,
    method: options.method || 'GET',
    request: {
      headers: options.headers || {},
      body: requestBody,
    },
    response: null,
    duration: null,
    status: null,
    stripeRequestId: null,
  };

  try {
    const response = await originalFetch(...args);
    const endTime = Date.now();

    const clonedResponse = response.clone();
    let responseBody = null;
    let stripeRequestId = null;

    try {
      responseBody = await clonedResponse.json();
      stripeRequestId = responseBody.stripeRequestId || null;
    } catch (e) {
      responseBody = await clonedResponse.text();
    }

    logEntry.response = responseBody;
    logEntry.duration = endTime - startTime;
    logEntry.status = response.status;
    logEntry.stripeRequestId = stripeRequestId;

    if (addLogCallback) {
      addLogCallback(logEntry);
    } else {
      pendingLogs.push(logEntry);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    const endTime = Date.now();

    logEntry.response = { error: error.message };
    logEntry.duration = endTime - startTime;
    logEntry.status = 'ERROR';

    if (addLogCallback) {
      addLogCallback(logEntry);
    } else {
      pendingLogs.push(logEntry);
    }

    throw error;
  }
};

export const useFetchInterceptor = () => {
  const { addLog } = useApiLogger();
  const addLogRef = useRef(addLog);

  useEffect(() => {
    addLogRef.current = addLog;
  }, [addLog]);

  useEffect(() => {
    addLogCallback = (entry) => addLogRef.current(entry);
    // Drain any requests that fired before the context was ready
    while (pendingLogs.length > 0) addLogRef.current(pendingLogs.shift());
    return () => { addLogCallback = null; };
  }, []);
};
