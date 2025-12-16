// OrderBlotter.jsx
// Main blotter container - renders header and list of orders using OrderRow
import React from 'react';
import './OrderBlotter.css';
import OrderRow from './OrderRow';
import ViewFIXButton from './fix/ViewFIXButton';

export default function OrderBlotter({ orders = [], onSelectOrder, actionsRenderer, instruments = [] }) {
  return (
    <div className="order-blotter">
      <div className="order-blotter-inner">
        {/* Header row: controls labels and alignment */}
        <div className="order-blotter-grid blotter-header" role="row">
          <div>Symbol</div>
          <div>Side</div>
          <div style={{ textAlign: 'right' }}>Qty</div>
          <div style={{ textAlign: 'right' }}>Price</div>
          <div>Status</div>
          <div>Trader</div>
          <div style={{ textAlign: 'right' }}>Time</div>
          <div style={{ textAlign: 'center' }}>Actions</div>
        </div>

        {/* Data rows */}
        {orders.map((o) => (
          <OrderRow
            key={o.id || o.order_id || `${o.instrument}-${Math.random()}`}
            order={o}
            onSelect={onSelectOrder}
            actionsNode={actionsRenderer ? actionsRenderer(o) : (<ViewFIXButton order={o} />)}
            instruments={instruments}
          />
        ))}
      </div>
    </div>
  );
}
