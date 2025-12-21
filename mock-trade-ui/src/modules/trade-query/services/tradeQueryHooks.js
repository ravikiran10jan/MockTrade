/**
 * Trade Query Module - Custom Hooks
 * React hooks for managing trade query state and operations
 */

import { useState, useCallback } from 'react';
import * as tradeQueryApi from './tradeQueryApi';

/**
 * Hook for managing enriched trades data
 * @returns {Object} {trades, loading, error, fetchTrades, cancelTrade, expireTrade}
 */
export function useEnrichedTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tradeQueryApi.fetchEnrichedTrades();
      setTrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching enriched trades:', err);
      setError(err.message);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelTrade = useCallback(async (tradeId, reason) => {
    try {
      await tradeQueryApi.cancelTrade(tradeId, reason);
      await fetchTrades(); // Refresh after cancellation
      return { success: true };
    } catch (err) {
      console.error('Error cancelling trade:', err);
      return { success: false, error: err.message };
    }
  }, [fetchTrades]);

  const expireTrade = useCallback(async (tradeId) => {
    try {
      await tradeQueryApi.expireTrade(tradeId);
      await fetchTrades(); // Refresh after expiration
      return { success: true };
    } catch (err) {
      console.error('Error expiring trade:', err);
      return { success: false, error: err.message };
    }
  }, [fetchTrades]);

  const undoTrade = useCallback(async (tradeId) => {
    try {
      await tradeQueryApi.undoTrade(tradeId);
      await fetchTrades(); // Refresh after undo
      return { success: true };
    } catch (err) {
      console.error('Error undoing trade:', err);
      return { success: false, error: err.message };
    }
  }, [fetchTrades]);

  return {
    trades,
    loading,
    error,
    fetchTrades,
    cancelTrade,
    expireTrade,
    undoTrade,
  };
}

/**
 * Hook for managing enriched orders data
 * @returns {Object} {orders, loading, error, fetchOrders}
 */
export function useEnrichedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tradeQueryApi.fetchEnrichedOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching enriched orders:', err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
  };
}

export default {
  useEnrichedTrades,
  useEnrichedOrders,
};
