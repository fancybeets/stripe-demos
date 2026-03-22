import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { ConnectComponentsProvider } from '@stripe/react-connect-js';
import * as ConnectComponents from '@stripe/react-connect-js';
import { useApiLogger } from '../../../context/ApiLoggerContext';
import { useTheme } from '../../../context/ThemeContext';
import API_BASE_URL from '../../../config/api';
import './Demo.css';

const APPEARANCE = {
  apocalypse: {
    variables: {
      colorPrimary: '#ffb000',
      colorBackground: '#0a0a0a',
      colorText: '#ffb000',
      colorSecondaryText: '#cc8800',
      colorDanger: '#ff4444',
      colorBorder: '#1a1a1a',
      fontFamily: "'Courier New', monospace",
      fontSizeBase: '13px',
      borderRadius: '0px',
      buttonBorderRadius: '0px',
      badgeBorderRadius: '0px',
      spacingUnit: '4px',
      // Badges — muted amber to match theme
      badgeNeutralColorBackground: '#1a1500',
      badgeNeutralColorText: '#cc8800',
      badgeNeutralColorBorder: '#4a3800',
      badgeSuccessColorBackground: '#0a1200',
      badgeSuccessColorText: '#7a9900',
      badgeSuccessColorBorder: '#2a3a00',
      badgeWarningColorBackground: '#1a1000',
      badgeWarningColorText: '#cc8800',
      badgeWarningColorBorder: '#4a3000',
      badgeDangerColorBackground: '#1a0800',
      badgeDangerColorText: '#cc4400',
      badgeDangerColorBorder: '#4a1800',
      // Primary buttons — filled amber
      buttonPrimaryColorBackground: '#ffb000',
      buttonPrimaryColorBorder: '#ffb000',
      buttonPrimaryColorText: '#0a0a0a',
      // Secondary buttons — dark with amber border
      buttonSecondaryColorBackground: '#1a1a1a',
      buttonSecondaryColorBorder: '#ffb000',
      buttonSecondaryColorText: '#ffb000',
      // Form
      formBackgroundColor: '#0a0a0a',
      offsetBackgroundColor: '#0a0a0a',
      formAccentColor: '#ffb000',
      formHighlightColorBorder: '#ffb000',
    },
    rules: {
      '.Input': {
        border: 'none',
        boxShadow: 'none',
        backgroundColor: '#0a0a0a',
        color: '#ffb000',
        fontFamily: 'Courier New, monospace',
      },
      '.Input::placeholder': {
        color: 'rgba(255, 176, 0, 0.4)',
      },
      '.Label': {
        color: '#ffb000',
        fontWeight: 'bold',
        fontSize: '12px',
        textShadow: '0 0 3px rgba(255, 176, 0, 0.5)',
        fontFamily: 'Courier New, monospace',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      },
      '.Tab': {
        border: 'none',
        backgroundColor: '#1a1a1a',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#ffb000',
        fontFamily: 'Courier New, monospace',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      },
      '.Tab:hover': {
        backgroundColor: '#2a2a2a',
      },
      '.Tab--selected': {
        backgroundColor: 'rgba(255, 176, 0, 0.2)',
        color: '#ffb000',
        textShadow: '0 0 5px #ffb000',
      },
      '.Divider': {
        borderColor: '#0a0a0a',
        backgroundColor: '#0a0a0a',
      },
      '.TableCell': {
        borderColor: '#0a0a0a',
        borderBottomColor: '#0a0a0a',
      },
      '.BodyRow': {
        borderColor: '#0a0a0a',
        borderBottomColor: '#0a0a0a',
      },
      '.HeaderRow': {
        borderColor: '#0a0a0a',
        borderBottomColor: '#0a0a0a',
      },
      '.Row': {
        borderColor: '#0a0a0a',
        borderBottomColor: '#0a0a0a',
      },
      '.Dialog': {
        backgroundColor: '#0a0a0a',
        color: '#ffb000',
      },
      '.Overlay': {
        backgroundColor: '#0a0a0a',
      },
      '.Sheet': {
        backgroundColor: '#0a0a0a',
      },
      '.Modal': {
        backgroundColor: '#0a0a0a',
      },
    },
  },
  dark: {
    variables: {
      colorPrimary: '#a78bfa',
      colorBackground: '#16161f',
      colorText: '#e0e0f0',
      colorSecondaryText: '#9090a8',
      colorDanger: '#f87171',
      colorBorder: '#2d2d3d',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      borderRadius: '0px',
      buttonBorderRadius: '0px',
      badgeBorderRadius: '0px',
      spacingUnit: '4px',
      // Badges — muted to match dark theme
      badgeNeutralColorBackground: '#1e1e2e',
      badgeNeutralColorText: '#9090a8',
      badgeNeutralColorBorder: '#2d2d3d',
      badgeSuccessColorBackground: '#0d1a1a',
      badgeSuccessColorText: '#4db8a0',
      badgeSuccessColorBorder: '#1a3a34',
      badgeWarningColorBackground: '#1a1620',
      badgeWarningColorText: '#c0a060',
      badgeWarningColorBorder: '#3a2e1a',
      badgeDangerColorBackground: '#1a1020',
      badgeDangerColorText: '#f87171',
      badgeDangerColorBorder: '#3a1a2e',
      // Primary buttons — purple filled
      buttonPrimaryColorBackground: '#a78bfa',
      buttonPrimaryColorBorder: '#a78bfa',
      buttonPrimaryColorText: '#ffffff',
      // Secondary buttons — dark with purple border
      buttonSecondaryColorBackground: '#1e1e2e',
      buttonSecondaryColorBorder: '#a78bfa',
      buttonSecondaryColorText: '#c0beff',
      // Form
      formBackgroundColor: '#1e1e2e',
      offsetBackgroundColor: '#1a1a28',
      formAccentColor: '#a78bfa',
      formHighlightColorBorder: '#a78bfa',
    },
    rules: {
      '.Input': {
        backgroundColor: '#1e1e2e',
        color: '#e0e0f0',
        border: '1px solid #2d2d3d',
        boxShadow: 'none',
      },
      '.Input::placeholder': {
        color: '#555566',
      },
      '.Label': {
        color: '#9090a8',
      },
      '.Tab': {
        backgroundColor: '#1e1e2e',
        border: '1px solid #2d2d3d',
        color: '#c0beff',
      },
      '.Tab:hover': {
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
      },
      '.Tab--selected': {
        backgroundColor: 'rgba(167, 139, 250, 0.25)',
        color: '#ffffff',
        borderColor: '#a78bfa',
      },
    },
  },
  simple: {
    variables: {
      colorPrimary: '#635BFF',
      colorBackground: '#ffffff',
      colorText: '#1a1a1a',
      colorDanger: '#e53e3e',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      spacingUnit: '4px',
      borderRadius: '0px',
      buttonBorderRadius: '0px',
      // Primary buttons — indigo filled
      buttonPrimaryColorBackground: '#635BFF',
      buttonPrimaryColorBorder: '#635BFF',
      buttonPrimaryColorText: '#ffffff',
      // Secondary buttons — white with indigo border/text
      buttonSecondaryColorBackground: '#ffffff',
      buttonSecondaryColorBorder: '#635BFF',
      buttonSecondaryColorText: '#635BFF',
      // Form
      formBackgroundColor: '#ffffff',
      offsetBackgroundColor: '#f8f8fd',
      formAccentColor: '#635BFF',
      formHighlightColorBorder: '#635BFF',
    },
  },
};

