// Initialize Stripe.js
const stripe = Stripe(window._STRIPE_PK || 'pk_test_...');

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
      // Submit form to validate fields
      const { error: submitError } = await elements.submit();
      if (submitError) {
        const messageContainer = document.querySelector('#error-message');
        messageContainer.textContent = submitError.message;
        return;
      }

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
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/completion',
        },
        redirect: 'if_required',
      });

      if (error) {
        const messageContainer = document.querySelector('#error-message');
        messageContainer.textContent = error.message;
      } else {
        const messageContainer = document.querySelector('#success-message');
        messageContainer.textContent = 'Payment successful!';
      }
    } catch (err) {
      const messageContainer = document.querySelector('#error-message');
      messageContainer.textContent = err.message;
    }
  });

  expressCheckoutElement.mount('#express-checkout-element');
}
