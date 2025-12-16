// OrderRow.jsx
// Reusable row component that renders a single order into the blotter grid
import React from 'react';
import './OrderBlotter.css';

// Props: order (object), onSelect (fn), actions (node)
export default function OrderRow({ order, onSelect, actionsNode, instruments }) {
  if (!order) return null;
  const sideColor = (order.side === 'BUY' || order.side === 'Buy') ? '#10b981' : '#ef4444';
  // Resolve symbol: prefer order.symbol, then try to match instrument_id to instruments list
  let displaySymbol = '';
  if (order && typeof order.instrument === 'object' && order.instrument !== null) {
    displaySymbol = order.instrument.symbol || order.instrument.id || '';
  } else {
    displaySymbol = order.symbol || order.instrument || '';
  }
  if (instruments && (!order.symbol && displaySymbol)) {
    const found = instruments.find(i =>
      (i.instrument_id && i.instrument_id === displaySymbol) ||
      (i.id && i.id === displaySymbol) ||
      (i.instrumentId && i.instrumentId === displaySymbol) ||
      (i.symbol && i.symbol === displaySymbol)
    );
    if (found && found.symbol) displaySymbol = found.symbol;
  }
  // If displaySymbol looks like a UUID (backend stored id) and we couldn't map it, shorten it for readability
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let displaySymbolShort = displaySymbol;
  if (displaySymbol && uuidLike.test(displaySymbol)) {
    // shorten for display but keep full id in title
    displaySymbolShort = `${displaySymbol.slice(0, 8)}...${displaySymbol.slice(-4)}`;
  }

  return (
    <div className="blotter-row" role="row" onClick={() => onSelect && onSelect(order)}>
      {/* Symbol */}
      <div className="blotter-cell cell-symbol" title={displaySymbol}>{displaySymbolShort || '—'}</div>
      {/* Side */}
      <div className="blotter-cell cell-side" style={{ color: sideColor }}>{order.side}</div>
      {/* Qty */}
      <div className="blotter-cell cell-qty">{order.qty}</div>
      {/* Price */}
      <div className="blotter-cell cell-price">{order.price != null ? order.price : '—'}</div>
      {/* Status (primary) */}
      <div className="blotter-cell cell-status">{order.status}</div>
      {/* Trader / secondary info (flex column on narrow screens) */}
      <div className="blotter-cell cell-trader">{order.trader || order.account || '—'}</div>
      {/* Time */}
      <div className="blotter-cell cell-time">{order.created_at ? new Date(order.created_at).toLocaleTimeString() : '—'}</div>

      {/* Actions cell - preserves existing action buttons (Fill/Cancel/View FIX) */}
      <div className="blotter-cell cell-actions">{actionsNode}</div>

      {/* Secondary line shown only on small screens: account, type, tif, text */}
      <div className="row-secondary">
        {order.account && <span style={{ marginRight: 12 }}>Account: {order.account}</span>}
        {order.type && <span style={{ marginRight: 12 }}>Type: {order.type}</span>}
        {order.tif && <span style={{ marginRight: 12 }}>TIF: {order.tif}</span>}
        {order.trader && <span>Trader: {order.trader}</span>}
      </div>
    </div>
  );
}
