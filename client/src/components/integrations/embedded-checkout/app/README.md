# Stripe Embedded Checkout Demo

A minimal Express + vanilla JS app that demonstrates Stripe's Embedded Checkout (`ui_mode: 'embedded'`).

## Setup

1. Ensure you have a [Node.js installation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
2. Download the project, unzip it, and `cd` into the project folder.
3. Open the project in your text editor of choice (e.g. `code .`, `cursor .`)
4. Create or log into your Stripe sandbox account, then get your API keys from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys).
5. Replace `sk_test_...` in `server.js` with your Sandbox secret key.
6. Replace `pk_test_...` in `frontend.js` with your Sandbox publishable key.
7. Install dependencies and start the server: `npm install && npm start`
8. Open [http://localhost:4242](http://localhost:4242) in a browser.
