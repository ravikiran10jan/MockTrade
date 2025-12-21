/**
 * Trade Query Module - API Service
 * Handles all API calls for trade query functionality
 */

import { API_ENDPOINTS, getAuthHeaders, apiFetch } from '../../../core/api';

/**
 * Fetch enriched trades with portfolio and instrument data
 * @returns {Promise<Array>} List of enriched trades
 */
export async function fetchEnrichedTrades() {
  return await apiFetch(API_ENDPOINTS.TRADE_QUERY.ENRICHED_TRADES, {
    method: 'GET',
  });
}

/**
 * Fetch enriched orders with portfolio and instrument data
 * @returns {Promise<Array>} List of enriched orders
 */
export async function fetchEnrichedOrders() {
  return await apiFetch(API_ENDPOINTS.TRADE_QUERY.ENRICHED_ORDERS, {
    method: 'GET',
  });
}

/**
 * Cancel a trade
 * @param {string} tradeId - Trade identifier
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancellation response
 */
export async function cancelTrade(tradeId, reason = 'User requested cancellation') {
  const url = `${API_ENDPOINTS.TRADES}/${tradeId}/cancel?reason=${encodeURIComponent(reason)}`;
  return await apiFetch(url, {
    method: 'POST',
  });
}

/**
 * Expire a trade
 * @param {string} tradeId - Trade identifier
 * @returns {Promise<Object>} Expiration response
 */
export async function expireTrade(tradeId) {
  const url = `${API_ENDPOINTS.TRADES}/${tradeId}/expire`;
  return await apiFetch(url, {
    method: 'POST',
  });
}

/**
 * Undo a trade cancellation or expiration
 * @param {string} tradeId - Trade identifier
 * @returns {Promise<Object>} Undo response
 */
export async function undoTrade(tradeId) {
  const url = `${API_ENDPOINTS.TRADES}/${tradeId}/undo`;
  return await apiFetch(url, {
    method: 'POST',
  });
}

/**
 * Fetch audit trail for a trade
 * @param {string} tradeId - Trade identifier
 * @returns {Promise<Array>} List of audit trail entries
 */
export async function fetchTradeAuditTrail(tradeId) {
  const url = `${API_ENDPOINTS.TRADES}/${tradeId}/audit-trail`;
  return await apiFetch(url, {
    method: 'GET',
  });
}

export default {
  fetchEnrichedTrades,
  fetchEnrichedOrders,
  cancelTrade,
  expireTrade,
  undoTrade,
  fetchTradeAuditTrail,
};
