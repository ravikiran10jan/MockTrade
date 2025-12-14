# CONFIRMATION MATCHING MONITOR - IMPLEMENTATION GUIDE

## Overview
This document provides step-by-step instructions for the front-end implementation of the Confirmation Matching Monitor module for MockTrade.

---

## What Was Delivered

### 1. **CONFIRMATION_MONITOR_SPEC.md**
- Complete design specification
- Layout architecture and component breakdown
- Data models and API endpoints
- Interaction flows and user journeys
- Visual styling and color palette
- Accessibility and performance considerations

### 2. **ConfirmationMonitor.jsx**
- Fully implemented React component
- All required subcomponents:
  - ConfirmationMonitorPage (main container)
  - FilterBar (date, instrument, trader, counterparty, status)
  - QuickFilterChips (All, Unmatched, One-sided, Error, Matched today)
  - ConfirmationGrid (main data table with sorting, pagination)
  - TradeDetailsPanel (side-by-side comparison, audit trail, actions)
  - StatusPill (color-coded status indicators)
  - ActionBar (Match, Override, Update Status, Ignore buttons)
- Mock data generation for testing
- Toast notifications for user feedback
- Modal dialogs for Override and Status Update actions

### 3. **TradingDashboard Integration**
- Added ConfirmationMonitor to module imports
- Added "Confirmations" module to sidebar navigation
- Properly integrated with existing layout (sidebar, main content, detail panel)

---

## Component Architecture

```
ConfirmationMonitor (Main Container)
├── FilterBar
│   ├── DateRange inputs (From, To)
│   ├── Text inputs (Instrument, Trader, Counterparty)
│   ├── Status multi-select
│   └── Reset Filters button
│
├── QuickFilterChips
│   └── 5 pre-defined filter chips
│
├── Main Grid Layout (2-column)
│   ├── ConfirmationGrid (Left)
│   │   ├── Table Headers (11 columns)
│   │   ├── Table Rows (40px height)
│   │   │   ├── Cell renders (with mismatch highlighting)
│   │   │   └── StatusPill
│   │   └── Pagination controls
│   │
│   └── TradeDetailsPanel (Right, Sticky)
│       ├── Trade Metadata
│       ├── Internal vs External Comparison
│       │   ├── Side-by-side field comparison
│       │   └── Mismatch highlighting (red background, border, icon)
│       ├── Status History / Audit Trail
│       └── ActionBar
│           ├── Match button (primary, green)
│           ├── Override button (warning, amber)
│           ├── Update Status button (secondary)
│           ├── Dismiss button (tertiary)
│           └── View in Trade Module link
│
└── Modals
    ├── Override Match Modal
    └── Update Status Modal
```

---

## Key Features Implemented

### 1. **Filter Bar**
- **Date Range:** From/To date inputs
- **Text Search:** Instrument, Trader, Counterparty fields
- **Status Multi-Select:** 7 status options (Unmatched, Matched, One-sided, Pending, Error, In Progress, Cancelled)
- **Reset:** Clear all filters and return to page 1

### 2. **Quick Filters**
- **All:** Show all confirmations (default)
- **Unmatched:** Only unmatched trades
- **One-sided:** Only one-sided mismatches
- **Error:** Only error confirmations
- **Matched today:** Only matched trades from today

### 3. **Confirmation Grid (Table)**
**Columns:**
| Column | Features |
|--------|----------|
| Trade ID | Monospace font, bold |
| External Ref | Shows red ✗ if mismatch exists |
| Instrument | Text |
| Side | Color-coded: BUY (green), SELL (red) |
| Quantity | Right-aligned |
| Price | Right-aligned, monospace, 2 decimals |
| Trader | Text |
| Counterparty | Text |
| Status | Color-coded pill with icon |
| Age | Right-aligned (e.g., "2h 15m") |
| Source | Text (Bloomberg, FIX, Email, etc.) |

