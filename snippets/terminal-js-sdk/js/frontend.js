import { loadStripeTerminal } from '@stripe/terminal-js';

const API = '/terminal-js-sdk';

let terminal = null;
let paymentIntent = null;

const btn = {
  connect:       document.getElementById('btn-connect'),
  createPi:      document.getElementById('btn-create-pi'),
  collect:       document.getElementById('btn-collect'),
  cancelCollect: document.getElementById('btn-cancel-collect'),
  process:       document.getElementById('btn-process'),
  capture:       document.getElementById('btn-capture'),
  reset:         document.getElementById('btn-reset'),
};

btn.connect.addEventListener('click', connect);
btn.createPi.addEventListener('click', createPaymentIntent);
btn.collect.addEventListener('click', collectPaymentMethod);
btn.cancelCollect.addEventListener('click', cancelCollect);
btn.process.addEventListener('click', processPayment);
btn.capture.addEventListener('click', capturePayment);
btn.reset.addEventListener('click', reset);

function log(msg) {
  const el = document.getElementById('log');
  el.textContent += msg + '\n';
}

function post(endpoint, body = {}) {
  return fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

async function connect() {
  btn.connect.disabled = true;

  const StripeTerminal = await loadStripeTerminal();
  terminal = StripeTerminal.create({
    onFetchConnectionToken: async () => {
      const data = await post('connection-token');
      return data.secret;
    },
    onUnexpectedReaderDisconnect: () => log('Reader disconnected unexpectedly'),
  });

  const { discoveredReaders, error: discoverError } = await terminal.discoverReaders({ simulated: true });
  if (discoverError) { log('Discover error: ' + discoverError.message); return; }
  log('Found ' + discoveredReaders.length + ' reader(s)');

  const { reader, error: connectError } = await terminal.connectReader(discoveredReaders[0]);
  if (connectError) { log('Connect error: ' + connectError.message); return; }
  log('Connected: ' + reader.id);

  btn.createPi.disabled = false;
  btn.reset.disabled = false;
}

async function createPaymentIntent() {
  btn.createPi.disabled = true;
  const data = await post('create-payment-intent', { amount: 4242, currency: 'usd' });
  paymentIntent = { id: data.paymentIntentId, client_secret: data.clientSecret };
  log('Payment intent created: ' + paymentIntent.id);
  btn.collect.disabled = false;
}

async function collectPaymentMethod() {
  btn.collect.disabled = true;
  btn.cancelCollect.disabled = false;

  const { paymentIntent: pi, error } = await terminal.collectPaymentMethod(paymentIntent.client_secret);
  btn.cancelCollect.disabled = true;

  if (error) {
    log('Collect error: ' + error.message);
    btn.collect.disabled = false;
    return;
  }

  paymentIntent = pi;
  log('Card collected — ready to process');
  btn.process.disabled = false;
}

async function cancelCollect() {
  btn.cancelCollect.disabled = true;
  const { error } = await terminal.cancelCollectPaymentMethod();
  if (error) { log('Cancel error: ' + error.message); return; }
  log('Collection cancelled');
  btn.collect.disabled = false;
}

async function processPayment() {
  btn.process.disabled = true;
  const { paymentIntent: pi, error } = await terminal.processPayment(paymentIntent);
  if (error) {
    log('Process error: ' + error.message);
    return;
  }
  paymentIntent = pi;
  log('Payment authorized — ready to capture');
  btn.capture.disabled = false;
}

async function capturePayment() {
  btn.capture.disabled = true;
  const data = await post('capture-payment-intent', { paymentIntentId: paymentIntent.id });
  log('Payment captured: ' + data.paymentIntent.id + ' (' + data.paymentIntent.status + ')');
}

function reset() {
  paymentIntent = null;
  btn.createPi.disabled = terminal ? false : true;
  btn.collect.disabled = true;
  btn.cancelCollect.disabled = true;
  btn.process.disabled = true;
  btn.capture.disabled = true;
  log('--- reset ---');
}