const CONNECT_API = `${API_BASE_URL}/connect-embedded`;

const formatComponentName = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const COMPONENT_NAMES = {
  account_onboarding: 'ConnectAccountOnboarding',
  account_management: 'ConnectAccountManagement',
  notification_banner: 'ConnectNotificationBanner',
  payments: 'ConnectPayments',
  disputes_list: 'ConnectDisputesList',
  payouts: 'ConnectPayouts',
  balances: 'ConnectBalances',
  payouts_list: 'ConnectPayoutsList',
  payout_details: 'ConnectPayoutDetails',
  tax_registrations: 'ConnectTaxRegistrations',
  tax_settings: 'ConnectTaxSettings',
  documents: 'ConnectDocuments',
};

const PARAMETERIZED = {
  payout_details: { prop: 'payout', label: 'Payout ID' },
};

const ConnectEmbeddedDemo = ({ paymentOptions = {} }) => {
  const { country = 'US', connectComponent = 'payments' } = paymentOptions;
  const { addLog: addApiLog } = useApiLogger();
  const { theme } = useTheme();

  const storageKey = `connect_account_${country}`;

  const [accountId, setAccountId] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey))?.accountId || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [publishableKey, setPublishableKey] = useState(null);
  const [resourceId, setResourceId] = useState('');
  const [componentKey, setComponentKey] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/config?country=${country}`)
      .then(r => r.json())
      .then(d => setPublishableKey(d.publishableKey))
      .catch(() => {});
  }, [country]);


  const apiCall = useCallback(async (endpoint, body) => {
    const url = `${CONNECT_API}/${endpoint}`;
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
        url: `/connect-embedded/${endpoint}`,
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
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addApiLog]);

  const handleCreateAccount = async () => {
    try {
      const data = await apiCall('create-account', { country });
      setAccountId(data.accountId);
      localStorage.setItem(storageKey, JSON.stringify({ accountId: data.accountId }));
      setComponentKey(prev => prev + 1); // Force component reload
    } catch {}
  };

  const handleCreateTestPayment = async () => {
    setPaying(true);
    setPaymentSuccess(null);
    try {
      const data = await apiCall('create-test-payment', { accountId, country });
      setPaymentSuccess(data.paymentIntentId);
    } catch {} finally {
      setPaying(false);
    }
  };

  const handleDeleteAccount = async () => {
    const id = accountId;
    setAccountId(null);
    localStorage.removeItem(storageKey);
    setError(null);
    setDeleting(true);
    try {
      await apiCall('delete-account', { accountId: id, country });
    } catch {} finally {
      setDeleting(false);
    }
  };

  const stripeConnectInstance = useMemo(() => {
    if (!accountId || !publishableKey) return null;
    return loadConnectAndInitialize({
      publishableKey,
      appearance: APPEARANCE[theme] || APPEARANCE.apocalypse,
      fetchClientSecret: async () => {
        const res = await fetch(`${CONNECT_API}/create-account-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId, component: connectComponent, country }),
        });
        const data = await res.json();
        addApiLog({
          id: `${Date.now()}-${Math.random()}`,
          method: 'POST',
          url: '/connect-embedded/create-account-session',
          status: res.status,
          timestamp: Date.now(),
          request: { accountId, component: connectComponent, country },
          response: data,
          duration: 0,
          stripeRequestId: data.stripeRequestId || null,
        });
        if (!res.ok) throw new Error(data.error || 'Failed to create account session');
        return data.clientSecret;
      },
    });
  }, [accountId, publishableKey, connectComponent, country, addApiLog, theme]);

  const ComponentToRender = COMPONENT_NAMES[connectComponent]
    ? ConnectComponents[COMPONENT_NAMES[connectComponent]]
    : null;

  const paramInfo = PARAMETERIZED[connectComponent] || null;

  return (
    <div className="connect-demo">
      <div className="connect-step">
        {accountId ? (
          <div className="connect-step-actions">
            <div className="connect-account-id-label">{accountId}</div>
            <button
              className="connect-btn"
              onClick={handleCreateTestPayment}
              disabled={loading}
            >
              {loading && paying ? 'Creating Payment...' : 'Create Test Payment'}
            </button>
            <button
              className="connect-btn connect-btn-danger"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            className="connect-btn"
            onClick={handleCreateAccount}
            disabled={loading}
          >
            {loading ? (deleting ? 'Deleting...' : 'Creating...') : 'Create Connected Account'}
          </button>
        )}
      </div>

      {error && (
        <div className="connect-error">
          <span className="connect-error-label">ERROR</span> {error}
          <button className="connect-error-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {paymentSuccess && (
        <div className="connect-success">
          <span className="connect-success-label">PAYMENT CREATED</span> {paymentSuccess}
          <button className="connect-success-dismiss" onClick={() => setPaymentSuccess(null)}>✕</button>
        </div>
      )}

      {accountId && stripeConnectInstance && ComponentToRender && (
        <div className="connect-component-wrapper" key={componentKey}>
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            {connectComponent !== 'notification_banner' && (
              <div className="connect-notification-banner-slot">
                <ConnectComponents.ConnectNotificationBanner />
              </div>
            )}
            {paramInfo && (
              <div className="connect-param-row">
                <label className="connect-param-label">{paramInfo.label}</label>
                <input
                  className="connect-param-input"
                  type="text"
                  placeholder={`Enter ${paramInfo.label}`}
                  value={resourceId}
                  onChange={e => setResourceId(e.target.value)}
                />
              </div>
            )}
            <ComponentToRender
              {...(paramInfo && resourceId ? { [paramInfo.prop]: resourceId } : {})}
            />
          </ConnectComponentsProvider>
          {connectComponent === 'notification_banner' && (
            <div className="connect-component-note">
              In this demo, the notification banner is shown above all other components, but renders invisibly when no notifications are present. If you don't see anything above, there are no active notifications for this account!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectEmbeddedDemo;
