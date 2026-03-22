// Make sure to replace this with your own Stripe Sandbox publishable key.
const PUBLISHABLE_KEY = 'pk_test_...';

//////////////
// Main
//////////////

async function main() {

  // Get DOM elements
  const accountIdOutput = document.getElementById('account-result-container');
  const componentSelectorPanel = document.getElementById('component-selector-container');
  const componentDropdown = document.getElementById('component-selector');
  const connectContainer = document.getElementById('connect-container');
  const errorContainer = document.getElementById('error-container');

  // Create a connected account and display the account ID
  let accountId;

  try {
    accountId = await createConnectedAccount();
    accountIdOutput.textContent = accountId;
    componentSelectorPanel.style.display = '';
  } catch (err) {
    accountIdOutput.textContent = '';
    errorContainer.style.display = '';
    errorContainer.textContent = err.message;
    return;
  }

  // Initialize Connect.js
  const connect = StripeConnect.init({
    publishableKey: PUBLISHABLE_KEY,
    fetchClientSecret: () => fetchAccountSessionClientSecret(accountId),
  });

  const onLoadError = (loadError) => {
    errorContainer.style.display = '';
    errorContainer.textContent = `${loadError.error.message} - make sure you've replaced pk_test_... in frontend.js with your publishable key from https://dashboard.stripe.com/test/apikeys`;
  };

  // Mount the account onboarding component
  mountEmbeddedComponent(connect, 'account-onboarding', connectContainer, onLoadError);

  // Add event listener to the component dropdown
  componentDropdown.addEventListener('change', (event) => {
    mountEmbeddedComponent(connect, event.target.value, connectContainer, onLoadError);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  main();
});


//////////////
// API calls
//////////////

// Creates a connected account
async function createConnectedAccount() {
  const url = '/create-connected-account';
  const response = await fetch(url, {
    method: 'POST',
  });
  const body = await response.json();
  if (!response.ok) {
    const message = body.error?.message || `${response.status} ${response.statusText}`;
    console.error('Backend error', { url, status: response.status, message });
    throw new Error(message);
  }
  const { accountId } = body;
  return accountId;
}

// Fetches a client secret (server enables every demo component in one Account Session).
async function fetchAccountSessionClientSecret(accountId) {
  const url = '/create-account-session';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId }),
  });
  const body = await response.json();
  if (!response.ok) {
    const message = body.error?.message || `${response.status} ${response.statusText}`;
    console.error('Backend error', { url, status: response.status, message });
    throw new Error(message);
  }
  const { clientSecret } = body;
  return clientSecret;
}

//////////////
// Utilities
//////////////

// Creates and mounts an embedded component
async function mountEmbeddedComponent(connect, componentTag, mountElement, onLoadError) {
  mountElement.replaceChildren();
  try {
    const component = connect.create(componentTag);
    if (onLoadError) {
      component.setOnLoadError(onLoadError);
    }
    mountElement.appendChild(component);
  } catch (err) {
    console.error(err);
    mountElement.textContent = err.message;
  }
}
