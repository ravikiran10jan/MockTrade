/**
 * Enrichment Module - Models
 */

export function createEmptyPortfolioMapping() {
  return {
    trader_id: '',
    account_id: '',
    portfolio_id: '',
  };
}

export function validatePortfolioMapping(mapping) {
  const errors = [];
  
  if (!mapping.trader_id) errors.push('Trader is required');
  if (!mapping.account_id) errors.push('Account is required');
  if (!mapping.portfolio_id) errors.push('Portfolio is required');
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
