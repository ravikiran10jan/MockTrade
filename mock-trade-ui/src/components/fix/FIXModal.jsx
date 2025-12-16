import React, { useState } from 'react';
import { parseFix, normalizeFixString } from '../../utils/fixParser';

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
};

const panelStyle = {
  width: '700px', maxWidth: '95%', maxHeight: '85vh', backgroundColor: '#fff', color: '#1f2933', padding: '24px', boxSizing: 'border-box', overflow: 'auto', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e5e7eb' };

function FIXModal({ open, onClose, fixRaw, orderSummary, errorMsg, order }) {
  const [view, setView] = useState('parsed'); // 'raw' or 'parsed'

  if (!open) return null;

  const parsed = parseFix(fixRaw || '');
  // If there is no raw FIX but an order object exists, provide a small parsed fallback
  const fallbackParsedFromOrder = () => {
    if (!order || (Array.isArray(parsed) && parsed.length > 0)) return parsed;
    const fields = [];
    if (order.clOrdID || order.client_order_id || order.id) fields.push({ tag: '11', name: 'ClOrdID', value: order.clOrdID || order.client_order_id || order.id, displayValue: order.clOrdID || order.client_order_id || order.id, description: 'Client order identifier (fallback from order object)' });
    if (order.order_id || order.id) fields.push({ tag: '37', name: 'OrderID', value: order.order_id || order.id, displayValue: order.order_id || order.id, description: 'Order ID (fallback)' });
    if (order.instrument || order.symbol) fields.push({ tag: '55', name: 'Symbol', value: order.instrument || order.symbol, displayValue: order.instrument || order.symbol, description: 'Instrument (fallback)' });
    if (order.side) {
      const sideVal = (order.side === 'BUY' || order.side === 'Buy') ? '1 (Buy)' : (order.side === 'SELL' || order.side === 'Sell') ? '2 (Sell)' : order.side;
      fields.push({ tag: '54', name: 'Side', value: order.side, displayValue: sideVal, description: 'Side (fallback)' });
    }
    if (order.qty || order.quantity) fields.push({ tag: '38', name: 'OrderQty', value: String(order.qty || order.quantity), displayValue: String(order.qty || order.quantity), description: 'Quantity (fallback)' });
    if (order.price) fields.push({ tag: '44', name: 'Price', value: String(order.price), displayValue: String(order.price), description: 'Price (fallback)' });
    if (order.status) fields.push({ tag: '39', name: 'OrdStatus', value: order.status, displayValue: order.status, description: 'Status (fallback)' });
    return fields;
  };
  const usedParsed = parsed.length > 0 ? parsed : fallbackParsedFromOrder();

  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(normalizeFixString(fixRaw || ''));
      // small visual feedback could be added
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2933' }}>FIX Message</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{orderSummary?.id || 'Order'} · {orderSummary?.instrument} · {orderSummary?.side} · {orderSummary?.qty}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView(view === 'parsed' ? 'raw' : 'parsed')} style={{ padding: '6px 12px', borderRadius: 4, background: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>{view === 'parsed' ? 'Raw' : 'Parsed'}</button>
            <button onClick={copyRaw} style={{ padding: '6px 12px', borderRadius: 4, background: '#1d4ed8', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Copy</button>
            <button onClick={onClose} style={{ padding: '6px 12px', borderRadius: 4, background: '#fff', border: '1px solid #d1d5db', color: '#374151', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>✕</button>
          </div>
        </div>

        {view === 'raw' ? (
          <div>
            {errorMsg && (
              <div style={{ padding: 10, background: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca', marginBottom: 12, fontSize: 12 }}>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: </span>
                <span style={{ color: '#6b7280' }}>{errorMsg}</span>
              </div>
            )}
            <div style={{ fontFamily: 'monospace', fontSize: 11, backgroundColor: '#f9fafb', padding: 14, borderRadius: 6, overflow: 'auto', whiteSpace: 'pre-wrap', border: '1px solid #e5e7eb', color: '#1f2933', lineHeight: 1.6, minHeight: 120 }}>
              {fixRaw || '(No raw FIX data available)'}
            </div>
          </div>
        ) : (
          <div>
            {errorMsg && (
              <div style={{ padding: 10, background: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca', marginBottom: 12, fontSize: 12 }}>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Note: </span>
                <span style={{ color: '#6b7280' }}>{errorMsg}</span>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '8px', width: 60, color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Tag</th>
                  <th style={{ padding: '8px', width: 140, color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Name</th>
                  <th style={{ padding: '8px', color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Value</th>
                  <th style={{ padding: '8px', width: 180, color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {usedParsed.map((f, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace', color: '#1d4ed8', fontSize: 11 }}>{f.tag}</td>
                    <td style={{ padding: '8px', color: '#1f2933', fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: '8px', color: '#374151', fontFamily: 'monospace', fontSize: 11 }}>{f.displayValue}</td>
                    <td style={{ padding: '8px', color: '#6b7280', fontSize: 11 }}>{f.description}</td>
                  </tr>
                ))}
                {usedParsed.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 12, color: '#9ca3af', textAlign: 'center' }}>No fields parsed</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FIXModal;

