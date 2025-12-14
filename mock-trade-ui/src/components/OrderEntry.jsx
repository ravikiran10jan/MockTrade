import React, { useState, useEffect } from "react";
import "./BloombergTheme.css";

// Add API base (prefer env var, fall back to IPv4 127.0.0.1)
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function OrderEntry({ onSelectOrder }) {
  const [instrument, setInstrument] = useState("");
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("LIMIT");
  const [tif, setTif] = useState("DAY");
  const [trader, setTrader] = useState("");
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Advanced parameters
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [rejectOrder, setRejectOrder] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [participationPct, setParticipationPct] = useState("");
  const [displayQty, setDisplayQty] = useState("");
  const [icebergSize, setIcebergSize] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [selfHedge, setSelfHedge] = useState(false);
  const [algoEnabled, setAlgoEnabled] = useState(false);
  const [strategy, setStrategy] = useState("");
  const [clientOrderId, setClientOrderId] = useState("");
  const [cancelOnDisconnect, setCancelOnDisconnect] = useState(false);

  // Dynamic instruments list from API
  const [instruments, setInstruments] = useState([]);
  const [traders, setTraders] = useState([]);

  // sample lists (could come from API later)
  // const instruments = ["ES", "NQ", "AAPL", "GOOGL", "BZ"]; // dropdown
  const accounts = ["ACC001", "ACC002", "ACC003"];
  const orderTypes = ["MARKET", "LIMIT", "STOP", "STOP_LIMIT", "IOC", "FOK"];
  const tifOptions = ["DAY", "GTC", "IOC", "FOK", "GTD"];
  const rejectReasons = ["Test Mode", "Circuit Breaker", "Manual Rejection"];
  const strategyOptions = ["TWAP", "VWAP", "POV"];

  // Filters
  const [filterInstrument, setFilterInstrument] = useState("");
  const [filterTrader, setFilterTrader] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch instruments from Static Data API
  const fetchInstruments = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/static-data/instruments`);
      if (!response.ok) {
        throw new Error(`Failed to fetch instruments: HTTP ${response.status}`);
      }
      const data = await response.json();
      // Extract symbols from the instrument objects
      const symbols = Array.isArray(data) ? data.map((inst) => inst.symbol).filter(Boolean) : [];
      setInstruments(symbols);
    } catch (error) {
      console.error("Error fetching instruments:", error);
      // Fallback to empty array - user will need to set up instruments in Static Data first
      setInstruments([]);
      setMessage(`Warning: Could not load instruments from Static Data. Please set up instruments first.`);
      setMessageType("warning");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/order/`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTraders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/static-data/traders`);
      if (!response.ok) {
        throw new Error(`Failed to fetch traders: HTTP ${response.status}`);
      }
      const data = await response.json();
      // Extract trader user_ids from the trader objects
      const traderIds = Array.isArray(data) ? data.map((t) => t.user_id).filter(Boolean) : [];
      setTraders(traderIds);
    } catch (error) {
      console.error("Error fetching traders:", error);
      setTraders([]);
    }
  };

  useEffect(() => {
    fetchInstruments();
    fetchTraders();
    fetchOrders();
  }, []);

  const clearForm = () => {
    setInstrument("");
    setSide("BUY");
    setQty("");
    setPrice("");
    setType("LIMIT");
    setTif("DAY");
    setTrader("");
    setAccount("");
    setMessage("");
    setSelectedOrderId(null);
    // advanced
    setAdvancedOpen(false);
    setRejectOrder(false);
    setRejectReason("");
    setParticipationPct("");
    setDisplayQty("");
    setIcebergSize("");
    setStopPrice("");
    setSelfHedge(false);
    setAlgoEnabled(false);
    setStrategy("");
    setClientOrderId("");
    setCancelOnDisconnect(false);
  };

  const validateForm = () => {
    if (!instrument) return "Instrument is required";
    if (!side) return "Side is required";
    if (!qty || Number(qty) <= 0) return "Order Qty must be a positive number";
    if (!type) return "Order Type is required";
    if (!account) return "Account is required";

    // conditional validations
    const upType = type;
    if ((upType === "LIMIT" || upType === "STOP_LIMIT") && (price === "" || price === null)) {
      return "Price is required for Limit/Stop-Limit orders";
    }
    if ((upType === "STOP" || upType === "STOP_LIMIT") && (stopPrice === "" || stopPrice === null)) {
      return "Stop Price is required for Stop/Stop-Limit orders";
    }

    if (rejectOrder && !rejectReason) return "Reject Reason required when Reject Order is checked";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    // Build order payload (mapping to FIX/NewOrderSingle style keys)
    const orderData = {
      instrument,
      side,
      orderQty: Number(qty),
      orderType: type,
      price: price === "" ? null : Number(price),
      stopPrice: stopPrice === "" ? null : Number(stopPrice),
      account,
      tif,
      trader,
      clientOrderId: clientOrderId || undefined,

      // advanced flags
      rejectOrder: !!rejectOrder,
      rejectReason: rejectOrder ? rejectReason || undefined : undefined,
      participationPercentage: participationPct ? Number(participationPct) : undefined,
      displayQty: displayQty ? Number(displayQty) : undefined,
      icebergSize: icebergSize ? Number(icebergSize) : undefined,
      selfHedge: !!selfHedge,
      algoEnabled: !!algoEnabled,
      strategy: algoEnabled ? strategy || undefined : undefined,
      cancelOnDisconnect: !!cancelOnDisconnect
    };

    try {
      const response = await fetch(`${API_BASE}/order/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          const textError = await response.text();
          errorDetail = textError || errorDetail;
        }
        throw new Error(errorDetail);
      }

      const createdOrder = await response.json();
      setMessage("Order created successfully");
      setMessageType("success");
      await fetchOrders();
      clearForm();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        setMessage("Error: Cannot reach API server at localhost:8000. Is the backend running?");
      } else {
        setMessage(`Error: ${error.message}`);
      }
      setMessageType("error");
    }
  };

  const handleSimulateFill = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/order/${orderId}/simulate_fill`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Failed to fill");
      setMessage("Order filled");
      setMessageType("success");
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/order/${orderId}/cancel`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Failed to cancel");
      setMessage("Order cancelled");
      setMessageType("success");
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterInstrument && !o.instrument?.toLowerCase().includes(filterInstrument.toLowerCase())) return false;
    if (filterTrader && !o.trader?.toLowerCase().includes(filterTrader.toLowerCase())) return false;
    if (filterStatus !== "All" && o.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW":
        return { bg: "#fef3c7", text: "#78350f", border: "#fde68a" };
      case "FILLED":
        return { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" };
      case "CANCELLED":
        return { bg: "#fee2e2", text: "#7f1d1d", border: "#fecaca" };
      default:
        return { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" };
    }
  };

  return (
    <div style={{ maxWidth: "1400px", fontFamily: FONT_FAMILY }}>
      {/* Form Panel */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{
          margin: "0 0 16px 0",
          fontSize: "15px",
          fontWeight: "700",
          color: "#1f2933",
          paddingBottom: "12px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          Create Order
        </h2>

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

        <form onSubmit={handleSubmit}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px"
          }}>
            {/* Instrument (dropdown) */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                Instrument *
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#fff",
                  boxSizing: "border-box",
                  fontFamily: FONT_FAMILY
                }}
              >
                <option value="">Select instrument...</option>
                {instruments.map((ins) => <option key={ins} value={ins}>{ins}</option>)}
                <option value="OTHER">Other (enter below)</option>
              </select>
              {instrument === "OTHER" && (
                <input
                  type="text"
                  placeholder="Enter instrument symbol"
                  onChange={(e) => setInstrument(e.target.value)}
                  style={{ marginTop: 8, width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 4 }}
                />
              )}
            </div>

            {/* Side (dropdown) */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                Side *
              </label>
              <select value={side} onChange={(e) => setSide(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontFamily: FONT_FAMILY }}>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>

            {/* Qty */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                Order Qty *
              </label>
              <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="100" style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", backgroundColor: "#fff", boxSizing: "border-box", fontFamily: FONT_FAMILY }} />
            </div>

            {/* Order Type */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                Order Type *
              </label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontFamily: FONT_FAMILY }}>
                {orderTypes.map((ot) => <option key={ot} value={ot}>{ot}</option>)}
              </select>
            </div>

            {/* Price (conditional) */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                Order Px
              </label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4000.50" disabled={type === "MARKET"} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", backgroundColor: type === "MARKET" ? "#f3f4f6" : "#fff", boxSizing: "border-box", opacity: type === "MARKET" ? 0.6 : 1, transition: "border-color 0.15s", fontFamily: FONT_FAMILY }} />
            </div>

            {/* Stop Price (conditional) */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                Stop Price
              </label>
              <input type="number" step="0.01" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="3990.00" disabled={!(type === "STOP" || type === "STOP_LIMIT")} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", backgroundColor: (type === "STOP" || type === "STOP_LIMIT") ? "#fff" : "#f3f4f6", boxSizing: "border-box", opacity: (type === "STOP" || type === "STOP_LIMIT") ? 1 : 0.6, transition: "border-color 0.15s", fontFamily: FONT_FAMILY }} />
            </div>

            {/* TIF */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                TIF *
              </label>
              <select value={tif} onChange={(e) => setTif(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontFamily: FONT_FAMILY }}>
                {tifOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Trader */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                Trader *
              </label>
              <select value={trader} onChange={(e) => setTrader(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", backgroundColor: "#fff", boxSizing: "border-box", fontFamily: FONT_FAMILY }}>
                <option value="">Select trader...</option>
                {traders.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Account */}
            <div>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.3px"
              }}>
                Account *
              </label>
              <select value={account} onChange={(e) => setAccount(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontFamily: FONT_FAMILY }}>
                <option value="">Select account...</option>
                {accounts.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Advanced parameters collapsible */}
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)} style={{ padding: "8px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
              {advancedOpen ? "Hide advanced parameters" : "Show advanced parameters"}
            </button>

            {advancedOpen && (
              <div style={{ marginTop: 12, padding: 12, border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={rejectOrder} onChange={(e) => setRejectOrder(e.target.checked)} />
                    Reject Order
                  </label>

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#4b5563", marginBottom: 4 }}>Reject Reason</label>
                    <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} disabled={!rejectOrder} style={{ width: "100%", padding: "8px", borderRadius: 4 }}>
                      <option value="">Select reason...</option>
                      {rejectReasons.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#4b5563", marginBottom: 4 }}>Participation %</label>
                    <input type="number" step="0.1" value={participationPct} onChange={(e) => setParticipationPct(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4 }} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#4b5563", marginBottom: 4 }}>Display Qty (Iceberg visible)</label>
                    <input type="number" value={displayQty} onChange={(e) => setDisplayQty(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4 }} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#4b5563", marginBottom: 4 }}>Iceberg Display Size</label>
                    <input type="number" value={icebergSize} onChange={(e) => setIcebergSize(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4 }} />
                  </div>

                  <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={selfHedge} onChange={(e) => setSelfHedge(e.target.checked)} />
                    Self-Hedge
                  </label>

                  <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={algoEnabled} onChange={(e) => setAlgoEnabled(e.target.checked)} />
                    Algo / Strategy Enabled
                  </label>

                  {algoEnabled && (
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "#4b5563", marginBottom: 4 }}>Strategy</label>
                      <select value={strategy} onChange={(e) => setStrategy(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4 }}>
                        <option value="">Select strategy...</option>
                        {strategyOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#4b5563", marginBottom: 4 }}>Client Order ID</label>
                    <input type="text" value={clientOrderId} onChange={(e) => setClientOrderId(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: 4 }} />
                  </div>

                  <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={cancelOnDisconnect} onChange={(e) => setCancelOnDisconnect(e.target.checked)} />
                    Cancel on Disconnect
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div style={{
            display: "flex",
            gap: "8px",
            paddingTop: "12px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <button type="submit" style={{
              padding: "8px 16px",
              backgroundColor: "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "600",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: FONT_FAMILY
            }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#1e40af"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#1d4ed8"}
            >
              Create
            </button>
            <button type="button" onClick={clearForm} style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontWeight: "600",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: FONT_FAMILY
            }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#f3f4f6"}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Orders Panel */}
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
            Orders ({filteredOrders.length})
          </h3>
          <button
            onClick={fetchOrders}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
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
          <input
            type="text"
            placeholder="Instr"
            value={filterInstrument}
            onChange={(e) => setFilterInstrument(e.target.value)}
            style={{
              padding: "6px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "3px",
              fontSize: "11px",
              backgroundColor: "#fff",
              boxSizing: "border-box",
              minWidth: "80px",
              fontFamily: FONT_FAMILY
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
              minWidth: "80px",
              fontFamily: FONT_FAMILY
            }}
          />
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
              minWidth: "70px",
              fontFamily: FONT_FAMILY
            }}
          >
            <option>All</option>
            <option>NEW</option>
            <option>FILLED</option>
            <option>CANCELLED</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{
            padding: "30px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "12px",
            fontFamily: FONT_FAMILY
          }}>
            Loading...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{
            padding: "30px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "12px",
            fontFamily: FONT_FAMILY
          }}>
            No orders yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "11px",
              fontFamily: FONT_FAMILY
            }}>
              <thead>
                <tr style={{
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>
                    INSTR
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>
                    SIDE
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>
                    QTY
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>
                    PRICE
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>
                    TRADER
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>
                    STATUS
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>
                    CREATED
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px" }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const statusColor = getStatusColor(order.status);
                  return (
                    <tr
                      key={idx}
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        if (onSelectOrder) {
                          onSelectOrder(order.id, order);
                        }
                      }}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                        height: "40px",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        borderLeft: selectedOrderId === order.id ? "3px solid #1d4ed8" : "3px solid transparent"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOrderId !== order.id) {
                          e.currentTarget.style.backgroundColor = "#f0f9ff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#f9fafb";
                      }}
                    >
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600", fontSize: "11px" }}>
                        {order.instrument}
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
                        {order.qty}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>
                        {order.price}
                      </td>
                      <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>
                        {order.trader}
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
                      <td style={{ padding: "8px 12px", color: "#9ca3af", fontSize: "10px" }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                          {order.status === "NEW" && (
                            <>
                              <button
                                onClick={() => handleSimulateFill(order.id)}
                                style={{
                                  padding: "3px 6px",
                                  backgroundColor: "transparent",
                                  color: "#10b981",
                                  border: "none",
                                  borderRadius: "2px",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                  fontFamily: FONT_FAMILY
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#d1fae5"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                              >
                                Fill
                              </button>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                style={{
                                  padding: "3px 6px",
                                  backgroundColor: "transparent",
                                  color: "#ef4444",
                                  border: "none",
                                  borderRadius: "2px",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                  fontFamily: FONT_FAMILY
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#fee2e2"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                              >
                                Cancel
                              </button>
                            </>
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
    </div>
  );
}

export default OrderEntry;

