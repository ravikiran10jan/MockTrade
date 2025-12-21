/**
 * WebSocket Hook for Real-time Trade Updates
 * Connects to backend WebSocket and listens for trade events
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection to trade updates
 * @param {Function} onTradeUpdate - Callback when trade is created/updated
 * @param {boolean} enabled - Whether WebSocket should be active
 * @returns {Object} {isConnected, reconnect}
 */
export function useTradeWebSocket(onTradeUpdate, enabled = true) {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Determine WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      // Use port 8000 for backend API
      const wsUrl = `${protocol}//${host}:8000/api/v1/trade-query/ws/trades`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected to trade updates');
        isConnectedRef.current = true;
        reconnectAttempts.current = 0;
        
        // Send ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          } else {
            clearInterval(pingInterval);
          }
        }, 30000); // Ping every 30 seconds
        
        ws.pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          
          // Handle trade updates
          if (data.type && data.data) {
            switch (data.type) {
              case 'trade_created':
              case 'trade_updated':
              case 'trade_cancelled':
              case 'trade_expired':
                if (onTradeUpdate) {
                  onTradeUpdate(data);
                }
                break;
              default:
                console.log('Unknown message type:', data.type);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        isConnectedRef.current = false;
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        isConnectedRef.current = false;
        
        // Clear ping interval
        if (ws.pingInterval) {
          clearInterval(ws.pingInterval);
        }
        
        // Attempt to reconnect with exponential backoff
        if (enabled && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1;
          const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current - 1);
          console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          console.error('❌ Max reconnection attempts reached. Please refresh the page.');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      isConnectedRef.current = false;
    }
  }, [enabled, onTradeUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // Clear ping interval
      if (wsRef.current.pingInterval) {
        clearInterval(wsRef.current.pingInterval);
      }
      
      wsRef.current.close();
      wsRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    reconnect,
  };
}

export default useTradeWebSocket;
