import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || '';
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function MarketDataModule() {
  const [marketData, setMarketData] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/market-data/`);
      if (response.ok) {
        const data = await response.json();
        setMarketData(data);
      }
    } catch (error) {
      console.log("No market data yet");
    }
    setLoading(false);
  };

  const handleUpdateMarketData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/v1/market-data/market-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrument_id: selectedInstrument,
          bid_price: parseFloat(formData.bid_price),
          ask_price: parseFloat(formData.ask_price),
          bid_qty: parseFloat(formData.bid_qty),
          ask_qty: parseFloat(formData.ask_qty),
          last_price: parseFloat(formData.last_price),
          volume: parseFloat(formData.volume) || 0,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      setMessage("Market data updated");
      setFormData({});
      setSelectedInstrument("");
      fetchMarketData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: "700",
          color: "#1f2933",
          paddingBottom: "12px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          Market Data
        </h2>
        <p style={{
          margin: "8px 0 0 0",
          fontSize: "12px",
          color: "#4b5563"
        }}>
          Update and monitor market pricing
        </p>
      </div>

      {message && (
        <div style={{
          padding: "8px 12px",
          marginBottom: "16px",
          backgroundColor: message.includes("Error") ? "#fee2e2" : "#d1fae5",
          color: message.includes("Error") ? "#7f1d1d" : "#065f46",
          borderRadius: "4px",
          border: `1px solid ${message.includes("Error") ? "#fecaca" : "#a7f3d0"}`,
          fontSize: "12px",
        }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", color: "#1f2933" }}>Update Data</h3>
          <form onSubmit={handleUpdateMarketData} style={{ display: "grid", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Instrument</label>
              <input type="text" placeholder="ES" value={selectedInstrument} onChange={(e) => setSelectedInstrument(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", backgroundColor: "#f9fafb", boxSizing: "border-box", fontFamily: FONT_FAMILY }} required />
            </div>
            {[
              { label: "Bid", key: "bid_price" },
              { label: "Ask", key: "ask_price" },
              { label: "Bid Qty", key: "bid_qty" },
              { label: "Ask Qty", key: "ask_qty" }
            ].map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>{f.label}</label>
                <input type="number" step="0.01" value={formData[f.key] || ""} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", backgroundColor: "#f9fafb", boxSizing: "border-box", fontFamily: FONT_FAMILY }} required />
              </div>
            ))}
            <button type="submit" style={{ padding: "8px 12px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "600", cursor: "pointer", fontSize: "12px", fontFamily: FONT_FAMILY }}>Update</button>
          </form>
        </div>

        <div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", color: "#1f2933" }}>Current Data</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: FONT_FAMILY }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>INSTR</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>BID/ASK</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>SPREAD</th>
                </tr>
              </thead>
              <tbody>
                {marketData.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: "16px 12px", textAlign: "center", color: "#9ca3af", fontSize: "12px" }}>No data</td></tr>
                ) : (
                  marketData.map((d, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600" }}>{d.instrument_id}</td>
                      <td style={{ padding: "8px 12px", color: "#4b5563" }}>{d.bid_price} / {d.ask_price}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563" }}>{(d.ask_price - d.bid_price).toFixed(4)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketDataModule;

