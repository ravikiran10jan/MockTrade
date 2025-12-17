import React, { useState, useEffect } from "react";
import { useAuth } from '../../core/auth';
import { usePermissions } from '../../hooks/usePermissions';

// Prefer an explicit VITE_API_BASE; fall back to empty string so dev proxy forwards relative /api calls
const API_BASE = import.meta.env.VITE_API_BASE || "";
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function TradeQueryModule() {
  const { getAuthHeaders, user } = useAuth();
  const { canViewModule } = usePermissions();
  
  // For ADMIN users, always allow access regardless of module permissions
  const isAdmin = user?.role === "ADMIN";
  const [trades, setTrades] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [activeTab, setActiveTab] = useState("trades");
  const [hasViewPermission, setHasViewPermission] = useState(true); // Default to true, check asynchronously
  
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
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/trades/${tradeId}/cancel`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: "User requested cancellation" })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // Refresh the trades list
      await fetchEnrichedTrades();
      setMessage("Trade cancelled successfully");
      setMessageType("success");
    } catch (error) {
      console.error("Error cancelling trade:", error);
      setMessage(`Error cancelling trade: ${error.message}`);
      setMessageType("error");
    }
  };

  const handleExpireTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to expire this trade?")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/trades/${tradeId}/expire`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // Refresh the trades list
      await fetchEnrichedTrades();
      setMessage("Trade expired successfully");
      setMessageType("success");
    } catch (error) {
      console.error("Error expiring trade:", error);
      setMessage(`Error expiring trade: ${error.message}`);
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (hasViewPermission) {
      if (activeTab === "trades") {
        fetchEnrichedTrades();
      } else {
        fetchEnrichedOrders();
      }
    }
  }, [activeTab, hasViewPermission]);

  const fetchEnrichedTrades = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/trade-query/enriched-trades`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTrades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching enriched trades:", error);
      setTrades([]);
      setMessage(`Error fetching trades: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrichedOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/trade-query/enriched-orders`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching enriched orders:", error);
      setOrders([]);
      setMessage(`Error fetching orders: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "FILLED":
      case "ACTIVE":
        return { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" };
      case "PENDING":
        return { bg: "#fef3c7", text: "#78350f", border: "#fde68a" };
      case "CANCELLED":
        return { bg: "#fee2e2", text: "#7f1d1d", border: "#fecaca" };
      case "EXPIRED":
        return { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
      default:
        return { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" };
    }
  };

  const filteredTrades = trades.filter((trade) => {
    if (filterStatus !== "ALL" && trade.status !== filterStatus) return false;
    if (filterInstrument && !trade.instrument_symbol?.toLowerCase().includes(filterInstrument.toLowerCase())) return false;
    if (filterTrader && !trade.trader_name?.toLowerCase().includes(filterTrader.toLowerCase())) return false;
    if (filterPortfolio && !trade.portfolio_name?.toLowerCase().includes(filterPortfolio.toLowerCase())) return false;
    return true;
  });

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== "ALL" && order.status !== filterStatus) return false;
    if (filterInstrument && !order.instrument_symbol?.toLowerCase().includes(filterInstrument.toLowerCase())) return false;
    if (filterTrader && !order.trader_name?.toLowerCase().includes(filterTrader.toLowerCase())) return false;
    if (filterPortfolio && !order.portfolio_name?.toLowerCase().includes(filterPortfolio.toLowerCase())) return false;
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
          Enriched trade and order data with portfolio mappings and instrument details
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

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "20px",
        borderBottom: "1px solid #e5e7eb"
      }}>
        <button
          onClick={() => setActiveTab("trades")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "trades" ? "#f0f9ff" : "#f3f4f6",
            color: activeTab === "trades" ? "#1d4ed8" : "#6b7280",
            border: activeTab === "trades" ? "1px solid #bfdbfe" : "1px solid #d1d5db",
            borderBottom: activeTab === "trades" ? "none" : "1px solid #d1d5db",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            cursor: "pointer",
            fontWeight: activeTab === "trades" ? "600" : "500",
            fontSize: "12px",
            fontFamily: FONT_FAMILY
          }}
        >
          Enriched Trades
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "orders" ? "#f0f9ff" : "#f3f4f6",
            color: activeTab === "orders" ? "#1d4ed8" : "#6b7280",
            border: activeTab === "orders" ? "1px solid #bfdbfe" : "1px solid #d1d5db",
            borderBottom: activeTab === "orders" ? "none" : "1px solid #d1d5db",
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            cursor: "pointer",
            fontWeight: activeTab === "orders" ? "600" : "500",
            fontSize: "12px",
            fontFamily: FONT_FAMILY
          }}
        >
          Enriched Orders
        </button>
      </div>

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
            onClick={() => {
              if (activeTab === "trades") {
                fetchEnrichedTrades();
              } else {
                fetchEnrichedOrders();
              }
            }}
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
            Refresh
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
            {activeTab === "trades" ? `Trades (${filteredTrades.length})` : `Orders (${filteredOrders.length})`}
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
        ) : activeTab === "trades" ? (
          filteredTrades.length === 0 ? (
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredOrders.length === 0 ? (
            <div style={{
              padding: "30px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "12px"
            }}>
              No orders found
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
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>ORDER ID</th>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => {
                    const statusColor = getStatusColor(order.status);
                    return (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600", fontSize: "11px" }}>
                          {String(order.order_id || "-").substring(0, 8)}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600", fontSize: "11px" }}>
                          {order.instrument_symbol}
                        </td>
                        <td style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: order.side === "BUY" ? "#10b981" : "#ef4444",
                          fontWeight: "600",
                          fontSize: "11px"
                        }}>
                          {order.side}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>
                          {order.qty?.toLocaleString()}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>
                          {order.price?.toFixed(2)}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>
                          {order.trader_name || order.trader_id}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>
                          {order.account_code || order.account_id}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>
                          {order.portfolio_name || "-"}
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
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>
                          {order.notional_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: "#4b5563", fontSize: "11px" }}>
                          {order.instrument_expiry_date ? new Date(order.instrument_expiry_date).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default TradeQueryModule;
