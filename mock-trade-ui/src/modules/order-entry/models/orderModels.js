/**
 * Order Entry Module - Models
 * Defines data structures and constants for orders
 */

// Order types
export const OrderType = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  STOP: 'STOP',
  STOP_LIMIT: 'STOP_LIMIT',
};

// Order sides
export const OrderSide = {
  BUY: 'BUY',
  SELL: 'SELL',
};

// Time in force options
export const TimeInForce = {
  DAY: 'DAY',
  GTC: 'GTC', // Good Till Cancel
  IOC: 'IOC', // Immediate or Cancel
  FOK: 'FOK', // Fill or Kill
};

// Order statuses
export const OrderStatus = {
  NEW: 'NEW',
  FILLED: 'FILLED',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

// Strategy types
export const StrategyType = {
  SINGLE: 'SINGLE',
  SPREAD: 'SPREAD',
  STRADDLE: 'STRADDLE',
  STRANGLE: 'STRANGLE',
};

/**
 * Create an empty order object
 * @returns {Object} Empty order structure
 */
export function createEmptyOrder() {
  return {
    instrument_id: '',
    order_type: OrderType.LIMIT,
    side: OrderSide.BUY,
    qty: '',
    price: '',
    trader_id: '',
    account_id: '',
    broker_id: '',
    clearer_id: '',
    time_in_force: TimeInForce.DAY,
  };
}

/**
 * Create an empty strategy order structure
 * @param {string} strategyType - Type of strategy
 * @returns {Object} Empty strategy order structure
 */
export function createEmptyStrategyOrder(strategyType) {
  const base = {
    strategy_type: strategyType,
    trader_id: '',
    account_id: '',
    broker_id: '',
    clearer_id: '',
  };

  if (strategyType === StrategyType.STRADDLE) {
    return {
      ...base,
      strike: '',
      qty: '',
      call_price: '',
      put_price: '',
    };
  } else if (strategyType === StrategyType.STRANGLE) {
    return {
      ...base,
      call_strike: '',
      put_strike: '',
      qty: '',
      call_price: '',
      put_price: '',
    };
  }

  return base;
}

/**
 * Validate order data before submission
 * @param {Object} order - Order data to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
export function validateOrder(order) {
  const errors = [];

  if (!order.instrument_id) errors.push('Instrument is required');
  if (!order.trader_id) errors.push('Trader is required');
  if (!order.account_id) errors.push('Account is required');
  if (!order.qty || order.qty <= 0) errors.push('Quantity must be greater than 0');
  
  if (order.order_type === OrderType.LIMIT || order.order_type === OrderType.STOP_LIMIT) {
    if (!order.price || order.price <= 0) errors.push('Price must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format order data for API submission
 * @param {Object} order - Order data
 * @returns {Object} Formatted order for API
 */
export function formatOrderForAPI(order) {
  return {
    ...order,
    qty: parseInt(order.qty, 10),
    price: parseFloat(order.price),
  };
}
