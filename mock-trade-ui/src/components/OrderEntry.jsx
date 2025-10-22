import React, { useState, useEffect } from "react";
import "./BloombergTheme.css";

function OrderEntry() {
  const [instrument, setInstrument] = useState("");
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("LIMIT");
  const [tif, setTif] = useState("DAY");
  const [trader, setTrader] = useState("");
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Filters
  const [filterInstrument, setFilterInstrument] = useState("");
  const [filterTrader, setFilterTrader] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://backend:8000/order/");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setMessage("Could not load orders from server.");
    }
  };

  useEffect(() => {
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
  };

  const loadOrderToForm = (order) => {
    if (!order) return;
    setInstrument(order.instrument || "");
    setSide(order.side || "BUY");
    setQty(order.qty?.toString() || "");
    setPrice(order.price?.toString() || "");
    setType(order.type || "LIMIT");
    setTif(order.tif || "DAY");
    setTrader(order.trader || "");
    setAccount(order.account || "");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!instrument || !qty || !trader) {
      setMessage("Instrument, Qty, and Trader are required.");
      return;
    }
    const orderData = {
      instrument,
      side,
      qty: parseInt(qty, 10),
      price: type === "LIMIT" && price !== "" ? parseFloat(price) : null,
      type,
      tif,
      trader,
      account
    };
    try {
      const response = await fetch("http://backend:8000/order/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || `HTTP ${response.status}`);
      }
      await fetchOrders();
      clearForm();
      setMessage("Order submitted successfully.");
    } catch (error) {
      console.error("Error submitting order:", error);
      setMessage(`Submit failed: ${error.message}`);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterInstrument && !o.instrument?.toLowerCase().includes(filterInstrument.toLowerCase())) return false;
    if (filterTrader && !o.trader?.toLowerCase().includes(filterTrader.toLowerCase())) return false;
    if (filterStatus && o.status !== filterStatus) return false;
    if (filterDate) {
      const od = o.created_at ? new Date(o.created_at).toISOString().slice(0, 10) : "";
      if (od !== filterDate) return false;
    }
    return true;
  });

  return (
    <div className="order-entry">
      <h3>Order Entry</h3>
  <form onSubmit={handleSubmit} className="order-form">
        <div className="form-row">
          <label>Instrument</label>
          <input value={instrument} onChange={(e) => setInstrument(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Side</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="buy"
                name="side"
                value="BUY"
                checked={side === "BUY"}
                onChange={(e) => setSide(e.target.value)}
              />
              <label htmlFor="buy">Buy</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="sell"
                name="side"
                value="SELL"
                checked={side === "SELL"}
                onChange={(e) => setSide(e.target.value)}
              />
              <label htmlFor="sell">Sell</label>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>Qty</label>
          <input value={qty} onChange={(e) => setQty(e.target.value)} type="number" />
        </div>
        <div className="form-row">
          <label>Type</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="limit"
                name="type"
                value="LIMIT"
                checked={type === "LIMIT"}
                onChange={(e) => setType(e.target.value)}
              />
              <label htmlFor="limit">Limit</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="market"
                name="type"
                value="MARKET"
                checked={type === "MARKET"}
                onChange={(e) => setType(e.target.value)}
              />
              <label htmlFor="market">Market</label>
            </div>
          </div>
        </div>
        {type === "LIMIT" && (
          <div className="form-row">
            <label>Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" />
          </div>
        )}
        <div className="form-row">
          <label>TIF</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="day"
                name="tif"
                value="DAY"
                checked={tif === "DAY"}
                onChange={(e) => setTif(e.target.value)}
              />
              <label htmlFor="day">Day</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="gtc"
                name="tif"
                value="GTC"
                checked={tif === "GTC"}
                onChange={(e) => setTif(e.target.value)}
              />
              <label htmlFor="gtc">GTC</label>
            </div>
          </div>
        </div>
        <div className="form-row">
          <label>Trader</label>
          <input value={trader} onChange={(e) => setTrader(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Account</label>
          <input value={account} onChange={(e) => setAccount(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }} className="button-row">
          <button type="submit">Submit</button>
          <button
            type="button"
            disabled={!selectedOrderId || orders.find(o => o.id === selectedOrderId)?.status !== 'NEW'}
            onClick={async () => {
              try {
                const res = await fetch(`http://backend:8000/order/${selectedOrderId}/simulate_fill`, { method: 'POST' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                await fetchOrders();
                setMessage('Order filled successfully');
              } catch (err) {
                console.error(err);
                setMessage('Failed to fill order: ' + err.message);
              }
            }}
          >
            Simulate Fill
          </button>
          <button
            type="button"
            disabled={!selectedOrderId || orders.find(o => o.id === selectedOrderId)?.status !== 'NEW'}
            onClick={async () => {
              try {
                const res = await fetch(`http://backend:8000/order/${selectedOrderId}/cancel`, { method: 'POST' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                await fetchOrders();
                setMessage('Order cancelled successfully');
              } catch (err) {
                console.error(err);
                setMessage('Failed to cancel order: ' + err.message);
              }
            }}
          >
            Cancel Order
          </button>
        </div>
        {message && <div className="message">{message}</div>}
      </form>

      <hr />

      <h4>Orders</h4>

      <table className="orders-table blotter">
        <thead>
          <tr>
            <th>ID</th>
            <th>
              Instrument
              <div className="header-filter"><input placeholder="Symbol/Instr" value={filterInstrument} onChange={(e) => setFilterInstrument(e.target.value)} /></div>
            </th>
            <th>Side</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Trader
              <div className="header-filter"><input placeholder="Trader" value={filterTrader} onChange={(e) => setFilterTrader(e.target.value)} /></div>
            </th>
            <th>Status
              <div className="header-filter">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All</option>
                  <option value="NEW">New</option>
                  <option value="FILLED">Filled</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </th>
            <th>Created
              <div className="header-filter"><input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} /></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr
              key={o.id}
              onClick={() => {
                setSelectedOrderId(o.id);
                loadOrderToForm(o);
              }}
              className={selectedOrderId === o.id ? 'selected' : ''}
              style={{ cursor: 'pointer' }}
            >
              <td>{o.id}</td>
              <td style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="symbol-chip">{o.instrument}</span>
                    {/* only show a secondary name if provided and different from the instrument code */}
                    {(o.name && o.name !== o.instrument) || (o.instrument_name && o.instrument_name !== o.instrument) ? (
                      <div className="instrument-name" style={{ marginLeft: 8 }}>{o.name || o.instrument_name}</div>
                    ) : null}
                  </div>
                </div>
              </td>
              <td>{o.side}</td>
              <td>{o.qty}</td>
              <td>{o.price}</td>
              <td>{o.trader}</td>
              <td><span className={`status-badge status-${(o.status||'').toLowerCase()}`}>{o.status}</span></td>
              <td>{o.created_at ? new Date(o.created_at).toLocaleString() : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* action buttons moved to the form */}
    </div>
  );
}

export default OrderEntry;
