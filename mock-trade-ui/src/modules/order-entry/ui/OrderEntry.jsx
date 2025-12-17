import React, { useState, useEffect } from "react";
import { useAuth } from "../../../core/auth";
import { usePermissions } from "../../../core/security";
import "../../../components/BloombergTheme.css";

// FIX Modal Component
const FIXModal = ({ open, onClose, fixRaw, orderSummary, errorMsg, order }) => {
  const [view, setView] = useState('parsed'); // 'raw' or 'parsed'
  
  if (!open) return null;
  
  // Parse FIX function (simplified version)
  const parseFix = (fixString) => {
    if (!fixString) return [];
    
    const fields = [];
    const pairs = fixString.split('|').filter(p => p.includes('='));
    
    const tagDescriptions = {
      '8': { name: 'BeginString', desc: 'FIX protocol version' },
      '9': { name: 'BodyLength', desc: 'Message body length' },
      '35': { name: 'MsgType', desc: 'Message type' },
      '49': { name: 'SenderCompID', desc: 'Sender company ID' },
      '56': { name: 'TargetCompID', desc: 'Target company ID' },
      '34': { name: 'MsgSeqNum', desc: 'Message sequence number' },
      '52': { name: 'SendingTime', desc: 'Time of message transmission' },
      '11': { name: 'ClOrdID', desc: 'Client order ID' },
      '55': { name: 'Symbol', desc: 'Security symbol' },
      '54': { name: 'Side', desc: 'Side (1=Buy, 2=Sell)' },
      '38': { name: 'OrderQty', desc: 'Order quantity' },
      '40': { name: 'OrdType', desc: 'Order type (1=Market, 2=Limit)' },
      '44': { name: 'Price', desc: 'Price' },
      '59': { name: 'TimeInForce', desc: 'Time in force (0=Day, 1=GTC)' },
      '1': { name: 'Account', desc: 'Account' },
      '10': { name: 'CheckSum', desc: 'Checksum' }
    };
    
    pairs.forEach(pair => {
      const [tag, value] = pair.split('=');
      const info = tagDescriptions[tag] || { name: `Tag ${tag}`, desc: 'Unknown field' };
      fields.push({
        tag,
        name: info.name,
        value,
        displayValue: value,
        description: info.desc
      });
    });
    
    return fields;
  };
  
  const parsed = parseFix(fixRaw || '');
  
  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(fixRaw || '');
    } catch (e) {
      console.error('Copy failed', e);
    }
  };
  
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
  };
  
  const panelStyle = {
    width: '700px', maxWidth: '95%', maxHeight: '85vh', backgroundColor: '#fff', color: '#1f2933', padding: '24px', boxSizing: 'border-box', overflow: 'auto', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  };
  
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e5e7eb' };
  
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2933' }}>FIX Message</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{orderSummary?.id || 'Order'} · {orderSummary?.instrument} · {orderSummary?.side} · {orderSummary?.qty}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView(view === 'parsed' ? 'raw' : 'parsed')} style={{ padding: '6px 12px', borderRadius: 4, background: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>{view === 'parsed' ? 'Raw' : 'Parsed'}</button>
            <button onClick={copyRaw} style={{ padding: '6px 12px', borderRadius: 4, background: '#1d4ed8', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Copy</button>
            <button onClick={onClose} style={{ padding: '6px 12px', borderRadius: 4, background: '#fff', border: '1px solid #d1d5db', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>✕</button>
          </div>
        </div>
        
        {view === 'raw' ? (
          <div>
            {errorMsg && (
              <div style={{ padding: 10, background: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca', marginBottom: 12, fontSize: 12 }}>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: </span>
                <span style={{ color: '#6b7280' }}>{errorMsg}</span>
              </div>
            )}
            <div style={{ fontFamily: 'monospace', fontSize: 11, backgroundColor: '#f9fafb', padding: 14, borderRadius: 6, overflow: 'auto', whiteSpace: 'pre-wrap', border: '1px solid #e5e7eb', color: '#1f2933', lineHeight: 1.6, minHeight: 120 }}>
              {fixRaw || '(No raw FIX data available)'}
            </div>
          </div>
        ) : (
          <div>
            {errorMsg && (
              <div style={{ padding: 10, background: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca', marginBottom: 12, fontSize: 12 }}>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: </span>
                <span style={{ color: '#6b7280' }}>{errorMsg}</span>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '8px', width: 60, color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Tag</th>
                  <th style={{ padding: '8px', width: 140, color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Name</th>
                  <th style={{ padding: '8px', color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Value</th>
                  <th style={{ padding: '8px', width: 180, color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((f, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace', color: '#1d4ed8', fontSize: 11 }}>{f.tag}</td>
                    <td style={{ padding: '8px', color: '#1f2933', fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: '8px', color: '#374151', fontFamily: 'monospace', fontSize: 11 }}>{f.displayValue}</td>
                    <td style={{ padding: '8px', color: '#6b7280', fontSize: 11 }}>{f.description}</td>
                  </tr>
                ))}
                {parsed.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 12, color: '#9ca3af', textAlign: 'center' }}>No fields parsed</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Prefer an explicit VITE_API_BASE; fall back to empty string so dev proxy forwards relative /api calls
const API_BASE = import.meta.env.VITE_API_BASE || "";

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function OrderEntry({ onSelectOrder }) {
  const { getAuthHeaders, user } = useAuth();
  const { canEditModule, canViewModule } = usePermissions();
  
  // For ADMIN users, always allow access regardless of module permissions
  const isAdmin = user?.role === "ADMIN";
  const [mode, setMode] = useState("SINGLE"); // SINGLE, STRADDLE, STRANGLE
  const [instrument, setInstrument] = useState("");
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("LIMIT");
  const [tif, setTif] = useState("DAY");
  const [trader, setTrader] = useState("");
  const [account, setAccount] = useState("");
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [filterInstrument, setFilterInstrument] = useState("");
  const [filterTrader, setFilterTrader] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  
  // Strategy mode states
  const [strategyExpiry, setStrategyExpiry] = useState("");
  const [strategyStrike, setStrategyStrike] = useState("");
  const [callStrike, setCallStrike] = useState("");
  const [putStrike, setPutStrike] = useState("");
  const [strategyNetPrice, setStrategyNetPrice] = useState("");
  const [callLeg, setCallLeg] = useState({ side: "BUY", qty: "", price: "", type: "LIMIT" });
  const [putLeg, setPutLeg] = useState({ side: "BUY", qty: "", price: "", type: "LIMIT" });
  
  // Static data for dropdowns
  const [instruments, setInstruments] = useState([]);
  const [traders, setTraders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [staticDataLoaded, setStaticDataLoaded] = useState(false);
  
  // State for FIX modal
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [selectedOrderForFix, setSelectedOrderForFix] = useState(null);
  const [fixRaw, setFixRaw] = useState('');
  const [fixErrorMsg, setFixErrorMsg] = useState(null);

  // Check permissions when component mounts
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if user has view permission first (unless they're an admin)
        const canView = isAdmin || await canViewModule("OrderEntry");
        if (!canView) {
          // If user doesn't have view permission, don't show the module at all
          setMessage("You don't have permission to access the Order Entry module.");
          setPermissionChecked(true);
          return;
        }
        
        // Check if user has edit permission (unless they're an admin)
        const canEdit = isAdmin || await canEditModule("OrderEntry");
        setHasEditPermission(canEdit);
        setPermissionChecked(true);
        
        if (!canEdit && !isAdmin) {
          setMessage("You have read-only access to Order Entry. Contact admin for write permissions.");
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissionChecked(true);
      }
    };

    checkPermissions();
  }, [canEditModule, canViewModule]);

  useEffect(() => {
    if (permissionChecked) {
      fetchOrders();
      fetchStaticData();
    }
  }, [permissionChecked]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/orders/`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log("No orders yet");
    }
  };
  
  const fetchStaticData = async () => {
    try {
      // Fetch instruments
      const instrumentsResponse = await fetch(`${API_BASE}/api/v1/static-data/instruments`, {
        headers: getAuthHeaders()
      });
      if (instrumentsResponse.ok) {
        const instrumentsData = await instrumentsResponse.json();
        console.log('Instruments data:', instrumentsData);
        setInstruments(Array.isArray(instrumentsData) ? instrumentsData : []);
      }
      
      // Fetch traders
      const tradersResponse = await fetch(`${API_BASE}/api/v1/static-data/traders`, {
        headers: getAuthHeaders()
      });
      if (tradersResponse.ok) {
        const tradersData = await tradersResponse.json();
        console.log('Traders data:', tradersData);
        setTraders(Array.isArray(tradersData) ? tradersData : []);
      }
      
      // Fetch accounts
      const accountsResponse = await fetch(`${API_BASE}/api/v1/static-data/accounts`, {
        headers: getAuthHeaders()
      });
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        console.log('Accounts data:', accountsData);
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }
      
      setStaticDataLoaded(true);
    } catch (error) {
      console.error("Error fetching static data:", error);
      setMessage("Error loading static data. Some dropdowns may be empty.");
      setStaticDataLoaded(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has permission to create orders (unless they're an admin)
    if (!isAdmin && !hasEditPermission) {
      setMessage("You don't have permission to create orders.");
      return;
    }
    
    if (!instrument || !qty) {
      setMessage("Instrument and Quantity are required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/orders/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          instrument,
          side,
          qty: parseFloat(qty),
          price: price ? parseFloat(price) : undefined,
          type,
          tif,
          trader: trader,
          account: account
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to submit order";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const order = await response.json();
      setOrders([order, ...orders]);
      setMessage("Order submitted successfully");

      // Reset form
      setInstrument("");
      setQty("");
      setPrice("");
      setType("LIMIT");
      setTif("DAY");
      setTrader("");
      setAccount("");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleStrategySubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has permission to create orders (unless they're an admin)
    if (!isAdmin && !hasEditPermission) {
      setMessage("You don't have permission to create strategy orders.");
      return;
    }
    
    if (!instrument || !qty) {
      setMessage("Underlying and Quantity are required");
      return;
    }

    try {
      // For STRADDLE, both legs share the same strike
      if (mode === "STRADDLE" && !strategyStrike) {
        setMessage("Strike price is required for Straddle strategy");
        return;
      }
      
      // For STRANGLE, each leg has its own strike
      if (mode === "STRANGLE" && (!callStrike || !putStrike)) {
        setMessage("Both Call and Put strikes are required for Strangle strategy");
        return;
      }
      
      // Prepare the strategy order data
      const strategyOrderData = {
        strategyType: mode,
        underlying: instrument,
        expiry: strategyExpiry,
        account: account,
        side: side,
        quantity: parseInt(qty),
        timeInForce: tif,
        netPrice: strategyNetPrice ? parseFloat(strategyNetPrice) : undefined,
        legs: []
      };
      
      // Add legs based on strategy type
      if (mode === "STRADDLE") {
        strategyOrderData.legs = [
          {
            type: "CALL",
            side: callLeg.side,
            quantity: parseInt(callLeg.qty || qty),
            price: callLeg.price ? parseFloat(callLeg.price) : undefined,
            orderType: callLeg.type,
            strike: parseFloat(strategyStrike)
          },
          {
            type: "PUT",
            side: putLeg.side,
            quantity: parseInt(putLeg.qty || qty),
            price: putLeg.price ? parseFloat(putLeg.price) : undefined,
            orderType: putLeg.type,
            strike: parseFloat(strategyStrike)
          }
        ];
      } else if (mode === "STRANGLE") {
        strategyOrderData.legs = [
          {
            type: "CALL",
            side: callLeg.side,
            quantity: parseInt(callLeg.qty || qty),
            price: callLeg.price ? parseFloat(callLeg.price) : undefined,
            orderType: callLeg.type,
            strike: parseFloat(callStrike)
          },
          {
            type: "PUT",
            side: putLeg.side,
            quantity: parseInt(putLeg.qty || qty),
            price: putLeg.price ? parseFloat(putLeg.price) : undefined,
            orderType: putLeg.type,
            strike: parseFloat(putStrike)
          }
        ];
      }
      
      // Submit the strategy order
      const response = await fetch(`${API_BASE}/api/v1/orders/strategy`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(strategyOrderData)
      });

      if (!response.ok) {
        let errorMessage = "Failed to submit strategy order";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const order = await response.json();
      setOrders([order, ...orders]);
      setMessage("Strategy order submitted successfully");

      // Reset form
      setStrategyExpiry("");
      setStrategyStrike("");
      setCallStrike("");
      setPutStrike("");
      setStrategyNetPrice("");
      setCallLeg({ side: "BUY", qty: "", price: "", type: "LIMIT" });
      setPutLeg({ side: "BUY", qty: "", price: "", type: "LIMIT" });

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleFillOrder = async (orderId) => {
    // Check if user has permission to fill orders (unless they're an admin)
    if (!isAdmin && !hasEditPermission) {
      setMessage("You don't have permission to fill orders.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to fill this order?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/orders/${orderId}/simulate_fill`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        let errorMessage = "Failed to fill order";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Refresh orders to show updated status
      await fetchOrders();
      setMessage("Order filled successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    return (
      (filterInstrument === "" || order.instrument.toLowerCase().includes(filterInstrument.toLowerCase())) &&
      (filterTrader === "" || order.trader.toLowerCase().includes(filterTrader.toLowerCase())) &&
      (filterStatus === "ALL" || order.status === filterStatus)
    );
  });
  
  // Group orders by strategy if they have strategy_leg property
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    if (order.strategy_leg) {
      // This is a strategy leg
      const strategyKey = order.strategy_leg.split('_')[0]; // Extract strategy type
      if (!groups.strategies[strategyKey]) {
        groups.strategies[strategyKey] = [];
      }
      groups.strategies[strategyKey].push(order);
    } else {
      // This is a regular order
      groups.regular.push(order);
    }
    return groups;
  }, { strategies: {}, regular: [] });
  
  // Generate FIX 4.2 message from order
  const generateFixMessage = (order) => {
    const SOH = '|'; // Use pipe for display
    const fields = [];
    
    // Standard FIX header
    fields.push('8=FIX.4.2'); // BeginString
    fields.push('35=D'); // MsgType (D = New Order Single)
    fields.push('49=MOCKTRADE'); // SenderCompID
    fields.push('56=BROKER'); // TargetCompID
    fields.push(`34=${Math.floor(Math.random() * 10000)}`); // MsgSeqNum
    fields.push(`52=${new Date().toISOString().replace(/[-:]/g, '').substring(0, 17)}`);
    
    // Order fields
    fields.push(`11=${order.id || order.order_id || 'N/A'}`); // ClOrdID
    fields.push(`55=${order.instrument || order.symbol || 'N/A'}`); // Symbol
    fields.push(`54=${order.side === 'BUY' ? '1' : '2'}`); // Side (1=Buy, 2=Sell)
    fields.push(`38=${order.qty || 0}`); // OrderQty
    fields.push(`40=${order.type === 'LIMIT' ? '2' : '1'}`); // OrdType (1=Market, 2=Limit)
    
    if (order.price) {
      fields.push(`44=${order.price}`); // Price
    }
    
    fields.push(`59=${order.tif === 'DAY' ? '0' : order.tif === 'GTC' ? '1' : '0'}`); // TimeInForce
    
    if (order.account) {
      fields.push(`1=${order.account}`); // Account
    }
    
    // Checksum (simplified - just use field count)
    fields.push(`10=${String(fields.length).padStart(3, '0')}`);
    
    return fields.join(SOH) + SOH;
  };
  
  const handleViewFix = (order) => {
    try {
      const fixMsg = generateFixMessage(order);
      setFixRaw(fixMsg);
      setFixErrorMsg(null);
      setSelectedOrderForFix(order);
      setFixModalOpen(true);
    } catch (e) {
      console.error('Failed to generate FIX', e);
      setFixErrorMsg('Unable to generate FIX message');
      setFixRaw('');
      setSelectedOrderForFix(order);
      setFixModalOpen(true);
    }
  };

  const handleSelectOrder = (order) => {
    if (onSelectOrder) {
      onSelectOrder(order.id, order);
    }
  };

  // If permissions haven't been checked yet, show loading
  if (!permissionChecked) {
    return (
      <div style={{ fontFamily: FONT_FAMILY, padding: "20px" }}>
        <div>Checking permissions...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
      {/* Order Entry Panel */}
      <div style={{ backgroundColor: "#fff", borderRadius: "6px", padding: "16px", border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "700",
            color: "#1f2933",
          }}>
            Order Entry
          </h2>
          
          {/* Mode Toggle */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => setMode("SINGLE")}
              style={{
                padding: "4px 8px",
                backgroundColor: mode === "SINGLE" ? "#1d4ed8" : "#f3f4f6",
                color: mode === "SINGLE" ? "#fff" : "#4b5563",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600",
                fontFamily: FONT_FAMILY
              }}
            >
              Single
            </button>
            <button
              onClick={() => setMode("STRADDLE")}
              style={{
                padding: "4px 8px",
                backgroundColor: mode === "STRADDLE" ? "#1d4ed8" : "#f3f4f6",
                color: mode === "STRADDLE" ? "#fff" : "#4b5563",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600",
                fontFamily: FONT_FAMILY
              }}
            >
              Straddle
            </button>
            <button
              onClick={() => setMode("STRANGLE")}
              style={{
                padding: "4px 8px",
                backgroundColor: mode === "STRANGLE" ? "#1d4ed8" : "#f3f4f6",
                color: mode === "STRANGLE" ? "#fff" : "#4b5563",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600",
                fontFamily: FONT_FAMILY
              }}
            >
              Strangle
            </button>
          </div>
        </div>
        
        {message && (
          <div style={{
            padding: "8px 12px",
            margin: "12px 0",
            backgroundColor: message.includes("Error") || message.includes("permission") ? "#fee2e2" : "#d1fae5",
            color: message.includes("Error") || message.includes("permission") ? "#7f1d1d" : "#065f46",
            borderRadius: "4px",
            border: `1px solid ${message.includes("Error") || message.includes("permission") ? "#fecaca" : "#a7f3d0"}`,
            fontSize: "12px",
          }}>
            {message}
          </div>
        )}

        {/* Single Order Form */}
        {mode === "SINGLE" && (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", marginTop: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Instrument *</label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  fontFamily: FONT_FAMILY
                }}
                required
                disabled={!isAdmin && !hasEditPermission}
              >
                <option value="">Select Instrument</option>
                {instruments.map((inst) => (
                  <option key={inst.instrument_id} value={inst.instrument_id}>
                    {inst.symbol || inst.instrument_id} - {inst.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Side</label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  fontFamily: FONT_FAMILY
                }}
                disabled={!isAdmin && !hasEditPermission}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Quantity *</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="e.g. 100"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  boxSizing: "border-box",
                  fontFamily: FONT_FAMILY
                }}
                required
                disabled={!isAdmin && !hasEditPermission}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 4500.50"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  boxSizing: "border-box",
                  fontFamily: FONT_FAMILY
                }}
                disabled={!isAdmin && !hasEditPermission}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  fontFamily: FONT_FAMILY
                }}
                disabled={!isAdmin && !hasEditPermission}
              >
                <option value="MARKET">MARKET</option>
                <option value="LIMIT">LIMIT</option>
                <option value="STOP">STOP</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>TIF</label>
              <select
                value={tif}
                onChange={(e) => setTif(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  fontFamily: FONT_FAMILY
                }}
                disabled={!isAdmin && !hasEditPermission}
              >
                <option value="DAY">DAY</option>
                <option value="GTC">GTC</option>
                <option value="IOC">IOC</option>
                <option value="FOK">FOK</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Trader</label>
              <select
                value={trader}
                onChange={(e) => setTrader(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  fontFamily: FONT_FAMILY
                }}
                disabled={!isAdmin && !hasEditPermission}
              >
                <option value="">Select Trader</option>
                {traders.map((trd) => (
                  <option key={trd.trader_id} value={trd.trader_id}>
                    {trd.user_id || trd.trader_id} - {trd.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  fontFamily: FONT_FAMILY
                }}
                disabled={!isAdmin && !hasEditPermission}
              >
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.account_id} value={acc.account_id}>
                    {acc.code || acc.account_id} - {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: "10px 16px",
              backgroundColor: (isAdmin || hasEditPermission) ? "#1d4ed8" : "#d1d5db",
              color: (isAdmin || hasEditPermission) ? "#fff" : "#6b7280",
              border: "none",
              borderRadius: "4px",
              fontWeight: "600",
              cursor: (isAdmin || hasEditPermission) ? "pointer" : "not-allowed",
              fontSize: "13px",
              fontFamily: FONT_FAMILY,
              marginTop: "8px"
            }}
            disabled={!isAdmin && !hasEditPermission}
          >
            Submit Order
          </button>
        </form>
      )}

        {/* Strategy Order Forms */}
        {(mode === "STRADDLE" || mode === "STRANGLE") && (
          <div style={{ display: "grid", gap: "16px", marginTop: "16px" }}>
            {/* Common Strategy Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Underlying *</label>
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: "#f9fafb",
                    fontFamily: FONT_FAMILY
                  }}
                  required
                  disabled={!isAdmin && !hasEditPermission}
                >
                  <option value="">Select Underlying</option>
                  {instruments.map((inst) => (
                    <option key={inst.instrument_id} value={inst.instrument_id}>
                      {inst.symbol || inst.instrument_id} - {inst.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Expiry</label>
                <input
                  type="date"
                  value={strategyExpiry}
                  onChange={(e) => setStrategyExpiry(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: "#f9fafb",
                    boxSizing: "border-box",
                    fontFamily: FONT_FAMILY
                  }}
                  disabled={!isAdmin && !hasEditPermission}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Strategy Side</label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: "#f9fafb",
                    fontFamily: FONT_FAMILY
                  }}
                  disabled={!isAdmin && !hasEditPermission}
                >
                  <option value="BUY">BUY (Long)</option>
                  <option value="SELL">SELL (Short)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Quantity</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="e.g. 100"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: "#f9fafb",
                    boxSizing: "border-box",
                    fontFamily: FONT_FAMILY
                  }}
                  disabled={!isAdmin && !hasEditPermission}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Account</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: "#f9fafb",
                    fontFamily: FONT_FAMILY
                  }}
                  disabled={!isAdmin && !hasEditPermission}
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc.account_id} value={acc.account_id}>
                      {acc.code || acc.account_id} - {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>TIF</label>
                <select
                  value={tif}
                  onChange={(e) => setTif(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: "#f9fafb",
                    fontFamily: FONT_FAMILY
                  }}
                  disabled={!isAdmin && !hasEditPermission}
                >
                  <option value="DAY">DAY</option>
                  <option value="GTC">GTC</option>
                  <option value="IOC">IOC</option>
                </select>
              </div>
            </div>

            {/* Specific Fields for STRADDLE */}
            {mode === "STRADDLE" && (
              <>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Strike Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={strategyStrike}
                    onChange={(e) => setStrategyStrike(e.target.value)}
                    placeholder="e.g. 1.1200"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: "#f9fafb",
                      boxSizing: "border-box",
                      fontFamily: FONT_FAMILY
                    }}
                    disabled={!isAdmin && !hasEditPermission}
                  />
                </div>

                {/* Call Leg */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "4px", padding: "12px", backgroundColor: "#f9fafb" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "700", color: "#1f2933" }}>Call Leg</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Action</label>
                      <select
                        value={callLeg.side}
                        onChange={(e) => setCallLeg({...callLeg, side: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Quantity</label>
                      <input
                        type="number"
                        value={callLeg.qty || qty}
                        onChange={(e) => setCallLeg({...callLeg, qty: e.target.value})}
                        placeholder="e.g. 100"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Type</label>
                      <select
                        value={callLeg.type}
                        onChange={(e) => setCallLeg({...callLeg, type: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      >
                        <option value="MARKET">MARKET</option>
                        <option value="LIMIT">LIMIT</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={callLeg.price}
                      onChange={(e) => setCallLeg({...callLeg, price: e.target.value})}
                      placeholder="e.g. 0.0050"
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: "#fff",
                        boxSizing: "border-box",
                        fontFamily: FONT_FAMILY
                      }}
                      disabled={!isAdmin && !hasEditPermission}
                    />
                  </div>
                </div>

                {/* Put Leg */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "4px", padding: "12px", backgroundColor: "#f9fafb" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "700", color: "#1f2933" }}>Put Leg</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Action</label>
                      <select
                        value={putLeg.side}
                        onChange={(e) => setPutLeg({...putLeg, side: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Quantity</label>
                      <input
                        type="number"
                        value={putLeg.qty || qty}
                        onChange={(e) => setPutLeg({...putLeg, qty: e.target.value})}
                        placeholder="e.g. 100"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Type</label>
                      <select
                        value={putLeg.type}
                        onChange={(e) => setPutLeg({...putLeg, type: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      >
                        <option value="MARKET">MARKET</option>
                        <option value="LIMIT">LIMIT</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={putLeg.price}
                      onChange={(e) => setPutLeg({...putLeg, price: e.target.value})}
                      placeholder="e.g. 0.0050"
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "11px",
                        backgroundColor: "#fff",
                        boxSizing: "border-box",
                        fontFamily: FONT_FAMILY
                      }}
                      disabled={!isAdmin && !hasEditPermission}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Specific Fields for STRANGLE */}
            {mode === "STRANGLE" && (
              <>
                {/* Call Leg */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "4px", padding: "12px", backgroundColor: "#f9fafb" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "700", color: "#1f2933" }}>Call Leg</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Strike</label>
                      <input
                        type="number"
                        step="0.01"
                        value={callStrike}
                        onChange={(e) => setCallStrike(e.target.value)}
                        placeholder="e.g. 1.1250"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Action</label>
                      <select
                        value={callLeg.side}
                        onChange={(e) => setCallLeg({...callLeg, side: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Quantity</label>
                      <input
                        type="number"
                        value={callLeg.qty || qty}
                        onChange={(e) => setCallLeg({...callLeg, qty: e.target.value})}
                        placeholder="e.g. 100"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Type</label>
                      <select
                        value={callLeg.type}
                        onChange={(e) => setCallLeg({...callLeg, type: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      >
                        <option value="MARKET">MARKET</option>
                        <option value="LIMIT">LIMIT</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={callLeg.price}
                        onChange={(e) => setCallLeg({...callLeg, price: e.target.value})}
                        placeholder="e.g. 0.0050"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      />
                    </div>
                  </div>
                </div>

                {/* Put Leg */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "4px", padding: "12px", backgroundColor: "#f9fafb" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "700", color: "#1f2933" }}>Put Leg</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Strike</label>
                      <input
                        type="number"
                        step="0.01"
                        value={putStrike}
                        onChange={(e) => setPutStrike(e.target.value)}
                        placeholder="e.g. 1.1150"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Action</label>
                      <select
                        value={putLeg.side}
                        onChange={(e) => setPutLeg({...putLeg, side: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Quantity</label>
                      <input
                        type="number"
                        value={putLeg.qty || qty}
                        onChange={(e) => setPutLeg({...putLeg, qty: e.target.value})}
                        placeholder="e.g. 100"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Type</label>
                      <select
                        value={putLeg.type}
                        onChange={(e) => setPutLeg({...putLeg, type: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      >
                        <option value="MARKET">MARKET</option>
                        <option value="LIMIT">LIMIT</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={putLeg.price}
                        onChange={(e) => setPutLeg({...putLeg, price: e.target.value})}
                        placeholder="e.g. 0.0050"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                        disabled={!isAdmin && !hasEditPermission}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Net Price Field */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>Net Price (Optional)</label>
              <input
                type="number"
                step="0.01"
                value={strategyNetPrice}
                onChange={(e) => setStrategyNetPrice(e.target.value)}
                placeholder="Combined debit/credit for strategy"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "#f9fafb",
                  boxSizing: "border-box",
                  fontFamily: FONT_FAMILY
                }}
                disabled={!isAdmin && !hasEditPermission}
              />
            </div>

            <button
              onClick={handleStrategySubmit}
              style={{
                padding: "10px 16px",
                backgroundColor: (isAdmin || hasEditPermission) ? "#1d4ed8" : "#d1d5db",
                color: (isAdmin || hasEditPermission) ? "#fff" : "#6b7280",
                border: "none",
                borderRadius: "4px",
                fontWeight: "600",
                cursor: (isAdmin || hasEditPermission) ? "pointer" : "not-allowed",
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
                marginTop: "8px"
              }}
              disabled={!isAdmin && !hasEditPermission}
            >
              Submit {mode} Strategy
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
          <div style={{ fontSize: "11px", color: "#4b5563" }}>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>Order Stats</div>
            <div>Total Orders: {orders.length}</div>
            <div>New: {orders.filter(o => o.status === "NEW").length}</div>
            <div>Filled: {orders.filter(o => o.status === "FILLED").length}</div>
          </div>
        </div>
      </div>

      {/* Order Blotter Panel */}
      <div style={{ backgroundColor: "#fff", borderRadius: "6px", padding: "16px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "700",
            color: "#1f2933"
          }}>
            Order Blotter
          </h2>
          
          {/* Filters */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Instrument"
              value={filterInstrument}
              onChange={(e) => setFilterInstrument(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "11px",
                backgroundColor: "#f9fafb",
                width: "80px",
                fontFamily: FONT_FAMILY
              }}
            />
            <input
              type="text"
              placeholder="Trader"
              value={filterTrader}
              onChange={(e) => setFilterTrader(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "11px",
                backgroundColor: "#f9fafb",
                width: "80px",
                fontFamily: FONT_FAMILY
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "11px",
                backgroundColor: "#f9fafb",
                fontFamily: FONT_FAMILY
              }}
            >
              <option value="ALL">All</option>
              <option value="NEW">New</option>
              <option value="PARTIAL">Partial</option>
              <option value="FILLED">Filled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: FONT_FAMILY }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>ID</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>Instr</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>Side</th>
                <th style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>Qty</th>
                <th style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>Price</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>Trader</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>Status</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>Time</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "#4b5563", fontWeight: "700", fontSize: "10px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: "16px 12px", textAlign: "center", color: "#9ca3af", fontSize: "12px" }}>
                    No orders
                  </td>
                </tr>
              ) : (
                <>
                  {/* Render strategy orders first */}
                  {Object.entries(groupedOrders.strategies).map(([strategyType, legs]) => (
                    <React.Fragment key={strategyType}>
                      {/* Strategy header row */}
                      <tr style={{ 
                        backgroundColor: "#dbeafe", 
                        borderBottom: "1px solid #e5e7eb",
                        fontWeight: "600"
                      }}>
                        <td style={{ padding: "8px 12px", color: "#1f2933" }} colSpan="2">
                          {strategyType} Strategy ({legs.length} legs)
                        </td>
                        <td style={{ padding: "8px 12px", color: legs[0]?.side === "BUY" ? "#10b981" : "#ef4444" }}>
                          {legs[0]?.side}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563" }}>
                          {legs.reduce((sum, leg) => sum + (leg.qty || 0), 0)?.toLocaleString()}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563" }}>
                          Avg: {legs.reduce((sum, leg) => sum + (leg.price || 0), 0) / legs.length || "-"}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#4b5563" }}>
                          {legs[0]?.trader}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            fontSize: "9px",
                            fontWeight: "700",
                            backgroundColor: "#bfdbfe",
                            color: "#1e40af",
                            border: "1px solid #93c5fd"
                          }}>
                            STRATEGY
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "10px" }}>
                          {legs[0]?.created_at ? new Date(legs[0].created_at).toLocaleTimeString() : "-"}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // View FIX for strategy - could show all legs
                                handleViewFix(legs[0]);
                              }}
                              style={{
                                padding: "3px 6px",
                                backgroundColor: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "2px",
                                fontSize: "10px",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              View FIX
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Render each leg */}
                      {legs.map((leg, index) => (
                        <tr 
                          key={leg.id} 
                          onClick={() => handleSelectOrder(leg)}
                          style={{ 
                            backgroundColor: index % 2 === 0 ? "#eff6ff" : "#dbeafe", 
                            borderBottom: "1px solid #e5e7eb",
                            cursor: "pointer",
                            fontStyle: "italic"
                          }}
                        >
                          <td style={{ padding: "8px 12px", color: "#1f2933", fontSize: "10px" }}>
                            ↳ {leg.id?.substring(0, 8) || "N/A"}
                          </td>
                          <td style={{ padding: "8px 12px", color: "#1f2933", fontSize: "10px" }}>
                            {leg.leg_type} (Strike: {leg.strike})
                          </td>
                          <td style={{ padding: "8px 12px", color: leg.side === "BUY" ? "#10b981" : "#ef4444", fontSize: "10px" }}>
                            {leg.side}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "10px" }}>
                            {leg.qty?.toLocaleString()}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "10px" }}>
                            {leg.price ? leg.price.toFixed(2) : "-"}
                          </td>
                          <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "10px" }}>
                            {leg.trader}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              fontSize: "9px",
                              fontWeight: "700",
                              backgroundColor: leg.status === "NEW" ? "#fef3c7" : leg.status === "FILLED" ? "#d1fae5" : leg.status === "PARTIAL" ? "#ffe7ba" : leg.status === "CANCELLED" ? "#fed7d7" : "#e5e7eb",
                              color: leg.status === "NEW" ? "#78350f" : leg.status === "FILLED" ? "#065f46" : leg.status === "PARTIAL" ? "#92400e" : leg.status === "CANCELLED" ? "#7f1d1d" : "#4b5563",
                              border: `1px solid ${leg.status === "NEW" ? "#fde68a" : leg.status === "FILLED" ? "#a7f3d0" : leg.status === "PARTIAL" ? "#fcd34d" : leg.status === "CANCELLED" ? "#fecaca" : "#d1d5db"}`
                            }}>
                              {leg.status}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "10px" }}>
                            {leg.created_at ? new Date(leg.created_at).toLocaleTimeString() : "-"}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewFix(leg);
                                }}
                                style={{
                                  padding: "3px 6px",
                                  backgroundColor: "#3b82f6",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "2px",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  cursor: "pointer"
                                }}
                              >
                                View FIX
                              </button>
                              {(leg.status === "NEW" || leg.status === "PARTIAL") && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFillOrder(leg.id);
                                  }}
                                  style={{
                                    padding: "3px 6px",
                                    backgroundColor: "#10b981",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "2px",
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    cursor: (isAdmin || hasEditPermission) ? "pointer" : "not-allowed",
                                    opacity: (isAdmin || hasEditPermission) ? 1 : 0.5
                                  }}
                                  disabled={!isAdmin && !hasEditPermission}
                                >
                                  Fill
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  
                  {/* Render regular orders */}
                  {groupedOrders.regular.map((order, index) => (
                    <tr 
                      key={order.id} 
                      onClick={() => handleSelectOrder(order)}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb", 
                        borderBottom: "1px solid #e5e7eb",
                        cursor: "pointer"
                      }}
                    >
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600" }}>{order.id?.substring(0, 8) || "N/A"}</td>
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "500" }}>{order.instrument}</td>
                      <td style={{ padding: "8px 12px", color: order.side === "BUY" ? "#10b981" : "#ef4444", fontWeight: "600" }}>{order.side}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563" }}>{order.qty?.toLocaleString()}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563" }}>{order.price ? order.price.toFixed(2) : "-"}</td>
                      <td style={{ padding: "8px 12px", color: "#4b5563" }}>{order.trader}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontSize: "9px",
                          fontWeight: "700",
                          backgroundColor: order.status === "NEW" ? "#fef3c7" : order.status === "FILLED" ? "#d1fae5" : order.status === "PARTIAL" ? "#ffe7ba" : order.status === "CANCELLED" ? "#fed7d7" : "#e5e7eb",
                          color: order.status === "NEW" ? "#78350f" : order.status === "FILLED" ? "#065f46" : order.status === "PARTIAL" ? "#92400e" : order.status === "CANCELLED" ? "#7f1d1d" : "#4b5563",
                          border: `1px solid ${order.status === "NEW" ? "#fde68a" : order.status === "FILLED" ? "#a7f3d0" : order.status === "PARTIAL" ? "#fcd34d" : order.status === "CANCELLED" ? "#fecaca" : "#d1d5db"}`
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "10px" }}>
                        {order.created_at ? new Date(order.created_at).toLocaleTimeString() : "-"}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFix(order);
                            }}
                            style={{
                              padding: "3px 6px",
                              backgroundColor: "#3b82f6",
                              color: "#fff",
                              border: "none",
                              borderRadius: "2px",
                              fontSize: "10px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            View FIX
                          </button>
                          {(order.status === "NEW" || order.status === "PARTIAL") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFillOrder(order.id);
                              }}
                              style={{
                                padding: "3px 6px",
                                backgroundColor: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "2px",
                                fontSize: "10px",
                                fontWeight: "600",
                                cursor: (isAdmin || hasEditPermission) ? "pointer" : "not-allowed",
                                opacity: (isAdmin || hasEditPermission) ? 1 : 0.5
                              }}
                              disabled={!isAdmin && !hasEditPermission}
                            >
                              Fill
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* FIX Modal */}
      {fixModalOpen && (
        <FIXModal 
          open={fixModalOpen} 
          onClose={() => setFixModalOpen(false)} 
          fixRaw={fixRaw} 
          errorMsg={fixErrorMsg} 
          order={selectedOrderForFix}
          orderSummary={{ 
            id: selectedOrderForFix?.id, 
            instrument: selectedOrderForFix?.instrument, 
            side: selectedOrderForFix?.side, 
            qty: selectedOrderForFix?.qty 
          }} 
        />
      )}
    </div>
  );
}

export default OrderEntry;