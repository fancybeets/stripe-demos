// Initialize Stripe.js
const stripe = Stripe(window._STRIPE_PK || 'pk_test_...');

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
    const { error } = await stripe.confirmPayment({
      elements,
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
  });

  expressCheckoutElement.mount('#express-checkout-element');
}
