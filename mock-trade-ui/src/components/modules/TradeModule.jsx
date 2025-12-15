import React, { useState, useEffect } from "react";

// Prefer an explicit VITE_API_BASE; fall back to empty string so dev proxy forwards relative /api calls
const API_BASE = import.meta.env.VITE_API_BASE || "";
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function TradeModule() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedTrade, setSelectedTrade] = useState(null);

  // Filters
  const [filterInstrument, setFilterInstrument] = useState("");
  const [filterTrader, setFilterTrader] = useState("");

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/trades/`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTrades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching trades:", error);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to cancel this trade?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/trades/${tradeId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const responseText = await response.text();
          try {
            const errorData = JSON.parse(responseText);
            errorDetail = errorData.detail || errorData.message || responseText;
          } catch (jsonError) {
            errorDetail = responseText || errorDetail;
          }
        } catch (textError) {
          errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorDetail);
      }

      setMessage("Trade cancelled successfully");
      setMessageType("success");
      await fetchTrades();
      setSelectedTrade(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  };

  const handleExpireTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to expire this trade?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/trades/${tradeId}/expire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const responseText = await response.text();
          try {
            const errorData = JSON.parse(responseText);
            errorDetail = errorData.detail || errorData.message || responseText;
          } catch (jsonError) {
            errorDetail = responseText || errorDetail;
          }
        } catch (textError) {
          errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorDetail);
      }

      setMessage("Trade expired successfully");
      setMessageType("success");
      await fetchTrades();
      setSelectedTrade(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
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
    if (filterInstrument && !trade.instrument?.toLowerCase().includes(filterInstrument.toLowerCase())) return false;
    if (filterTrader && !trade.trader?.toLowerCase().includes(filterTrader.toLowerCase())) return false;
    return true;
  });

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
          Trade Module
        </h2>
        <p style={{
          margin: "8px 0 0 0",
          fontSize: "12px",
          color: "#4b5563"
        }}>
          Monitor and manage all trades. Cancel or expire trades as needed.
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

      {/* Main Container */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 350px",
        gap: "20px"
      }}>
        {/* Trades Table */}
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
              Trades ({filteredTrades.length})
            </h3>
            <button
              onClick={fetchTrades}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#f3f4f6"}
            >
              Refresh
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{
            padding: "8px 12px",
            backgroundColor: "#f9fafb",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            borderBottom: "1px solid #e5e7eb",
            flexWrap: "wrap"
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
                boxSizing: "border-box",
                minWidth: "100px"
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
                boxSizing: "border-box",
                minWidth: "100px"
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
                boxSizing: "border-box",
                minWidth: "100px"
              }}
            />
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
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>INSTR</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>SIDE</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>QTY</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>PRICE</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>TRADER</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>STATUS</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade, idx) => {
                    const statusColor = getStatusColor(trade.status);
                    const isSelected = selectedTrade?.trade_id === trade.trade_id;
                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedTrade(trade)}
                        style={{
                          backgroundColor: isSelected ? "#dbeafe" : (idx % 2 === 0 ? "#fff" : "#f9fafb"),
                          borderBottom: "1px solid #e5e7eb",
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                          borderLeft: isSelected ? "3px solid #1d4ed8" : "3px solid transparent"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "#f0f9ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected ? "#dbeafe" : (idx % 2 === 0 ? "#fff" : "#f9fafb");
                        }}
                      >
                        <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600", fontSize: "11px" }}>
                          {String(trade.trade_id || "-").substring(0, 12)}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600", fontSize: "11px" }}>
                          {trade.instrument}
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
                          {trade.qty}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>
                          {trade.price}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>
                          {trade.trader}
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
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                            {trade.status === "ACTIVE" || trade.status === "FILLED" ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelTrade(trade.trade_id);
                                  }}
                                  style={{
                                    padding: "3px 6px",
                                    backgroundColor: "transparent",
                                    color: "#ef4444",
                                    border: "none",
                                    borderRadius: "2px",
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.15s"
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = "#fee2e2"}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExpireTrade(trade.trade_id);
                                  }}
                                  style={{
                                    padding: "3px 6px",
                                    backgroundColor: "transparent",
                                    color: "#6b7280",
                                    border: "none",
                                    borderRadius: "2px",
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.15s"
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                                >
                                  Expire
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: "10px", color: "#9ca3af" }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Panel */}
        {selectedTrade && (
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "6px",
            padding: "16px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            border: "1px solid #e5e7eb",
            height: "fit-content",
            position: "sticky",
            top: "20px"
          }}>
            <h3 style={{
              margin: "0 0 16px 0",
              fontSize: "13px",
              fontWeight: "700",
              color: "#1f2933",
              paddingBottom: "12px",
              borderBottom: "1px solid #e5e7eb"
            }}>
              Trade Details
            </h3>

            <div style={{ display: "grid", gap: "12px", fontSize: "12px" }}>
              <div>
                <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Trade ID</div>
                <div style={{ color: "#1f2933", fontFamily: "monospace" }}>{selectedTrade.trade_id}</div>
              </div>

              <div>
                <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Instrument</div>
                <div style={{ color: "#1f2933", fontWeight: "600" }}>{selectedTrade.instrument}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Side</div>
                  <div style={{
                    color: selectedTrade.side === "BUY" ? "#10b981" : "#ef4444",
                    fontWeight: "600"
                  }}>
                    {selectedTrade.side}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Quantity</div>
                  <div style={{ color: "#1f2933" }}>{selectedTrade.qty}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Price</div>
                  <div style={{ color: "#1f2933" }}>{selectedTrade.price}</div>
                </div>
                <div>
                  <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Status</div>
                  <div style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontWeight: "700",
                    backgroundColor: getStatusColor(selectedTrade.status).bg,
                    color: getStatusColor(selectedTrade.status).text,
                    border: `1px solid ${getStatusColor(selectedTrade.status).border}`
                  }}>
                    {selectedTrade.status}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Trader</div>
                <div style={{ color: "#1f2933" }}>{selectedTrade.trader}</div>
              </div>

              <div>
                <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Broker</div>
                <div style={{ color: "#1f2933" }}>{selectedTrade.broker_id || "—"}</div>
              </div>

              <div>
                <div style={{ color: "#4b5563", fontWeight: "600", marginBottom: "4px" }}>Exec Time</div>
                <div style={{ color: "#1f2933", fontSize: "11px" }}>
                  {selectedTrade.exec_time ? new Date(selectedTrade.exec_time).toLocaleString() : "—"}
                </div>
              </div>

              <div style={{
                paddingTop: "12px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                gap: "8px",
                flexDirection: "column"
              }}>
                {(selectedTrade.status === "ACTIVE" || selectedTrade.status === "FILLED") && (
                  <>
                    <button
                      onClick={() => handleCancelTrade(selectedTrade.trade_id)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "600",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                    >
                      Cancel Trade
                    </button>
                    <button
                      onClick={() => handleExpireTrade(selectedTrade.trade_id)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#6b7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "600",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#4b5563"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#6b7280"}
                    >
                      Expire Trade
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedTrade(null)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f3f4f6",
                    color: "#6b7280",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontWeight: "600",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradeModule;

