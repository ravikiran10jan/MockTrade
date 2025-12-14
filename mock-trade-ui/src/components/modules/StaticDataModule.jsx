import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function StaticDataModule() {
  const [activeSection, setActiveSection] = useState("instruments");
  const [activeSubtypeTab, setActiveSubtypeTab] = useState(null);

  const [instruments, setInstruments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [traders, setTraders] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [clearers, setClearers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [otcDetails, setOtcDetails] = useState({});
  const [showOtcForm, setShowOtcForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const section = activeSection;
      const response = await fetch(`${API_BASE}/api/v1/static-data/${section}`);
      const data = await response.json();

      if (section === "instruments") setInstruments(data);
      else if (section === "accounts") setAccounts(data);
      else if (section === "traders") setTraders(data);
      else if (section === "brokers") setBrokers(data);
      else if (section === "clearers") setClearers(data);
    } catch (error) {
      setMessage(`Error loading ${activeSection}: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };

      if (activeSection === "instruments" && payload.metadata) {
        try {
          const parsed = typeof payload.metadata === "string" ? JSON.parse(payload.metadata) : payload.metadata;
          payload.metadata = parsed;
        } catch (err) {
          setMessage(`Error: metadata JSON invalid - ${err.message}`);
          return;
        }
      }

      try {
        const response = await fetch(`${API_BASE}/api/v1/static-data/${activeSection}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorDetail = "Failed to create";
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
          } catch (e) {
            errorDetail = `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorDetail);
        }

        setMessage(`${activeSection.slice(0, -1)} created successfully`);
        setShowForm(false);
        setFormData({});
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        if (fetchError.message.includes("Failed to fetch")) {
          setMessage(`Error: Cannot reach API server at ${API_BASE}. Is the backend running?`);
        } else {
          setMessage(`Error: ${fetchError.message}`);
        }
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleSaveOtcDetails = async (e) => {
    e.preventDefault();
    if (!selectedInstrument) {
      setMessage("Error: No instrument selected");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/static-data/instruments/${selectedInstrument.instrument_id}/otc`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(otcDetails),
        }
      );

      if (!response.ok) {
        let errorDetail = "Failed to save OTC details";
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorDetail);
      }

      setMessage("OTC details saved successfully");
      setShowOtcForm(false);
      setOtcDetails({});
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleUpdate = async (row) => {
    // Get primary key for the item
    const idKey = activeSection === "instruments" ? "instrument_id" :
                  activeSection === "accounts" ? "account_id" :
                  activeSection === "traders" ? "trader_id" :
                  activeSection === "brokers" ? "broker_id" :
                  "clearer_id";

    const itemId = row[idKey];

    // Pre-populate form with current data
    setFormData(row);
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeSection.slice(0, -1)}?`)) {
      return;
    }

    try {
      // Get primary key for the item
      const idKey = activeSection === "instruments" ? "instrument_id" :
                    activeSection === "accounts" ? "account_id" :
                    activeSection === "traders" ? "trader_id" :
                    activeSection === "brokers" ? "broker_id" :
                    "clearer_id";

      const itemId = row[idKey];

      const response = await fetch(`${API_BASE}/api/v1/static-data/${activeSection}/${itemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        let errorDetail = "Failed to delete";
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorDetail);
      }

      setMessage(`${activeSection.slice(0, -1)} deleted successfully`);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        setMessage(`Error: Cannot reach API server at ${API_BASE}. Is the backend running?`);
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  const formFields = {
    instruments: [
      { label: "Symbol", key: "symbol", type: "text", required: true, placeholder: "ES, NQ, AAPL" },
      { label: "Name", key: "name", type: "text", required: true, placeholder: "E-mini S&P 500" },
      { label: "Asset Class", key: "asset_class", type: "text", required: false, placeholder: "FX, EQUITY, FUTURE, OTC" },
      { label: "Instrument Type", key: "instrument_type", type: "text", required: false, placeholder: "OTC_FX_FWD, FX_FUT, STRATEGY" },
      { label: "Status", key: "status", type: "text", required: false, placeholder: "ACTIVE" },
      { label: "Metadata (JSON, optional)", key: "metadata", type: "json", required: false }
    ],
    accounts: [
      { label: "Code", key: "code", type: "text", required: true },
      { label: "Name", key: "name", type: "text", required: true },
    ],
    traders: [
      { label: "User ID", key: "user_id", type: "text", required: true },
      { label: "Name", key: "name", type: "text", required: true },
      { label: "Desk", key: "desk", type: "text", required: true },
    ],
    brokers: [
      { label: "Code", key: "code", type: "text", required: true },
      { label: "Name", key: "name", type: "text", required: true },
    ],
    clearers: [
      { label: "Code", key: "code", type: "text", required: true },
      { label: "Name", key: "name", type: "text", required: true },
      { label: "LEID", key: "leid", type: "text", required: true, placeholder: "Legal Entity Identifier" },
    ],
  };

  const otcFormFields = [
    { label: "Settlement Type", key: "settlement_type", type: "text", placeholder: "PHYSICAL, CASH" },
    { label: "Settlement Day Offset", key: "settlement_day_offset", type: "number", placeholder: "T+N (e.g., 2)" },
    { label: "Day Count Convention", key: "day_count_convention", type: "text", placeholder: "ACT/365, 30/360" },
    { label: "Payment Frequency", key: "payment_frequency", type: "text", placeholder: "QUARTERLY, SEMI-ANNUAL" },
    { label: "Primary Calendar", key: "primary_calendar", type: "text", placeholder: "US, EUR, GBP" },
    { label: "Secondary Calendar", key: "secondary_calendar", type: "text", placeholder: "Optional" },
    { label: "Is Cleared (Y/N)", key: "is_cleared", type: "text", placeholder: "Y or N" },
    { label: "Clearing House", key: "clearing_house", type: "text", placeholder: "LCH, CME Clearing" },
    { label: "Clearing Code", key: "clearing_code", type: "text", placeholder: "Optional" },
    { label: "Bilateral Counterparty", key: "bilateral_cpty", type: "text", placeholder: "Optional" },
  ];

  const sections = {
    instruments: {
      title: "Instruments",
      data: instruments,
      columns: ["instrument_id", "symbol", "name", "asset_class", "instrument_type", "status"],
    },
    accounts: {
      title: "Accounts",
      data: accounts,
      columns: ["account_id", "code", "name", "status"],
    },
    traders: {
      title: "Traders",
      data: traders,
      columns: ["trader_id", "user_id", "name", "desk"],
    },
    brokers: {
      title: "Brokers",
      data: brokers,
      columns: ["broker_id", "code", "name", "status"],
    },
    clearers: {
      title: "Clearers",
      data: clearers,
      columns: ["clearer_id", "code", "name", "leid", "status"],
    },
  };

  const currentSection = sections[activeSection];

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
          Static Data
        </h2>
        <p style={{
          margin: "8px 0 0 0",
          fontSize: "12px",
          color: "#4b5563"
        }}>
          Manage instruments, accounts, traders, brokers, and clearers
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        {Object.keys(sections).map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            style={{
              padding: "8px 12px",
              backgroundColor: activeSection === key ? "#f0f9ff" : "#f3f4f6",
              color: activeSection === key ? "#1d4ed8" : "#6b7280",
              border: activeSection === key ? "1px solid #bfdbfe" : "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: activeSection === key ? "600" : "500",
              fontSize: "12px",
              transition: "all 0.15s",
              fontFamily: FONT_FAMILY
            }}
          >
            {sections[key].title}
          </button>
        ))}
      </div>

      {message && (
        <div
          style={{
            padding: "8px 12px",
            marginBottom: "16px",
            backgroundColor: message.includes("Error") ? "#fee2e2" : "#d1fae5",
            color: message.includes("Error") ? "#7f1d1d" : "#065f46",
            borderRadius: "4px",
            border: `1px solid ${message.includes("Error") ? "#fecaca" : "#a7f3d0"}`,
            fontSize: "12px",
          }}
        >
          {message}
        </div>
      )}

      <div>
        {activeSection === "instruments" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: "20px",
                padding: "12px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "4px"
              }}
            >
              <button
                onClick={() => setActiveSubtypeTab(activeSubtypeTab === "otc" ? null : "otc")}
                style={{
                  padding: "8px 12px",
                  backgroundColor: activeSubtypeTab === "otc" ? "#dbeafe" : "#f3f4f6",
                  color: activeSubtypeTab === "otc" ? "#0c4a6e" : "#6b7280",
                  border: activeSubtypeTab === "otc" ? "1px solid #7dd3fc" : "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY
                }}
              >
                OTC Details
              </button>
              <button
                onClick={() => setActiveSubtypeTab(activeSubtypeTab === "etd" ? null : "etd")}
                style={{
                  padding: "8px 12px",
                  backgroundColor: activeSubtypeTab === "etd" ? "#dcfce7" : "#f3f4f6",
                  color: activeSubtypeTab === "etd" ? "#166534" : "#6b7280",
                  border: activeSubtypeTab === "etd" ? "1px solid #86efac" : "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY
                }}
              >
                ETD Details
              </button>
              <button
                onClick={() => setActiveSubtypeTab(activeSubtypeTab === "strategy" ? null : "strategy")}
                style={{
                  padding: "8px 12px",
                  backgroundColor: activeSubtypeTab === "strategy" ? "#fce7f3" : "#f3f4f6",
                  color: activeSubtypeTab === "strategy" ? "#831843" : "#6b7280",
                  border: activeSubtypeTab === "strategy" ? "1px solid #fbcfe8" : "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY
                }}
              >
                Strategy Details
              </button>
            </div>

            {activeSubtypeTab && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "4px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#166534"
                }}
              >
                ℹ️ First create an instrument above, then select it here to add {activeSubtypeTab.toUpperCase()} details.
              </div>
            )}
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "20px" }}>
          <div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#1d4ed8",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "12px",
                  marginBottom: "16px",
                  fontFamily: FONT_FAMILY
                }}
              >
                New Entry
              </button>
            )}

            {showForm && (
              <div style={{ marginBottom: "20px" }}>
                <form onSubmit={handleCreateNew} style={{ display: "grid", gap: "12px" }}>
                  {formFields[activeSection].map((field) => (
                    <div key={field.key}>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#4b5563",
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px"
                      }}>
                        {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                      </label>
                      {field.type === 'json' ? (
                        <textarea
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          placeholder='{"key": "value"}'
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            backgroundColor: '#f9fafb',
                            color: '#1f2933',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            fontFamily: FONT_FAMILY,
                            minHeight: 80,
                            lineHeight: '1.4'
                          }}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          placeholder={field.placeholder || ""}
                          required={field.required}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            backgroundColor: "#f9fafb",
                            color: "#1f2933",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            fontSize: "12px",
                            boxSizing: "border-box",
                            fontFamily: FONT_FAMILY
                          }}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="submit"
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "#1d4ed8",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontFamily: FONT_FAMILY,
                      marginTop: "8px"
                    }}
                  >
                    Create {activeSection.slice(0, -1)}
                  </button>
                </form>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    marginTop: "8px",
                    backgroundColor: "#f3f4f6",
                    color: "#6b7280",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 style={{
              margin: "0 0 12px 0",
              fontSize: "13px",
              fontWeight: "700",
              color: "#1f2933"
            }}>
              {currentSection.title} ({currentSection.data.length})
            </h3>
            {loading ? (
              <p style={{ color: "#9ca3af", fontSize: "12px" }}>Loading...</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "11px",
                  fontFamily: FONT_FAMILY
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {currentSection.columns.map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: "8px 12px",
                            textAlign: "left",
                            color: "#4b5563",
                            fontWeight: "700",
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px"
                          }}
                        >
                          {col}
                        </th>
                      ))}
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: "#4b5563",
                          fontWeight: "700",
                          fontSize: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.3px"
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSection.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={currentSection.columns.length + 1}
                          style={{
                            padding: "16px 12px",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: "12px",
                          }}
                        >
                          No data
                        </td>
                      </tr>
                    ) : (
                      currentSection.data.map((row, idx) => (
                        <tr
                          key={idx}
                          onClick={() => activeSection === "instruments" && setSelectedInstrument(row)}
                          style={{
                            borderBottom: "1px solid #e5e7eb",
                            backgroundColor: selectedInstrument?.instrument_id === row.instrument_id ? "#dbeafe" : (idx % 2 === 0 ? "#fff" : "#f9fafb"),
                            cursor: activeSection === "instruments" ? "pointer" : "default",
                            transition: "background-color 0.1s",
                          }}
                        >
                          {currentSection.columns.map((col) => (
                            <td
                              key={col}
                              style={{
                                padding: "8px 12px",
                                color: "#4b5563",
                                fontSize: "11px"
                              }}
                            >
                              {String(row[col] || "-").substring(0, 30)}
                            </td>
                          ))}
                          <td
                            style={{
                              padding: "8px 12px",
                              textAlign: "center",
                              fontSize: "11px"
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                              <button
                                onClick={() => handleUpdate(row)}
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#3b82f6",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "3px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: "10px",
                                  fontFamily: FONT_FAMILY,
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(row)}
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "3px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: "10px",
                                  fontFamily: FONT_FAMILY,
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {activeSection === "instruments" && activeSubtypeTab && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px"
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", color: "#1f2933" }}>
              {activeSubtypeTab.toUpperCase()} Instrument Details
            </h3>
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                backgroundColor: "#f9fafb",
                borderRadius: "4px",
                color: "#6b7280",
                fontSize: "12px"
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>
                To add {activeSubtypeTab.toUpperCase()} details:
              </p>
              <ol style={{ margin: "8px 0", textAlign: "left", display: "inline-block", color: "#4b5563" }}>
                <li>Select an instrument from the table above</li>
                <li>Click the {activeSubtypeTab.toUpperCase()} Details button</li>
                <li>Fill in the specific fields and save</li>
              </ol>
              <p style={{ margin: "12px 0 0 0", fontSize: "11px", color: "#9ca3af" }}>
                ({activeSubtypeTab === "otc" && "OTC: settlement type, calendars, clearing details, etc."})
                ({activeSubtypeTab === "etd" && "ETD: exchange, contract specs, margin, trading hours, etc."})
                ({activeSubtypeTab === "strategy" && "Strategy: template, payoff type, rebalance rules, legs, etc."})
              </p>
            </div>
          </div>
        )}

        {activeSection === "instruments" && selectedInstrument && (
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "700",
                color: "#1f2933"
              }}>
                Selected: {selectedInstrument.symbol} - {selectedInstrument.name}
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setShowOtcForm(!showOtcForm)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#1d4ed8",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY
                  }}
                >
                  {showOtcForm ? "Hide OTC Details" : "Add OTC Details"}
                </button>
                <button
                  onClick={() => { setSelectedInstrument(null); setShowOtcForm(false); setOtcDetails({}); }}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#9ca3af",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {showOtcForm && (
              <form onSubmit={handleSaveOtcDetails} style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                marginTop: "12px",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  {otcFormFields.map((field) => (
                    <div key={field.key}>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#4b5563",
                        marginBottom: "4px",
                        textTransform: "uppercase"
                      }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        value={otcDetails[field.key] || ""}
                        onChange={(e) => setOtcDetails({ ...otcDetails, [field.key]: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          backgroundColor: "#fff",
                          color: "#1f2933",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "11px",
                          boxSizing: "border-box",
                          fontFamily: FONT_FAMILY
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button
                    type="submit"
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "12px",
                      fontFamily: FONT_FAMILY
                    }}
                  >
                    Save OTC Details
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowOtcForm(false); setOtcDetails({}); }}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#6b7280",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "12px",
                      fontFamily: FONT_FAMILY
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StaticDataModule;

