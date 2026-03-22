// Static imports of all snippet files for the tester app.
// React snippets are imported as modules; JS/HTML snippets use ?raw.

import CardElementReactDefault from '../../snippets/card-element/react-default/frontend.jsx';

import PaymentElementReactDefault from '../../snippets/payment-element/react-default/frontend.jsx';
import PaymentElementReactDeferred from '../../snippets/payment-element/react-deferred/frontend.jsx';

import ExpressCheckoutReactDefault from '../../snippets/express-checkout/react-default/frontend.jsx';
import ExpressCheckoutReactDeferred from '../../snippets/express-checkout/react-deferred/frontend.jsx';

import CheckoutSessionsReactDefault from '../../snippets/checkout-sessions/react-default/frontend.jsx';

import PaymentRequestButtonReactDefault from '../../snippets/payment-request-button/react-default/frontend.jsx';

import EmbeddedCheckoutReactDefault from '../../snippets/embedded-checkout/react-default/frontend.jsx';

// JS/HTML snippets (raw text for iframe injection)
import CardElementJSDefaultHTML from '../../snippets/card-element/js-default/index.html?raw';
import CardElementJSDefaultJS from '../../snippets/card-element/js-default/frontend.js?raw';

import PaymentElementJSDefaultHTML from '../../snippets/payment-element/js-default/index.html?raw';
import PaymentElementJSDefaultJS from '../../snippets/payment-element/js-default/frontend.js?raw';

import PaymentElementJSDeferredHTML from '../../snippets/payment-element/js-deferred/index.html?raw';
import PaymentElementJSDeferredJS from '../../snippets/payment-element/js-deferred/frontend.js?raw';

import ExpressCheckoutJSDefaultHTML from '../../snippets/express-checkout/js-default/index.html?raw';
import ExpressCheckoutJSDefaultJS from '../../snippets/express-checkout/js-default/frontend.js?raw';

import ExpressCheckoutJSDeferredHTML from '../../snippets/express-checkout/js-deferred/index.html?raw';
import ExpressCheckoutJSDeferredJS from '../../snippets/express-checkout/js-deferred/frontend.js?raw';

import CheckoutSessionsJSDefaultHTML from '../../snippets/checkout-sessions/js-default/index.html?raw';
import CheckoutSessionsJSDefaultJS from '../../snippets/checkout-sessions/js-default/frontend.js?raw';

import PaymentRequestButtonJSDefaultHTML from '../../snippets/payment-request-button/js-default/index.html?raw';
import PaymentRequestButtonJSDefaultJS from '../../snippets/payment-request-button/js-default/frontend.js?raw';

import EmbeddedCheckoutJSDefaultHTML from '../../snippets/embedded-checkout/js-default/index.html?raw';
import EmbeddedCheckoutJSDefaultJS from '../../snippets/embedded-checkout/js-default/frontend.js?raw';

export const reactSnippets = {
  'card-element/react-default': CardElementReactDefault,
  'payment-element/react-default': PaymentElementReactDefault,
  'payment-element/react-deferred': PaymentElementReactDeferred,
  'express-checkout/react-default': ExpressCheckoutReactDefault,
  'express-checkout/react-deferred': ExpressCheckoutReactDeferred,
  'checkout-sessions/react-default': CheckoutSessionsReactDefault,
  'payment-request-button/react-default': PaymentRequestButtonReactDefault,
  'embedded-checkout/react-default': EmbeddedCheckoutReactDefault,
};

export const jsSnippets = {
  'card-element/js-default': { html: CardElementJSDefaultHTML, js: CardElementJSDefaultJS },
  'payment-element/js-default': { html: PaymentElementJSDefaultHTML, js: PaymentElementJSDefaultJS },
  'payment-element/js-deferred': { html: PaymentElementJSDeferredHTML, js: PaymentElementJSDeferredJS },
  'express-checkout/js-default': { html: ExpressCheckoutJSDefaultHTML, js: ExpressCheckoutJSDefaultJS },
  'express-checkout/js-deferred': { html: ExpressCheckoutJSDeferredHTML, js: ExpressCheckoutJSDeferredJS },
  'checkout-sessions/js-default': { html: CheckoutSessionsJSDefaultHTML, js: CheckoutSessionsJSDefaultJS },
  'payment-request-button/js-default': { html: PaymentRequestButtonJSDefaultHTML, js: PaymentRequestButtonJSDefaultJS },
  'embedded-checkout/js-default': { html: EmbeddedCheckoutJSDefaultHTML, js: EmbeddedCheckoutJSDefaultJS },
};

export const allKeys = [
  ...Object.keys(reactSnippets).map((k) => ({ key: k, type: 'react' })),
  ...Object.keys(jsSnippets).map((k) => ({ key: k, type: 'js' })),
];
