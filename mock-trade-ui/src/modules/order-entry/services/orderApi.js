/**
 * Order Entry Module - API Service
 * Handles all API calls for order management
 */

import { API_ENDPOINTS, apiFetch } from '../../../core/api';

/**
 * Submit a new order
 * @param {Object} orderData - Order data to submit
 * @returns {Promise<Object>} Created order
 */
export async function submitOrder(orderData) {
  return await apiFetch(API_ENDPOINTS.ORDERS, {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

/**
 * Fetch all orders
 * @returns {Promise<Array>} List of orders
 */
export async function fetchOrders() {
  return await apiFetch(API_ENDPOINTS.ORDERS, {
    method: 'GET',
  });
}

/**
 * Fill an order (simulate order execution)
 * @param {string} orderId - Order identifier
 * @param {number} fillQty - Quantity to fill
 * @param {number} fillPrice - Fill price
 * @returns {Promise<Object>} Fill response
 */
export async function fillOrder(orderId, fillQty, fillPrice) {
  return await apiFetch(`${API_ENDPOINTS.ORDERS}/${orderId}/fill`, {
    method: 'POST',
    body: JSON.stringify({
      fill_qty: fillQty,
      fill_price: fillPrice,
    }),
  });
}

/**
 * Cancel an order
 * @param {string} orderId - Order identifier
 * @returns {Promise<Object>} Cancellation response
 */
export async function cancelOrder(orderId) {
  return await apiFetch(`${API_ENDPOINTS.ORDERS}/${orderId}/cancel`, {
    method: 'POST',
  });
}

/**
 * Fetch static data for dropdowns
 * @returns {Promise<Object>} Object with instruments, traders, accounts, etc.
 */
export async function fetchStaticData() {
  const [instruments, traders, accounts, brokers, clearers] = await Promise.all([
    apiFetch(API_ENDPOINTS.STATIC_DATA.INSTRUMENTS),
    apiFetch(API_ENDPOINTS.STATIC_DATA.TRADERS),
    apiFetch(API_ENDPOINTS.STATIC_DATA.ACCOUNTS),
    apiFetch(API_ENDPOINTS.STATIC_DATA.BROKERS),
    apiFetch(API_ENDPOINTS.STATIC_DATA.CLEARERS),
  ]);

  return {
    instruments: Array.isArray(instruments) ? instruments : [],
    traders: Array.isArray(traders) ? traders : [],
    accounts: Array.isArray(accounts) ? accounts : [],
    brokers: Array.isArray(brokers) ? brokers : [],
    clearers: Array.isArray(clearers) ? clearers : [],
  };
}
