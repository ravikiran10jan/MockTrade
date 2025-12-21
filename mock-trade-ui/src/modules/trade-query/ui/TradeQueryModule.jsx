import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../../core/auth';
import { usePermissions } from '../../../core/security';
import { useEnrichedTrades } from '../services/tradeQueryHooks';
import { useTradeWebSocket } from '../services/useTradeWebSocket';
import { AllStatuses, getStatusColor, formatDate, formatNumber } from '../models/tradeModels';
import TradeAuditTrailModal from './TradeAuditTrailModal';

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function TradeQueryModule() {
  const { user } = useAuth();
  const { canViewModule } = usePermissions();
  const isAdmin = user?.role === "ADMIN";
  
  // Use custom hooks for data management
  const { 
    trades,
    loading,
    error,
    fetchTrades,
    cancelTrade: cancelTradeService,
    expireTrade: expireTradeService,
    undoTrade: undoTradeService
  } = useEnrichedTrades();
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [hasViewPermission, setHasViewPermission] = useState(true);
  const [selectedTradeForAudit, setSelectedTradeForAudit] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterInstrument, setFilterInstrument] = useState("");
  const [filterTrader, setFilterTrader] = useState("");
  const [filterPortfolio, setFilterPortfolio] = useState("");

  // Check if user has permission to view trade query data
  useEffect(() => {
    const checkPermissions = async () => {
      const canView = isAdmin || await canViewModule("Trade");
      setHasViewPermission(canView);
      
      if (!canView && !isAdmin) {
        setMessage("You don't have permission to access the Trade Query module.");
        setMessageType("error");
      }
    };
    
    checkPermissions();
  }, []);

  const handleCancelTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to cancel this trade?")) {
      return;
    }
    
    const result = await cancelTradeService(tradeId, "User requested cancellation");
    if (result.success) {
      setMessage("Trade cancelled successfully");
      setMessageType("success");
    } else {
      setMessage(`Error cancelling trade: ${result.error}`);
      setMessageType("error");
    }
  };

  const handleExpireTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to expire this trade?")) {
      return;
    }
    
    const result = await expireTradeService(tradeId);
    if (result.success) {
      setMessage("Trade expired successfully");
      setMessageType("success");
    } else {
      setMessage(`Error expiring trade: ${result.error}`);
      setMessageType("error");
    }
  };

  const handleUndoTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to undo this trade action and restore it to ACTIVE?")) {
      return;
    }
    
    const result = await undoTradeService(tradeId);
    if (result.success) {
      setMessage("Trade undo successful - restored to ACTIVE");
      setMessageType("success");
    } else {
      setMessage(`Error undoing trade: ${result.error}`);
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (hasViewPermission) {
      fetchTrades();
    }
  }, [hasViewPermission, fetchTrades]);

  // WebSocket handler for real-time trade updates
  const handleTradeUpdate = useCallback((message) => {
    console.log('Trade update received:', message.type);
    // Refresh trades when any trade event occurs
    fetchTrades();
    
    // Show notification based on event type
    switch (message.type) {
      case 'trade_created':
        setMessage('New trade created');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
        break;
      case 'trade_cancelled':
        setMessage('Trade cancelled');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
        break;
      case 'trade_expired':
        setMessage('Trade expired');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
        break;
      default:
        break;
    }
  }, [fetchTrades]);

  // Connect to WebSocket for real-time updates
  useTradeWebSocket(handleTradeUpdate, hasViewPermission);

  const filteredTrades = trades.filter((trade) => {
    if (filterStatus !== "ALL" && trade.status !== filterStatus) return false;
    if (filterInstrument && !trade.instrument_symbol?.toLowerCase().includes(filterInstrument.toLowerCase())) return false;
    if (filterTrader && !trade.trader_name?.toLowerCase().includes(filterTrader.toLowerCase())) return false;
    if (filterPortfolio && !trade.portfolio_name?.toLowerCase().includes(filterPortfolio.toLowerCase())) return false;
    return true;
  });

  // If permissions haven't been checked yet or user doesn't have permission, show message
  if (!hasViewPermission) {
    return (
      <div style={{ fontFamily: FONT_FAMILY, padding: "20px" }}>
        <div>{message || "Checking permissions..."}</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT_FAMILY }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: "700",
          color: "#1f2933",
          paddingBottom: "12px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          Trade Query Module
        </h2>
        <p style={{
          margin: "8px 0 0 0",
          fontSize: "12px",
          color: "#4b5563"
        }}>
          Enriched trades with portfolio mappings (real-time via WebSocket)
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: "10px 12px",
          marginBottom: "16px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "500",
          backgroundColor: messageType === "success" ? "#d1fae5" : "#fee2e2",
          color: messageType === "success" ? "#065f46" : "#7f1d1d",
          border: `1px solid ${messageType === "success" ? "#a7f3d0" : "#fecaca"}`,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {messageType === "success" ? "✓" : "✕"} {message}
        </div>
      )}

      {/* Filter Bar */}
      <div style={{
        padding: "12px",
        backgroundColor: "#f9fafb",
        borderRadius: "6px",
        marginBottom: "20px",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          alignItems: "center"
        }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "6px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "3px",
              fontSize: "11px",
              backgroundColor: "#fff",
              boxSizing: "border-box"
            }}
          >
            <option value="ALL">All Status</option>
            <option value="FILLED">Filled</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <input
            type="text"
            placeholder="Instrument"
            value={filterInstrument}
            onChange={(e) => setFilterInstrument(e.target.value)}
            style={{
              padding: "6px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "3px",
              fontSize: "11px",
              backgroundColor: "#fff",
              boxSizing: "border-box"
            }}
          />
          <input
            type="text"
            placeholder="Trader"
            value={filterTrader}
            onChange={(e) => setFilterTrader(e.target.value)}
            style={{
              padding: "6px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "3px",
              fontSize: "11px",
              backgroundColor: "#fff",
              boxSizing: "border-box"
            }}
          />
          <input
            type="text"
            placeholder="Portfolio"
            value={filterPortfolio}
            onChange={(e) => setFilterPortfolio(e.target.value)}
            style={{
              padding: "6px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "3px",
              fontSize: "11px",
              backgroundColor: "#fff",
              boxSizing: "border-box"
            }}
          />
          <button
            onClick={() => fetchTrades()}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "3px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: FONT_FAMILY
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#f3f4f6"}
          >
            Refresh Trades
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb"
      }}>
        {/* Panel Header */}
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f9fafb"
        }}>
          <h3 style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: "700",
            color: "#1f2933"
          }}>
            Enriched Trades ({filteredTrades.length})
          </h3>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{
            padding: "30px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "12px"
          }}>
            Loading...
          </div>
        ) : filteredTrades.length === 0 ? (
            <div style={{
              padding: "30px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "12px"
            }}>
              No trades found
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px"
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>TRADE ID</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>INSTRUMENT</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>SIDE</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>QTY</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>PRICE</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>TRADER</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>ACCOUNT</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>PORTFOLIO</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>STATUS</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>NOTIONAL</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>EXPIRY</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade, idx) => {
                    const statusColor = getStatusColor(trade.status);
                    return (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600", fontSize: "11px" }}>
                          {String(trade.trade_id || "-").substring(0, 8)}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600", fontSize: "11px" }}>
                          {trade.instrument_symbol}
                        </td>
                        <td style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: trade.side === "BUY" ? "#10b981" : "#ef4444",
                          fontWeight: "600",
                          fontSize: "11px"
                        }}>
                          {trade.side}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>
                          {trade.qty?.toLocaleString()}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>
                          {trade.price?.toFixed(2)}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>
                          {trade.trader_name || trade.trader_id}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>
                          {trade.account_code || trade.account_id}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>
                          {trade.portfolio_name || "-"}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "3px",
                            fontSize: "10px",
                            fontWeight: "700",
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`
                          }}>
                            {trade.status}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>
                          {trade.notional_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: "#4b5563", fontSize: "11px" }}>
                          {trade.instrument_expiry_date ? new Date(trade.instrument_expiry_date).toLocaleDateString() : "-"}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <button
                            onClick={() => setSelectedTradeForAudit(trade.trade_id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#dbeafe",
                              color: "#1e40af",
                              border: "1px solid #bfdbfe",
                              borderRadius: "3px",
                              fontSize: "10px",
                              fontWeight: "600",
                              cursor: "pointer",
                              marginRight: "4px"
                            }}
                          >
                            Audit Trail
                          </button>
                          {trade.status === "ACTIVE" && (
                            <>
                              <button
                                onClick={() => handleCancelTrade(trade.trade_id)}
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#fee2e2",
                                  color: "#7f1d1d",
                                  border: "1px solid #fecaca",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  marginRight: "4px"
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleExpireTrade(trade.trade_id)}
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#f3f4f6",
                                  color: "#374151",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  cursor: "pointer"
                                }}
                              >
                                Expire
                              </button>
                            </>
                          )}
                          {(trade.status === "CANCELLED" || trade.status === "EXPIRED") && (
                            <button
                              onClick={() => handleUndoTrade(trade.trade_id)}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#dcfce7",
                                color: "#166534",
                                border: "1px solid #bbf7d0",
                                borderRadius: "3px",
                                fontSize: "10px",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              Undo
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
      
      {/* Audit Trail Modal */}
      {selectedTradeForAudit && (
        <TradeAuditTrailModal
          tradeId={selectedTradeForAudit}
          onClose={() => setSelectedTradeForAudit(null)}
        />
      )}
    </div>
  );
}

export default TradeQueryModule;
