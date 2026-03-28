import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DeviceLayout from './components/DeviceLayout';
import LandingIntegration from './components/integrations/Landing';
import PaymentElementIntegration from './components/integrations/payment-element/PaymentElement';
import CardElementIntegration from './components/integrations/card-element/CardElement';
import ExpressCheckoutIntegration from './components/integrations/express-checkout/ExpressCheckout';
import CheckoutSessionsIntegration from './components/integrations/checkout-sessions/CheckoutSessions';
import PaymentRequestButtonIntegration from './components/integrations/payment-request-button/PaymentRequestButton';
import EmbeddedCheckoutIntegration from './components/integrations/embedded-checkout/EmbeddedCheckout';
import TerminalIntegration from './components/integrations/terminal/Terminal';
import TerminalJsSdkIntegration from './components/integrations/terminal-js-sdk/TerminalJsSdk';
import ConnectEmbeddedIntegration from './components/integrations/connect-embedded/ConnectEmbedded';
import HostedCheckoutIntegration from './components/integrations/hosted-checkout/HostedCheckout';
import NetworkTools from './components/integrations/NetworkTools';
import StripeReachability from './components/tools/StripeReachability';
import About from './components/About';
import Settings from './components/Settings';
import { ApiLoggerProvider } from './context/ApiLoggerContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState(null);
  const location = useLocation();

  // Handle route-based view opening
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pathname = location.pathname;

    const queryParams = {
      implementation: params.get('implementation') || 'react',
      mode: params.get('mode') || 'default',
      session_id: params.get('session_id') || null,
    };

    if (pathname === '/card-element') {
      setCurrentView({
        type: 'card',
        content: <CardElementIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/payment-element') {
      setCurrentView({
        type: 'payment',
        content: <PaymentElementIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/express-checkout-element') {
      setCurrentView({
        type: 'express',
        content: <ExpressCheckoutIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/checkout-sessions') {
      setCurrentView({
        type: 'checkout',
        content: <CheckoutSessionsIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/payment-request-button') {
      setCurrentView({
        type: 'payment-request-button',
        content: <PaymentRequestButtonIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/embedded-checkout') {
      setCurrentView({
        type: 'embedded-checkout',
        content: <EmbeddedCheckoutIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/terminal-server-driven') {
      setCurrentView({
        type: 'terminal',
        content: <TerminalIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/terminal-js-sdk') {
      setCurrentView({
        type: 'terminal-js-sdk',
        content: <TerminalJsSdkIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/hosted-checkout') {
      setCurrentView({
        type: 'hosted-checkout',
        content: <HostedCheckoutIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/connect-embedded') {
      setCurrentView({
        type: 'connect-embedded',
        content: <ConnectEmbeddedIntegration initialParams={queryParams} />,
      });
    } else if (pathname === '/tools') {
      setCurrentView({
        type: 'tools',
        content: <NetworkTools />,
      });
    } else if (pathname === '/tools/stripe-connectivity') {
      setCurrentView({
        type: 'stripe-connectivity',
        content: <StripeReachability />,
      });
    } else if (pathname === '/about') {
      setCurrentView({
        type: 'about',
        content: <About />,
      });
    } else if (pathname === '/settings') {
      setCurrentView({
        type: 'settings',
        content: <Settings />,
      });
    } else if (pathname === '/') {
      setCurrentView({
        type: 'landing',
        content: <LandingIntegration />,
      });
    }
  }, [location]);

  if (!currentView) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppInner currentView={currentView} />
    </ThemeProvider>
  );
}

function AppInner({ currentView }) {
  const { theme } = useTheme();

  return (
    <ApiLoggerProvider>
      <div className={`App theme-${theme}`}>
        <DeviceLayout>
          {currentView.content}
        </DeviceLayout>
      </div>
    </ApiLoggerProvider>
  );
}

export default App;
