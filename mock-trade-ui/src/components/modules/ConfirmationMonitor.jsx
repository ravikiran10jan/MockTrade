import React, { useState, useEffect } from "react";

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// Confirmation Monitor Page Container
function ConfirmationMonitor() {
  const [confirmations, setConfirmations] = useState([]);
  const [selectedConfirmation, setSelectedConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    instrument: "",
    trader: "",
    counterparty: "",
    statuses: []
  });
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch mock data on mount and filter change
  useEffect(() => {
    fetchConfirmations();
  }, [filters, sortBy, sortDir, page]);

  const fetchConfirmations = async () => {
    setLoading(true);
    try {
      // Mock API call - in production, this would be an actual fetch
      const mockData = generateMockConfirmations();
      setConfirmations(mockData);
      setMessage("");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (confirmationId) => {
    if (window.confirm("Confirm match of this trade?")) {
      try {
        setMessage("✓ Trade matched successfully");
        setMessageType("success");
        setSelectedConfirmation({ ...selectedConfirmation, status: "Matched" });
        setConfirmations(confirmations.map(c =>
          c.id === confirmationId ? { ...c, status: "Matched" } : c
        ));
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage(`Error: ${error.message}`);
        setMessageType("error");
      }
    }
  };

  const handleOverride = async (confirmationId, _reason) => {
    try {
      setMessage("✓ Override applied. Reason logged.");
      setMessageType("success");
      setSelectedConfirmation({ ...selectedConfirmation, status: "Matched" });
      setConfirmations(confirmations.map(c =>
        c.id === confirmationId ? { ...c, status: "Matched" } : c
      ));
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  };

  const handleUpdateStatus = async (confirmationId, newStatus, _reason) => {
    try {
      setMessage(`✓ Status updated to ${newStatus}`);
      setMessageType("success");
      setSelectedConfirmation({ ...selectedConfirmation, status: newStatus });
      setConfirmations(confirmations.map(c =>
        c.id === confirmationId ? { ...c, status: newStatus } : c
      ));
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  };

  const handleIgnore = async (confirmationId) => {
    try {
      setMessage("✓ Trade dismissed");
      setMessageType("success");
      setConfirmations(confirmations.filter(c => c.id !== confirmationId));
      setSelectedConfirmation(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY, width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Debug header to confirm mounting */}
      <div style={{ padding: "8px 12px", background: "#f8fafc", border: "1px solid #e6edf3", borderRadius: 6 }}>
        <strong style={{ color: "#0f172a" }}>Confirmations Module</strong>
        <span style={{ marginLeft: 12, color: "#475569" }}>— mounted</span>
        <span style={{ float: "right", color: "#475569" }}>Count: {confirmations.length}</span>
      </div>

      {/* Error/Success Message Banner */}
      {message && (
        <div style={{
          padding: "10px 16px",
          marginBottom: "8px",
          backgroundColor: messageType === "success" ? "#d1fae5" : "#fee2e2",
          color: messageType === "success" ? "#065f46" : "#7f1d1d",
          borderRadius: "6px",
          border: `1px solid ${messageType === "success" ? "#a7f3d0" : "#fecaca"}`,
          fontSize: "12px",
          fontWeight: "500"
        }}>
          {message}
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => {
          setFilters({
            dateFrom: null,
            dateTo: null,
            instrument: "",
            trader: "",
            counterparty: "",
            statuses: []
          });
          setPage(1);
        }}
      />

      {/* Quick Filter Chips */}
      <QuickFilterChips
        activeFilter={activeQuickFilter}
        onFilterSelect={(key) => {
          setActiveQuickFilter(key);
          setPage(1);
        }}
      />

      {/* Main Grid + Details */}
      <div style={{ display: "flex", flex: 1, gap: "20px", overflow: "auto", minHeight: 0 }}>
        {/* Confirmation Grid */}
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <ConfirmationGrid
            confirmations={confirmations}
            selectedId={selectedConfirmation?.id}
            onSelectRow={(confirmation) => setSelectedConfirmation(confirmation)}
            onSort={(column) => {
              setSortBy(column);
              setSortDir(sortDir === "asc" ? "desc" : "asc");
            }}
            sortBy={sortBy}
            sortDir={sortDir}
            isLoading={loading}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>

        {/* Trade Details Panel */}
        <div style={{ width: "320px", overflow: "auto", minHeight: 0 }}>
          <TradeDetailsPanel
            confirmation={selectedConfirmation}
            onMatch={() => selectedConfirmation && handleMatch(selectedConfirmation.id)}
            onOverride={(reason) => selectedConfirmation && handleOverride(selectedConfirmation.id, reason)}
            onUpdateStatus={(status, reason) => selectedConfirmation && handleUpdateStatus(selectedConfirmation.id, status, reason)}
            onIgnore={() => selectedConfirmation && handleIgnore(selectedConfirmation.id)}
          />
        </div>
      </div>
    </div>
  );
}

// Filter Bar Component
function FilterBar({ filters, onFilterChange, onReset }) {
  return (
    <div style={{
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      padding: "12px 16px",
      marginBottom: "16px"
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "12px" }}>
        {/* Date From */}
        <div>
          <label style={{ fontSize: "10px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Date To */}
        <div>
          <label style={{ fontSize: "10px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Instrument */}
        <div>
          <label style={{ fontSize: "10px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Instrument
          </label>
          <input
            type="text"
            placeholder="ES, NQ..."
            value={filters.instrument}
            onChange={(e) => onFilterChange({ ...filters, instrument: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              boxSizing: "border-box",
              backgroundColor: "#f9fafb"
            }}
          />
        </div>

        {/* Trader */}
        <div>
          <label style={{ fontSize: "10px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Trader
          </label>
          <input
            type="text"
            placeholder="TRADER1"
            value={filters.trader}
            onChange={(e) => onFilterChange({ ...filters, trader: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              boxSizing: "border-box",
              backgroundColor: "#f9fafb"
            }}
          />
        </div>

        {/* Counterparty */}
        <div>
          <label style={{ fontSize: "10px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Counterparty
          </label>
          <input
            type="text"
            placeholder="JPM, GS..."
            value={filters.counterparty}
            onChange={(e) => onFilterChange({ ...filters, counterparty: e.target.value })}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              boxSizing: "border-box",
              backgroundColor: "#f9fafb"
            }}
          />
        </div>

        {/* Status Multi-Select */}
        <div>
          <label style={{ fontSize: "10px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            Status
          </label>
          <select
            multiple
            value={filters.statuses}
            onChange={(e) => onFilterChange({
              ...filters,
              statuses: Array.from(e.target.selectedOptions, option => option.value)
            })}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              boxSizing: "border-box",
              backgroundColor: "#f9fafb"
            }}
          >
            <option value="Unmatched">Unmatched</option>
            <option value="Matched">Matched</option>
            <option value="One-sided">One-sided</option>
            <option value="Pending">Pending</option>
            <option value="Error">Error</option>
            <option value="In Progress">In Progress</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onReset}
          style={{
            padding: "6px 12px",
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
          Reset Filters
        </button>
      </div>
    </div>
  );
}

// Quick Filter Chips Component
function QuickFilterChips({ activeFilter, onFilterSelect }) {
  const chips = [
    { key: "all", label: "All" },
    { key: "unmatched", label: "Unmatched" },
    { key: "one-sided", label: "One-sided" },
    { key: "error", label: "Error" },
    { key: "matched-today", label: "Matched today" }
  ];

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onFilterSelect(chip.key)}
          style={{
            padding: "6px 12px",
            backgroundColor: activeFilter === chip.key ? "#1d4ed8" : "#f3f4f6",
            color: activeFilter === chip.key ? "#fff" : "#6b7280",
            border: `1px solid ${activeFilter === chip.key ? "#1d4ed8" : "#d1d5db"}`,
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "12px",
            transition: "all 0.15s",
            fontFamily: FONT_FAMILY
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

// Confirmation Grid Component
function ConfirmationGrid({ confirmations, selectedId, onSelectRow, onSort, sortBy, sortDir, isLoading, page, pageSize, onPageChange }) {
  const getStatusColor = (status) => {
    const colors = {
      "Matched": { bg: "#d1fae5", text: "#065f46", icon: "✓" },
      "Unmatched": { bg: "#fef3c7", text: "#92400e", icon: "" },
      "One-sided": { bg: "#fef3c7", text: "#92400e", icon: "⚠" },
      "Pending": { bg: "#e3f2fd", text: "#1e40af", icon: "" },
      "Error": { bg: "#fee2e2", text: "#991b1b", icon: "!" },
      "In Progress": { bg: "#dbeafe", text: "#0c4a6e", icon: "" },
      "Cancelled": { bg: "#f3f4f6", text: "#6b7280", icon: "" }
    };
    return colors[status] || colors["Cancelled"];
  };

  const displayConfirmations = confirmations.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(confirmations.length / pageSize);

  if (isLoading) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}>Loading...</div>;
  }

  if (confirmations.length === 0) {
    return (
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        padding: "40px",
        textAlign: "center",
        color: "#9ca3af",
        border: "1px solid #e5e7eb"
      }}>
        <p style={{ margin: 0, fontSize: "13px" }}>No confirmations match your filters</p>
        <p style={{ margin: "4px 0 0 0", fontSize: "11px" }}>Try adjusting your date range or status filters</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      overflow: "hidden"
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: FONT_FAMILY }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <ColumnHeader label="Trade ID" width="120px" sortKey="tradeId" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <ColumnHeader label="Ext Ref" width="120px" sortKey="externalRef" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <ColumnHeader label="Instrument" width="100px" sortKey="instrument" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <ColumnHeader label="Side" width="60px" sortKey="side" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <ColumnHeader label="Quantity" width="80px" sortKey="quantity" sortBy={sortBy} sortDir={sortDir} onSort={onSort} textAlign="right" />
              <ColumnHeader label="Price" width="100px" sortKey="price" sortBy={sortBy} sortDir={sortDir} onSort={onSort} textAlign="right" />
              <ColumnHeader label="Trader" width="100px" sortKey="trader" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <ColumnHeader label="Counterparty" width="120px" sortKey="counterparty" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <ColumnHeader label="Status" width="120px" sortKey="status" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <ColumnHeader label="Age" width="80px" sortKey="age" sortBy={sortBy} sortDir={sortDir} onSort={onSort} textAlign="right" />
              <ColumnHeader label="Source" width="100px" sortKey="source" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            </tr>
          </thead>
          <tbody>
            {displayConfirmations.map((conf, idx) => {
              const statusColor = getStatusColor(conf.status);
              const isSelected = selectedId === conf.id;
              return (
                <tr
                  key={conf.id}
                  onClick={() => onSelectRow(conf)}
                  style={{
                    backgroundColor: isSelected ? "#f0f9ff" : idx % 2 === 0 ? "#fff" : "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    borderLeft: isSelected ? "3px solid #1d4ed8" : "3px solid transparent",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                    height: "40px"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#f9fafb";
                  }}
                >
                  <td style={{ padding: "8px 12px", color: "#1f2933", fontWeight: "600", fontSize: "10px", fontFamily: "monospace" }}>{conf.tradeId}</td>
                  <td style={{ padding: "8px 12px", color: conf.mismatches?.length > 0 ? "#ef4444" : "#1f2933", fontWeight: conf.mismatches?.length > 0 ? "700" : "600", fontSize: "10px", fontFamily: "monospace" }}>
                    {conf.externalRef} {conf.mismatches?.length > 0 && "✗"}
                  </td>
                  <td style={{ padding: "8px 12px", color: "#1f2933", fontSize: "11px" }}>{conf.instrument}</td>
                  <td style={{ padding: "8px 12px", color: conf.side === "BUY" ? "#10b981" : "#ef4444", fontWeight: "600", fontSize: "11px" }}>{conf.side}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px" }}>{conf.quantity}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#4b5563", fontSize: "11px", fontFamily: "monospace" }}>{conf.price.toFixed(2)}</td>
                  <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>{conf.trader}</td>
                  <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>{conf.counterparty}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontWeight: "700",
                      backgroundColor: statusColor.bg,
                      color: statusColor.text
                    }}>
                      {statusColor.icon && `${statusColor.icon} `}{conf.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#9ca3af", fontSize: "11px" }}>{conf.age}</td>
                  <td style={{ padding: "8px 12px", color: "#4b5563", fontSize: "11px" }}>{conf.source}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        padding: "12px 16px",
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "#6b7280"
      }}>
        <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, confirmations.length)} of {confirmations.length}</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            style={{
              padding: "4px 8px",
              backgroundColor: page === 1 ? "#f3f4f6" : "#fff",
              color: page === 1 ? "#d1d5db" : "#4b5563",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: page === 1 ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "11px"
            }}
          >
            ← Prev
          </button>
          <span style={{ padding: "4px 8px" }}>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{
              padding: "4px 8px",
              backgroundColor: page === totalPages ? "#f3f4f6" : "#fff",
              color: page === totalPages ? "#d1d5db" : "#4b5563",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "11px"
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// Column Header Component
function ColumnHeader({ label, width, sortKey, sortBy, sortDir, onSort, textAlign = "left" }) {
  const isSorted = sortBy === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: "8px 12px",
        textAlign,
        fontWeight: "700",
        color: "#4b5563",
        fontSize: "10px",
        textTransform: "uppercase",
        cursor: "pointer",
        userSelect: "none",
        backgroundColor: isSorted ? "#f0f9ff" : "transparent",
        width,
        transition: "background-color 0.15s"
      }}
      onMouseEnter={(e) => {
        if (!isSorted) e.currentTarget.style.backgroundColor = "#f9fafb";
      }}
      onMouseLeave={(e) => {
        if (!isSorted) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {label} {isSorted && (sortDir === "asc" ? "↑" : "↓")}
    </th>
  );
}

// Trade Details Panel Component
function TradeDetailsPanel({ confirmation, onMatch, onOverride, onUpdateStatus, onIgnore }) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [newStatus, setNewStatus] = useState("");

  if (!confirmation) {
    return (
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
        padding: "16px",
        textAlign: "center",
        color: "#9ca3af",
        position: "sticky",
        top: "24px"
      }}>
        <p style={{ margin: 0, fontSize: "12px" }}>Select an order to view details</p>
      </div>
    );
  }

  const mismatches = confirmation.mismatches || [];
  const hasMismatches = mismatches.length > 0;

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      padding: "16px",
      position: "sticky",
      top: "24px",
      maxHeight: "calc(100vh - 200px)",
      overflowY: "auto"
    }}>
      {/* Trade Metadata */}
      <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700", color: "#1f2933" }}>Trade Details</h3>
        <div style={{ fontSize: "11px" }}>
          <div style={{ marginBottom: "4px" }}>
            <span style={{ color: "#9ca3af", fontWeight: "600" }}>ID:</span>
            <span style={{ color: "#1f2933", fontFamily: "monospace", marginLeft: "6px" }}>{confirmation.tradeId}</span>
          </div>
          <div style={{ marginBottom: "4px" }}>
            <span style={{ color: "#9ca3af", fontWeight: "600" }}>External Ref:</span>
            <span style={{ color: "#1f2933", fontFamily: "monospace", marginLeft: "6px" }}>{confirmation.externalRef}</span>
          </div>
          <div style={{ marginBottom: "4px" }}>
            <span style={{ color: "#9ca3af", fontWeight: "600" }}>Trader:</span>
            <span style={{ color: "#1f2933", marginLeft: "6px" }}>{confirmation.trader}</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "700", color: "#1f2933" }}>Internal vs External</h4>
        <div style={{ fontSize: "10px" }}>
          {[
            { field: "Instrument", internal: confirmation.instrument, external: confirmation.instrument },
            { field: "Side", internal: confirmation.side, external: confirmation.side },
            { field: "Quantity", internal: confirmation.quantity, external: confirmation.quantity },
            { field: "Price", internal: confirmation.price.toFixed(2), external: confirmation.price.toFixed(2) }
          ].map((row, idx) => {
            const hasMismatch = confirmation.mismatches?.some(m => m.field === row.field);
            return (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1fr",
                  gap: "8px",
                  padding: "6px",
                  borderRadius: "3px",
                  backgroundColor: hasMismatch ? "#fee2e2" : "#f9fafb",
                  marginBottom: "4px",
                  borderLeft: hasMismatch ? "2px solid #ef4444" : "2px solid transparent"
                }}
              >
                <span style={{ fontWeight: "600", color: "#4b5563" }}>{row.field}</span>
                <span style={{ color: "#1f2933" }}>{row.internal}</span>
                <span style={{ color: hasMismatch ? "#ef4444" : "#1f2933", fontWeight: hasMismatch ? "600" : "400" }}>
                  {row.external} {hasMismatch && "✗"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Trail */}
      <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "700", color: "#1f2933" }}>Status History</h4>
        <div style={{ fontSize: "10px" }}>
          {[
            { time: "09:47", action: "Imported from exchange", actor: "Bloomberg" },
            { time: "09:46", action: "Created in internal system", actor: "TRADER1" }
          ].map((item, idx) => (
            <div key={idx} style={{ marginBottom: "6px", color: "#6b7280" }}>
              <div style={{ fontWeight: "600" }}>{item.time} - {item.action}</div>
              <div style={{ fontSize: "9px", color: "#9ca3af" }}>{item.actor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "grid", gap: "6px" }}>
        {confirmation.status === "Unmatched" && (
          <button
            onClick={onMatch}
            style={{
              padding: "8px 12px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: FONT_FAMILY
            }}
          >
            ✓ Match
          </button>
        )}

        {hasMismatches && (
          <button
            onClick={() => setShowOverrideModal(true)}
            style={{
              padding: "8px 12px",
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fde68a",
              borderRadius: "4px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: FONT_FAMILY
            }}
          >
            ⚠ Override
          </button>
        )}

        <button
          onClick={() => setShowStatusModal(true)}
          style={{
            padding: "8px 12px",
            backgroundColor: "#f3f4f6",
            color: "#6b7280",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: FONT_FAMILY
          }}
        >
          ↻ Update Status
        </button>

        <button
          onClick={onIgnore}
          style={{
            padding: "8px 12px",
            backgroundColor: "#fff",
            color: "#6b7280",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: FONT_FAMILY
          }}
        >
          Dismiss
        </button>
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 25px rgba(0,0,0,0.1)",
          zIndex: 1000,
          minWidth: "400px"
        }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700" }}>Override Match</h3>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0" }}>
            Provide a reason for overriding system matching rules:
          </p>
          <textarea
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="Enter reason..."
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              minHeight: "60px",
              boxSizing: "border-box",
              fontFamily: FONT_FAMILY
            }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              onClick={() => {
                onOverride(overrideReason);
                setShowOverrideModal(false);
                setOverrideReason("");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: FONT_FAMILY
              }}
            >
              Confirm Override
            </button>
            <button
              onClick={() => setShowOverrideModal(false)}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: FONT_FAMILY
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 25px rgba(0,0,0,0.1)",
          zIndex: 1000,
          minWidth: "400px"
        }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700" }}>Update Status</h3>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "12px",
                boxSizing: "border-box",
                fontFamily: FONT_FAMILY
              }}
            >
              <option value="">Select status...</option>
              <option value="Pending">Pending</option>
              <option value="Error Resolved">Error Resolved</option>
              <option value="Cancelled">Cancelled</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Reason (Required)
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Explain the status change..."
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "12px",
                minHeight: "60px",
                boxSizing: "border-box",
                fontFamily: FONT_FAMILY
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                if (newStatus && statusReason) {
                  onUpdateStatus(newStatus, statusReason);
                  setShowStatusModal(false);
                  setNewStatus("");
                  setStatusReason("");
                }
              }}
              disabled={!newStatus || !statusReason}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: newStatus && statusReason ? "#1d4ed8" : "#ccc",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "600",
                cursor: newStatus && statusReason ? "pointer" : "not-allowed",
                fontSize: "12px",
                fontFamily: FONT_FAMILY
              }}
            >
              Update
            </button>
            <button
              onClick={() => setShowStatusModal(false)}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: FONT_FAMILY
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock Data Generator
function generateMockConfirmations() {
  const statuses = ["Matched", "Unmatched", "One-sided", "Pending", "Error", "In Progress"];
  const instruments = ["ES", "NQ", "AAPL", "GOOGL", "BZ"];
  const traders = ["TRADER1", "TRADER2", "TRADER3"];
  const counterparties = ["JPM", "GS", "BNY", "CITI"];
  const sources = ["Bloomberg", "FIX", "Email", "Swift"];

  return Array.from({ length: 45 }, (_, i) => {
    const instrument = instruments[Math.floor(Math.random() * instruments.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const hasMismatch = status !== "Matched" && Math.random() > 0.5;

    const priceValue = Number((Math.random() * 10000 + 3000).toFixed(2));

    return {
      id: `TR${String(i + 1).padStart(3, "0")}`,
      tradeId: `TR-20251213-${String(i + 1).padStart(3, "0")}`,
      externalRef: `CR-${String(i + 1).padStart(3, "0")}`,
      instrument,
      side: Math.random() > 0.5 ? "BUY" : "SELL",
      quantity: Math.floor(Math.random() * 500) + 10,
      price: priceValue,
      trader: traders[Math.floor(Math.random() * traders.length)],
      counterparty: counterparties[Math.floor(Math.random() * counterparties.length)],
      status,
      age: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      source: sources[Math.floor(Math.random() * sources.length)],
      mismatches: hasMismatch ? [{ field: "Quantity", severity: "critical" }] : [],
      createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
    };
  });
}

export default ConfirmationMonitor;

