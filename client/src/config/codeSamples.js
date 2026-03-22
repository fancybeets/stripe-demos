export const codeSamples = {
  paymentElement: {
    reactDefault: {
      frontend: `import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/completion',
      },
    });

    if (error) {
      setMessage(error.message);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={isLoading || !stripe || !elements}>
        {isLoading ? 'Processing...' : 'Pay now'}
      </button>
      {message && <div>{message}</div>}
    </form>
  );
};

export default function App() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch('/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'xl-tshirt' }] }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const options = { clientSecret };

  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}`,
      backend: `const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;

  // Calculate order amount
  const calculateOrderAmount = (items) => {
    // Replace with your actual order amount calculation
    return 1400;
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));`
    },
    reactDeferred: {
      frontend: `import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Create PaymentIntent on submit
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1400,
          currency: 'usd'
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment with clientSecret
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/completion',
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Payment authorized! (Capture required)');
      }
    } catch (err) {
      setMessage(err.message);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={isLoading || !stripe || !elements}>
        {isLoading ? 'Processing...' : 'Pay now'}
      </button>
      {message && <div>{message}</div>}
    </form>
  );
};

export default function App() {
  const options = {
    mode: 'payment',
    amount: 1400,
    currency: 'usd',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}`,
      backend: `const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

// Capture the payment later
app.post('/capture-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.capture(
      paymentIntentId
    );
    res.send({ paymentIntent });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));`
    },
    jsDefault: {
      html: `<!DOCTYPE html>
<html>
  <head>
    <script src="https://js.stripe.com/v3/"></script>
  </head>
  <body>
    <form id="payment-form">
      <div id="payment-element"></div>
      <button id="submit">Pay now</button>
      <div id="payment-message"></div>
    </form>
    <script src="checkout.js"></script>
  </body>
</html>`,
      frontend: `// Initialize Stripe.js
const stripe = Stripe('pk_test_...');

let elements;

initialize();

document
  .querySelector('#payment-form')
  .addEventListener('submit', handleSubmit);

async function initialize() {
  const response = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: 'xl-tshirt' }] }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.origin + '/completion',
    },
  });

  if (error) {
    const messageContainer = document.querySelector('#payment-message');
    messageContainer.textContent = error.message;
  }

  setLoading(false);
}

function setLoading(isLoading) {
  const submitButton = document.querySelector('#submit');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Processing...' : 'Pay now';
}`,
      backend: `const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;

  const calculateOrderAmount = (items) => {
    return 1400;
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));`
    },
    jsDeferred: {
      html: `<!DOCTYPE html>
<html>
  <head>
    <script src="https://js.stripe.com/v3/"></script>
  </head>
  <body>
    <form id="payment-form">
      <div id="payment-element"></div>
      <button id="submit">Pay now</button>
      <div id="payment-message"></div>
    </form>
    <script src="checkout.js"></script>
  </body>
</html>`,
      frontend: `// Initialize Stripe.js
const stripe = Stripe('pk_test_...');

let elements;

initialize();

document
  .querySelector('#payment-form')
  .addEventListener('submit', handleSubmit);

async function initialize() {
  const appearance = {
    theme: 'stripe',
  };

  // Initialize with mode: 'payment'
  elements = stripe.elements({
    mode: 'payment',
    amount: 1400,
    currency: 'usd',
    appearance
  });

  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    // Create PaymentIntent on submit
    const response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1400,
        currency: 'usd'
      }),
    });

    const { clientSecret } = await response.json();

    // Confirm payment with clientSecret
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin + '/completion',
      },
      redirect: 'if_required',
    });

    if (error) {
      const messageContainer = document.querySelector('#payment-message');
      messageContainer.textContent = error.message;
    } else {
      const messageContainer = document.querySelector('#payment-message');
      messageContainer.textContent = 'Payment authorized! (Capture required)';
    }
  } catch (err) {
    const messageContainer = document.querySelector('#payment-message');
    messageContainer.textContent = err.message;
  }

  setLoading(false);
}

function setLoading(isLoading) {
  const submitButton = document.querySelector('#submit');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Processing...' : 'Pay now';
}`,
      backend: `const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

// Capture the payment later
app.post('/capture-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.capture(
      paymentIntentId
    );
    res.send({ paymentIntent });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));`
    }
  },
  expressCheckout: {
    reactDefault: {
      frontend: `import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ExpressCheckoutElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

const CheckoutForm = () => {
  const [message, setMessage] = useState('');

  const onConfirm = async (event) => {
    const { error: submitError } = await event.resolve();

    if (submitError) {
      setMessage(submitError.message);
      return;
    }

    setMessage('Payment successful!');
  };

  const onClick = (event) => {
    // Optional: Inspect the button that was clicked
    console.log('Button clicked:', event.expressPaymentType);
  };

  return (
    <>
      <ExpressCheckoutElement
        onConfirm={onConfirm}
        onClick={onClick}
        options={{
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          },
        }}
      />
      {message && <div>{message}</div>}
    </>
  );
};

export default function App() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch('/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'xl-tshirt' }] }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const options = { clientSecret };

  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}`,
      backend: `const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;

  const calculateOrderAmount = (items) => {
    return 1400;
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));`
    },
    reactDeferred: {
      frontend: `import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ExpressCheckoutElement, useStripe } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

const CheckoutForm = () => {
  const stripe = useStripe();
  const [message, setMessage] = useState('');

  const onConfirm = async (event) => {
    setMessage('');

    try {
      // Create PaymentIntent on confirm
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1400,
          currency: 'usd'
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment with clientSecret
      const { error } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Payment authorized! (Capture required)');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <ExpressCheckoutElement
        onConfirm={onConfirm}
        options={{
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          },
        }}
      />
      {message && <div>{message}</div>}
    </>
  );
};

export default function App() {
  const options = {
    mode: 'payment',
    amount: 1400,
    currency: 'usd',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}`,
      backend: `const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

// Capture the payment later
app.post('/capture-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.capture(
      paymentIntentId
    );
    res.send({ paymentIntent });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));`
    },
    jsDefault: {
      html: `<!DOCTYPE html>
<html>
  <head>
    <script src="https://js.stripe.com/v3/"></script>
  </head>
  <body>
    <div id="express-checkout-element"></div>
    <div id="error-message"></div>
    <div id="success-message"></div>
    <script src="checkout.js"></script>
  </body>
</html>`,
      frontend: `// Initialize Stripe.js
const stripe = Stripe('pk_test_...');

let elements;

initialize();

async function initialize() {
  const response = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: 'xl-tshirt' }] }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const expressCheckoutElement = elements.create('expressCheckout', {
    buttonType: {
      applePay: 'buy',
      googlePay: 'buy',
    },
  });

  expressCheckoutElement.on('confirm', async (event) => {
    const { error: submitError } = await event.resolve();

    if (submitError) {
      const messageContainer = document.querySelector('#error-message');
      messageContainer.textContent = submitError.message;
    } else {
      const messageContainer = document.querySelector('#success-message');
      messageContainer.textContent = 'Payment successful!';
    }
  });

  expressCheckoutElement.mount('#express-checkout-element');
}`,
      backend: `const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;

  const calculateOrderAmount = (items) => {
    return 1400;
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));`
    },
    jsDeferred: {
      html: `<!DOCTYPE html>
<html>
  <head>
    <script src="https://js.stripe.com/v3/"></script>
  </head>
  <body>
    <div id="express-checkout-element"></div>
    <div id="error-message"></div>
    <div id="success-message"></div>
    <script src="checkout.js"></script>
  </body>
</html>`,
      frontend: `// Initialize Stripe.js
const stripe = Stripe('pk_test_...');

let elements;

initialize();

async function initialize() {
  const appearance = {
    theme: 'stripe',
  };

  // Initialize with mode: 'payment'
  elements = stripe.elements({
    mode: 'payment',
    amount: 1400,
    currency: 'usd',
    appearance
  });

  const expressCheckoutElement = elements.create('expressCheckout', {
    buttonType: {
      applePay: 'buy',
      googlePay: 'buy',
    },
  });

  expressCheckoutElement.on('confirm', async (event) => {
    try {
      // Create PaymentIntent on confirm
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1400,
          currency: 'usd'
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment with clientSecret
      const { error } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        const messageContainer = document.querySelector('#error-message');
        messageContainer.textContent = error.message;
      } else {
        const messageContainer = document.querySelector('#success-message');
        messageContainer.textContent = 'Payment authorized! (Capture required)';
      }
    } catch (err) {
      const messageContainer = document.querySelector('#error-message');
      messageContainer.textContent = err.message;
    }
  });

  expressCheckoutElement.mount('#express-checkout-element');
}`,
      backend: `const stripe = require('stripe')('sk_test_...');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'manual',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

// Capture the payment later
app.post('/capture-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.capture(
      paymentIntentId
    );
    res.send({ paymentIntent });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));`
    }
  }
};
