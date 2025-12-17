/**
 * Core API Configuration
 * Centralized API base URL and configuration
 */

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE}/api/v1/auth/login`,
    LOGOUT: `${API_BASE}/api/v1/auth/logout`,
    ME: `${API_BASE}/api/v1/auth/me`,
  },
  
  // Orders
  ORDERS: `${API_BASE}/order`,
  
  // Trades
  TRADES: `${API_BASE}/api/v1/trades`,
  
  // Trade Query
  TRADE_QUERY: {
    ENRICHED_TRADES: `${API_BASE}/api/v1/trade-query/enriched-trades`,
    ENRICHED_ORDERS: `${API_BASE}/api/v1/trade-query/enriched-orders`,
  },
  
  // Static Data
  STATIC_DATA: {
    INSTRUMENTS: `${API_BASE}/api/v1/static-data/instruments`,
    ACCOUNTS: `${API_BASE}/api/v1/static-data/accounts`,
    TRADERS: `${API_BASE}/api/v1/static-data/traders`,
    BROKERS: `${API_BASE}/api/v1/static-data/brokers`,
    CLEARERS: `${API_BASE}/api/v1/static-data/clearers`,
    PORTFOLIOS: `${API_BASE}/api/v1/static-data/portfolios`,
  },
  
  // Market Data
  MARKET_DATA: {
    BASE: `${API_BASE}/api/v1/market-data`,
    QUOTES: `${API_BASE}/api/v1/market-data/quotes`,
  },
  
  // Enrichment
  ENRICHMENT: {
    BASE: `${API_BASE}/api/v1/enrichment`,
    ENRICH_ORDER: (orderId) => `${API_BASE}/api/v1/enrichment/enrich-order/${orderId}`,
    PORTFOLIO_ENRICHMENT: `${API_BASE}/api/v1/enrichment/portfolio-enrichment`,
  },
  
  // Security
  SECURITY: {
    BASE: `${API_BASE}/api/v1/security`,
    ROLES: `${API_BASE}/api/v1/security/roles`,
    PERMISSIONS: `${API_BASE}/api/v1/security/permissions`,
    MODULES: `${API_BASE}/api/v1/security/modules`,
    ROLE_PERMISSIONS: `${API_BASE}/api/v1/security/role-permissions`,
    USER_ROLES: `${API_BASE}/api/v1/security/user-roles`,
    USER_CONTEXT: (userId) => `${API_BASE}/api/v1/security/users/${userId}/context`,
  },
};

export default {
  API_BASE,
  API_ENDPOINTS,
};
