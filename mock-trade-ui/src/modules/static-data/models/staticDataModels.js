/**
 * Static Data Module - Models
 * Defines data structures and constants for static data entities
 */

// Entity types
export const EntityType = {
  INSTRUMENT: 'INSTRUMENT',
  TRADER: 'TRADER',
  ACCOUNT: 'ACCOUNT',
  BROKER: 'BROKER',
  CLEARER: 'CLEARER',
  PORTFOLIO: 'PORTFOLIO',
};

// Instrument types
export const InstrumentType = {
  EQUITY: 'EQUITY',
  OPTION: 'OPTION',
  FUTURE: 'FUTURE',
  FX: 'FX',
  BOND: 'BOND',
};

// Option types
export const OptionType = {
  CALL: 'CALL',
  PUT: 'PUT',
};

/**
 * Create empty instrument object
 * @returns {Object} Empty instrument structure
 */
export function createEmptyInstrument() {
  return {
    instrument_id: '',
    symbol: '',
    instrument_name: '',
    instrument_type: InstrumentType.EQUITY,
    exchange: '',
    currency: 'USD',
    lot_size: 1,
    tick_size: 0.01,
    description: '',
  };
}

/**
 * Create empty trader object
 * @returns {Object} Empty trader structure
 */
export function createEmptyTrader() {
  return {
    trader_id: '',
    trader_name: '',
    email: '',
    desk: '',
    status: 'ACTIVE',
  };
}

/**
 * Create empty account object
 * @returns {Object} Empty account structure
 */
export function createEmptyAccount() {
  return {
    account_id: '',
    account_code: '',
    account_name: '',
    account_type: 'TRADING',
    status: 'ACTIVE',
  };
}

/**
 * Create empty broker object
 * @returns {Object} Empty broker structure
 */
export function createEmptyBroker() {
  return {
    broker_id: '',
    broker_name: '',
    broker_code: '',
    status: 'ACTIVE',
  };
}

/**
 * Create empty clearer object
 * @returns {Object} Empty clearer structure
 */
export function createEmptyClearer() {
  return {
    clearer_id: '',
    clearer_name: '',
    clearer_code: '',
    status: 'ACTIVE',
  };
}

/**
 * Create empty portfolio object
 * @returns {Object} Empty portfolio structure
 */
export function createEmptyPortfolio() {
  return {
    portfolio_id: '',
    portfolio_name: '',
    description: '',
    status: 'ACTIVE',
  };
}

/**
 * Validate instrument data
 * @param {Object} instrument - Instrument data
 * @returns {Object} {valid: boolean, errors: Array}
 */
export function validateInstrument(instrument) {
  const errors = [];

  if (!instrument.instrument_id) errors.push('Instrument ID is required');
  if (!instrument.symbol) errors.push('Symbol is required');
  if (!instrument.instrument_name) errors.push('Instrument name is required');
  if (!instrument.instrument_type) errors.push('Instrument type is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate trader data
 * @param {Object} trader - Trader data
 * @returns {Object} {valid: boolean, errors: Array}
 */
export function validateTrader(trader) {
  const errors = [];

  if (!trader.trader_id) errors.push('Trader ID is required');
  if (!trader.trader_name) errors.push('Trader name is required');
  if (trader.email && !isValidEmail(trader.email)) errors.push('Invalid email format');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate account data
 * @param {Object} account - Account data
 * @returns {Object} {valid: boolean, errors: Array}
 */
export function validateAccount(account) {
  const errors = [];

  if (!account.account_id) errors.push('Account ID is required');
  if (!account.account_code) errors.push('Account code is required');
  if (!account.account_name) errors.push('Account name is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Simple email validation
 * @param {string} email - Email address
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
