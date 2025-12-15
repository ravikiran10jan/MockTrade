import React, { useState, useEffect } from "react";

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const API_BASE = import.meta.env.VITE_API_BASE || "";

function EnrichmentModule() {
  const [enrichmentTab, setEnrichmentTab] = useState("portfolio"); // portfolio or trader
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Example Trader Enrichment Mappings - Maps external trader UUIDs to internal IDs
  const [traderMappings, setTraderMappings] = useState([
    {
      rule_id: 2001,
      source_system: "MUREX",
      source_trader_uuid: "a4f7e8c2-1b3d-4f9a-8c5e-6d2a9f1e7b3c",
      internal_trader_id: "TRD001",
      email: "james.chen@demo-bank.com",
      active: true
    },
    {
      rule_id: 2002,
      source_system: "SUMMIT",
      source_trader_uuid: "b5e8d9a3-2c4e-5f0b-9d6f-7e3b0a2f8c4d",
      internal_trader_id: "TRD001",
      email: "james.chen@demo-bank.com",
      active: true
    },
    {
      rule_id: 2003,
      source_system: "BLBG",
      source_trader_uuid: "c6f9ea4b-3d5f-6a1c-ae7a-8f4c1b3a9d5e",
      internal_trader_id: "FXDESK02",
      email: "sarah.williams@demo-bank.com",
      active: true
    },
    {
      rule_id: 2004,
      source_system: "MUREX",
      source_trader_uuid: "d7a0fb5c-4e6a-7b2d-bf8b-9a5d2c4b0e6f",
      internal_trader_id: "FXDESK02",
      email: "sarah.williams@demo-bank.com",
      active: true
    },
    {
      rule_id: 2005,
      source_system: "SUMMIT",
      source_trader_uuid: "e8b1ac6d-5f7b-8c3e-ca9c-ab6e3d5c1f7a",
      internal_trader_id: "RATES01",
      email: "michael.kumar@demo-bank.com",
      active: true
    },
    {
      rule_id: 2006,
      source_system: "BLBG",
      source_trader_uuid: "f9c2bd7e-6a8c-9d4f-db0d-bc7f4e6d2a8b",
      internal_trader_id: "EQDESK03",
      email: "emma.rodriguez@demo-bank.com",
      active: true
    },
    {
      rule_id: 2007,
      source_system: "MUREX",
      source_trader_uuid: "a0d3ce8f-7b9d-0e5a-ec1e-cd8a5f7e3b9c",
      internal_trader_id: "CMDTY04",
      email: "david.morrison@demo-bank.com",
      active: false
    },
    {
      rule_id: 2008,
      source_system: "SUMMIT",
      source_trader_uuid: "b1e4df0a-8c0e-1f6b-fd2f-de9b6a8f4c0d",
      internal_trader_id: "RATES01",
      email: "michael.kumar@demo-bank.com",
      active: true
    },
    {
      rule_id: 2009,
      source_system: "BLBG",
      source_trader_uuid: "c2f5e01b-9d1f-2a7c-ae3a-ef0c7b9a5d1e",
      internal_trader_id: "VOLDESK05",
      email: "alice.thompson@demo-bank.com",
      active: true
    },
    {
      rule_id: 2010,
      source_system: "MUREX",
      source_trader_uuid: "d3a6f12c-0e2a-3b8d-bf4b-fa1d8c0b6e2f",
      internal_trader_id: "CREDIT06",
      email: "robert.walsh@demo-bank.com",
      active: false
    }
  ]);

  // Broker Enrichment Mappings
  const [brokerMappings, setBrokerMappings] = useState([
    {
      rule_id: 3001,
      source_system: "BLBG",
      account_name: "TRADER_001_FX",
      broker: "JPMorgan Securities",
      broker_leid: "5493001KJTIIGC8Y1R12",
      comments: "Primary FX broker partnership",
      active: true
    },
    {
      rule_id: 3002,
      source_system: "BLBG",
      account_name: "TRADER_002_FIXED",
      broker: "Goldman Sachs",
      broker_leid: "W22LROWP2IHZNBB6K528",
      comments: "Fixed income broker",
      active: true
    },
    {
      rule_id: 3003,
      source_system: "MUREX",
      account_name: "DESK_RATES_APAC",
      broker: "Nomura",
      broker_leid: "6B9Z8J8LK5C9X2M4Q7V3",
      comments: "APAC rates broker",
      active: true
    },
    {
      rule_id: 3004,
      source_system: "MUREX",
      account_name: "DESK_RATES_EMEA",
      broker: "Deutsche Bank",
      broker_leid: "HB6WPR2FRRXLMWBLRP29",
      comments: "EMEA rates desk broker",
      active: true
    },
    {
      rule_id: 3005,
      source_system: "SUMMIT",
      account_name: "EQUITY_DESK_NA",
      broker: "Morgan Stanley",
      broker_leid: "4ABQU46RHEBAXFAOXFF7",
      comments: "Equity derivatives broker",
      active: true
    },
    {
      rule_id: 3006,
      source_system: "SUMMIT",
      account_name: "EQUITY_DESK_EMEA",
      broker: "Barclays",
      broker_leid: "G5GSEF7XJ5AQB589XV76",
      comments: "UK equity broker",
      active: true
    },
    {
      rule_id: 3007,
      source_system: "BLBG",
      account_name: "CREDIT_DESK",
      broker: "Bank of America Merrill Lynch",
      broker_leid: "B76ZR46FFB69PWRMQ175",
      comments: "Credit products broker",
      active: true
    },
    {
      rule_id: 3008,
      source_system: "MUREX",
      account_name: "COMMODITIES_DESK",
      broker: "Shell Trading",
      broker_leid: "SHLTDJC8CQVPJG4J8K2L",
      comments: "Commodity trading broker",
      active: false
    },
    {
      rule_id: 3009,
      source_system: "SUMMIT",
      account_name: "VOL_DESK",
      broker: "Volatility Partners Inc",
      broker_leid: "VOLPRT2MNQXYZC5F8D3R",
      comments: "Volatility trading specialist",
      active: true
    },
    {
      rule_id: 3010,
      source_system: "BLBG",
      account_name: "DESK_RATES_EMEA",
      broker: "BNP Paribas",
      broker_leid: "R0MUWZ35BNRQ6SG9V2F4",
      comments: "European rates broker",
      active: true
    }
  ]);

  // Clearer Enrichment Mappings
  const [clearerMappings, setClearerMappings] = useState([
    {
      rule_id: 4001,
      source_system: "BLBG",
      account_name: "TRADER_001_FX",
      clearer: "LCH SwapClear",
      clearer_leid: "8945009FHGH9LJMD3N87",
      comments: "OTC derivatives clearing for FX",
      active: true
    },
    {
      rule_id: 4002,
      source_system: "BLBG",
      account_name: "TRADER_002_FIXED",
      clearer: "LCH ForexClear",
      clearer_leid: "8945009FHGH9LJMD3N87",
      comments: "FX clearing house",
      active: true
    },
    {
      rule_id: 4003,
      source_system: "MUREX",
      account_name: "DESK_RATES_APAC",
      clearer: "Japan Securities Clearing Corporation",
      clearer_leid: "1J4F8KNMHZX0PQVW2R6T",
      comments: "APAC securities clearing",
      active: true
    },
    {
      rule_id: 4004,
      source_system: "MUREX",
      account_name: "DESK_RATES_EMEA",
      clearer: "Eurex Clearing",
      clearer_leid: "HKU3868ZQH0MQ4YTGH14",
      comments: "European derivatives clearing",
      active: true
    },
    {
      rule_id: 4005,
      source_system: "SUMMIT",
      account_name: "EQUITY_DESK_NA",
      clearer: "CME Clearing",
      clearer_leid: "CME000B7M47OTC0GME01",
      comments: "CME Group clearing for US equities",
      active: true
    },
    {
      rule_id: 4006,
      source_system: "SUMMIT",
      account_name: "EQUITY_DESK_EMEA",
      clearer: "LCH Clearnet",
      clearer_leid: "8945009FHGH9LJMD3N87",
      comments: "European equity clearing",
      active: true
    },
    {
      rule_id: 4007,
      source_system: "BLBG",
      account_name: "CREDIT_DESK",
      clearer: "Intercontinental Exchange",
      clearer_leid: "254900CMNHE6FXR0FG39",
      comments: "ICE clearing for credit products",
      active: true
    },
    {
      rule_id: 4008,
      source_system: "MUREX",
      account_name: "COMMODITIES_DESK",
      clearer: "ICE Futures U.S.",
      clearer_leid: "254900CMNHE6FXR0FG39",
      comments: "Commodity futures clearing",
      active: true
    },
    {
      rule_id: 4009,
      source_system: "SUMMIT",
      account_name: "VOL_DESK",
      clearer: "LCH SwapClear",
      clearer_leid: "8945009FHGH9LJMD3N87",
      comments: "Volatility derivatives clearing",
      active: false
    },
    {
      rule_id: 4010,
      source_system: "BLBG",
      account_name: "DESK_RATES_EMEA",
      clearer: "SIX x-clear",
      clearer_leid: "5GRX0FHZM7PYQLW9X3N5",
      comments: "Swiss clearing house",
      active: true
    }
  ]);

  // ...existing code...
  const [portfolioMappings, setPortfolioMappings] = useState([]);

  // Fetch portfolio mappings on mount and when tab changes
  useEffect(() => {
    if (enrichmentTab === "portfolio") {
      fetchPortfolioMappings();
    }
  }, [enrichmentTab]);

  const fetchPortfolioMappings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/enrichment/portfolio-mappings?active_only=false`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setPortfolioMappings(data);
    } catch (error) {
      console.error("Error fetching portfolio mappings:", error);
      setMessage(`Error: Failed to fetch mappings - ${error.message}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredMappings = portfolioMappings.filter(m =>
    m.trader_account_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.instrument_code && m.instrument_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    m.portfolio_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.source_system.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMapping = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.source_system || !formData.trader_account_id || !formData.portfolio_code) {
        setMessage("Error: Source system, trader account, and portfolio code are required");
        setLoading(false);
        return;
      }

      const mappingData = {
        source_system: formData.source_system,
        trader_account_id: formData.trader_account_id,
        instrument_code: formData.instrument_code || "",
        portfolio_code: formData.portfolio_code,
        comments: formData.comments || "",
        active: formData.active !== false
      };

      const response = await fetch(`${API_BASE}/api/v1/enrichment/portfolio-mappings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mappingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const newMapping = await response.json();
      setPortfolioMappings([...portfolioMappings, newMapping]);
      setMessage("✓ Mapping created successfully");
      setShowForm(false);
      setFormData({});
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error creating mapping:", error);
      setMessage(`Create failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (ruleId) => {
    setLoading(true);
    try {
      const mapping = portfolioMappings.find(m => m.rule_id === ruleId);
      if (!mapping) return;

      const response = await fetch(`${API_BASE}/api/v1/enrichment/portfolio-mappings/${ruleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          active: !mapping.active
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const updatedMapping = await response.json();
      setPortfolioMappings(
        portfolioMappings.map(m =>
          m.rule_id === ruleId ? updatedMapping : m
        )
      );
      setMessage("✓ Mapping updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error toggling mapping:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteMapping = async (ruleId) => {
    if (!window.confirm("Are you sure you want to delete this mapping?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/enrichment/portfolio-mappings/${ruleId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      setPortfolioMappings(portfolioMappings.filter(m => m.rule_id !== ruleId));
      setMessage("✓ Mapping deleted");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting mapping:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
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
          Enrichment Mappings
        </h2>
        <p style={{
          margin: "8px 0 0 0",
          fontSize: "12px",
          color: "#4b5563"
        }}>
          Manage enrichment rules that map source system data to internal identifiers
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
        <button
          onClick={() => { setEnrichmentTab("portfolio"); setShowForm(false); }}
          style={{
            padding: "8px 16px",
            backgroundColor: enrichmentTab === "portfolio" ? "transparent" : "transparent",
            color: enrichmentTab === "portfolio" ? "#1d4ed8" : "#6b7280",
            border: "none",
            borderBottom: enrichmentTab === "portfolio" ? "2px solid #1d4ed8" : "2px solid transparent",
            cursor: "pointer",
            fontWeight: enrichmentTab === "portfolio" ? "600" : "500",
            fontSize: "13px",
            fontFamily: FONT_FAMILY
          }}
        >
          Portfolio Enrichment
        </button>
        <button
          onClick={() => { setEnrichmentTab("trader"); setShowForm(false); }}
          style={{
            padding: "8px 16px",
            backgroundColor: enrichmentTab === "trader" ? "transparent" : "transparent",
            color: enrichmentTab === "trader" ? "#1d4ed8" : "#6b7280",
            border: "none",
            borderBottom: enrichmentTab === "trader" ? "2px solid #1d4ed8" : "2px solid transparent",
            cursor: "pointer",
            fontWeight: enrichmentTab === "trader" ? "600" : "500",
            fontSize: "13px",
            fontFamily: FONT_FAMILY
          }}
        >
          Trader Enrichment
        </button>
        <button
          onClick={() => { setEnrichmentTab("broker"); setShowForm(false); }}
          style={{
            padding: "8px 16px",
            backgroundColor: enrichmentTab === "broker" ? "transparent" : "transparent",
            color: enrichmentTab === "broker" ? "#1d4ed8" : "#6b7280",
            border: "none",
            borderBottom: enrichmentTab === "broker" ? "2px solid #1d4ed8" : "2px solid transparent",
            cursor: "pointer",
            fontWeight: enrichmentTab === "broker" ? "600" : "500",
            fontSize: "13px",
            fontFamily: FONT_FAMILY
          }}
        >
          Broker Enrichment
        </button>
        <button
          onClick={() => { setEnrichmentTab("clearer"); setShowForm(false); }}
          style={{
            padding: "8px 16px",
            backgroundColor: enrichmentTab === "clearer" ? "transparent" : "transparent",
            color: enrichmentTab === "clearer" ? "#1d4ed8" : "#6b7280",
            border: "none",
            borderBottom: enrichmentTab === "clearer" ? "2px solid #1d4ed8" : "2px solid transparent",
            cursor: "pointer",
            fontWeight: enrichmentTab === "clearer" ? "600" : "500",
            fontSize: "13px",
            fontFamily: FONT_FAMILY
          }}
        >
          Clearer Enrichment
        </button>
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

      {/* Portfolio Enrichment Tab */}
      {enrichmentTab === "portfolio" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px" }}>
        {/* Left Panel - Controls */}
        <div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: "100%",
                padding: "10px 12px",
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
              New Mapping
            </button>
          )}

          {showForm && (
            <div style={{ marginBottom: "20px" }}>
              <form onSubmit={handleCreateMapping} style={{ display: "grid", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>
                    Source System *
                  </label>
                  <select
                    value={formData.source_system || ""}
                    onChange={(e) => setFormData({ ...formData, source_system: e.target.value })}
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
                  >
                    <option value="">Select...</option>
                    <option value="BLBG">BLBG (Bloomberg)</option>
                    <option value="MUREX">MUREX</option>
                    <option value="SUMMIT">SUMMIT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>
                    Trader/Account ID *
                  </label>
                  <input
                    type="text"
                    value={formData.trader_account_id || ""}
                    onChange={(e) => setFormData({ ...formData, trader_account_id: e.target.value })}
                    placeholder="e.g., TRADER_001"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>
                    Instrument Code (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.instrument_code || ""}
                    onChange={(e) => setFormData({ ...formData, instrument_code: e.target.value })}
                    placeholder="e.g., EURUSD (leave blank for any)"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>
                    Portfolio Code *
                  </label>
                  <input
                    type="text"
                    value={formData.portfolio_code || ""}
                    onChange={(e) => setFormData({ ...formData, portfolio_code: e.target.value })}
                    placeholder="e.g., PORT_FX_EU_001"
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#4b5563", marginBottom: "4px", textTransform: "uppercase" }}>
                    Comments
                  </label>
                  <textarea
                    value={formData.comments || ""}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    placeholder="Optional notes about this mapping"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      backgroundColor: "#f9fafb",
                      color: "#1f2933",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "12px",
                      boxSizing: "border-box",
                      fontFamily: FONT_FAMILY,
                      minHeight: "60px",
                      lineHeight: "1.4"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", fontSize: "11px", fontWeight: "600", color: "#4b5563", gap: "6px" }}>
                    <input
                      type="checkbox"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>

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
                  Create Mapping
                </button>
              </form>

              <button
                onClick={() => { setShowForm(false); setFormData({}); }}
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

          {/* Search */}
          <div style={{ marginTop: "16px" }}>
            <input
              type="text"
              placeholder="Search mappings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>

          {/* Stats */}
          <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
            <div style={{ fontSize: "11px", color: "#4b5563", marginBottom: "8px" }}>
              <div style={{ fontWeight: "600", marginBottom: "4px" }}>Summary</div>
              <div>Total: {portfolioMappings.length}</div>
              <div>Active: {portfolioMappings.filter(m => m.active).length}</div>
              <div>Inactive: {portfolioMappings.filter(m => !m.active).length}</div>
            </div>
          </div>
        </div>

        {/* Right Panel - Mappings Table */}
        <div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px",
                fontFamily: FONT_FAMILY,
                backgroundColor: "#fff"
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Rule ID</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>System</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Trader/Account</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Instrument</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Portfolio Code</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Comments</th>
                  <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Active</th>
                  <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: "16px 12px", textAlign: "center", color: "#9ca3af" }}>
                      No mappings found
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map((mapping, idx) => (
                    <tr
                      key={mapping.rule_id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                        opacity: mapping.active ? 1 : 0.6
                      }}
                    >
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600" }}>{mapping.rule_id}</td>
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "500" }}>{mapping.source_system}</td>
                      <td style={{ padding: "8px 12px", color: "#4b5563" }}>{mapping.trader_account_id}</td>
                      <td style={{ padding: "8px 12px", color: "#4b5563" }}>
                        {mapping.instrument_code || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>any</span>}
                      </td>
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "500", fontFamily: "monospace" }}>{mapping.portfolio_code}</td>
                      <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "10px" }}>{mapping.comments}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <button
                          onClick={() => toggleActive(mapping.rule_id)}
                          style={{
                            padding: "3px 8px",
                            backgroundColor: mapping.active ? "#d1fae5" : "#fee2e2",
                            color: mapping.active ? "#065f46" : "#7f1d1d",
                            border: "none",
                            borderRadius: "3px",
                            fontSize: "10px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          {mapping.active ? "YES" : "NO"}
                        </button>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <button
                          onClick={() => deleteMapping(mapping.rule_id)}
                          style={{
                            padding: "3px 8px",
                            backgroundColor: "#fee2e2",
                            color: "#7f1d1d",
                            border: "none",
                            borderRadius: "3px",
                            fontSize: "10px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* Trader Enrichment Tab */}
      {enrichmentTab === "trader" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px" }}>
          {/* Left Panel */}
          <div>
            <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
              <div style={{ fontSize: "11px", color: "#4b5563", marginBottom: "8px" }}>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>Summary</div>
                <div>Total: {traderMappings.length}</div>
                <div>Active: {traderMappings.filter(m => m.active).length}</div>
                <div>Inactive: {traderMappings.filter(m => !m.active).length}</div>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <input
                type="text"
                placeholder="Search traders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            </div>
          </div>

          {/* Right Panel - Trader Mappings Table */}
          <div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "11px",
                  fontFamily: FONT_FAMILY,
                  backgroundColor: "#fff"
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Rule ID</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>System</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Source UUID</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Internal ID</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Email</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {traderMappings
                    .filter(m =>
                      m.internal_trader_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      m.source_system.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((mapping, idx) => (
                    <tr
                      key={mapping.rule_id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                        opacity: mapping.active ? 1 : 0.6
                      }}
                    >
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600" }}>{mapping.rule_id}</td>
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "500" }}>{mapping.source_system}</td>
                      <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "9px", fontFamily: "monospace" }}>{mapping.source_trader_uuid.substring(0, 12)}...</td>
                      <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600" }}>{mapping.internal_trader_id}</td>
                      <td style={{ padding: "8px 12px", color: "#4b5563" }}>{mapping.email}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <span style={{
                          padding: "3px 8px",
                          backgroundColor: mapping.active ? "#d1fae5" : "#fee2e2",
                          color: mapping.active ? "#065f46" : "#7f1d1d",
                          borderRadius: "3px",
                          fontSize: "10px",
                          fontWeight: "600"
                        }}>
                          {mapping.active ? "YES" : "NO"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Broker Enrichment Tab */}
      {enrichmentTab === "broker" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: FONT_FAMILY, backgroundColor: "#fff" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Rule ID</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>System</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Account</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Broker</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Broker LEID</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Comments</th>
                <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {brokerMappings
                .filter(m =>
                  m.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.broker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.source_system.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((mapping, idx) => (
                  <tr key={mapping.rule_id} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #e5e7eb", opacity: mapping.active ? 1 : 0.6 }}>
                    <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600" }}>{mapping.rule_id}</td>
                    <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "500" }}>{mapping.source_system}</td>
                    <td style={{ padding: "8px 12px", color: "#4b5563" }}>{mapping.account_name}</td>
                    <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "500" }}>{mapping.broker}</td>
                    <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "9px", fontFamily: "monospace" }}>{mapping.broker_leid}</td>
                    <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "10px" }}>{mapping.comments}</td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ padding: "3px 8px", backgroundColor: mapping.active ? "#d1fae5" : "#fee2e2", color: mapping.active ? "#065f46" : "#7f1d1d", borderRadius: "3px", fontSize: "10px", fontWeight: "600" }}>
                        {mapping.active ? "YES" : "NO"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Clearer Enrichment Tab */}
      {enrichmentTab === "clearer" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: FONT_FAMILY, backgroundColor: "#fff" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Rule ID</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>System</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Account</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Clearer</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Clearer LEID</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Comments</th>
                <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700", color: "#4b5563", fontSize: "10px", textTransform: "uppercase" }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {clearerMappings
                .filter(m =>
                  m.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.clearer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.source_system.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((mapping, idx) => (
                  <tr key={mapping.rule_id} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #e5e7eb", opacity: mapping.active ? 1 : 0.6 }}>
                    <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600" }}>{mapping.rule_id}</td>
                    <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "500" }}>{mapping.source_system}</td>
                    <td style={{ padding: "8px 12px", color: "#4b5563" }}>{mapping.account_name}</td>
                    <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "500" }}>{mapping.clearer}</td>
                    <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "9px", fontFamily: "monospace" }}>{mapping.clearer_leid}</td>
                    <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "10px" }}>{mapping.comments}</td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <span style={{ padding: "3px 8px", backgroundColor: mapping.active ? "#d1fae5" : "#fee2e2", color: mapping.active ? "#065f46" : "#7f1d1d", borderRadius: "3px", fontSize: "10px", fontWeight: "600" }}>
                        {mapping.active ? "YES" : "NO"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EnrichmentModule;

