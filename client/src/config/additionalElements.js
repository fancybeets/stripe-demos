export const AVAILABLE_ADDITIONAL_ELEMENTS = {
  'PAYMENT': [
    {
      id: 'express',
      name: 'Express Checkout',
      requiresClientSecret: true,
      elementType: 'expressCheckout'
    },
    {
      id: 'shipping',
      name: 'Shipping Address',
      requiresClientSecret: false,
      elementType: 'address',
      elementOptions: { mode: 'shipping' }
    },
    {
      id: 'billing',
      name: 'Billing Address',
      requiresClientSecret: false,
      elementType: 'address',
      elementOptions: { mode: 'billing' }
    }
  ],
  // Future expansion: add 'EXPRESS', 'CHECKOUT', etc.
};

export const getAvailableAdditionalElements = (pageId) => {
  return AVAILABLE_ADDITIONAL_ELEMENTS[pageId] || [];
};
