let readerId = null;
let paymentIntentId = null;
let pollInterval = null;

const btn = {
  createReader: document.getElementById('btn-create-reader'),
  createPi:     document.getElementById('btn-create-pi'),
  process:      document.getElementById('btn-process'),
  simulate:     document.getElementById('btn-simulate'),
  cancel:       document.getElementById('btn-cancel'),
  capture:      document.getElementById('btn-capture'),
  reset:        document.getElementById('btn-reset'),
};

btn.createReader.addEventListener('click', createReader);
btn.createPi.addEventListener('click', createPaymentIntent);
btn.process.addEventListener('click', processPaymentIntent);
btn.simulate.addEventListener('click', simulateTap);
btn.cancel.addEventListener('click', cancelReaderAction);
btn.capture.addEventListener('click', capturePayment);
btn.reset.addEventListener('click', reset);

function log(msg) {
  const el = document.getElementById('log');
  el.textContent += msg + '\n';
}

function post(endpoint, body) {
  return fetch(`/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

async function createReader() {
  btn.createReader.disabled = true;
  const data = await post('create-reader', { country: 'US' });
  readerId = data.readerId;
  log('Reader created: ' + readerId);
  btn.createPi.disabled = false;
  btn.reset.disabled = false;
}

async function createPaymentIntent() {
  btn.createPi.disabled = true;
  const data = await post('create-payment-intent', { amount: 4242, currency: 'usd' });
  paymentIntentId = data.paymentIntentId;
  log('Payment intent created: ' + paymentIntentId);
  btn.process.disabled = false;
}

async function processPaymentIntent() {
  btn.process.disabled = true;
  await post('process-payment-intent', { readerId, paymentIntentId });
  log('Sent to reader — waiting for card...');
  btn.simulate.disabled = false;
  btn.cancel.disabled = false;
}

async function simulateTap() {
  btn.simulate.disabled = true;
  btn.cancel.disabled = true;
  await post('simulate-tap', { readerId });
  log('Card tapped — polling for authorization...');

  pollInterval = setInterval(async () => {
    const data = await post('reader-status', { readerId });
    if (data.actionStatus === 'succeeded') {
      stopPolling();
      log('Payment authorized — ready to capture');
      btn.capture.disabled = false;
    } else if (data.actionStatus === 'failed') {
      stopPolling();
      log('Authorization failed');
      btn.reset.disabled = false;
    }
  }, 1500);
}

async function cancelReaderAction() {
  btn.simulate.disabled = true;
  btn.cancel.disabled = true;
  await post('cancel-reader-action', { readerId });
  log('Reader action cancelled');
  paymentIntentId = null;
  btn.createPi.disabled = false;
}

async function capturePayment() {
  btn.capture.disabled = true;
  const data = await post('capture-payment-intent', { paymentIntentId });
  log('Payment captured: ' + data.paymentIntent.id + ' (' + data.paymentIntent.status + ')');
}

function reset() {
  stopPolling();
  paymentIntentId = null;
  btn.createPi.disabled = readerId ? false : true;
  btn.process.disabled = true;
  btn.simulate.disabled = true;
  btn.cancel.disabled = true;
  btn.capture.disabled = true;
  log('--- reset ---');
}
