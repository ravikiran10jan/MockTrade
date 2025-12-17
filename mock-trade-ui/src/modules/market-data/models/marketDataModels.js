/**
 * Market Data Module - Models
 */

export const QuoteType = {
  BID: 'BID',
  ASK: 'ASK',
  LAST: 'LAST',
};

export function createEmptyPriceQuote() {
  return {
    instrument_id: '',
    bid_price: '',
    ask_price: '',
    last_price: '',
    bid_size: '',
    ask_size: '',
    volume: '',
  };
}

export function validatePriceQuote(quote) {
  const errors = [];
  
  if (!quote.instrument_id) errors.push('Instrument is required');
  if (!quote.bid_price && !quote.ask_price && !quote.last_price) {
    errors.push('At least one price (bid/ask/last) is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function formatPrice(price) {
  if (!price) return '-';
  return parseFloat(price).toFixed(2);
}
