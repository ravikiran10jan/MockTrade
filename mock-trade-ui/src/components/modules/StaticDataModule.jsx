import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";

// Prefer an explicit VITE_API_BASE; fall back to empty string so dev proxy forwards relative /api calls
const API_BASE = import.meta.env.VITE_API_BASE || "";
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function StaticDataModule() {
  const { getAuthHeaders, user } = useAuth();
  const { canEditModule, canViewModule } = usePermissions();
  const [activeSection, setActiveSection] = useState("instruments");
  const [activeSubtypeTab, setActiveSubtypeTab] = useState(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasViewPermission, setHasViewPermission] = useState(true);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState("");
  
  // For ADMIN users, always allow editing regardless of module permissions
  const isAdmin = user?.role === "ADMIN";
  const isDisabled = !isAdmin && !hasEditPermission;

  const [instruments, setInstruments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [counterparties, setCounterparties] = useState([]);
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

  // Check permissions when component mounts
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const canView = isAdmin || await canViewModule("StaticData");
        const canEdit = isAdmin || await canEditModule("StaticData");
        
        setHasViewPermission(canView);
        setHasEditPermission(canEdit);
        setPermissionChecked(true);
        
        if (!canView) {
          setPermissionMessage("You don't have permission to access the Static Data module.");
        } else if (!canEdit && !isAdmin) {
          setPermissionMessage("You have read-only access to the Static Data module.");
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissionMessage("Error checking permissions.");
        setPermissionChecked(true);
      }
    };

    checkPermissions();
  }, [canViewModule, canEditModule, isAdmin]);

  useEffect(() => {
    if (permissionChecked && hasViewPermission) {
      fetchData();
    }
  }, [activeSection, permissionChecked, hasViewPermission]);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.items)) return payload.items;
    return [];
  };

  const fetchData = async () => {
    if (!hasViewPermission) return;
    
    setLoading(true);
    try {
      const section = activeSection;
      const response = await fetch(`${API_BASE}/api/v1/static-data/${section}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const normalized = normalizeArray(data);

      if (section === "instruments") setInstruments(normalized);
      else if (section === "counterparties") setCounterparties(normalized);
      else if (section === "accounts") setAccounts(normalized);
      else if (section === "traders") setTraders(normalized);
      else if (section === "brokers") setBrokers(normalized);
      else if (section === "clearers") setClearers(normalized);
    } catch (error) {
      console.error("StaticData fetch error", error);
      setMessage(`Error loading ${activeSection}: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    
    // Check if user has permission to edit (unless they're an admin)
    if (!isAdmin && !hasEditPermission) {
      setMessage("You don't have permission to create new items in Static Data.");
      return;
    }
    
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
          headers: getAuthHeaders(),
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
    
    // Check if user has permission to edit (unless they're an admin)
    if (!isAdmin && !hasEditPermission) {
      setMessage("You don't have permission to save OTC details.");
      return;
    }
    
    if (!selectedInstrument) {
      setMessage("Error: No instrument selected");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/static-data/instruments/${selectedInstrument.instrument_id}/otc`,
        {
          method: "POST",
          headers: getAuthHeaders(),
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
    // Check if user has permission to edit (unless they're an admin)
    if (!isAdmin && !hasEditPermission) {
      setMessage("You don't have permission to update items in Static Data.");
      return;
    }
    
    // Get primary key for the item
    const idKey = activeSection === "instruments" ? "instrument_id" :
                  activeSection === "accounts" ? "account_id" :
                  activeSection === "traders" ? "trader_id" :
                  activeSection === "brokers" ? "broker_id" :
                  "clearer_id";

    const itemId = row[idKey];

    try {
      const response = await fetch(`${API_BASE}/api/v1/static-data/${activeSection}/${itemId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(row),
      });

      if (!response.ok) {
        let errorDetail = "Failed to update";
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorDetail);
      }

      setMessage(`${activeSection.slice(0, -1)} updated successfully`);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (row) => {
    // Check if user has permission to edit (unless they're an admin)
    if (!isAdmin && !hasEditPermission) {
      setMessage("You don't have permission to delete items in Static Data.");
      return;
    }
    
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
        headers: getAuthHeaders(),
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
      setMessage(`Error: ${error.message}`);
    }
  };

  // Show permission message if user doesn't have access
  if (!permissionChecked) {
    return (
      <div style={{ padding: "20px", fontFamily: FONT_FAMILY }}>
        <div style={{
          padding: "15px",
          backgroundColor: "#eff6ff",
          border: "1px solid #dbeafe",
          borderRadius: "6px",
          color: "#1e40af"
        }}>
          Checking permissions...
        </div>
      </div>
    );
  }

  // Always show content but disable actions for users without edit permission
  // VIEWER users should see all content but with disabled actions

  const formFields = {
    instruments: [
      { label: "Symbol", key: "symbol", type: "text", required: true, placeholder: "ES, NQ, AAPL" },
      { label: "Name", key: "name", type: "text", required: true, placeholder: "E-mini S&P 500" },
      { label: "Asset Class", key: "asset_class", type: "text", required: false, placeholder: "FX, EQUITY, FUTURE, OTC" },
      { label: "Instrument Type", key: "instrument_type", type: "text", required: false, placeholder: "OTC_FX_FWD, FX_FUT, STRATEGY" },
      { label: "Expiry Date", key: "expiry_date", type: "date", required: false },
      { label: "Last Trading Date", key: "last_trading_date", type: "date", required: false },
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
    counterparties: [
      // General / Identification
      { label: "Counterparty Code", key: "counterparty_code", type: "text", required: true, placeholder: "CP-1001" },
      { label: "Full Legal Name", key: "full_legal_name", type: "text", required: true },
      { label: "Short Name / Alias", key: "short_name", type: "text", required: false },
      { label: "Customer Type", key: "customer_type", type: "text", required: true, placeholder: "Internal or External" },
      { label: "Counterparty Category", key: "category", type: "text", required: false, placeholder: "Bank, Broker, Client..." },
      { label: "Business Roles (JSON)", key: "business_roles", type: "json", required: false, placeholder: '["FX Counterparty","Client"]' },

      // Legal & Address
      { label: "Country of Incorporation", key: "country_of_incorporation", type: "text", required: false },
      { label: "LEI", key: "lei", type: "text", required: false },
      { label: "Registered Address (JSON)", key: "registered_address", type: "json", required: false, placeholder: '{"line1":"","city":"","postal":""}' },
      { label: "Operational Address (JSON)", key: "operational_address", type: "json", required: false },
      { label: "Tax ID / VAT", key: "tax_id", type: "text", required: false },
      { label: "Registration Number", key: "registration_number", type: "text", required: false },

      // Contacts
      { label: "Primary Contact (JSON)", key: "primary_contact", type: "json", required: false, placeholder: '{"name":"","email":"","phone":""}' },
      { label: "Secondary Contact (JSON)", key: "secondary_contact", type: "json", required: false },
      { label: "SWIFT / BIC", key: "swift_bic", type: "text", required: false },

      // Bank & Settlement
      { label: "Bank Details (JSON)", key: "bank_details", type: "json", required: false, placeholder: '{"bank_name":"","branch":"","account":"","iban":"","currency":"USD"}' },
      { label: "Settlement Instructions", key: "settlement_instructions", type: "text", required: false },
      { label: "Default Settlement Account (Y/N)", key: "default_settlement_account", type: "text", required: false, placeholder: "Y/N" },

      // Relationships
      { label: "Parent / Group Entity", key: "parent_entity", type: "text", required: false },
      { label: "Counterparty Group", key: "counterparty_group", type: "text", required: false },
      { label: "Intercompany Group", key: "intercompany_group", type: "text", required: false },
      { label: "Relationship Type", key: "relationship_type", type: "text", required: false },

      // Risk & Limits
      { label: "Credit Rating Agency", key: "credit_rating_agency", type: "text", required: false },
      { label: "Credit Rating", key: "credit_rating", type: "text", required: false },
      { label: "Internal Risk Rating", key: "internal_risk_rating", type: "text", required: false },
      { label: "Counterparty Limit (Amount)", key: "counterparty_limit_amount", type: "number", required: false },
      { label: "Counterparty Limit Currency", key: "counterparty_limit_currency", type: "text", required: false },
      { label: "Limit Expiry Date", key: "limit_expiry_date", type: "date", required: false },

      // Status & Control
      { label: "Status", key: "status", type: "text", required: false, placeholder: "Active, Inactive, On Hold" },
      { label: "Authorized (Y/N)", key: "authorized", type: "text", required: false, placeholder: "Y/N" },
      { label: "Account Manager", key: "account_manager", type: "text", required: false },
      { label: "Created By", key: "created_by", type: "text", required: false },
      { label: "Created At", key: "created_at", type: "date", required: false },
      { label: "Updated By", key: "updated_by", type: "text", required: false },
      { label: "Updated At", key: "updated_at", type: "date", required: false },
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
      data: Array.isArray(instruments) ? instruments : [],
      columns: ["instrument_id", "symbol", "name", "asset_class", "instrument_type", "expiry_date", "status"],
    },
    accounts: {
      title: "Accounts",
      data: Array.isArray(accounts) ? accounts : [],
      columns: ["account_id", "code", "name", "status"],
    },
    traders: {
      title: "Traders",
      data: Array.isArray(traders) ? traders : [],
      columns: ["trader_id", "user_id", "name", "desk"],
    },
    brokers: {
      title: "Brokers",
      data: Array.isArray(brokers) ? brokers : [],
      columns: ["broker_id", "code", "name", "status"],
    },
    clearers: {
      title: "Clearers",
      data: Array.isArray(clearers) ? clearers : [],
      columns: ["clearer_id", "code", "name", "leid", "status"],
    },
    counterparties: {
      title: "Counterparties",
      data: Array.isArray(counterparties) ? counterparties : [],
      columns: ["counterparty_code", "full_legal_name", "short_name", "customer_type", "category", "country_of_incorporation", "status"],
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
                disabled={isDisabled}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: !isDisabled ? "#1d4ed8" : "#d1d5db",
                  color: !isDisabled ? "#fff" : "#6b7280",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "600",
                  cursor: !isDisabled ? "pointer" : "not-allowed",
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
                          disabled={isDisabled}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            backgroundColor: !isDisabled ? '#f9fafb' : '#f3f4f6',
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
                          disabled={isDisabled}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            backgroundColor: !isDisabled ? "#f9fafb" : "#f3f4f6",
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
                    disabled={isDisabled}
                    style={{
                      padding: "10px 12px",
                      backgroundColor: !isDisabled ? "#1d4ed8" : "#d1d5db",
                      color: !isDisabled ? "#fff" : "#6b7280",
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "600",
                      cursor: !isDisabled ? "pointer" : "not-allowed",
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
                  disabled={isDisabled}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    marginTop: "8px",
                    backgroundColor: !isDisabled ? "#f3f4f6" : "#e5e7eb",
                    color: !isDisabled ? "#6b7280" : "#9ca3af",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    cursor: !isDisabled ? "pointer" : "not-allowed",
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
                              {col === 'expiry_date' || col === 'last_trading_date' || col === 'created_at' || col === 'updated_at' ? (row[col] ? new Date(row[col]).toLocaleDateString() : '-') : String(row[col] || "-").substring(0, 30)}
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
                                disabled={isDisabled}
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: !isDisabled ? "#3b82f6" : "#d1d5db",
                                  color: !isDisabled ? "#fff" : "#6b7280",
                                  border: "none",
                                  borderRadius: "3px",
                                  cursor: !isDisabled ? "pointer" : "not-allowed",
                                  fontWeight: "600",
                                  fontSize: "10px",
                                  fontFamily: FONT_FAMILY,
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={(e) => {
                                  if (!isDisabled) e.target.style.backgroundColor = "#2563eb";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isDisabled) e.target.style.backgroundColor = "#3b82f6";
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(row)}
                                disabled={isDisabled}
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: !isDisabled ? "#ef4444" : "#d1d5db",
                                  color: !isDisabled ? "#fff" : "#6b7280",
                                  border: "none",
                                  borderRadius: "3px",
                                  cursor: !isDisabled ? "pointer" : "not-allowed",
                                  fontWeight: "600",
                                  fontSize: "10px",
                                  fontFamily: FONT_FAMILY,
                                  transition: "all 0.15s"
                                }}
                                onMouseEnter={(e) => {
                                  if (!isDisabled) e.target.style.backgroundColor = "#dc2626";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isDisabled) e.target.style.backgroundColor = "#ef4444";
                                }}
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
                  disabled={isDisabled}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: !isDisabled ? "#1d4ed8" : "#d1d5db",
                    color: !isDisabled ? "#fff" : "#6b7280",
                    border: "none",
                    borderRadius: "4px",
                    cursor: !isDisabled ? "pointer" : "not-allowed",
                    fontWeight: "600",
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY
                  }}
                >
                  {showOtcForm ? "Hide OTC Details" : "Add OTC Details"}
                </button>
                <button
                  onClick={() => { setSelectedInstrument(null); setShowOtcForm(false); setOtcDetails({}); }}
                  disabled={isDisabled}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: !isDisabled ? "#9ca3af" : "#d1d5db",
                    color: !isDisabled ? "#fff" : "#6b7280",
                    border: "none",
                    borderRadius: "4px",
                    cursor: !isDisabled ? "pointer" : "not-allowed",
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
                        disabled={isDisabled}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          backgroundColor: !isDisabled ? "#fff" : "#f3f4f6",
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
                    disabled={isDisabled}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: !isDisabled ? "#10b981" : "#d1d5db",
                      color: !isDisabled ? "#fff" : "#6b7280",
                      border: "none",
                      borderRadius: "4px",
                      cursor: !isDisabled ? "pointer" : "not-allowed",
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
                    disabled={isDisabled}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: !isDisabled ? "#6b7280" : "#d1d5db",
                      color: !isDisabled ? "#fff" : "#6b7280",
                      border: "none",
                      borderRadius: "4px",
                      cursor: !isDisabled ? "pointer" : "not-allowed",
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