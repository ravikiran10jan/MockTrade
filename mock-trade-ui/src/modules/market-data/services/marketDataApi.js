/**
 * Market Data Module - API Service
 */

import { API_ENDPOINTS, apiFetch } from '../../../core/api';

export async function fetchPriceQuotes(instrumentId = null) {
  const url = instrumentId 
    ? `${API_ENDPOINTS.MARKET_DATA.BASE}/quotes?instrument_id=${instrumentId}`
    : `${API_ENDPOINTS.MARKET_DATA.BASE}/quotes`;
  return await apiFetch(url);
}

export async function createPriceQuote(quoteData) {
  return await apiFetch(`${API_ENDPOINTS.MARKET_DATA.BASE}/quotes`, {
    method: 'POST',
    body: JSON.stringify(quoteData),
  });
}

export async function getLatestQuote(instrumentId) {
  return await apiFetch(`${API_ENDPOINTS.MARKET_DATA.BASE}/quotes/${instrumentId}/latest`);
}
