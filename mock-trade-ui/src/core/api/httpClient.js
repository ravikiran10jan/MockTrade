/**
 * Core HTTP Client
 * Provides base fetch functionality with authentication headers and error handling
 */

import { API_BASE } from './config';

/**
 * Get authentication headers from localStorage
 * @returns {Object} Headers object with authentication token
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Enhanced fetch with authentication and error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function apiFetch(url, options = {}) {
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.detail || error.message || `Request failed with status ${response.status}`);
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

/**
 * GET request
 */
export async function get(url, options = {}) {
  return apiFetch(url, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function post(url, data, options = {}) {
  return apiFetch(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function put(url, data, options = {}) {
  return apiFetch(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function del(url, options = {}) {
  return apiFetch(url, { ...options, method: 'DELETE' });
}

export default {
  API_BASE,
  getAuthHeaders,
  apiFetch,
  get,
  post,
  put,
  del,
};
