import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initStripeLogger } from '../utils/stripeLogger';

const ApiLoggerContext = createContext();

const STORAGE_KEY = 'stripe_api_logs';
const MAX_LOGS = 100;

// Load logs from localStorage synchronously
const loadLogsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load API logs from localStorage:', error);
  }
  return [];
};

export const ApiLoggerProvider = ({ children }) => {
  const [logs, setLogs] = useState(loadLogsFromStorage);
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const isDrawerOpen = params.get('logs') === 'open';

  // Save logs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save API logs to localStorage:', error);
    }
  }, [logs]);

  const addLog = useCallback((logEntry) => {
    setLogs((prevLogs) => {
      const newLogs = [logEntry, ...prevLogs].slice(0, MAX_LOGS);
      return newLogs;
    });
  }, []);

  // Initialize Stripe logger with addLog function
  useEffect(() => {
    initStripeLogger(addLog);
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleDrawer = useCallback(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('logs') === 'open') {
      params.delete('logs');
    } else {
      params.set('logs', 'open');
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location, navigate]);

  const value = {
    logs,
    addLog,
    clearLogs,
    isDrawerOpen,
    toggleDrawer,
  };

  return (
    <ApiLoggerContext.Provider value={value}>
      {children}
    </ApiLoggerContext.Provider>
  );
};

export const useApiLogger = () => {
  const context = useContext(ApiLoggerContext);
  if (!context) {
    throw new Error('useApiLogger must be used within an ApiLoggerProvider');
  }
  return context;
};
