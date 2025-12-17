/**
 * Enrichment Module - API Service
 */

import { API_ENDPOINTS, apiFetch } from '../../../core/api';

export async function fetchPortfolioMappings() {
  return await apiFetch(`${API_ENDPOINTS.ENRICHMENT.BASE}/portfolio-mappings`);
}

export async function createPortfolioMapping(mappingData) {
  return await apiFetch(`${API_ENDPOINTS.ENRICHMENT.BASE}/portfolio-mappings`, {
    method: 'POST',
    body: JSON.stringify(mappingData),
  });
}

export async function deletePortfolioMapping(mappingId) {
  return await apiFetch(`${API_ENDPOINTS.ENRICHMENT.BASE}/portfolio-mappings/${mappingId}`, {
    method: 'DELETE',
  });
}
