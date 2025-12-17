/**
 * Static Data Module - API Service
 * Handles all API calls for static data management
 */

import { API_ENDPOINTS, apiFetch } from '../../../core/api';

/**
 * Fetch all instruments
 * @returns {Promise<Array>} List of instruments
 */
export async function fetchInstruments() {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.INSTRUMENTS, {
    method: 'GET',
  });
}

/**
 * Create a new instrument
 * @param {Object} instrumentData - Instrument data
 * @returns {Promise<Object>} Created instrument
 */
export async function createInstrument(instrumentData) {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.INSTRUMENTS, {
    method: 'POST',
    body: JSON.stringify(instrumentData),
  });
}

/**
 * Update an instrument
 * @param {string} instrumentId - Instrument identifier
 * @param {Object} instrumentData - Updated instrument data
 * @returns {Promise<Object>} Updated instrument
 */
export async function updateInstrument(instrumentId, instrumentData) {
  return await apiFetch(`${API_ENDPOINTS.STATIC_DATA.INSTRUMENTS}/${instrumentId}`, {
    method: 'PUT',
    body: JSON.stringify(instrumentData),
  });
}

/**
 * Delete an instrument
 * @param {string} instrumentId - Instrument identifier
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteInstrument(instrumentId) {
  return await apiFetch(`${API_ENDPOINTS.STATIC_DATA.INSTRUMENTS}/${instrumentId}`, {
    method: 'DELETE',
  });
}

// Traders API
export async function fetchTraders() {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.TRADERS);
}

export async function createTrader(traderData) {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.TRADERS, {
    method: 'POST',
    body: JSON.stringify(traderData),
  });
}

export async function updateTrader(traderId, traderData) {
  return await apiFetch(`${API_ENDPOINTS.STATIC_DATA.TRADERS}/${traderId}`, {
    method: 'PUT',
    body: JSON.stringify(traderData),
  });
}

export async function deleteTrader(traderId) {
  return await apiFetch(`${API_ENDPOINTS.STATIC_DATA.TRADERS}/${traderId}`, {
    method: 'DELETE',
  });
}

// Accounts API
export async function fetchAccounts() {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.ACCOUNTS);
}

export async function createAccount(accountData) {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.ACCOUNTS, {
    method: 'POST',
    body: JSON.stringify(accountData),
  });
}

export async function updateAccount(accountId, accountData) {
  return await apiFetch(`${API_ENDPOINTS.STATIC_DATA.ACCOUNTS}/${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(accountData),
  });
}

export async function deleteAccount(accountId) {
  return await apiFetch(`${API_ENDPOINTS.STATIC_DATA.ACCOUNTS}/${accountId}`, {
    method: 'DELETE',
  });
}

// Brokers API
export async function fetchBrokers() {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.BROKERS);
}

export async function createBroker(brokerData) {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.BROKERS, {
    method: 'POST',
    body: JSON.stringify(brokerData),
  });
}

// Clearers API
export async function fetchClearers() {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.CLEARERS);
}

export async function createClearer(clearerData) {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.CLEARERS, {
    method: 'POST',
    body: JSON.stringify(clearerData),
  });
}

// Portfolios API
export async function fetchPortfolios() {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.PORTFOLIOS);
}

export async function createPortfolio(portfolioData) {
  return await apiFetch(API_ENDPOINTS.STATIC_DATA.PORTFOLIOS, {
    method: 'POST',
    body: JSON.stringify(portfolioData),
  });
}
