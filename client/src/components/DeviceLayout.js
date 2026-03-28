import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchInterceptor } from '../hooks/useFetchInterceptor';
import ApiLoggerDrawer from './ApiLoggerDrawer';
import { elements } from '../config/elements';
import { DeviceContext } from '../context/DeviceContext';
import { useTheme } from '../context/ThemeContext';
import { getAvailableAdditionalElements } from '../config/additionalElements';
import './DeviceLayout.css';
import psuGif from '../assets/device-psu.gif';

const DeviceLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  // Initialize fetch interceptor to log API requests
  useFetchInterceptor();

  const params = new URLSearchParams(location.search);
  const [implementation, setImplementation] = useState(params.get('implementation') || 'react');
  const [mode, setMode] = useState(params.get('mode') || 'default');
  const [country, setCountry] = useState(params.get('country') || 'US');
  const [currency, setCurrency] = useState(params.get('currency') || 'usd');
  const [amount, setAmount] = useState(params.get('amount') || '4242');
  const [paymentMethods, setPaymentMethods] = useState(params.get('paymentMethods') || 'auto');
  const [readerMode, setReaderMode] = useState(params.get('readerMode') || 'simulated');
  const [connectComponent, setConnectComponent] = useState(params.get('connectComponent') || 'account_onboarding');
  const [additionalElements, setAdditionalElements] = useState(params.get('additionalElements') || '');
  const [showPaymentMethodsSelector, setShowPaymentMethodsSelector] = useState(false);
  const [showConnectComponentSelector, setShowConnectComponentSelector] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showAdditionalElementsSelector, setShowAdditionalElementsSelector] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load collapsed sections from localStorage
  const [collapsedSections, setCollapsedSections] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebarCollapsedSections');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [pendingImplementation, setPendingImplementation] = useState(null);
  const [pendingMode, setPendingMode] = useState(null);
  const [pendingCountry, setPendingCountry] = useState(null);
  const [pendingCurrency, setPendingCurrency] = useState(null);
  const [pendingAmount, setPendingAmount] = useState(null);
  const [pendingPaymentMethods, setPendingPaymentMethods] = useState(null);
  const [pendingAdditionalElements, setPendingAdditionalElements] = useState(null);
  const [knobRotating, setKnobRotating] = useState(false);
  const [knobSpinning, setKnobSpinning] = useState(false);
  const [isEasterEggRunning, setIsEasterEggRunning] = useState(false);
  const [spinningScrew, setSpinningScrew] = useState(new Set());
  const [fallingScrew, setFallingScrew] = useState(new Set());
  const [fallenScrews, setFallenScrews] = useState(new Set());
  const [screwClickCounts, setScrewClickCounts] = useState({});
  const [screenFalling, setScreenFalling] = useState(false);
  const [screenFallen, setScreenFallen] = useState(false);

  const screenTiltStyle = useMemo(() => {
    if (screenFalling || screenFallen) return {};
    const effects = {
      tl: { rotate:  0.22, x: -1.2, y: -1.2 },
      tr: { rotate: -0.22, x:  1.2, y: -1.2 },
      bl: { rotate: -0.18, x: -1.2, y:  1.2 },
      br: { rotate:  0.18, x:  1.2, y:  1.2 },
      ml: { rotate:  0.1,  x: -1.5, y:  0   },
      mr: { rotate: -0.1,  x:  1.5, y:  0   },
    };
    let rotate = 0, x = 0, y = 0;
    for (const [id, e] of Object.entries(effects)) {
      if (fallenScrews.has(id) || fallingScrew.has(id) || spinningScrew.has(id)) {
        rotate += e.rotate; x += e.x; y += e.y;
      }
    }
    if (rotate === 0 && x === 0 && y === 0) return {};
    return { transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)` };
  }, [fallenScrews, fallingScrew, spinningScrew, screenFalling, screenFallen]);
  const [activeView, setActiveView] = useState(params.get('view') || 'demo');
  const [isMaximized, setIsMaximized] = useState(() => localStorage.getItem('maximized') === 'true');
  const [isFading, setIsFading] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 800);
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);
  const [mobileElementsOpen, setMobileElementsOpen] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [allDropdownRect, setAllDropdownRect] = useState(null);
  const screenRef = React.useRef(null);
  const tabsInnerRef = React.useRef(null);
  const headerRef = React.useRef(null);

  const currentTab = location.pathname === '/card-element' ? 'CARD' :
                     location.pathname === '/payment-element' ? 'PAYMENT' :
                     location.pathname === '/express-checkout-element' ? 'EXPRESS' :
                     location.pathname === '/checkout-sessions' ? 'CHECKOUT' :
                     location.pathname === '/payment-request-button' ? 'PRB' :
                     location.pathname === '/embedded-checkout' ? 'EMBEDDED' :
                     location.pathname === '/hosted-checkout' ? 'HOSTED' :
                     location.pathname === '/terminal-server-driven' ? 'TERMINAL' :
                     location.pathname === '/terminal-js-sdk' ? 'TERM-JS' :
                     location.pathname === '/connect-embedded' ? 'CONNECT' :
                     location.pathname === '/tools' ? 'TOOLS' :
                     location.pathname.startsWith('/tools/') ? 'TOOL' :
                     location.pathname === '/about' ? 'ABOUT' :
                     location.pathname === '/settings' ? 'SETTINGS' :
                     location.pathname === '/' ? 'HOME' : null;

  const isTerminalPage = currentTab === 'TERMINAL';
  const isTerminalJsSdkPage = currentTab === 'TERM-JS';
  const isAnyTerminalPage = isTerminalPage || isTerminalJsSdkPage;
  const isConnectPage = currentTab === 'CONNECT';

  const sidebarOptions = children?.type?.sidebarOptions ?? [];
  const has = (opt) => sidebarOptions.includes(opt);

  const availablePaymentMethods = [
    { id: 'card', name: 'Card' },
    { id: 'us_bank_account', name: 'US Bank Account' },
    { id: 'sepa_debit', name: 'SEPA Direct Debit' },
    { id: 'ideal', name: 'iDEAL' },
    { id: 'bancontact', name: 'Bancontact' },
    { id: 'sofort', name: 'Sofort' },
    { id: 'giropay', name: 'giropay' },
    { id: 'eps', name: 'EPS' },
    { id: 'p24', name: 'Przelewy24' },
    { id: 'klarna', name: 'Klarna' },
    { id: 'affirm', name: 'Affirm' },
    { id: 'afterpay_clearpay', name: 'Afterpay/Clearpay' },
    { id: 'alipay', name: 'Alipay' },
    { id: 'wechat_pay', name: 'WeChat Pay' },
    { id: 'cashapp', name: 'Cash App Pay' },
    { id: 'paypal', name: 'PayPal' },
  ];

  const rotateKnob = () => {
    setKnobRotating(true);
    setTimeout(() => setKnobRotating(false), 500);
  };

  const handleScrewClick = (id) => {
    if (fallenScrews.has(id) || fallingScrew.has(id) || spinningScrew.has(id)) return;

    const newCount = (screwClickCounts[id] || 0) + 1;
    setScrewClickCounts(prev => ({ ...prev, [id]: newCount }));

    if (newCount >= 2) {
      setFallingScrew(prev => new Set([...prev, id]));
    } else {
      setSpinningScrew(prev => new Set([...prev, id]));
    }
  };

  const handleScrewAnimEnd = (e, id) => {
    if (e.animationName === "screwSpinFall" || e.animationName === "screwSpinFallMid") {
      setFallingScrew(prev => { const n = new Set(prev); n.delete(id); return n; });
      setFallenScrews(prev => { const n = new Set(prev); n.add(id); return n; });
    } else {
      setSpinningScrew(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleScreenFallEnd = (e) => {
    if (e.animationName !== 'screenFall') return;
    setScreenFallen(true);
    setScreenFalling(false);
  };

  useEffect(() => {
    const smallScrews = ['tl', 'tr', 'bl', 'br', 'ml', 'mr'];
    if (smallScrews.every(id => fallenScrews.has(id)) && !screenFalling && !screenFallen) {
      const timer = setTimeout(() => setScreenFalling(true), 300);
      return () => clearTimeout(timer);
    }
  }, [fallenScrews, screenFalling, screenFallen]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setActiveView(p.get('view') || 'demo');
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!showAllDropdown) return;
    const handleClickOutside = () => setShowAllDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAllDropdown]);

  useEffect(() => {
    if (showAllDropdown && tabsInnerRef.current && screenRef.current && headerRef.current) {
      const tabsR = tabsInnerRef.current.getBoundingClientRect();
      const headerR = headerRef.current.getBoundingClientRect();
      const screenR = screenRef.current.getBoundingClientRect();
      const borderTop = screenRef.current.clientTop;
      const borderLeft = screenRef.current.clientLeft;
      setAllDropdownRect({
        top: headerR.bottom - screenR.top - borderTop,
        left: tabsR.left - screenR.left - borderLeft,
        width: tabsR.width,
      });
    } else {
      setAllDropdownRect(null);
    }
  }, [showAllDropdown]);

  // Helper to preserve logs query param when navigating
  const preserveLogsParam = (newParams) => {
    const currentParams = new URLSearchParams(location.search);
    const logsParam = currentParams.get('logs');
    if (logsParam) {
      newParams.set('logs', logsParam);
    }
    return newParams;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlImpl = params.get('implementation');
    const urlMode = params.get('mode');
    const urlCountry = params.get('country');
    const urlCurrency = params.get('currency');
    const urlAmount = params.get('amount');
    const urlPaymentMethods = params.get('paymentMethods');

    if (urlImpl && ['react', 'javascript'].includes(urlImpl)) {
      setImplementation(urlImpl);
    }
    if (urlMode && ['default', 'deferred'].includes(urlMode)) {
      setMode(urlMode);
    }
    if (urlCountry && ['US', 'GB', 'MX', 'CA'].includes(urlCountry)) {
      setCountry(urlCountry);
    }
    if (urlCurrency && ['usd', 'eur', 'gbp', 'jpy', 'mxn', 'cad'].includes(urlCurrency)) {
      setCurrency(urlCurrency);
    }
    if (urlAmount) {
      setAmount(urlAmount);
    }
    if (urlPaymentMethods) {
      setPaymentMethods(urlPaymentMethods);
    }

    const urlAdditionalElements = params.get('additionalElements');
    setAdditionalElements(urlAdditionalElements || '');

    const urlConnectComponent = params.get('connectComponent');
    if (urlConnectComponent) {
      setConnectComponent(urlConnectComponent);
    }

    // Clear pending changes when URL changes
    setPendingImplementation(null);
    setPendingMode(null);
    setPendingCountry(null);
    setPendingCurrency(null);
    setPendingAmount(null);
    setPendingPaymentMethods(null);
    setPendingAdditionalElements(null);
    setShowPaymentMethodsSelector(false);
    setShowCountrySelector(false);
    setShowCurrencySelector(false);
    setShowConnectComponentSelector(false);
    setShowAdditionalElementsSelector(false);
    setMobileOptionsOpen(false);
    setMobileElementsOpen(false);
    setShowAllDropdown(false);

    // If fading, reset after animation completes
    if (isFading) {
      const timer = setTimeout(() => {
        setIsFading(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [location, isFading]);

  const handleTabClick = (tab) => {
    rotateKnob();
    if (tab === 'HOME') {
      // Navigating back to landing - trigger fade
      setIsFading(true);
      const params = new URLSearchParams();
      preserveLogsParam(params);
      const queryString = params.toString();
      navigate(`/${queryString ? `?${queryString}` : ''}`);
    } else {
      // Switching between elements - no fade
      if (tab === 'TERMINAL') {
        const params = new URLSearchParams();
        params.set('country', country);
        params.set('currency', currency);
        params.set('amount', amount);
        params.set('readerMode', readerMode);
        preserveLogsParam(params);
        navigate(`/terminal-server-driven?${params.toString()}`);
        return;
      }
      if (tab === 'TERM-JS') {
        const params = new URLSearchParams();
        params.set('country', country);
        params.set('currency', currency);
        params.set('amount', amount);
        params.set('readerMode', readerMode);
        preserveLogsParam(params);
        navigate(`/terminal-js-sdk?${params.toString()}`);
        return;
      }
      if (tab === 'CONNECT') {
        const params = new URLSearchParams();
        params.set('country', country);
        params.set('connectComponent', connectComponent);
        preserveLogsParam(params);
        navigate(`/connect-embedded?${params.toString()}`);
        return;
      }
      if (tab === 'HOSTED') {
        const params = new URLSearchParams();
        params.set('country', country);
        params.set('currency', currency);
        params.set('amount', amount);
        preserveLogsParam(params);
        navigate(`/hosted-checkout?${params.toString()}`);
        return;
      }

      const route = tab === 'CARD' ? '/card-element' :
                    tab === 'PAYMENT' ? '/payment-element' :
                    tab === 'EXPRESS' ? '/express-checkout-element' :
                    tab === 'PRB' ? '/payment-request-button' :
                    tab === 'EMBEDDED' ? '/embedded-checkout' :
                    '/checkout-sessions';

      // Reset mode to 'default' when navigating to Checkout Sessions, PRB, or Embedded Checkout (no deferred mode)
      const effectiveMode = (tab === 'CHECKOUT' || tab === 'PRB' || tab === 'EMBEDDED') ? 'default' : mode;
      if ((tab === 'CHECKOUT' || tab === 'PRB' || tab === 'EMBEDDED') && mode !== 'default') {
        setMode('default');
        setPendingMode(null);
      }

      const params = new URLSearchParams();
      params.set('implementation', implementation);
      params.set('mode', effectiveMode);
      params.set('country', country);
      params.set('currency', currency);
      if (additionalElements) {
        params.set('additionalElements', additionalElements);
      }
      preserveLogsParam(params);
      navigate(`${route}?${params.toString()}`);
    }
  };

  const handleImplementationChange = (impl) => {
    rotateKnob();

    if (activeView === 'demo') {
      // On demo view, set pending state
      setPendingImplementation(impl);
    } else {
      // On code/about views, navigate immediately
      const newCountry = pendingCountry !== null ? pendingCountry : country;
      const newCurr = pendingCurrency !== null ? pendingCurrency : currency;
      const newAmount = pendingAmount !== null ? pendingAmount : amount;
      const newPaymentMethods = pendingPaymentMethods !== null ? pendingPaymentMethods : paymentMethods;
      const newAdditionalElements = pendingAdditionalElements !== null ? pendingAdditionalElements : additionalElements;

      if (currentTab && currentTab !== 'HOME') {
        const route = currentTab === 'CARD' ? '/card-element' :
                      currentTab === 'PAYMENT' ? '/payment-element' :
                      currentTab === 'EXPRESS' ? '/express-checkout-element' :
                      currentTab === 'PRB' ? '/payment-request-button' :
                      currentTab === 'EMBEDDED' ? '/embedded-checkout' :
                      '/checkout-sessions';
        const params = new URLSearchParams();
        params.set('implementation', impl);
        params.set('mode', mode);
        params.set('country', newCountry);
        params.set('currency', newCurr);
        params.set('amount', newAmount);
        params.set('paymentMethods', newPaymentMethods);
        if (newAdditionalElements) {
          params.set('additionalElements', newAdditionalElements);
        }
        preserveLogsParam(params);
        navigate(`${route}?${params.toString()}`);
      }
    }
  };

  const handleModeChange = (m) => {
    rotateKnob();

    if (activeView === 'demo') {
      // On demo view, set pending state
      setPendingMode(m);
    } else {
      // On code/about views, navigate immediately
      const newCountry = pendingCountry !== null ? pendingCountry : country;
      const newCurr = pendingCurrency !== null ? pendingCurrency : currency;
      const newAmount = pendingAmount !== null ? pendingAmount : amount;
      const newPaymentMethods = pendingPaymentMethods !== null ? pendingPaymentMethods : paymentMethods;
      const newAdditionalElements = pendingAdditionalElements !== null ? pendingAdditionalElements : additionalElements;

      if (currentTab && currentTab !== 'HOME') {
        const route = currentTab === 'CARD' ? '/card-element' :
                      currentTab === 'PAYMENT' ? '/payment-element' :
                      currentTab === 'EXPRESS' ? '/express-checkout-element' :
                      currentTab === 'PRB' ? '/payment-request-button' :
                      currentTab === 'EMBEDDED' ? '/embedded-checkout' :
                      '/checkout-sessions';
        const params = new URLSearchParams();
        params.set('implementation', implementation);
        params.set('mode', m);
        params.set('country', newCountry);
        params.set('currency', newCurr);
        params.set('amount', newAmount);
        params.set('paymentMethods', newPaymentMethods);
        if (newAdditionalElements) {
          params.set('additionalElements', newAdditionalElements);
        }
        preserveLogsParam(params);
        navigate(`${route}?${params.toString()}`);
      }
    }
  };

  const navigateTerminal = (newCountry, newCurrency, newAmount, newReaderMode = readerMode) => {
    const params = new URLSearchParams();
    params.set('country', newCountry);
    params.set('currency', newCurrency);
    params.set('amount', newAmount);
    params.set('readerMode', newReaderMode);
    preserveLogsParam(params);
    navigate(`/terminal-server-driven?${params.toString()}`, { replace: true });
  };

  const navigateAnyTerminal = (newCountry, newCurrency, newAmount, newReaderMode = readerMode) => {
    const params = new URLSearchParams();
    params.set('country', newCountry);
    params.set('currency', newCurrency);
    params.set('amount', newAmount);
    params.set('readerMode', newReaderMode);
    preserveLogsParam(params);
    const route = isTerminalJsSdkPage ? '/terminal-js-sdk' : '/terminal-server-driven';
    navigate(`${route}?${params.toString()}`, { replace: true });
  };

  const navigateConnect = (newCountry, newConnectComponent) => {
    const p = new URLSearchParams();
    p.set('country', newCountry);
    p.set('connectComponent', newConnectComponent);
    preserveLogsParam(p);
    navigate(`/connect-embedded?${p.toString()}`, { replace: true });
  };

  const handleReaderModeChange = (newMode) => {
    setReaderMode(newMode);
    navigateAnyTerminal(country, currency, amount, newMode);
    rotateKnob();
  };

  const handleCountryChange = (c) => {
    if (isAnyTerminalPage) {
      navigateAnyTerminal(c, currency, amount);
    } else if (isConnectPage) {
      navigateConnect(c, connectComponent);
    } else {
      setPendingCountry(c);
    }
    setShowCountrySelector(false);
    rotateKnob();
  };

  const handleCurrencyChange = (curr) => {
    if (isAnyTerminalPage) {
      navigateAnyTerminal(country, curr, amount);
    } else {
      setPendingCurrency(curr);
    }
    setShowCurrencySelector(false);
    rotateKnob();
  };

  const handleAmountChange = (amt) => {
    if (isAnyTerminalPage) {
      navigateAnyTerminal(country, currency, amt);
    } else {
      setPendingAmount(amt);
    }
    rotateKnob();
  };

  const handlePaymentMethodsChange = (methods) => {
    setPendingPaymentMethods(methods);
    rotateKnob();
  };

  const togglePaymentMethodsSelector = () => {
    setShowPaymentMethodsSelector(!showPaymentMethodsSelector);
    rotateKnob();
  };

  const toggleCountrySelector = () => {
    setShowCountrySelector(!showCountrySelector);
    rotateKnob();
  };

  const toggleCurrencySelector = () => {
    setShowCurrencySelector(!showCurrencySelector);
    rotateKnob();
  };

  const handleConnectComponentChange = (comp) => {
    setConnectComponent(comp);
    navigateConnect(country, comp);
    setShowConnectComponentSelector(false);
    rotateKnob();
  };

  const availableCountries = [
    { id: 'US', name: 'United States' },
    { id: 'GB', name: 'United Kingdom' },
    { id: 'MX', name: 'Mexico' },
    { id: 'CA', name: 'Canada' },
  ];

  const availableCurrencies = [
    { id: 'usd', name: 'USD' },
    { id: 'eur', name: 'EUR' },
    { id: 'gbp', name: 'GBP' },
    { id: 'jpy', name: 'JPY' },
    { id: 'mxn', name: 'MXN' },
    { id: 'cad', name: 'CAD' },
  ];

  const availableConnectComponents = [
    { id: 'account_onboarding', name: 'Account Onboarding' },
    { id: 'account_management', name: 'Account Management' },
    { id: 'notification_banner', name: 'Notification Banner' },
    { id: 'payments', name: 'Payments' },
    { id: 'disputes_list', name: 'Disputes' },
    { id: 'payouts', name: 'Payouts' },
    { id: 'balances', name: 'Balances' },
    { id: 'payouts_list', name: 'Payouts List' },
    { id: 'payout_details', name: 'Payout Details' },
    { id: 'tax_registrations', name: 'Tax Registrations' },
    { id: 'tax_settings', name: 'Tax Settings' },
    { id: 'documents', name: 'Documents' },
  ];

  const getCountryDisplayText = () => {
    const current = pendingCountry !== null ? pendingCountry : country;
    const countryObj = availableCountries.find(c => c.id === current);
    return countryObj ? countryObj.name.toUpperCase() : 'UNITED STATES';
  };

  const getCurrencyDisplayText = () => {
    const current = pendingCurrency !== null ? pendingCurrency : currency;
    const currencyObj = availableCurrencies.find(c => c.id === current);
    return currencyObj ? currencyObj.name : 'USD';
  };

  const getSelectedPaymentMethods = () => {
    const current = pendingPaymentMethods !== null ? pendingPaymentMethods : paymentMethods;
    if (current === 'auto') return [];
    return current.split(',').filter(m => m);
  };

  const togglePaymentMethod = (methodId) => {
    const selected = getSelectedPaymentMethods();
    let newSelected;

    if (methodId === 'auto') {
      newSelected = [];
    } else {
      if (selected.includes(methodId)) {
        newSelected = selected.filter(m => m !== methodId);
      } else {
        newSelected = [...selected, methodId];
      }
    }

    const methodsString = newSelected.length === 0 ? 'auto' : newSelected.join(',');
    handlePaymentMethodsChange(methodsString);
  };

  const getPaymentMethodsDisplayText = () => {
    const current = pendingPaymentMethods !== null ? pendingPaymentMethods : paymentMethods;
    if (current === 'auto') return 'AUTO';
    const methods = current.split(',').filter(m => m);
    if (methods.length === 0) return 'AUTO';
    if (methods.length === 1) return availablePaymentMethods.find(m => m.id === methods[0])?.name || 'Custom';
    return `${methods.length} Selected`;
  };

  const getSelectedAdditionalElements = () => {
    const current = pendingAdditionalElements !== null ? pendingAdditionalElements : additionalElements;
    if (!current) return [];
    return current.split(',').filter(e => e);
  };

  const toggleAdditionalElement = (elementId) => {
    const selected = getSelectedAdditionalElements();
    let newSelected;

    if (elementId === 'none') {
      newSelected = [];
    } else {
      if (selected.includes(elementId)) {
        newSelected = selected.filter(e => e !== elementId);
      } else {
        newSelected = [...selected, elementId];
      }
    }

    const elementsString = newSelected.length === 0 ? '' : newSelected.join(',');
    handleAdditionalElementsChange(elementsString);
  };

  const getAdditionalElementsDisplayText = () => {
    const selected = getSelectedAdditionalElements();
    if (selected.length === 0) return 'NONE';
    if (selected.length === 1) {
      const element = getAvailableAdditionalElements(currentTab).find(e => e.id === selected[0]);
      return element ? element.name.toUpperCase() : 'CUSTOM';
    }
    return `${selected.length} SELECTED`;
  };

  const handleAdditionalElementsChange = (elementsString) => {
    setPendingAdditionalElements(elementsString);
    rotateKnob();
  };

  const toggleSection = (sectionName) => {
    const newCollapsedSections = {
      ...collapsedSections,
      [sectionName]: !collapsedSections[sectionName]
    };
    setCollapsedSections(newCollapsedSections);
    try {
      localStorage.setItem('sidebarCollapsedSections', JSON.stringify(newCollapsedSections));
    } catch {
      // Ignore localStorage errors
    }
  };

  const applyPendingChanges = () => {
    const newImpl = pendingImplementation !== null ? pendingImplementation : implementation;
    const newMode = pendingMode !== null ? pendingMode : mode;
    const newCountry = pendingCountry !== null ? pendingCountry : country;
    const newCurr = pendingCurrency !== null ? pendingCurrency : currency;
    const newAmount = pendingAmount !== null ? pendingAmount : amount;
    const newPaymentMethods = pendingPaymentMethods !== null ? pendingPaymentMethods : paymentMethods;
    const newAdditionalElements = pendingAdditionalElements !== null ? pendingAdditionalElements : additionalElements;

    if (currentTab === 'TERMINAL' || currentTab === 'TERM-JS') {
      navigateAnyTerminal(newCountry, newCurr, newAmount);
      return;
    }
    if (currentTab === 'CONNECT') {
      return;
    }

    if (currentTab && currentTab !== 'HOME') {
      const route = currentTab === 'CARD' ? '/card-element' :
                    currentTab === 'PAYMENT' ? '/payment-element' :
                    currentTab === 'EXPRESS' ? '/express-checkout-element' :
                    currentTab === 'PRB' ? '/payment-request-button' :
                    currentTab === 'EMBEDDED' ? '/embedded-checkout' :
                    '/checkout-sessions';
      const params = new URLSearchParams();
      params.set('implementation', newImpl);
      params.set('mode', newMode);
      params.set('country', newCountry);
      params.set('currency', newCurr);
      params.set('amount', newAmount);
      params.set('paymentMethods', newPaymentMethods);
      if (newAdditionalElements) {
        params.set('additionalElements', newAdditionalElements);
      }
      preserveLogsParam(params);
      navigate(`${route}?${params.toString()}`);
    }
  };

  const hasPendingChanges = pendingImplementation !== null || pendingMode !== null || pendingCountry !== null || pendingCurrency !== null || pendingAmount !== null || pendingPaymentMethods !== null || pendingAdditionalElements !== null;

  const handleClose = () => {
    navigate('/');
  };

  const triggerEasterEgg = (currentView) => {
    if (isEasterEggRunning) return;
    setIsEasterEggRunning(true);
    setKnobSpinning(true);

    const views = ['demo', 'code', 'about'];
    const startIdx = views.indexOf(currentView);
    // Decelerating intervals: fast at start, slow at end (ms between each step)
    const intervals = [120, 220, 400];

    let cumulative = 0;
    for (let i = 0; i < 3; i++) {
      cumulative += intervals[i];
      const nextView = views[(startIdx + i + 1) % 3];
      ((delay, v) => setTimeout(() => setActiveView(v), delay))(cumulative, nextView);
    }

    setTimeout(() => {
      setKnobSpinning(false);
      setIsEasterEggRunning(false);
    }, cumulative + 150);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    rotateKnob();
    const p = new URLSearchParams(location.search);
    p.set('view', view);
    const qs = p.toString();
    navigate(`${location.pathname}${qs ? '?' + qs : ''}`, { replace: true });
  };

  const applyMaximizeStyles = (screen, maximize) => {
    if (maximize) {
      screen.style.position = 'fixed';
      screen.style.top = '0';
      screen.style.left = '0';
      screen.style.width = '100vw';
      screen.style.height = '100vh';
      screen.style.borderRadius = '0';
      screen.style.border = 'none';
      screen.style.zIndex = '1000';
    } else {
      screen.style.position = 'relative';
      screen.style.top = '';
      screen.style.left = '';
      screen.style.width = '';
      screen.style.height = '';
      screen.style.borderRadius = '';
      screen.style.border = '';
      screen.style.zIndex = '';
    }
  };

  // Apply maximized styles on mount if restored from localStorage
  React.useEffect(() => {
    if (isMaximized && screenRef.current) {
      applyMaximizeStyles(screenRef.current, true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMaximize = () => {
    const screen = screenRef.current;
    if (!screen) return;
    const next = !isMaximized;
    applyMaximizeStyles(screen, next);
    setIsMaximized(next);
    localStorage.setItem('maximized', String(next));
  };

  if (!currentTab) {
    return null;
  }

  const isHomePage = currentTab === 'HOME';
  const isAboutPage = currentTab === 'ABOUT';
  const isSettingsPage = currentTab === 'SETTINGS';
  const isNetworkToolsPage = currentTab === 'TOOLS';
  const isNetworkToolPage = currentTab === 'TOOL';
  const sidebarContent = !isHomePage && !isAboutPage && !isSettingsPage && !isNetworkToolsPage && !isNetworkToolPage ? (
    showCountrySelector ? (
      <div className="device-sidebar-section device-sidebar-section-full">
        <div className="device-sidebar-header">
          <button className="device-sidebar-back-btn" onClick={toggleCountrySelector}>←</button>
          <div className="device-sidebar-title-fixed">COUNTRY</div>
        </div>
        <div className="device-payment-methods-list">
          {availableCountries.map(countryItem => (
            <div
              key={countryItem.id}
              className={`device-payment-method ${(pendingCountry !== null ? pendingCountry : country) === countryItem.id ? 'selected' : ''}`}
              onClick={() => handleCountryChange(countryItem.id)}
            >
              {countryItem.name}
            </div>
          ))}
        </div>
      </div>
    ) : showCurrencySelector ? (
      <div className="device-sidebar-section device-sidebar-section-full">
        <div className="device-sidebar-header">
          <button className="device-sidebar-back-btn" onClick={toggleCurrencySelector}>←</button>
          <div className="device-sidebar-title-fixed">CURRENCY</div>
        </div>
        <div className="device-payment-methods-list">
          {availableCurrencies.map(currencyItem => (
            <div
              key={currencyItem.id}
              className={`device-payment-method ${(pendingCurrency !== null ? pendingCurrency : currency) === currencyItem.id ? 'selected' : ''}`}
              onClick={() => handleCurrencyChange(currencyItem.id)}
            >
              {currencyItem.name}
            </div>
          ))}
        </div>
      </div>
    ) : showConnectComponentSelector ? (
      <div className="device-sidebar-section device-sidebar-section-full">
        <div className="device-sidebar-header">
          <button className="device-sidebar-back-btn" onClick={() => setShowConnectComponentSelector(false)}>←</button>
          <div className="device-sidebar-title-fixed">COMPONENT</div>
        </div>
        <div className="device-payment-methods-list">
          {availableConnectComponents.map(comp => (
            <div
              key={comp.id}
              className={`device-payment-method ${connectComponent === comp.id ? 'selected' : ''}`}
              onClick={() => handleConnectComponentChange(comp.id)}
            >
              {comp.name}{comp.preview ? ' ·' : ''}
            </div>
          ))}
        </div>
      </div>
    ) : showAdditionalElementsSelector ? (
      <div className="device-sidebar-section device-sidebar-section-full">
        <div className="device-sidebar-header">
          <button className="device-sidebar-back-btn" onClick={() => setShowAdditionalElementsSelector(false)}>←</button>
          <div className="device-sidebar-title-fixed">ADDITIONAL ELEMENTS</div>
        </div>
        <div className="device-payment-methods-list">
          <div
            className={`device-payment-method ${getSelectedAdditionalElements().length === 0 ? 'selected' : ''}`}
            onClick={() => toggleAdditionalElement('none')}
          >
            <span className="device-checkbox">{getSelectedAdditionalElements().length === 0 ? '✓' : ''}</span>
            NONE
          </div>
          {getAvailableAdditionalElements(currentTab).map(element => (
            <div
              key={element.id}
              className={`device-payment-method ${getSelectedAdditionalElements().includes(element.id) ? 'selected' : ''}`}
              onClick={() => toggleAdditionalElement(element.id)}
            >
              <span className="device-checkbox">{getSelectedAdditionalElements().includes(element.id) ? '✓' : ''}</span>
              {element.name}
            </div>
          ))}
        </div>
      </div>
    ) : !showPaymentMethodsSelector ? (
      <>
        {has('readerMode') && (
          <div className="device-sidebar-section">
            <div className="device-sidebar-title" onClick={() => toggleSection('readerMode')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>READER MODE</span>
              <span style={{ fontSize: '12px' }}>{collapsedSections.readerMode ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.readerMode && (
              <div className="device-sidebar-row">
                <div
                  className={`device-sidebar-item ${readerMode === 'simulated' ? 'selected' : ''}`}
                  onClick={() => handleReaderModeChange('simulated')}
                >
                  SIMULATED
                </div>
                <div
                  className={`device-sidebar-item ${readerMode === 'physical' ? 'selected' : ''}`}
                  onClick={() => handleReaderModeChange('physical')}
                >
                  PHYSICAL
                </div>
              </div>
            )}
          </div>
        )}
        {has('implementation') && (
          <div className="device-sidebar-section">
            <div className="device-sidebar-title" onClick={() => toggleSection('implementation')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>IMPLEMENTATION</span>
              <span style={{ fontSize: '12px' }}>{collapsedSections.implementation ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.implementation && (
              <div className="device-sidebar-row">
                <div
                  className={`device-sidebar-item ${(pendingImplementation !== null ? pendingImplementation : implementation) === 'react' ? 'selected' : ''}`}
                  onClick={() => handleImplementationChange('react')}
                >
                  REACT
                </div>
                <div
                  className={`device-sidebar-item ${(pendingImplementation !== null ? pendingImplementation : implementation) === 'javascript' ? 'selected' : ''}`}
                  onClick={() => handleImplementationChange('javascript')}
                >
                  JAVASCRIPT
                </div>
              </div>
            )}
          </div>
        )}
        {has('mode') && (
          <div className="device-sidebar-section">
            <div className="device-sidebar-title" onClick={() => toggleSection('mode')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>MODE</span>
              <span style={{ fontSize: '12px' }}>{collapsedSections.mode ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.mode && (
              <div className="device-sidebar-row">
                <div
                  className={`device-sidebar-item ${(pendingMode !== null ? pendingMode : mode) === 'default' ? 'selected' : ''}`}
                  onClick={() => handleModeChange('default')}
                >
                  DEFAULT
                </div>
                <div
                  className={`device-sidebar-item ${(pendingMode !== null ? pendingMode : mode) === 'deferred' ? 'selected' : ''}`}
                  onClick={() => handleModeChange('deferred')}
                >
                  DEFERRED
                </div>
              </div>
            )}
          </div>
        )}
        {has('country') && (
          <div className="device-sidebar-section">
            <div className="device-sidebar-title" onClick={() => toggleSection('country')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>MERCHANT COUNTRY</span>
              <span style={{ fontSize: '12px' }}>{collapsedSections.country ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.country && (
              <div className="device-sidebar-row">
                <button className="device-button device-button-full" onClick={toggleCountrySelector}>
                  {getCountryDisplayText()}
                </button>
              </div>
            )}
          </div>
        )}
        {has('connectComponent') && (
          <div className="device-sidebar-section">
            <div className="device-sidebar-title" onClick={() => toggleSection('connectComponent')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>COMPONENT</span>
              <span style={{ fontSize: '12px' }}>{collapsedSections.connectComponent ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.connectComponent && (
              <div className="device-sidebar-row">
                <button className="device-button device-button-full" onClick={() => setShowConnectComponentSelector(true)}>
                  {connectComponent.toUpperCase().replace(/_/g, ' ')}
                </button>
              </div>
            )}
          </div>
        )}
        {(has('currency') || has('amount') || has('paymentMethods')) && (
          <div className="device-sidebar-section">
            <div className="device-sidebar-title" onClick={() => toggleSection('paymentOptions')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>PAYMENT OPTIONS</span>
              <span style={{ fontSize: '12px' }}>{collapsedSections.paymentOptions ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.paymentOptions && (
              <>
                {has('currency') && (
                  <div className="device-option-row">
                    <div className="device-option-label">CURRENCY</div>
                    <button className="device-button device-button-inline device-button-currency" onClick={toggleCurrencySelector}>
                      {getCurrencyDisplayText()}
                    </button>
                  </div>
                )}
                {has('amount') && (
                  <div className="device-option-row">
                    <div className="device-option-label">AMOUNT</div>
                    <input
                      type="number"
                      className="device-input device-input-inline"
                      value={pendingAmount !== null ? pendingAmount : amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      min="50"
                      step="1"
                      placeholder="Amount in cents"
                    />
                  </div>
                )}
                {has('paymentMethods') && (
                  <div className="device-option-row">
                    <div className="device-option-label">PAYMENT METHODS</div>
                    <button className="device-button device-button-inline device-button-payment-methods" onClick={togglePaymentMethodsSelector}>
                      {getPaymentMethodsDisplayText()}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {has('additionalElements') && (
          <div className="device-sidebar-section">
            <div className="device-sidebar-title" onClick={() => toggleSection('additionalElements')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>ADDITIONAL ELEMENTS</span>
              <span style={{ fontSize: '12px' }}>{collapsedSections.additionalElements ? '▶' : '▼'}</span>
            </div>
            {!collapsedSections.additionalElements && (
              <div className="device-sidebar-row">
                <button className="device-button device-button-full" onClick={() => setShowAdditionalElementsSelector(true)}>
                  {getAdditionalElementsDisplayText()}
                </button>
              </div>
            )}
          </div>
        )}
      </>
    ) : (
      <div className="device-sidebar-section device-sidebar-section-full">
        <div className="device-sidebar-header">
          <button className="device-sidebar-back-btn" onClick={togglePaymentMethodsSelector}>←</button>
          <div className="device-sidebar-title-fixed">PAYMENT METHODS</div>
        </div>
        <div className="device-payment-methods-list">
          <div
            className={`device-payment-method ${getSelectedPaymentMethods().length === 0 ? 'selected' : ''}`}
            onClick={() => togglePaymentMethod('auto')}
          >
            <span className="device-checkbox">{getSelectedPaymentMethods().length === 0 ? '✓' : ''}</span>
            AUTO
          </div>
          {availablePaymentMethods.map(method => (
            <div
              key={method.id}
              className={`device-payment-method ${getSelectedPaymentMethods().includes(method.id) ? 'selected' : ''}`}
              onClick={() => togglePaymentMethod(method.id)}
            >
              <span className="device-checkbox">{getSelectedPaymentMethods().includes(method.id) ? '✓' : ''}</span>
              {method.name}
            </div>
          ))}
        </div>
      </div>
    )
  ) : null;

  const clonedChildren = React.cloneElement(children, {
    key: isTerminalPage
      ? `${country}-${readerMode}`
      : isTerminalJsSdkPage
      ? `${country}-${readerMode}`
      : isConnectPage
      ? `${country}-${connectComponent}`
      : `${implementation}-${mode}-${country}-${currency}-${amount}-${paymentMethods}-${additionalElements}-${readerMode}`,
    activeView,
    onViewChange: handleViewChange,
    onNavigate: () => {
      rotateKnob();
      setIsFading(true);
    },
    implementation,
    mode,
    paymentOptions: { country, currency, amount, paymentMethods, readerMode, connectComponent, additionalElements },
    currentTab,
    onMaximize: handleMaximize,
    isMaximized,
  });

  if (isMobile) {
    return (
      <DeviceContext.Provider value={{ screenTiltStyle, screenFalling, theme }}>
      <div className="mobile-container">
        {/* Overlay — only for the options drawer, not the elements dropdown */}
        {mobileOptionsOpen && (
          <div
            className="mobile-overlay"
            onClick={() => { setMobileOptionsOpen(false); setMobileElementsOpen(false); }}
          />
        )}

        {/* Options drawer — slides in from left */}
        {!isHomePage && !isAboutPage && !isSettingsPage && !isNetworkToolsPage && !isNetworkToolPage && (
          <div className={`mobile-options-drawer ${mobileOptionsOpen ? 'open' : ''}`}>
            <div className="mobile-options-header">
              <span>OPTIONS</span>
              <button className="mobile-options-close" onClick={() => setMobileOptionsOpen(false)}>✕</button>
            </div>
            <div className="mobile-options-content">
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Elements dropdown — slides down from top */}
        {!isHomePage && !isAboutPage && !isNetworkToolsPage && !isNetworkToolPage && (
          <div className={`mobile-elements-dropdown ${mobileElementsOpen ? 'open' : ''}`}>
            {['PAYMENT', 'EXPRESS', 'CHECKOUT', 'EMBEDDED', 'CARD', 'PRB', 'TERMINAL', 'TERM-JS', 'CONNECT'].map(tab => (
              <div
                key={tab}
                className={`mobile-tab-item ${currentTab === tab ? 'active' : ''}`}
                onClick={() => { handleTabClick(tab); setMobileElementsOpen(false); }}
              >
                {tab}
              </div>
            ))}
          </div>
        )}

        {/* Main screen */}
        <div className="mobile-screen">
          {!isHomePage && currentTab !== 'TOOLS' && currentTab !== 'TOOL' && (
            <div className="mobile-header">
              <div className="mobile-header-left">
                <button className="mobile-back-btn" onClick={() => handleTabClick('HOME')}>←</button>
                {!isAboutPage && !isSettingsPage && (
                  <button
                    className={`mobile-options-btn ${mobileOptionsOpen ? 'active' : ''}`}
                    onClick={() => { setMobileOptionsOpen(!mobileOptionsOpen); setMobileElementsOpen(false); }}
                  >
                    ELEMENT OPTIONS
                  </button>
                )}
              </div>
              <div className="mobile-header-right">
                {!isAboutPage && (
                  <button
                    className={`mobile-elements-btn ${mobileElementsOpen ? 'active' : ''}`}
                    onClick={() => { setMobileElementsOpen(!mobileElementsOpen); setMobileOptionsOpen(false); }}
                  >
                    ☰ {isSettingsPage ? 'ELEMENTS' : currentTab}
                  </button>
                )}
                <button
                  className={`mobile-settings-btn ${isSettingsPage ? 'active' : ''}`}
                  onClick={() => { setIsFading(true); navigate('/settings'); }}
                >
                  ⚙
                </button>
              </div>
            </div>
          )}

          <div className={`mobile-main ${isHomePage || isAboutPage || isSettingsPage || isNetworkToolsPage || isNetworkToolPage ? 'mobile-main-full' : ''} ${isFading ? 'device-content-fading' : ''}`}>
            {hasPendingChanges && !isHomePage && !isAboutPage && !isNetworkToolsPage && !isNetworkToolPage && activeView === 'demo' && (
              <div className="device-pending-overlay" onClick={applyPendingChanges}>
                <div className="device-pending-message">PENDING CHANGES - CLICK TO REFRESH</div>
              </div>
            )}
            {clonedChildren}
          </div>

          {!isHomePage && !isAboutPage && !isSettingsPage && !isNetworkToolsPage && !isNetworkToolPage && (
            <div className="mobile-footer">
              <div className="device-indicators">
                <div className={`device-view-indicator ${activeView === 'demo' ? 'active' : ''}`} onClick={() => handleViewChange('demo')}>
                  <div className="indicator-light-wrapper"><div className="indicator-light"></div></div>
                  <div className="indicator-label">DEMO</div>
                </div>
                <div className={`device-view-indicator ${activeView === 'code' ? 'active' : ''}`} onClick={() => handleViewChange('code')}>
                  <div className="indicator-light-wrapper"><div className="indicator-light"></div></div>
                  <div className="indicator-label">CODE</div>
                </div>
                <div className={`device-view-indicator ${activeView === 'about' ? 'active' : ''}`} onClick={() => handleViewChange('about')}>
                  <div className="indicator-light-wrapper"><div className="indicator-light"></div></div>
                  <div className="indicator-label">ABOUT</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </DeviceContext.Provider>
    );
  }

  return (
    <DeviceContext.Provider value={{ screenTiltStyle, screenFalling, theme }}>
    <div className="device-container">
      <div className="device-border">
        <div className="device-corner-hole device-corner-hole-tl"></div>
        <div className="device-corner-hole device-corner-hole-tr"></div>
        <div className="device-corner-hole device-corner-hole-bl"></div>
        <div className="device-corner-hole device-corner-hole-br"></div>
        <div className={`device-corner device-corner-tl${fallenScrews.has('ctl') ? ' fallen' : fallingScrew.has('ctl') ? ' falling' : spinningScrew.has('ctl') ? ' spinning' : ''}`} onClick={() => handleScrewClick('ctl')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'ctl'); }}></div>
        <div className={`device-corner device-corner-tr${fallenScrews.has('ctr') ? ' fallen' : fallingScrew.has('ctr') ? ' falling' : spinningScrew.has('ctr') ? ' spinning' : ''}`} onClick={() => handleScrewClick('ctr')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'ctr'); }}></div>
        <div className={`device-corner device-corner-bl${fallenScrews.has('cbl') ? ' fallen' : fallingScrew.has('cbl') ? ' falling' : spinningScrew.has('cbl') ? ' spinning' : ''}`} onClick={() => handleScrewClick('cbl')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'cbl'); }}></div>
        <div className={`device-corner device-corner-br${fallenScrews.has('cbr') ? ' fallen' : fallingScrew.has('cbr') ? ' falling' : spinningScrew.has('cbr') ? ' spinning' : ''}`} onClick={() => handleScrewClick('cbr')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'cbr'); }}></div>

        <div className={`device-knob ${knobSpinning ? 'spinning' : knobRotating ? 'rotating' : ''}`} onClick={() => triggerEasterEgg(activeView)}></div>
        <div className="device-label device-label-knob">SN: FB-8472-X9K3-M7Q1</div>

        <div className="device-vents">
          <div className="device-vent"></div>
          <div className="device-vent"></div>
          <div className="device-vent"></div>
          <div className="device-vent"></div>
          <div className="device-vent"></div>
          <div className="device-vent"></div>
          <div className="device-vent"></div>
          <div className="device-vent"></div>
        </div>

        <div className="device-panel-line device-panel-line-top"></div>
        <div className="device-panel-line device-panel-line-bottom"></div>


        <div className="device-label device-label-screen">FANCYBEETS INDUSTRIES</div>

        {(screenFalling || screenFallen) && (
          <div className="device-slot">
            <div className="device-slot-frame"></div>
            <div className="device-slot-screw-hole device-slot-screw-hole-tl"></div>
            <div className="device-slot-screw-hole device-slot-screw-hole-tr"></div>
            <div className="device-slot-screw-hole device-slot-screw-hole-bl"></div>
            <div className="device-slot-screw-hole device-slot-screw-hole-br"></div>
            <div className="device-slot-screw-hole device-slot-screw-hole-ml"></div>
            <div className="device-slot-screw-hole device-slot-screw-hole-mr"></div>
            <div className="device-cable-yellow-1"></div>
            <div className="device-cable-red-1"></div>
            <div className="device-cable-red-2"></div>
            <div className="device-cable-red-3"></div>
            <div className="device-cable-blue-1"></div>
            <div className="device-cable-blue-2"></div>
            <div className="device-cable-blue-3"></div>
            <div className="device-cable-green-1"></div>
            <div className="device-cable-orange-1"></div>
            <div className="device-zip-tie-h-1"></div>
            <div className="device-cable-vertical-red-1"></div>
            <div className="device-cable-vertical-blue-1"></div>
            <div className="device-cable-vertical-yellow-1"></div>
            <div className="device-cable-vertical-green-1"></div>
            <div className="device-cable-vertical-orange-1"></div>
            <div className="device-cable-vertical-red-2"></div>
            <div className="device-cable-vertical-blue-2"></div>
            <div className="device-cable-vertical-green-2"></div>
            <div className="device-zip-tie-v-1"></div>
            <div className="device-logic-unit">
              <div className="device-logic-label">LOGIC UNIT</div>
              <div className="device-circuit">
              {/* Mounting holes */}
              <div className="circuit-mount circuit-mount-1"></div>
              <div className="circuit-mount circuit-mount-2"></div>
              <div className="circuit-mount circuit-mount-3"></div>
              <div className="circuit-mount circuit-mount-4"></div>
              {/* Main CPU */}
              <div className="circuit-chip-main"></div>
              {/* Small chips */}
              <div className="circuit-chip-sm circuit-chip-sm-1"></div>
              <div className="circuit-chip-sm circuit-chip-sm-3"></div>
              <div className="circuit-chip-sm circuit-chip-sm-4"></div>
              {/* IC packages */}
              <div className="circuit-ic circuit-ic-1" data-label="74HC245"></div>
              <div className="circuit-ic circuit-ic-2" data-label="LM358"></div>
              <div className="circuit-ic circuit-ic-3" data-label="SPI"></div>
              {/* Capacitors */}
              <div className="circuit-cap circuit-cap-1"></div>
              <div className="circuit-cap circuit-cap-2"></div>
              <div className="circuit-cap circuit-cap-3"></div>
              <div className="circuit-cap circuit-cap-4"></div>
              <div className="circuit-cap circuit-cap-5"></div>
              <div className="circuit-cap circuit-cap-6"></div>
              {/* Resistors */}
              <div className="circuit-resistor circuit-resistor-1"></div>
              <div className="circuit-resistor circuit-resistor-2"></div>
              <div className="circuit-resistor circuit-resistor-3"></div>
              <div className="circuit-resistor circuit-resistor-4"></div>
              <div className="circuit-resistor circuit-resistor-5"></div>
              <div className="circuit-resistor circuit-resistor-6"></div>
              <div className="circuit-resistor circuit-resistor-7"></div>
              {/* Crystal */}
              <div className="circuit-crystal circuit-crystal-1"></div>
              {/* Power LED */}
              <div className="circuit-led circuit-led-1"></div>
              {/* Edge connector */}
              <div className="circuit-connector"></div>
              {/* Original solder dots */}
              <div className="circuit-dot circuit-dot-3"></div>
              <div className="circuit-dot circuit-dot-5"></div>
              <div className="circuit-dot circuit-dot-6"></div>
              {/* Vias */}
              <div className="circuit-via circuit-via-1"></div>
              <div className="circuit-via circuit-via-2"></div>
              <div className="circuit-via circuit-via-6"></div>
              <div className="circuit-via circuit-via-7"></div>
              <div className="circuit-via circuit-via-8"></div>
              <div className="circuit-via circuit-via-9"></div>
              <div className="circuit-via circuit-via-10"></div>
              <div className="circuit-via circuit-via-11"></div>
              <div className="circuit-via circuit-via-12"></div>
              <div className="circuit-via circuit-via-13"></div>
              <div className="circuit-via circuit-via-15"></div>
              <div className="circuit-via circuit-via-17"></div>
              <div className="circuit-via circuit-via-18"></div>
              <div className="circuit-via circuit-via-19"></div>
              <div className="circuit-via circuit-via-21"></div>
              <div className="circuit-via circuit-via-22"></div>
              <div className="circuit-via circuit-via-24"></div>
              <div className="circuit-via circuit-via-25"></div>
              <div className="circuit-via circuit-via-26"></div>
              <div className="circuit-via circuit-via-27"></div>
              <div className="circuit-via circuit-via-28"></div>
              {/* Silkscreen labels */}
              <div className="circuit-label circuit-label-u1">U1</div>
              <div className="circuit-label circuit-label-u2">U3</div>
              <div className="circuit-label circuit-label-u3">Y1</div>
              <div className="circuit-label circuit-label-u4">U4</div>
              <div className="circuit-label circuit-label-c1">C1</div>
              <div className="circuit-label circuit-label-c2">C2</div>
              <div className="circuit-label circuit-label-c3">C3</div>
              <div className="circuit-label circuit-label-c4">C4</div>
              <div className="circuit-label circuit-label-c5">C5</div>
              <div className="circuit-label circuit-label-r1">R1</div>
              <div className="circuit-label circuit-label-r2">R2</div>
              <div className="circuit-label circuit-label-r3">R3</div>
              <div className="circuit-label circuit-label-y1">16MHz</div>
              <div className="circuit-label circuit-label-fb">© FANCYBEETS IND.</div>
              </div>
              <div className="logic-cable-bundle">
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable-zip-tie"></div>
              </div>
              <div className="logic-cable-bundle logic-cable-bundle-bottom">
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable"></div>
                <div className="logic-cable-zip-tie"></div>
              </div>
            </div>
            <div className="device-psu-slot">
              <div className="device-psu-inner-border"></div>
              <div className="device-psu-label">PSU</div>
              <img src={psuGif} alt="PSU" className="device-psu-gif" />
            </div>
            <div className="device-service-log">
              <div className="device-service-log-smudge smudge-1"></div>
              <div className="device-service-log-smudge smudge-2"></div>
              <div className="device-service-log-smudge smudge-3"></div>
              <div className="device-service-log-header">— SERVICE CHECKS —</div>
              <div className="device-service-log-columns">
                <div className="device-service-log-col">
                  <div className="device-service-log-row sig-a"><span>03/14/71</span><span className="device-service-log-sig">JM</span></div>
                  <div className="device-service-log-row sig-a"><span>03/02/72</span><span className="device-service-log-sig">JM</span></div>
                  <div className="device-service-log-row sig-a"><span>03/19/73</span><span className="device-service-log-sig">JM</span></div>
                  <div className="device-service-log-row sig-b"><span>04/07/74</span><span className="device-service-log-sig">RM</span></div>
                  <div className="device-service-log-row sig-b"><span>04/22/75</span><span className="device-service-log-sig">RM</span></div>
                </div>
                <div className="device-service-log-col-divider"></div>
                <div className="device-service-log-col">
                  <div className="device-service-log-row sig-b"><span>06/14/77</span><span className="device-service-log-sig">RM</span></div>
                  <div className="device-service-log-row sig-c"><span>02/11/81</span><span className="device-service-log-sig">ET</span></div>
                </div>
              </div>
            </div>
            <div className="device-dangling-connectors device-dangling-connectors-top">
              <div className="device-connector device-connector-t1">
                <div className="connector-inner">
                  <div className="connector-wire connector-wire-4"></div>
                  <div className="connector-body">
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                  </div>
                </div>
              </div>
              <div className="device-connector device-connector-t4">
                <div className="connector-inner">
                  <div className="connector-wire connector-wire-3"></div>
                  <div className="connector-body">
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!screenFallen && (
        <div className={`device-screen-container${screenFalling ? ' screen-falling' : ''}`} style={screenTiltStyle} onAnimationEnd={handleScreenFallEnd}>
          <div className="device-screws">
            <div className="device-screw-hole device-screw-hole-tl"></div>
            <div className="device-screw-hole device-screw-hole-tr"></div>
            <div className="device-screw-hole device-screw-hole-bl"></div>
            <div className="device-screw-hole device-screw-hole-br"></div>
            <div className="device-screw-hole device-screw-hole-ml"></div>
            <div className="device-screw-hole device-screw-hole-mr"></div>
            <div className={`device-screw device-screw-tl${fallenScrews.has('tl') ? ' fallen' : fallingScrew.has('tl') ? ' falling' : spinningScrew.has('tl') ? ' spinning' : ''}`} onClick={() => handleScrewClick('tl')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'tl'); }}></div>
            <div className={`device-screw device-screw-tr${fallenScrews.has('tr') ? ' fallen' : fallingScrew.has('tr') ? ' falling' : spinningScrew.has('tr') ? ' spinning' : ''}`} onClick={() => handleScrewClick('tr')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'tr'); }}></div>
            <div className={`device-screw device-screw-bl${fallenScrews.has('bl') ? ' fallen' : fallingScrew.has('bl') ? ' falling' : spinningScrew.has('bl') ? ' spinning' : ''}`} onClick={() => handleScrewClick('bl')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'bl'); }}></div>
            <div className={`device-screw device-screw-br${fallenScrews.has('br') ? ' fallen' : fallingScrew.has('br') ? ' falling' : spinningScrew.has('br') ? ' spinning' : ''}`} onClick={() => handleScrewClick('br')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'br'); }}></div>
            <div className={`device-screw device-screw-ml${fallenScrews.has('ml') ? ' fallen' : fallingScrew.has('ml') ? ' falling' : spinningScrew.has('ml') ? ' spinning' : ''}`} onClick={() => handleScrewClick('ml')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'ml'); }}></div>
            <div className={`device-screw device-screw-mr${fallenScrews.has('mr') ? ' fallen' : fallingScrew.has('mr') ? ' falling' : spinningScrew.has('mr') ? ' spinning' : ''}`} onClick={() => handleScrewClick('mr')} onAnimationEnd={(e) => { e.stopPropagation(); handleScrewAnimEnd(e, 'mr'); }}></div>
          </div>

          <div className="device-screen" ref={screenRef}>
          {!isHomePage && !isNetworkToolsPage && !isNetworkToolPage && (
            <div className="device-header" ref={headerRef}>
              <div className="device-back-button" onClick={() => handleTabClick('HOME')}>
                ←
              </div>
              <div
                className={`device-settings-button ${isSettingsPage ? 'active' : ''}`}
                onClick={() => { rotateKnob(); setIsFading(true); navigate('/settings'); }}
              >
                ⚙
              </div>
              {(
                <div className="device-tabs">
                  <div className="device-tabs-inner" ref={tabsInnerRef}>
                    <div
                      className={`device-tab ${currentTab === 'PAYMENT' ? 'active' : ''}`}
                      onClick={() => handleTabClick('PAYMENT')}
                    >
                      PAYMENT
                    </div>
                    <div
                      className={`device-tab ${currentTab === 'EXPRESS' ? 'active' : ''}`}
                      onClick={() => handleTabClick('EXPRESS')}
                    >
                      EXPRESS
                    </div>
                    <div
                      className={`device-tab ${currentTab === 'CHECKOUT' ? 'active' : ''}`}
                      onClick={() => handleTabClick('CHECKOUT')}
                    >
                      CHECKOUT
                    </div>
                    <div className={`device-tab device-tab-all ${showAllDropdown ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); rotateKnob(); setShowAllDropdown(v => !v); }}>
                      ALL ▾
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {allDropdownRect && (
            <div
              className="device-tab-all-dropdown"
              style={{ top: allDropdownRect.top, left: allDropdownRect.left, width: allDropdownRect.width }}
            >
              {elements.map(el => (
                <div
                  key={el.tab}
                  className={`device-tab-all-item ${currentTab === el.tab ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleTabClick(el.tab); setShowAllDropdown(false); }}
                >
                  {el.title.toUpperCase()}
                </div>
              ))}
            </div>
          )}

          <div className={`device-content ${isHomePage || isAboutPage || isSettingsPage || isNetworkToolsPage || isNetworkToolPage ? 'device-content-full' : ''} ${isFading ? 'device-content-fading' : ''}`}>
            {!isHomePage && !isAboutPage && !isSettingsPage && !isNetworkToolsPage && !isNetworkToolPage && (
              <div className={`device-sidebar${sidebarCollapsed ? ' device-sidebar--collapsed' : ''}`}>
                <div className="device-sidebar-scroll">
                {showCountrySelector ? (
                  <div className="device-sidebar-section device-sidebar-section-full">
                    <div className="device-sidebar-header">
                      <button className="device-sidebar-back-btn" onClick={toggleCountrySelector}>
                        ←
                      </button>
                      <div className="device-sidebar-title-fixed">COUNTRY</div>
                    </div>
                    <div className="device-payment-methods-list">
                      {availableCountries.map(countryItem => (
                        <div
                          key={countryItem.id}
                          className={`device-payment-method ${(pendingCountry !== null ? pendingCountry : country) === countryItem.id ? 'selected' : ''}`}
                          onClick={() => handleCountryChange(countryItem.id)}
                        >
                          {countryItem.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : showCurrencySelector ? (
                  <div className="device-sidebar-section device-sidebar-section-full">
                    <div className="device-sidebar-header">
                      <button className="device-sidebar-back-btn" onClick={toggleCurrencySelector}>
                        ←
                      </button>
                      <div className="device-sidebar-title-fixed">CURRENCY</div>
                    </div>
                    <div className="device-payment-methods-list">
                      {availableCurrencies.map(currencyItem => (
                        <div
                          key={currencyItem.id}
                          className={`device-payment-method ${(pendingCurrency !== null ? pendingCurrency : currency) === currencyItem.id ? 'selected' : ''}`}
                          onClick={() => handleCurrencyChange(currencyItem.id)}
                        >
                          {currencyItem.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : showConnectComponentSelector ? (
                  <div className="device-sidebar-section device-sidebar-section-full">
                    <div className="device-sidebar-header">
                      <button className="device-sidebar-back-btn" onClick={() => setShowConnectComponentSelector(false)}>
                        ←
                      </button>
                      <div className="device-sidebar-title-fixed">COMPONENT</div>
                    </div>
                    <div className="device-payment-methods-list">
                      {availableConnectComponents.map(comp => (
                        <div
                          key={comp.id}
                          className={`device-payment-method ${connectComponent === comp.id ? 'selected' : ''}`}
                          onClick={() => handleConnectComponentChange(comp.id)}
                        >
                          {comp.name}{comp.preview ? ' ·' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : showAdditionalElementsSelector ? (
                  <div className="device-sidebar-section device-sidebar-section-full">
                    <div className="device-sidebar-header">
                      <button className="device-sidebar-back-btn" onClick={() => setShowAdditionalElementsSelector(false)}>←</button>
                      <div className="device-sidebar-title-fixed">ADDITIONAL ELEMENTS</div>
                    </div>
                    <div className="device-payment-methods-list">
                      <div
                        className={`device-payment-method ${getSelectedAdditionalElements().length === 0 ? 'selected' : ''}`}
                        onClick={() => toggleAdditionalElement('none')}
                      >
                        <span className="device-checkbox">{getSelectedAdditionalElements().length === 0 ? '✓' : ''}</span>
                        NONE
                      </div>
                      {getAvailableAdditionalElements(currentTab).map(element => (
                        <div
                          key={element.id}
                          className={`device-payment-method ${getSelectedAdditionalElements().includes(element.id) ? 'selected' : ''}`}
                          onClick={() => toggleAdditionalElement(element.id)}
                        >
                          <span className="device-checkbox">{getSelectedAdditionalElements().includes(element.id) ? '✓' : ''}</span>
                          {element.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !showPaymentMethodsSelector ? (
                  <>
                    {has('readerMode') && (
                      <div className="device-sidebar-section">
                        <div className="device-sidebar-title" onClick={() => toggleSection('readerMode')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>READER MODE</span>
                          <span style={{ fontSize: '12px' }}>{collapsedSections.readerMode ? '▶' : '▼'}</span>
                        </div>
                        {!collapsedSections.readerMode && (
                          <div className="device-sidebar-row">
                            <div
                              className={`device-sidebar-item ${readerMode === 'simulated' ? 'selected' : ''}`}
                              onClick={() => handleReaderModeChange('simulated')}
                            >
                              SIMULATED
                            </div>
                            <div
                              className={`device-sidebar-item ${readerMode === 'physical' ? 'selected' : ''}`}
                              onClick={() => handleReaderModeChange('physical')}
                            >
                              PHYSICAL
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {has('implementation') && (
                      <div className="device-sidebar-section">
                        <div className="device-sidebar-title" onClick={() => toggleSection('implementation')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>IMPLEMENTATION</span>
                          <span style={{ fontSize: '12px' }}>{collapsedSections.implementation ? '▶' : '▼'}</span>
                        </div>
                        {!collapsedSections.implementation && (
                          <div className="device-sidebar-row">
                            <div
                              className={`device-sidebar-item ${(pendingImplementation !== null ? pendingImplementation : implementation) === 'react' ? 'selected' : ''}`}
                              onClick={() => handleImplementationChange('react')}
                            >
                              REACT
                            </div>
                            <div
                              className={`device-sidebar-item ${(pendingImplementation !== null ? pendingImplementation : implementation) === 'javascript' ? 'selected' : ''}`}
                              onClick={() => handleImplementationChange('javascript')}
                            >
                              JAVASCRIPT
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {has('mode') && (
                      <div className="device-sidebar-section">
                        <div className="device-sidebar-title" onClick={() => toggleSection('mode')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>MODE</span>
                          <span style={{ fontSize: '12px' }}>{collapsedSections.mode ? '▶' : '▼'}</span>
                        </div>
                        {!collapsedSections.mode && (
                          <div className="device-sidebar-row">
                            <div
                              className={`device-sidebar-item ${(pendingMode !== null ? pendingMode : mode) === 'default' ? 'selected' : ''}`}
                              onClick={() => handleModeChange('default')}
                            >
                              DEFAULT
                            </div>
                            <div
                              className={`device-sidebar-item ${(pendingMode !== null ? pendingMode : mode) === 'deferred' ? 'selected' : ''}`}
                              onClick={() => handleModeChange('deferred')}
                            >
                              DEFERRED
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {has('country') && (
                      <div className="device-sidebar-section">
                        <div className="device-sidebar-title" onClick={() => toggleSection('country')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>MERCHANT COUNTRY</span>
                          <span style={{ fontSize: '12px' }}>{collapsedSections.country ? '▶' : '▼'}</span>
                        </div>
                        {!collapsedSections.country && (
                          <div className="device-sidebar-row">
                            <button
                              className="device-button device-button-full"
                              onClick={toggleCountrySelector}
                            >
                              {getCountryDisplayText()}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {has('connectComponent') && (
                      <div className="device-sidebar-section">
                        <div className="device-sidebar-title" onClick={() => toggleSection('connectComponent')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>COMPONENT</span>
                          <span style={{ fontSize: '12px' }}>{collapsedSections.connectComponent ? '▶' : '▼'}</span>
                        </div>
                        {!collapsedSections.connectComponent && (
                          <div className="device-sidebar-row">
                            <button
                              className="device-button device-button-full"
                              onClick={() => setShowConnectComponentSelector(true)}
                            >
                              {connectComponent.toUpperCase().replace(/_/g, ' ')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {(has('currency') || has('amount') || has('paymentMethods')) && (
                      <div className="device-sidebar-section">
                        <div className="device-sidebar-title" onClick={() => toggleSection('paymentOptions')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>PAYMENT OPTIONS</span>
                          <span style={{ fontSize: '12px' }}>{collapsedSections.paymentOptions ? '▶' : '▼'}</span>
                        </div>
                        {!collapsedSections.paymentOptions && (
                          <>
                            {has('currency') && (
                              <div className="device-option-row">
                                <div className="device-option-label">CURRENCY</div>
                                <button
                                  className="device-button device-button-inline device-button-currency"
                                  onClick={toggleCurrencySelector}
                                >
                                  {getCurrencyDisplayText()}
                                </button>
                              </div>
                            )}
                            {has('amount') && (
                              <div className="device-option-row">
                                <div className="device-option-label">AMOUNT</div>
                                <input
                                  type="number"
                                  className="device-input device-input-inline"
                                  value={pendingAmount !== null ? pendingAmount : amount}
                                  onChange={(e) => handleAmountChange(e.target.value)}
                                  min="50"
                                  step="1"
                                  placeholder="Amount in cents"
                                />
                              </div>
                            )}
                            {has('paymentMethods') && (
                              <div className="device-option-row">
                                <div className="device-option-label">PAYMENT METHODS</div>
                                <button
                                  className="device-button device-button-inline device-button-payment-methods"
                                  onClick={togglePaymentMethodsSelector}
                                >
                                  {getPaymentMethodsDisplayText()}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {has('additionalElements') && (
                      <div className="device-sidebar-section">
                        <div className="device-sidebar-title" onClick={() => toggleSection('additionalElements')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>ADDITIONAL ELEMENTS</span>
                          <span style={{ fontSize: '12px' }}>{collapsedSections.additionalElements ? '▶' : '▼'}</span>
                        </div>
                        {!collapsedSections.additionalElements && (
                          <div className="device-sidebar-row">
                            <button
                              className="device-button device-button-full"
                              onClick={() => setShowAdditionalElementsSelector(true)}
                            >
                              {getAdditionalElementsDisplayText()}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="device-sidebar-section device-sidebar-section-full">
                    <div className="device-sidebar-header">
                      <button className="device-sidebar-back-btn" onClick={togglePaymentMethodsSelector}>
                        ←
                      </button>
                      <div className="device-sidebar-title-fixed">PAYMENT METHODS</div>
                    </div>
                    <div className="device-payment-methods-list">
                      <div
                        className={`device-payment-method ${getSelectedPaymentMethods().length === 0 ? 'selected' : ''}`}
                        onClick={() => togglePaymentMethod('auto')}
                      >
                        <span className="device-checkbox">{getSelectedPaymentMethods().length === 0 ? '✓' : ''}</span>
                        AUTO
                      </div>
                      {availablePaymentMethods.map(method => (
                        <div
                          key={method.id}
                          className={`device-payment-method ${getSelectedPaymentMethods().includes(method.id) ? 'selected' : ''}`}
                          onClick={() => togglePaymentMethod(method.id)}
                        >
                          <span className="device-checkbox">{getSelectedPaymentMethods().includes(method.id) ? '✓' : ''}</span>
                          {method.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
                {!isMobile && (
                  <button
                    className="device-sidebar-collapse-btn"
                    onClick={() => setSidebarCollapsed(c => !c)}
                    title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    <span className="device-sidebar-collapse-arrow">{sidebarCollapsed ? '›' : '‹'}</span>
                  </button>
                )}
              </div>
            )}

            <div className="device-main">
              {hasPendingChanges && !isHomePage && !isAboutPage && !isNetworkToolsPage && !isNetworkToolPage && activeView === 'demo' && (
                <div className="device-pending-overlay" onClick={applyPendingChanges}>
                  <div className="device-pending-message">
                    PENDING CHANGES - CLICK TO REFRESH
                  </div>
                </div>
              )}
              {clonedChildren}
            </div>
          </div>
        </div>
        </div>
        )}

        <div className="device-footer">
          <div className="device-indicators">
            <div
              className={`device-view-indicator ${activeView === 'demo' ? 'active' : ''}`}
              onClick={() => handleViewChange('demo')}
            >
              <div className="indicator-light-wrapper">
                <div className="indicator-light"></div>
              </div>
              <div className="indicator-label">DEMO</div>
            </div>
            <div
              className={`device-view-indicator ${activeView === 'code' ? 'active' : ''}`}
              onClick={() => handleViewChange('code')}
            >
              <div className="indicator-light-wrapper">
                <div className="indicator-light"></div>
              </div>
              <div className="indicator-label">CODE</div>
            </div>
            <div
              className={`device-view-indicator ${activeView === 'about' ? 'active' : ''}`}
              onClick={() => handleViewChange('about')}
            >
              <div className="indicator-light-wrapper">
                <div className="indicator-light"></div>
              </div>
              <div className="indicator-label">ABOUT</div>
            </div>
          </div>
        </div>
      </div>

      <ApiLoggerDrawer />
    </div>
    </DeviceContext.Provider>
  );
};

export default DeviceLayout;
