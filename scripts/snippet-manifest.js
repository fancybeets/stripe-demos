module.exports = {
  'card-element': {
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
  },
  'payment-element': {
    'js': {
      dir: 'client/src/components/integrations/payment-element/app',
      files: ['index.html', 'styles.css', 'frontend.js', 'server.js', 'package.json', 'README.md'],
    },
    'js-deferred': {
      dir: 'client/src/components/integrations/payment-element/app-deferred',
      files: ['index.html', 'styles.css', 'frontend.js', 'server.js', 'package.json', 'README.md'],
    },
  },
  'express-checkout': {
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
    'js-deferred': ['index.html', 'frontend.js', 'backend.js'],
  },
  'checkout-sessions': {
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
  },
  'payment-request-button': {
    'js-default': ['index.html', 'frontend.js', 'backend.js'],
  },
  'embedded-checkout': {
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
