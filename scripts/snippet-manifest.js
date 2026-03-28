module.exports = {
  'card-element': {
    'react-default': ['frontend.jsx', 'backend.js'],
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
  },
  'payment-element': {
    'react-default': ['frontend.jsx', 'backend.js'],
    'react-deferred': ['frontend.jsx', 'backend.js'],
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
    'js-deferred': ['index.html', 'frontend.js', 'backend.js'],
  },
  'express-checkout': {
    'react-default': ['frontend.jsx', 'backend.js'],
    'react-deferred': ['frontend.jsx', 'backend.js'],
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
    'js-deferred': ['index.html', 'frontend.js', 'backend.js'],
  },
  'checkout-sessions': {
    'react-default': ['frontend.jsx', 'backend.js'],
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
  },
  'payment-request-button': {
    'react-default': ['frontend.jsx', 'backend.js'],
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
  },
  'embedded-checkout': {
    'react-default': ['frontend.jsx', 'backend.js'],
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
  },
  'terminal': {
    'server': ['index.html', 'frontend.js', 'backend.js'],
  },
  'terminal-js-sdk': {
    'js': ['index.html', 'frontend.js', 'backend.js'],
  },
  'connect-embedded': {
    'js': {
      dir: 'client/src/components/integrations/connect-embedded/app',
      files: ['index.html', 'styles.css', 'frontend.js', 'server.js', 'package.json', 'README.md'],
    },
  },
  'hosted-checkout': {
    'js': {
      dir: 'client/src/components/integrations/hosted-checkout/app',
      files: ['index.html', 'styles.css', 'frontend.js', 'server.js', 'package.json', 'README.md'],
    },
  },
};
