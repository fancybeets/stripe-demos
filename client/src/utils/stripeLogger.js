// Utility functions to wrap Stripe.js method calls with API logging

let apiLoggerContext = null;

// Initialize the logger context (call this from a component that has access to useApiLogger)
export const initStripeLogger = (addLogFn) => {
  apiLoggerContext = addLogFn;
};

// Helper to sanitize data - remove circular references and non-serializable objects
const sanitizeData = (data) => {
  try {
    // Try to serialize to see if it's safe
    JSON.stringify(data);
    return data;
  } catch (e) {
    // If it fails, return a simplified version
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    } else if (typeof data === 'object' && data !== null) {
      // For objects, extract only serializable properties
      const sanitized = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          // Skip functions, DOM elements, and React components
          if (typeof value === 'function' ||
              value instanceof HTMLElement ||
              (value && value._reactInternals)) {
            sanitized[key] = `[${typeof value}]`;
          } else if (key === 'elements') {
            sanitized[key] = '[Elements instance]';
          } else {
            try {
              JSON.stringify(value);
              sanitized[key] = value;
            } catch {
              sanitized[key] = '[Non-serializable]';
            }
          }
        }
      }
      return sanitized;
    }
    return data;
  }
};

// Helper to create log entry
const createLogEntry = (method, args, response, duration, error = null) => {
  return {
    id: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    url: `Stripe.js: ${method}`,
    method: 'STRIPE',
    request: {
      method,
      arguments: sanitizeData(args),
    },
    response: error ? { error: error.message || String(error) } : sanitizeData(response),
    duration,
    status: error ? 'ERROR' : 'SUCCESS',
    stripeRequestId: null,
  };
};

// Wrapper for stripe.confirmPayment()
export const confirmPayment = async (stripe, ...args) => {
  // Log before the call (in case redirect happens immediately)
  if (apiLoggerContext) {
    const preLogEntry = {
      id: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      url: 'Stripe payment confirmation request',
      method: 'STRIPE',
      request: null,
      response: null,
      duration: null,
      status: 'FYI',
      stripeRequestId: null,
    };
    apiLoggerContext(preLogEntry);
  }

  try {
    const result = await stripe.confirmPayment(...args);
    return result;
  } catch (error) {
    throw error;
  }
};

// Wrapper for stripe.retrievePaymentIntent()
export const retrievePaymentIntent = async (stripe, clientSecret) => {
  const startTime = Date.now();

  try {
    const result = await stripe.retrievePaymentIntent(clientSecret);
    const duration = Date.now() - startTime;

    if (apiLoggerContext) {
      apiLoggerContext(createLogEntry('retrievePaymentIntent', { clientSecret }, result, duration));
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (apiLoggerContext) {
      apiLoggerContext(createLogEntry('retrievePaymentIntent', { clientSecret }, null, duration, error));
    }

    throw error;
  }
};

// Wrapper for stripe.confirmSetup()
export const confirmSetup = async (stripe, ...args) => {
  const startTime = Date.now();

  try {
    const result = await stripe.confirmSetup(...args);
    const duration = Date.now() - startTime;

    if (apiLoggerContext) {
      apiLoggerContext(createLogEntry('confirmSetup', args, result, duration));
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (apiLoggerContext) {
      apiLoggerContext(createLogEntry('confirmSetup', args, null, duration, error));
    }

    throw error;
  }
};

// Wrapper for elements.submit()
export const elementsSubmit = async (elements) => {
  const startTime = Date.now();

  try {
    const result = await elements.submit();
    const duration = Date.now() - startTime;

    if (apiLoggerContext) {
      apiLoggerContext(createLogEntry('elements.submit', {}, result, duration));
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (apiLoggerContext) {
      apiLoggerContext(createLogEntry('elements.submit', {}, null, duration, error));
    }

    throw error;
  }
};

// Wrapper for elements.fetchUpdates()
export const elementsFetchUpdates = async (elements) => {
  const startTime = Date.now();

  try {
    const result = await elements.fetchUpdates();
    const duration = Date.now() - startTime;

    if (apiLoggerContext) {
      apiLoggerContext(createLogEntry('elements.fetchUpdates', {}, result, duration));
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    if (apiLoggerContext) {
      apiLoggerContext(createLogEntry('elements.fetchUpdates', {}, null, duration, error));
    }

    throw error;
  }
};

// Wrapper for checkout.confirm()
export const checkoutConfirm = async (checkout, ...args) => {
  // Log before the call
  if (apiLoggerContext) {
    const logEntry = {
      id: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      url: 'Stripe Checkout confirmation request',
      method: 'STRIPE',
      request: null,
      response: null,
      duration: null,
      status: 'FYI',
      stripeRequestId: null,
    };
    apiLoggerContext(logEntry);
  }

  try {
    const result = await checkout.confirm(...args);
    return result;
  } catch (error) {
    throw error;
  }
};

// Wrapper for checkout.updateEmail()
export const checkoutUpdateEmail = async (checkout, email) => {
  try {
    const result = await checkout.updateEmail(email);
    return result;
  } catch (error) {
    throw error;
  }
};

// Simple logger for Elements creation (no details, just FYI)
export const logElementsCreation = () => {
  if (apiLoggerContext) {
    const logEntry = {
      id: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      url: 'Stripe Elements creation request',
      method: 'STRIPE',
      request: null,
      response: null,
      duration: null,
      status: 'FYI',
      stripeRequestId: null,
    };
    apiLoggerContext(logEntry);
  }
};

// Simple logger for Checkout Actions confirmation (for JS implementation)
export const logCheckoutActionsConfirm = () => {
  if (apiLoggerContext) {
    const logEntry = {
      id: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      url: 'Stripe Checkout confirmation request',
      method: 'STRIPE',
      request: null,
      response: null,
      duration: null,
      status: 'FYI',
      stripeRequestId: null,
    };
    apiLoggerContext(logEntry);
  }
};

// Wrapper for stripe.elements() creation
export const createElements = (stripe, options) => {
  const elements = stripe.elements(options);
  logElementsCreation();
  return elements;
};

// Simple logger for Checkout creation (no details, just FYI)
export const logCheckoutCreation = () => {
  if (apiLoggerContext) {
    const logEntry = {
      id: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      url: 'Stripe Checkout initialization request',
      method: 'STRIPE',
      request: null,
      response: null,
      duration: null,
      status: 'FYI',
      stripeRequestId: null,
    };
    apiLoggerContext(logEntry);
  }
};
