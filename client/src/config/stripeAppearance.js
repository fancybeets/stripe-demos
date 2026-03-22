const apocalypseAppearance = {
  theme: 'none',
  variables: {
    colorPrimary: '#ffb000',
    colorBackground: '#0a0a0a',
    colorText: '#ffb000',
    colorDanger: '#ff0000',
    fontFamily: 'Courier New, monospace',
    spacingUnit: '4px',
    borderRadius: '0px',
  },
  rules: {
    '.Block': {
      backgroundColor: '#0a0a0a',
      border: 'none',
    },
    '.Input': {
      border: 'none',
      boxShadow: 'none',
      padding: '10px',
      backgroundColor: '#0a0a0a',
      color: '#ffb000',
      fontFamily: 'Courier New, monospace',
    },
    '.Input:focus': {
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
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
      height: '32px',
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
    '.Error': {
      color: '#ff4444',
      textShadow: '0 0 3px rgba(255, 68, 68, 0.5)',
    },
  },
};

const simpleAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#635BFF',
    colorBackground: '#ffffff',
    colorText: '#1a1a1a',
    colorDanger: '#e53e3e',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    spacingUnit: '4px',
    borderRadius: '4px',
  },
};

const darkAppearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#a78bfa',
    colorBackground: '#1e1e2e',
    colorText: '#c0beff',
    colorDanger: '#f87171',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    spacingUnit: '4px',
    borderRadius: '4px',
  },
};

// For use in non-React (vanilla JS) demos
export const getStripeAppearance = () => {
  const theme = localStorage.getItem('theme') || 'apocalypse';
  if (theme === 'simple') return simpleAppearance;
  if (theme === 'dark') return darkAppearance;
  return apocalypseAppearance;
};

// Legacy static export (apocalypse only) — kept for backwards compatibility
export const stripeAppearance = apocalypseAppearance;
