# CONFIRMATION MATCHING MONITOR - ARCHITECTURAL DIAGRAMS

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MockTrade Trading Platform                       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Header (56px)                             │  │
│  │  Logo  | MockTrade | Trading Terminal                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌────────────┬──────────────────────────────────────────────────┐  │
│  │  SIDEBAR   │           MAIN CONTENT AREA                     │  │
│  │ (240px)    │  ┌──────────────────────────────────────────┐  │  │
│  │            │  │  FILTER BAR + QUICK CHIPS               │  │  │
│  │ MODULES:   │  │  ┌────────────────────────────────────┐ │  │  │
│  │            │  │  │ [From] [To] [Instr] [Trader]       │ │  │  │
│  │ • Order    │  │  │ [Counterparty] [Status ▼]          │ │  │  │
│  │   Entry    │  │  │ [All] [Unmatch] [1-sided] [Error]  │ │  │  │
│  │            │  │  └────────────────────────────────────┘ │  │  │
│  │ • Confirm. │  │  ┌────────────────────────────────────┐  │  │  │
│  │   Monitor  │  │  │                                    │  │  │  │
│  │   (NEW)    │  │  │  CONFIRMATION GRID | DETAILS PANEL│  │  │  │
│  │            │  │  │  ┌──────────────────┐ ┌─────────┐│  │  │  │
│  │ • Static   │  │  │  │ Trade ID │ Ext   │ │ Order ID││  │  │  │
│  │   Data     │  │  │  │ Instr    │ Side  │ │ Instr   ││  │  │  │
│  │            │  │  │  │ Qty      │ Price │ │ Qty: 100││  │  │  │
│  │ • Market   │  │  │  │ Trader   │ Status│ │ Price   ││  │  │  │
│  │   Data     │  │  │  │ CPty     │ Age   │ │ Status  ││  │  │  │
│  │            │  │  │  │ Source   │       │ │         ││  │  │  │
│  │ • Enrichm. │  │  │  │          │       │ │[Match]  ││  │  │  │
│  │            │  │  │  │[Prev][1/5]      │ │[Override││  │  │  │
│  │ • Trade    │  │  │  │[Next] [Page]    │ │[Update] ││  │  │  │
│  │   Module   │  │  │  └──────────────────┘ │[Dismiss]││  │  │  │
│  │            │  │  │                       └─────────┘│  │  │  │
│  │ DOCS:      │  │  └────────────────────────────────────┘  │  │  │
│  │ localhost: │  │                                          │  │  │
│  │ 8000/docs  │  │  [Toast Notifications]                   │  │  │
│  │            │  │  ✓ Trade matched                         │  │  │
│  │            │  │  ⚠ Override reason required              │  │  │
│  │            │  │  ✕ API error occurred                    │  │  │
│  │            │  │                                          │  │  │
│  └────────────┴──────────────────────────────────────────────┘  │
│                                                                     │
│  Modals (Overlay):                                                 │
│  ┌──────────────────────────┐   ┌──────────────────────────┐      │
│  │  Override Match Modal    │   │  Update Status Modal     │      │
│  │  Reason: [____] [Confirm]│   │  Status: [Pending ▼]     │      │
│  │                          │   │  Reason: [____]          │      │
│  │                          │   │  [Update] [Cancel]       │      │
│  └──────────────────────────┘   └──────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
ConfirmationMonitorPage
│
├── State Management
│   ├── confirmations: Array
│   ├── selectedConfirmation: Object | null
│   ├── filters: { dateFrom, dateTo, instrument, trader, counterparty, statuses }
│   ├── loading: Boolean
│   ├── message: String
│   ├── sortBy: String
│   ├── sortDir: 'asc' | 'desc'
│   ├── page: Number
│   └── pageSize: Number
│
├── FilterBar
│   ├── DateInput (From)
│   ├── DateInput (To)
│   ├── TextInput (Instrument)
│   ├── TextInput (Trader)
│   ├── TextInput (Counterparty)
│   ├── MultiSelect (Status)
│   └── Button (Reset)
│
├── QuickFilterChips
│   ├── Chip (All)
│   ├── Chip (Unmatched)
│   ├── Chip (One-sided)
│   ├── Chip (Error)
│   └── Chip (Matched today)
│
├── Main Grid (2-column layout)
│   │
│   ├── ConfirmationGrid (Left column)
│   │   ├── TableHeader
│   │   │   ├── ColumnHeader (Trade ID) - sortable
│   │   │   ├── ColumnHeader (External Ref) - sortable
│   │   │   ├── ColumnHeader (Instrument) - sortable
│   │   │   ├── ColumnHeader (Side) - sortable
│   │   │   ├── ColumnHeader (Quantity) - sortable
│   │   │   ├── ColumnHeader (Price) - sortable
│   │   │   ├── ColumnHeader (Trader) - sortable
│   │   │   ├── ColumnHeader (Counterparty) - sortable
│   │   │   ├── ColumnHeader (Status) - sortable
│   │   │   ├── ColumnHeader (Age) - sortable
│   │   │   └── ColumnHeader (Source) - sortable
│   │   │
│   │   ├── TableBody
│   │   │   └── Row (40px height, zebra-striped)
│   │   │       ├── Cell (Trade ID, monospace)
│   │   │       ├── Cell (External Ref, shows ✗ if mismatch)
│   │   │       ├── Cell (Instrument)
│   │   │       ├── Cell (Side, color-coded)
│   │   │       ├── Cell (Quantity, right-aligned)
│   │   │       ├── Cell (Price, right-aligned, monospace)
│   │   │       ├── Cell (Trader)
│   │   │       ├── Cell (Counterparty)
│   │   │       ├── Cell (Status)
│   │   │       │   └── StatusPill
│   │   │       │       ├── Color (based on status)
│   │   │       │       ├── Icon (✓, ⚠, !, -)
│   │   │       │       └── Text (Matched, Unmatched, etc.)
│   │   │       ├── Cell (Age, right-aligned)
│   │   │       └── Cell (Source)
│   │   │
│   │   └── Pagination
│   │       ├── Button (← Prev)
│   │       ├── Display (Page X of Y)
│   │       └── Button (Next →)
│   │
│   └── TradeDetailsPanel (Right column, sticky)
│       ├── (When no selection)
│       │   └── Message: "Select an order to view details"
│       │
│       └── (When selection exists)
│           ├── TradeMetadata
│           │   ├── Trade ID
│           │   ├── External Ref
│           │   ├── Trader
│           │   └── Created At
│           │
│           ├── ComparisonTable
│           │   └── ComparisonRow (for each field)
│           │       ├── Field Name (fixed width)
│           │       ├── Internal Value
│           │       ├── External Value
│           │       └── (If mismatch: red bg, red border, ✗ icon)
│           │
│           ├── AuditTrail
│           │   └── TimelineItem
│           │       ├── Timestamp
│           │       ├── Action
│           │       └── Actor
│           │
│           └── ActionBar
│               ├── Button (Match) - if Unmatched
│               ├── Button (Override) - if Mismatches
│               ├── Button (Update Status) - always
│               └── Button (Dismiss) - always
│
└── Modals (Portal)
    ├── OverrideMatchModal
    │   ├── Title
    │   ├── Instructions
    │   ├── TextArea (Reason)
    │   ├── Button (Confirm Override)
    │   └── Button (Cancel)
    │
    └── UpdateStatusModal
        ├── Title
        ├── Select (New Status)
        ├── TextArea (Reason)
        ├── Button (Update)
        └── Button (Cancel)
```

---

## Data Flow Diagram

```
User Action
    ↓
┌───────────────────────────────┐
│ Event Handler (onClick, etc.) │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ State Update                  │
│ (setConfirmations, etc.)      │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ Component Re-render           │
│ (with new state)              │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ Conditional Rendering         │
│ (if selected, show details)   │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ DOM Update                    │
│ (grid, panel, modal)          │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ Toast Notification           │
│ (success/error message)       │
└───────────────────────────────┘
```

Example: Match Trade Flow
```
User clicks "Match" button
         ↓
handleMatch(confirmationId) called
         ↓
window.confirm("Confirm match?")
         ↓
User clicks "OK"
         ↓
API call: POST /api/v1/confirmations/{id}/match
         ↓
Update state: selectedConfirmation.status = "Matched"
         ↓
Update state: confirmations = [...updated array]
         ↓
Show toast: "✓ Trade matched successfully"
         ↓
Grid row updates: Status pill becomes green ✓
         ↓
Details panel updates: Status shows "Matched"
         ↓
Toast auto-dismisses after 3 seconds
```

---

## Table Layout (Grid)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CONFIRMATION GRID - Column Layout (11 columns)                          │
├────────┬────────┬──────────┬───────┬────────┬────────┬────────┬────────┬──────────┬───────┬────────┤
│ Trade  │ Ext    │          │       │        │        │        │        │          │       │        │
│ ID     │ Ref    │ Instr    │ Side  │ Qty    │ Price  │ Trader │ CPty   │ Status   │ Age   │ Source │
├────────┼────────┼──────────┼───────┼────────┼────────┼────────┼────────┼──────────┼───────┼────────┤
│120px   │120px   │ 100px    │60px   │80px    │100px   │100px   │120px   │ 120px    │80px   │100px   │
├────────┼────────┼──────────┼───────┼────────┼────────┼────────┼────────┼──────────┼───────┼────────┤
│TR-001  │CR-001  │ ES       │ BUY ✓ │    10  │4000.50 │TRADER1 │ JPM    │ Matched  │1h 2m  │Bloomberg│
│        │        │          │       │        │ (right │        │        │  (green) │       │        │
│        │        │          │       │        │ align) │        │        │          │       │        │
├────────┼────────┼──────────┼───────┼────────┼────────┼────────┼────────┼──────────┼───────┼────────┤
│TR-002  │CR-002 ✗│ NQ       │SELL ✗ │    20  │16000   │TRADER2 │ GS     │Unmatched │2h 15m │FIX     │
│        │        │          │       │        │        │        │        │  (amber) │       │        │
├────────┼────────┼──────────┼───────┼────────┼────────┼────────┼────────┼──────────┼───────┼────────┤
│TR-003  │CR-003  │ AAPL     │ BUY ✓ │   100  │180.25  │TRADER1 │ BNY    │One-sided │2h 45m │Email   │
│        │        │          │       │        │        │        │        │  (amber) │       │        │
│        │        │          │       │        │        │        │        │     ⚠    │       │        │
├────────┼────────┼──────────┼───────┼────────┼────────┼────────┼────────┼──────────┼───────┼────────┤
│TR-004  │CR-004  │ GOOGL    │SELL ✗ │    15  │125.75  │TRADER3 │ CITI   │  Error   │3h 20m │Swift   │
│        │        │          │       │        │        │        │        │   (red)  │       │        │
│        │        │          │       │        │        │        │        │    !     │       │        │
├────────┼────────┼──────────┼───────┼────────┼────────┼────────┼────────┼──────────┼───────┼────────┤
│TR-005  │CR-005  │ BZ       │ BUY ✓ │   500  │75.50   │TRADER2 │ JPM    │ Pending  │4h 5m  │Bloomberg│
│        │        │          │       │        │        │        │        │  (blue)  │       │        │
└────────┴────────┴──────────┴───────┴────────┴────────┴────────┴────────┴──────────┴───────┴────────┘

Legend:
✓ = Match indicator (green)
✗ = Mismatch indicator (red)
⚠ = Warning indicator (amber)
! = Error indicator (red)

Styling:
• Zebra striping: Alternating white / light gray (#f9fafb)
• Selected row: Blue left border (3px) + light blue background
• Hover: Light blue background (#f0f9ff) on non-selected rows
• Column alignment: Left (default), Right (numbers), Center (status)
• Font: System font, 11px, monospace for IDs and prices
```

---

## Details Panel Layout (Sticky, Right Side)

```
┌──────────────────────────────────────┐
│  TRADE DETAILS (sticky)              │
│  Width: 320px                        │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Trade Details                  │  │
│  │ ID: TR-20251213-001 (monospace)│  │
│  │ Ext Ref: CR-EXT-001            │  │
│  │ Trader: TRADER1                │  │
│  │ Created: 2025-12-13 09:45 UTC  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Internal vs External            │  │
│  │                                │  │
│  │ Field        │ Internal │ Ext  │  │
│  │ ─────────────┼──────────┼──────│  │
│  │ Instrument   │ ES       │ ES   │  │ ✓ Match
│  │ Side         │ BUY      │ BUY  │  │ ✓ Match
│  │ Quantity     │ 100      │ 105  │  │ ✗ MISMATCH
│  │              │          │      │  │ (red bg, border, icon)
│  │ Price        │ 4000.50  │ 4000 │  │ ✓ Match
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Status History                 │  │
│  │                                │  │
│  │ 09:47 Imported from exchange   │  │
│  │       Bloomberg                │  │
│  │                                │  │
│  │ 09:46 Created in internal sys  │  │
│  │       TRADER1                  │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [✓ Match] (Green, Primary)     │  │
│  │ [⚠ Override] (Amber, Warning)  │  │
│  │ [↻ Update Status] (Gray)       │  │
│  │ [- Dismiss] (Gray Text)        │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## Filter Bar Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ FILTER TOOLBAR                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Row 1: Date Filters & Text Inputs                               │
│ ┌──────────┬──────────┬────────────┬─────────┬────────────────┐ │
│ │From Date │ To Date  │Instrument  │ Trader  │Counterparty    │ │
│ │[____▼]   │ [____▼]  │[ES, NQ...] │[TRADER1]│[JPM, GS, ...]  │ │
│ └──────────┴──────────┴────────────┴─────────┴────────────────┘ │
│                                                                  │
│ Row 2: Status Multi-Select                                      │
│ ┌──────────────────────────────────────┐                        │
│ │Status ▼ (Multiple selection)         │                        │
│ │☑ Unmatched                           │                        │
│ │☑ Matched                             │                        │
│ │☐ One-sided                           │                        │
│ │☐ Pending                             │                        │
│ │☐ Error                               │                        │
│ │☐ In Progress                         │                        │
│ │☐ Cancelled                           │                        │
│ └──────────────────────────────────────┘                        │
│                                                                  │
│ Row 3: Action Buttons                                           │
│ [Reset Filters] [Apply] (or auto-apply on change)               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Modal Dialogs

### Override Match Modal

```
┌────────────────────────────────────────┐
│ ✕ Override Match              [X]      │
├────────────────────────────────────────┤
│                                        │
│ Provide a reason for overriding       │
│ system matching rules:                │
│                                        │
│ [Qty mismatch verified with trader]   │
│ [Text area - 4 lines min]              │
│ [                                    ]  │
│ [                                    ]  │
│                                        │
│ ┌──────────────┐  ┌──────────────┐   │
│ │ Confirm      │  │ Cancel       │   │
│ │ Override     │  │              │   │
│ │  (Green)     │  │  (Gray)      │   │
│ └──────────────┘  └──────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

### Update Status Modal

```
┌────────────────────────────────────────┐
│ ↻ Update Status                  [X]   │
├────────────────────────────────────────┤
│                                        │
│ New Status                             │
│ [Pending ▼]                            │
│ [Options: Pending, Error Resolved,    │
│  Cancelled, In Progress]               │
│                                        │
│ Reason (Required)                      │
│ [Awaiting trader review]               │
│ [Text area - 4 lines]                  │
│ [                                    ]  │
│ [                                    ]  │
│                                        │
│ ┌──────────────┐  ┌──────────────┐   │
│ │ Update       │  │ Cancel       │   │
│ │  (Blue)      │  │  (Gray)      │   │
│ │  (Disabled if│  │              │   │
│ │   no status) │  │              │   │
│ └──────────────┘  └──────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

---

## Status Badge Variants

```
┌─────────────┬──────────────┬─────────────────┬──────┐
│ Status      │ Background   │ Text            │ Icon │
├─────────────┼──────────────┼─────────────────┼──────┤
│ Matched     │ #d1fae5      │ #065f46 (dark)  │ ✓    │
│             │ Green        │ Dark Green      │      │
├─────────────┼──────────────┼─────────────────┼──────┤
│ Unmatched   │ #fef3c7      │ #92400e (brown) │ -    │
│             │ Amber        │                 │      │
├─────────────┼──────────────┼─────────────────┼──────┤
│ One-sided   │ #fef3c7      │ #92400e (brown) │ ⚠    │
│             │ Amber        │                 │      │
├─────────────┼──────────────┼─────────────────┼──────┤
│ Pending     │ #e3f2fd      │ #1e40af (blue)  │ -    │
│             │ Light Blue   │                 │      │
├─────────────┼──────────────┼─────────────────┼──────┤
│ Error       │ #fee2e2      │ #991b1b (red)   │ !    │
│             │ Light Red    │                 │      │
├─────────────┼──────────────┼─────────────────┼──────┤
│ In Progress │ #dbeafe      │ #0c4a6e (blue)  │ -    │
│             │ Light Blue   │                 │      │
├─────────────┼──────────────┼─────────────────┼──────┤
│ Cancelled   │ #f3f4f6      │ #6b7280 (gray)  │ -    │
│             │ Light Gray   │                 │      │
└─────────────┴──────────────┴─────────────────┴──────┘

Visual Representation:

✓ Matched (Green)
┌──────────────┐
│✓ Matched    │  Font: 10px, 700 weight
│ Background  │  Padding: 3px 8px
│ #d1fae5     │  Border: 1px solid #a7f3d0
│ Text: Dark  │  Border-radius: 3px
└──────────────┘

⚠ One-sided (Amber)
┌──────────────┐
│⚠ One-sided  │  Font: 10px, 700 weight
│ Background  │  Padding: 3px 8px
│ #fef3c7     │  Border: 1px solid #fde68a
│ Text: Brown │  Border-radius: 3px
└──────────────┘

! Error (Red)
┌──────────────┐
│! Error       │  Font: 10px, 700 weight
│ Background  │  Padding: 3px 8px
│ #fee2e2     │  Border: 1px solid #fecaca
│ Text: Dark  │  Border-radius: 3px
└──────────────┘
```

---

## State Machine (Status Transitions)

```
                  [Unmatched]
                       ↓
                    (Click Match)
                       ↓
                    [Matched]
                    (Final)
                    
Alternative:
                  [Unmatched]
                       ↓
                    (Mismatch Detected)
                       ↓
                  [One-sided] ←→ [Unmatched]
                       ↓
                    (Click Override)
                       ↓
                    [Matched]


Pending/Error Flow:
                     [Error]
                       ↓
                   (Click Update Status)
                       ↓
                  [Error Resolved]
                  or [Pending]
                       ↓
                  (Eventually)
                       ↓
                    [Matched]
                    or [Cancelled]


Full State Diagram:
   ┌─────────────┐
   │  Unmatched  │  ← Default state when confirmation received
   └──────┬──────┘
          │
          ├─→ (User clicks Match)
          │        ↓
          │   ┌─────────────┐
          │   │   Matched   │  ← Success state
          │   └─────────────┘
          │
          └─→ (Mismatch detected)
               ↓
          ┌──────────────┐
          │  One-sided   │  ← Requires Override
          └──────┬───────┘
                 │
                 └─→ (User clicks Override)
                      ↓
                 ┌──────────────┐
                 │   Matched    │
                 └──────────────┘

Optional Status Updates:
┌──────────┐
│ Pending  │
└────┬─────┘
     ├─→ Error Resolved → Matched
     ├─→ Cancelled → (archived)
     └─→ In Progress → Matched

┌───────┐
│ Error │
└───┬───┘
    └─→ Update Status → Pending / Cancelled
```

---

**End of Architectural Diagrams**

