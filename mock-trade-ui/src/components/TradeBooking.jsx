import React, { useState, useEffect } from "react";
import "./BloombergTheme.css";

function TradeBooking() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedTrade, setSelectedTrade] = useState(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/v1/trades/");
      if (!response.ok) throw new Error("Failed to fetch trades");
      const data = await response.json();
      setTrades(data);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrade = async (tradeId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/trades/${tradeId}/cancel`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to cancel trade");
      setMessage("Trade cancelled successfully");
      fetchTrades();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleExpireTrade = async (tradeId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/trades/${tradeId}/expire`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to expire trade");
      setMessage("Trade expired successfully");
      fetchTrades();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="trade-booking-container">
      <h3>Trade Booking</h3>

      {message && <div className="message" style={{ color: message.includes("Error") ? "red" : "green" }}>
        {message}
      </div>}

      <button onClick={fetchTrades} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Loading..." : "Refresh Trades"}
      </button>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "#0ff" }}>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #0ff" }}>Trade ID</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #0ff" }}>Instrument</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #0ff" }}>Side</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #0ff" }}>Qty</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #0ff" }}>Price</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #0ff" }}>Status</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #0ff" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                  No trades yet. Create orders and fill them to see trades here.
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr key={trade.trade_id} style={{ borderBottom: "1px solid #444" }}>
                  <td style={{ padding: "10px" }}>{trade.trade_id.substring(0, 8)}</td>
                  <td style={{ padding: "10px" }}>{trade.instrument_id}</td>
                  <td style={{ padding: "10px", color: trade.side === "BUY" ? "#0f0" : "#f00" }}>
                    {trade.side}
                  </td>
                  <td style={{ padding: "10px" }}>{trade.qty}</td>
                  <td style={{ padding: "10px" }}>{trade.price}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{
                      padding: "4px 8px",
                      backgroundColor: trade.status === "ACTIVE" ? "#0f0" : "#f00",
                      color: "#000",
                      borderRadius: "3px",
                      fontSize: "12px"
                    }}>
                      {trade.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    {trade.status === "ACTIVE" && (
                      <>
                        <button
                          onClick={() => handleCancelTrade(trade.trade_id)}
                          style={{
                            padding: "4px 8px",
                            marginRight: "5px",
                            backgroundColor: "#f00",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "3px"
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleExpireTrade(trade.trade_id)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#ff9900",
                            color: "#000",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "3px"
                          }}
                        >
                          Expire
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TradeBooking;

