/**
 * Trade Query Module - Models
 * Defines data structures and constants for trades and orders
 */

// Trade statuses
export const TradeStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  SETTLED: 'SETTLED',
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

// All possible statuses for filtering
export const AllStatuses = {
  ALL: 'ALL',
  ...TradeStatus,
  ...OrderStatus,
};

/**
 * Get status color styling based on status value
 * @param {string} status - Status value
 * @returns {Object} Color configuration {bg, text, border}
 */
export function getStatusColor(status) {
  switch (status) {
    case TradeStatus.ACTIVE:
    case OrderStatus.FILLED:
      return { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' };
    case OrderStatus.NEW:
    case OrderStatus.PARTIALLY_FILLED:
      return { bg: '#fef3c7', text: '#78350f', border: '#fde68a' };
    case TradeStatus.CANCELLED:
    case OrderStatus.CANCELLED:
      return { bg: '#fee2e2', text: '#7f1d1d', border: '#fecaca' };
    case TradeStatus.EXPIRED:
    case OrderStatus.EXPIRED:
      return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    case TradeStatus.SETTLED:
      return { bg: '#dbeafe', text: '#1e3a8a', border: '#bfdbfe' };
    default:
      return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
  }
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '-';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
