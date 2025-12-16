// TwoOrderPane.jsx
// Compact blotter-like pane showing up to two orders in a grid
import React from 'react';
import './TwoOrderPane.css';

// Header row controls labels and alignment
function TwoOrderHeader() {
  return (
    <div className="two-order-header" role="row">
      <div className="two-cell">Symbol</div>
      <div className="two-cell">Side</div>
      <div className="two-cell">Qty</div>
      <div className="two-cell">Price</div>
      <div className="two-cell">Status</div>
      <div className="two-cell">Time</div>
    </div>
  );
}

// Single order row component
function TwoOrderRow({ order }) {
  if (!order) return null;
  const sideColor = order.side === 'BUY' ? '#10b981' : '#ef4444';
  return (
    <div className="two-order-row" role="row">
      {/* main grid cells - left aligned symbol, center side, right aligned numbers */}
      <div className="two-cell cell-symbol" title={order.instrument}>{order.instrument}</div>
      <div className="two-cell cell-side" style={{ color: sideColor }}>{order.side}</div>
      <div className="two-cell cell-qty">{order.qty}</div>
      <div className="two-cell cell-price">{order.price != null ? order.price : '—'}</div>
      <div className="two-cell cell-status">{order.status}</div>
      <div className="two-cell cell-time">{order.created_at ? new Date(order.created_at).toLocaleTimeString() : '—'}</div>

      {/* Responsive secondary info for narrow screens: placed invisibly for wide screens */}
      <div className="row-main" style={{ display: 'none' }}>
        {/* visible only on narrow screens via CSS */}
      </div>
    </div>
  );
}

export default function TwoOrderPane({ orders = [] }) {
  const first = orders[0] || null;
  const second = orders[1] || null;

  return (
    <div className="two-order-pane">
      <TwoOrderHeader />
      <TwoOrderRow order={first} />
      <TwoOrderRow order={second} />
    </div>
  );
}

