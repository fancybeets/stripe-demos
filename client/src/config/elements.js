export const elements = [
  {
    id: 'payment-element',
    tab: 'PAYMENT',
    title: 'Payment Element',
    description: 'All-in-one payment collection component supporting multiple payment methods',
    route: '/payment-element?implementation=react&mode=default'
  },
  {
    id: 'express-checkout',
    tab: 'EXPRESS',
    title: 'Express Checkout Element',
    description: 'One-click payment with Apple Pay, Google Pay, and Link',
    route: '/express-checkout-element?implementation=react&mode=default'
  },
  {
    id: 'checkout-sessions',
    tab: 'CHECKOUT',
    title: 'Elements + Checkout Sessions',
    description: 'Use Elements with Checkout Sessions for server-side payment tracking',
    route: '/checkout-sessions?implementation=react&mode=default'
  },
  {
    id: 'embedded-checkout',
    tab: 'EMBEDDED',
    title: 'Embedded Checkout',
    description: 'Stripe-hosted checkout UI embedded directly in your page with no redirects',
    route: '/embedded-checkout?implementation=react&mode=default'
  },
  {
    id: 'card-element',
    tab: 'CARD',
    title: 'Card Element',
    description: 'Legacy card payment component for collecting card number, expiry, and CVC',
    route: '/card-element?implementation=react&mode=default'
  },
  {
    id: 'payment-request-button',
    tab: 'PRB',
    title: 'Payment Request Button',
    description: 'Legacy single-button wallet UI using the browser Payment Request API',
    route: '/payment-request-button?implementation=react&mode=default'
  },
  {
    id: 'terminal',
    tab: 'TERMINAL',
    title: 'Terminal (Server Driven)',
    description: 'Server-driven in-person payments using a simulated reader',
    route: '/terminal-server-driven'
  },
  {
    id: 'terminal-js-sdk',
    tab: 'TERM-JS',
    title: 'Terminal (JavaScript SDK)',
    description: 'Client-side in-person payments using the Stripe Terminal JavaScript SDK',
    route: '/terminal-js-sdk'
  },
  {
    id: 'connect-embedded',
    tab: 'CONNECT',
    title: 'Connect Embedded Components',
    description: 'Stripe Connect embedded UI components for onboarding, payments, payouts, and more',
    route: '/connect-embedded'
  },
];
