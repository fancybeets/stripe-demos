/**
 * Formats currency amounts with proper symbols and decimal handling
 * @param {string|number} amount - Amount in cents (or smallest currency unit)
 * @param {string} currency - Currency code (e.g., 'usd', 'eur', 'jpy')
 * @returns {string} Formatted currency string (e.g., "$20.00", "€20.00", "¥2000")
 */
export const formatCurrency = (amount, currency) => {
  const amountNum = parseInt(amount);
  const currencyLower = currency.toLowerCase();

  // Zero-decimal currencies (no cents/fractional units)
  const zeroDecimalCurrencies = ['jpy', 'krw', 'clp', 'pyg', 'vnd', 'xaf', 'xof', 'xpf'];

  // Currency symbols mapping
  const currencySymbols = {
    usd: 'US$',
    eur: '€',
    gbp: '£',
    jpy: '¥',
    mxn: 'MX$',
    cad: 'CA$',
    aud: 'A$',
    nzd: 'NZ$',
    chf: 'CHF ',
    sek: 'kr',
    nok: 'kr',
    dkk: 'kr',
    pln: 'zł',
    czk: 'Kč',
    huf: 'Ft',
    inr: '₹',
    brl: 'R$',
    krw: '₩',
    cny: '¥',
    hkd: 'HK$',
    sgd: 'S$',
    thb: '฿',
    myr: 'RM',
    idr: 'Rp',
    php: '₱',
    twd: 'NT$',
    zar: 'R',
    try: '₺',
  };

  // Get currency symbol, default to currency code if not found
  const symbol = currencySymbols[currencyLower] || currencyLower.toUpperCase();

  // Handle zero-decimal currencies
  if (zeroDecimalCurrencies.includes(currencyLower)) {
    return `${symbol}${amountNum.toLocaleString()}`;
  }

  // Handle standard currencies with decimals
  const amountInMajorUnits = (amountNum / 100).toFixed(2);
  return `${symbol}${amountInMajorUnits}`;
};