**Row Features:**
- Zebra striping (alternating #fff / #f9fafb)
- 40px row height
- Clickable rows with hover highlight
- Blue left border (3px) on selected row
- Light blue hover effect (#f0f9ff)
- Smooth transitions (0.15s)

**Sorting:**
- Click column headers to sort
- Visual indicator (↑/↓) shows current sort
- Sorted column has light blue background

**Pagination:**
- 20 rows per page
- Display: "Showing X–Y of Z"
- Previous / Next / Page number display

### 4. **Trade Details Panel**
**Sections:**

#### 4a. Trade Metadata
- Trade ID (monospace)
- External Ref (monospace)
- Trader, Desk, Book
- Creation timestamp

#### 4b. Internal vs External Comparison
- Side-by-side grid showing:
  - Field name (left)
  - Internal value (middle)
  - External value (right)
- **Mismatch Highlighting:**
  - Red background (#fee2e2)
  - Red left border (2px)
  - Red ✗ icon
  - Fields: Instrument, Side, Quantity, Price, Settlement Date

#### 4c. Status History / Audit Trail
- Timeline showing:
  - Timestamp
  - Action (Imported, Created, Matched, etc.)
  - Actor (System, User name)
- Read-only, for information only

#### 4d. Action Buttons
**Match** (Green, Primary)
- Visible when: Status = "Unmatched"
- Click: Shows confirmation dialog
- Action: Matches trade, updates grid, shows toast

**Override** (Amber, Warning)
- Visible when: Mismatches exist AND Override permission granted
- Click: Opens modal with reason text area
- Warning tooltip: "Override system matching rules"
- Action: Marks as matched with reason logged

**Update Status** (Grey, Secondary)
- Visible always
- Click: Opens modal with status dropdown + reason field
- Options: Pending, Error Resolved, Cancelled, In Progress
- Reason: Required field
- Action: Changes status, logs reason in audit trail

**Dismiss** (Grey, Tertiary)
- Visible always
- Click: Archives trade from primary view
- Action: Removes from grid, resets selection

### 5. **Status Colors & Icons**
| Status | Background | Text | Icon |
|--------|-----------|------|------|
| Matched | #d1fae5 (Green) | #065f46 | ✓ |
| Unmatched | #fef3c7 (Amber) | #92400e | - |
| One-sided | #fef3c7 (Amber) | #92400e | ⚠ |
| Pending | #e3f2fd (Blue) | #1e40af | - |
| Error | #fee2e2 (Red) | #991b1b | ! |
| In Progress | #dbeafe (Light Blue) | #0c4a6e | - |
| Cancelled | #f3f4f6 (Grey) | #6b7280 | - |

### 6. **Modals**

#### Override Match Modal
- Title: "Override Match"
- Instructions: "Provide a reason for overriding system matching rules:"
- Text area: Reason (required)
- Buttons: [Confirm Override] [Cancel]
- On confirm: Calls `handleOverride()`, shows toast, closes modal

#### Update Status Modal
- Title: "Update Status"
- Dropdown: Status selection (Pending, Error Resolved, Cancelled, In Progress)
- Text area: Reason (required)
- Buttons: [Update] [Cancel]
- Validation: Both fields required to enable Update button
- On confirm: Calls `handleUpdateStatus()`, shows toast, closes modal

### 7. **Empty States**
- **No Data:** "No confirmations match your filters. Try adjusting your date range or status filters."
- **Loading:** Spinner or skeleton loaders
- **Error:** Error banner with retry button

### 8. **Notifications (Toast)**
- **Success:** Green background (#d1fae5), auto-dismiss after 3s
  - Examples: "✓ Trade matched successfully", "✓ Status updated to Pending"
- **Error:** Red background (#fee2e2), stays visible
  - Examples: "✗ Error: Failed to match trade"

---

## Data Flow

### 1. Initial Load
1. ConfirmationMonitor mounts
2. `fetchConfirmations()` is called
3. Mock data is generated (45 sample confirmations)
4. Grid renders with first page (20 rows)
5. No selection (details panel shows "Select an order...")

### 2. User Selects a Row
1. User clicks a confirmation row
2. `onSelectRow(confirmation)` fires
3. `selectedConfirmation` state updates
4. Grid row gets blue left border + light blue background
5. Details panel updates with trade info
6. Action buttons show based on status

### 3. User Clicks "Match"
1. Confirmation dialog appears
2. User confirms
3. `handleMatch()` is called
4. State updates: status = "Matched"
5. Grid row updates in place (status pill changes to green ✓)
6. Toast: "✓ Trade matched successfully"
7. Toast auto-dismisses after 3 seconds

### 4. User Clicks "Override"
1. Override Modal opens
2. User enters reason
3. User clicks "Confirm Override"
4. `handleOverride()` is called
5. Status changes to "Matched"
6. Audit trail updated (mock)
7. Toast: "✓ Override applied. Reason logged."

### 5. User Applies Filters
1. User changes date, instrument, trader, counterparty, or status
2. `onFilterChange()` fires
3. Grid re-filters (client-side for mock data)
4. Page resets to 1
5. Row count updates
6. Details panel clears (if selected row no longer matches filter)

---

## Code Implementation Details

### File: ConfirmationMonitor.jsx
**Size:** ~950 lines
**Structure:**
1. Main component (`ConfirmationMonitor`) - State management, API calls
2. Sub-components in order:
   - `FilterBar` - Filter inputs
   - `QuickFilterChips` - Chip buttons
   - `ConfirmationGrid` - Main table
   - `ColumnHeader` - Table column header with sort
   - `TradeDetailsPanel` - Side panel with modals
3. Helper function: `generateMockConfirmations()` - Mock data

### State Management
```javascript
// Container state
const [confirmations, setConfirmations] = useState([]);
const [selectedConfirmation, setSelectedConfirmation] = useState(null);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState("success");
const [filters, setFilters] = useState({...});
const [activeQuickFilter, setActiveQuickFilter] = useState("all");
const [sortBy, setSortBy] = useState("createdAt");
const [sortDir, setSortDir] = useState("desc");
const [page, setPage] = useState(1);

// Detail panel state
const [showOverrideModal, setShowOverrideModal] = useState(false);
const [showStatusModal, setShowStatusModal] = useState(false);
const [overrideReason, setOverrideReason] = useState("");
const [statusReason, setStatusReason] = useState("");
const [newStatus, setNewStatus] = useState("");
```

### Styling
- **Font:** System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto...`
- **Colors:** All inline styles using the enterprise color palette
- **Responsive:** Grid layout with 2 columns on desktop, can be adjusted for mobile
- **Sticky positioning:** Detail panel sticks to top on scroll

---

## Testing Scenarios

### Test 1: Filter by Status
1. Click quick filter "Unmatched"
2. Grid shows only unmatched confirmations
3. Count updates (e.g., "15 of 234")
4. Pagination resets to page 1

### Test 2: Sort by Column
1. Click "Quantity" column header
2. Grid sorts by quantity (ascending)
3. Arrow indicator shows (↑)
4. Click again to reverse (↓)

### Test 3: Match a Trade
1. Click an "Unmatched" confirmation row
2. Details panel shows on right
3. Click green "Match" button
4. Confirmation dialog appears
5. Click "Confirm"
6. Status changes to "Matched" (green pill)
7. Toast shows: "✓ Trade matched successfully"

### Test 4: Override with Mismatch
1. Click a confirmation with mismatches
2. Details panel shows red-highlighted mismatch rows
3. Orange "Override" button is visible
4. Click "Override"
5. Modal opens with reason text area
6. Enter reason: "Qty verified with trader"
7. Click "Confirm Override"
8. Status changes to "Matched"
9. Toast: "✓ Override applied..."
10. Audit trail logs the override

### Test 5: Pagination
1. View page 1 (rows 1–20)
2. Click "Next >" button
3. View page 2 (rows 21–40)
4. Page counter shows "Page 2 of 3"
5. Click "← Prev" to return to page 1

### Test 6: Empty State
1. Filter by status "Cancelled"
2. No matching confirmations
3. Message: "No confirmations match your filters"
4. Click "Reset Filters"
5. Filters clear, all data returns

---

## Integration with Backend

When connecting to the actual backend, replace `generateMockConfirmations()` with real API calls:

### Fetch Confirmations
```javascript
const fetchConfirmations = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      instrument: filters.instrument,
      trader: filters.trader,
      counterparty: filters.counterparty,
      statuses: filters.statuses.join(","),
      sortBy,
      sortDir,
      page,
      pageSize
    });
    const response = await fetch(`http://localhost:8000/api/v1/confirmations?${params}`);
    const data = await response.json();
    setConfirmations(data.data);
  } catch (error) {
    setMessage(`Error: ${error.message}`);
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};
```

### Match Trade
```javascript
const handleMatch = async (confirmationId) => {
  if (window.confirm("Confirm match of this trade?")) {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/confirmations/${confirmationId}/match`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: "Manual match" })
        }
      );
      const updated = await response.json();
      // Update state with response
      setSelectedConfirmation(updated);
      setConfirmations(confirmations.map(c => c.id === confirmationId ? updated : c));
      setMessage("✓ Trade matched successfully");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  }
};
```

### Override Match
```javascript
const handleOverride = async (confirmationId, reason) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/confirmations/${confirmationId}/override-match`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          overriddenFields: ["quantity"] // Example
        })
      }
    );
    const updated = await response.json();
    setSelectedConfirmation(updated);
    setConfirmations(confirmations.map(c => c.id === confirmationId ? updated : c));
    setMessage("✓ Override applied. Reason logged.");
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000);
  } catch (error) {
    setMessage(`Error: ${error.message}`);
    setMessageType("error");
  }
};
```

### Update Status
```javascript
const handleUpdateStatus = async (confirmationId, newStatus, reason) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/confirmations/${confirmationId}/update-status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus, reason })
      }
    );
    const updated = await response.json();
    setSelectedConfirmation(updated);
    setConfirmations(confirmations.map(c => c.id === confirmationId ? updated : c));
    setMessage(`✓ Status updated to ${newStatus}`);
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000);
  } catch (error) {
    setMessage(`Error: ${error.message}`);
    setMessageType("error");
  }
};
```

---

## Performance Optimizations (Future)

1. **Virtual Scrolling:** For 500+ rows, use `react-window` library
2. **Pagination Server-Side:** Fetch only current page from backend
3. **Debounce Filters:** Wait 300ms after user stops typing to apply filter
4. **Memoization:** Use `React.memo()` for table rows
5. **Auto-Refresh:** Poll API every 30 seconds for new confirmations
6. **Caching:** Cache filter results, invalidate on change

---

## Accessibility Features

- **Keyboard Navigation:** Tab through filters, buttons; Enter to submit
- **ARIA Labels:** All form fields have descriptive labels
- **Focus Indicators:** Clear blue outline on focused elements
- **Color + Icon:** Status indicated by both color and icon/text
- **High Contrast:** All text meets WCAG AA standards
- **Screen Reader:** Semantic HTML with proper headings, labels

---

## Browser Support

- **Modern browsers:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **React 17+**
- **No external UI library:** Uses inline styles (easy to migrate to styled-components, Tailwind, etc. if needed)

---

## Next Steps

1. **Backend Implementation:**
   - Create Confirmation model
   - Implement filtering, sorting, pagination endpoints
   - Add match/override/status update endpoints
   - Set up audit logging

2. **Frontend Enhancement:**
   - Replace mock data with real API calls
   - Add loading skeletons
   - Add error recovery strategies
   - Add keyboard shortcuts (e.g., Ctrl+M for match)

3. **Testing:**
   - Unit tests for filter logic
   - Integration tests for API calls
   - E2E tests for user workflows
   - Performance tests for large datasets

4. **Monitoring:**
   - Track matching success rates
   - Monitor API response times
   - Alert on high error rates

---

**End of Implementation Guide**

