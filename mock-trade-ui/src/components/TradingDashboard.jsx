import React, { useState, useEffect } from "react";
import { useAuth } from "../core/auth";
import { usePermissions } from "../core/security";
import { OrderEntry } from "../modules/order-entry";
import { StaticDataModule } from "../modules/static-data";
import { SecurityModule } from "../modules/security";
import { TradeQueryModule } from "../modules/trade-query";
import MarketDataModule from "./modules/MarketDataModule";
import EnrichmentModule from "./modules/EnrichmentModule";
import TradeModule from "./modules/TradeModule";
import ConfirmationMonitor from "./modules/ConfirmationMonitor";
import SettlementMonitor from "./modules/SettlementMonitor";
import AccountingModule from "./modules/AccountingModule";
import "./TradingDashboard.css";

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// Simple Error Boundary to catch render errors and display an informative message
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Could log to an external service here
    // console.error('ErrorBoundary caught', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, background: '#fff3f2', border: '1px solid #fecaca', borderRadius: 6 }}>
          <h3 style={{ margin: 0, color: '#7f1d1d' }}>Module failed to render</h3>
          <div style={{ marginTop: 8, color: '#7f1d1d', fontSize: 13 }}>
            {this.state.error && this.state.error.toString()}
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}>
              Dismiss
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function TradingDashboard() {
  const { user, logout } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [availableModules, setAvailableModules] = useState([]);

  // Define all modules with their names for permission checking
  const allModules = [
    { id: "orders", label: "Order Entry", moduleName: "OrderEntry" },
    { id: "enrichment", label: "Enrichment", moduleName: "Enrichment" },
    { id: "trades", label: "Trade Query", moduleName: "Trade" },
    { id: "confirmations", label: "Confirmations", moduleName: "Confirmations" },
    { id: "settlement", label: "Settlement Monitor", moduleName: "Settlements" },
    { id: "accounting", label: "Accounting", moduleName: "Accounting" },
    { id: "static", label: "Static Data", moduleName: "StaticData" },
    { id: "market", label: "Market Data", moduleName: "MarketData" },
    { id: "security", label: "Security", moduleName: "Security" }
  ];

  // Check which modules the user has access to
  useEffect(() => {
    const checkModuleAccess = async () => {
      // ADMIN users have access to all modules
      if (user?.role === "ADMIN") {
        setAvailableModules(allModules);
        return;
      }
      
      // For VIEWER users, show all modules except Security
      // VIEWER users should see all modules in navigation except Security module
      if (user?.role === "VIEWER") {
        // Filter out Security module for VIEWER users
        const viewerModules = allModules.filter(module => module.id !== "security");
        setAvailableModules(viewerModules);
        return;
      }
      
      // For other users, check READ permissions for all modules except Security
      const accessibleModules = [];
      for (const module of allModules) {
        // Special case: Security module should only be accessible to users with Security module access
        if (module.id === "security") {
          const hasAccess = await hasAnyPermission(module.moduleName);
          if (hasAccess) {
            accessibleModules.push(module);
          }
        } else {
          // For other users, check READ permission
          const hasAccess = await hasAnyPermission(module.moduleName);
          if (hasAccess) {
            accessibleModules.push(module);
          }
        }
      }
      
      setAvailableModules(accessibleModules);
      
      // Set default active tab to first available module if current tab is not accessible
      if (accessibleModules.length > 0 && !accessibleModules.some(m => m.id === activeTab)) {
        setActiveTab(accessibleModules[0].id);
      }
    };
    
    if (user) {
      checkModuleAccess();
    }
  }, [user, hasAnyPermission]);

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return <OrderEntry onSelectOrder={(id, details) => { setSelectedOrderId(id); setSelectedOrderDetails(details); }} />;
      case "static":
        return <StaticDataModule />;
      case "market":
        return <MarketDataModule />;
      case "enrichment":
        return <EnrichmentModule />;
      case "trades":
        return <TradeQueryModule />;
      case "confirmations":
        return <ConfirmationMonitor />;
      case "settlement":
        return <SettlementMonitor />;
      case "accounting":
        return <AccountingModule />;
      case "security":
        return <SecurityModule />;
      default:
        return <div style={{ padding: 20 }}>Module not available</div>;
    }
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: "#f3f4f6",
      fontFamily: FONT_FAMILY
    }}>
      {/* Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "56px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        paddingLeft: "240px",
        zIndex: 100,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        justifyContent: "space-between",
        paddingRight: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "700",
            fontSize: "16px"
          }}>
            M
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: "700",
              color: "#1f2933",
              letterSpacing: "-0.3px"
            }}>
              MockTrade
            </h1>
          </div>
          <div style={{
            marginLeft: "12px",
            paddingLeft: "12px",
            borderLeft: "1px solid #e5e7eb",
            fontSize: "12px",
            fontWeight: "600",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Trading Terminal
          </div>
          {/* Active module label for debugging */}
          <div style={{ marginLeft: 20, fontSize: 12, color: '#6b7280' }}>Active: <strong>{availableModules.find(m => m.id === activeTab)?.label}</strong></div>
        </div>
        
        {/* User Info and Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            backgroundColor: "#f9fafb",
            borderRadius: "20px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#1f2933" }}>
              {user?.name} ({user?.role})
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: "6px 12px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "240px",
        height: "100vh",
        backgroundColor: "#fff",
        borderRight: "1px solid #e5e7eb",
        paddingTop: "64px",
        paddingBottom: "20px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ flex: 1, padding: "0 12px" }}>
          <p style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            margin: "0 0 8px 12px",
            paddingLeft: "0"
          }}>
            Modules
          </p>

          <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {availableModules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveTab(module.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: activeTab === module.id ? "#f0f9ff" : "transparent",
                  color: activeTab === module.id ? "#1d4ed8" : "#4b5563",
                  border: activeTab === module.id ? "1px solid #bfdbfe" : "1px solid transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: activeTab === module.id ? "600" : "500",
                  fontSize: "13px",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  fontFamily: "inherit"
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== module.id) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== module.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span>{module.label}</span>
                {activeTab === module.id && (
                  <div style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "#1d4ed8"
                  }} />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{
          margin: "0 12px",
          padding: "12px",
          backgroundColor: "#f9fafb",
          borderRadius: "6px",
          fontSize: "10px",
          color: "#4b5563",
          lineHeight: "1.5",
          border: "1px solid #e5e7eb"
        }}>
          <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#1f2933" }}>
            API Docs
          </p>
          <p style={{ margin: 0 }}>
            <a href={`${import.meta.env.VITE_API_BASE || ''}/docs`} target="_blank" rel="noopener noreferrer" style={{
               color: "#1d4ed8",
               textDecoration: "none",
               fontWeight: "500"
             }}>
              API Docs
             </a>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: "240px",
        marginTop: "56px",
        flex: 1,
        overflow: "auto",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f3f4f6"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "1400px",
          display: "grid",
          gridTemplateColumns: activeTab === "orders" ? "1fr 320px" : "1fr",
          gap: "20px"
        }}>
          {/* Left Panel - Main Content */}
          <div style={{ backgroundColor: "#fff", borderRadius: "6px", padding: "16px", overflow: "hidden" }}>
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </div>

          {/* Right Panel - Order Details (only for Orders module) */}
          {activeTab === "orders" && (
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              padding: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              height: "fit-content",
              position: "sticky",
              top: "24px"
            }}>
              {selectedOrderDetails ? (
                <div>
                  <h3 style={{
                    margin: "0 0 12px 0",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#1f2933",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Order Details
                  </h3>

                  <div style={{ display: "grid", gap: "10px", fontSize: "12px" }}>
                    <div>
                      <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Execution Id</span>
                      <div style={{ color: "#1f2933", fontFamily: "monospace", fontSize: "11px", marginTop: "2px" }}>
                        {selectedOrderDetails.id?.substring(0, 12)}...
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Instrument</span>
                      <div style={{ color: "#1f2933", fontWeight: "600", marginTop: "2px" }}>
                        {selectedOrderDetails.instrument}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Side</span>
                        <div style={{
                          color: selectedOrderDetails.side === "BUY" ? "#10b981" : "#ef4444",
                          fontWeight: "600",
                          marginTop: "2px"
                        }}>
                          {selectedOrderDetails.side}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Qty</span>
                        <div style={{ color: "#1f2933", fontWeight: "600", marginTop: "2px" }}>
                          {selectedOrderDetails.qty}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Price</span>
                      <div style={{ color: "#1f2933", fontWeight: "600", marginTop: "2px" }}>
                        {selectedOrderDetails.price || "—"}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Type</span>
                        <div style={{ color: "#1f2933", fontSize: "11px", marginTop: "2px" }}>
                          {selectedOrderDetails.type}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>TIF</span>
                        <div style={{ color: "#1f2933", fontSize: "11px", marginTop: "2px" }}>
                          {selectedOrderDetails.tif}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Trader</span>
                      <div style={{ color: "#1f2933", fontSize: "11px", marginTop: "2px" }}>
                        {selectedOrderDetails.trader}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Status</span>
                      <div style={{ marginTop: "2px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "3px",
                          fontSize: "10px",
                          fontWeight: "700",
                          backgroundColor: selectedOrderDetails.status === "NEW" ? "#fef3c7" : "#d1fae5",
                          color: selectedOrderDetails.status === "NEW" ? "#78350f" : "#065f46",
                          border: `1px solid ${selectedOrderDetails.status === "NEW" ? "#fde68a" : "#a7f3d0"}`
                        }}>
                          {selectedOrderDetails.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>Created</span>
                      <div style={{ color: "#1f2933", fontSize: "11px", marginTop: "2px" }}>
                        {selectedOrderDetails.created_at
                          ? new Date(selectedOrderDetails.created_at).toLocaleString()
                          : "—"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "20px 0",
                  color: "#9ca3af"
                }}>
                  <p style={{ margin: 0, fontSize: "12px" }}>
                    Select an order
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#d1d5db" }}>
                    to view details
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradingDashboard;