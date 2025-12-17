import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../core/auth';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function formatCurrency(amount, currency) {
  if (amount == null) return '-';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(amount);
  } catch {
    return `${currency || ''} ${amount}`;
  }
}

function statusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'future':
    case 'future payments':
      return '#3b82f6'; // blue
    case 'errors':
    case 'error':
      return '#ef4444'; // red
    case 'due':
    case 'due for release':
    case 'due_for_release':
      return '#f59e0b'; // amber
    case 'released':
    case 'complete':
      return '#10b981'; // green
    default:
      return '#6b7280';
  }
}

export default function SettlementMonitor() {
  const { getAuthHeaders } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', status: 'All', currency: '', counterparty: '' });
  const [selected, setSelected] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const categories = [
    { key: 'future', label: 'Future Payments' },
    { key: 'errors', label: 'Errors' },
    { key: 'due', label: 'Due for Release' },
    { key: 'released', label: 'Released' }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const qs = [];
      if (filters.status && filters.status !== 'All') qs.push(`status=${encodeURIComponent(filters.status)}`);
      if (filters.currency) qs.push(`currency=${encodeURIComponent(filters.currency)}`);
      if (filters.counterparty) qs.push(`counterparty=${encodeURIComponent(filters.counterparty)}`);
      if (filters.dateFrom) qs.push(`dateFrom=${encodeURIComponent(filters.dateFrom)}`);
      if (filters.dateTo) qs.push(`dateTo=${encodeURIComponent(filters.dateTo)}`);
      const url = `${API_BASE}/api/v1/settlements${qs.length ? `?${qs.join('&')}` : ''}`;

      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        // backend might not support it yet — fallback to empty
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('SettlementMonitor load error', err);
      // graceful fallback: mock local data so UI is usable even without backend
      setItems((prev) => prev.length ? prev : mockData());
      setMessage('Warning: Could not load settlement data from backend (using local sample).');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      // refresh every 2 minutes
      intervalRef.current = setInterval(() => loadData(), 120000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const summary = categories.map(cat => {
    const bucket = items.filter(i => mapStatus(i.status) === cat.key);
    const totalAmt = bucket.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    return { ...cat, count: bucket.length, totalAmt };
  });

  function mapStatus(raw) {
    if (!raw) return 'future';
    const r = String(raw).toLowerCase();
    if (r.includes('error')) return 'errors';
    if (r.includes('due') || r.includes('release')) return 'due';
    if (r.includes('released') || r.includes('complete')) return 'released';
    if (r.includes('future')) return 'future';
    return 'future';
  }

  function handleAction(action, item) {
    // optimistic UI change and backend call
    const id = item.payment_ref || item.id;
    if (!id) return;
    setMessage(`${action} in progress for ${id}...`);
    (async () => {
      try {
        const url = `${API_BASE}/api/v1/settlements/${encodeURIComponent(id)}/${action.toLowerCase()}`;
        const res = await fetch(url, { 
          method: 'POST', 
          headers: getAuthHeaders()
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        // refresh
        await loadData();
        setMessage(`${action} successful for ${id}`);
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Settlement action error', err);
        setMessage(`Error: ${action} failed for ${id}`);
        setTimeout(() => setMessage(''), 4000);
      }
    })();
  }

  const filtered = items.filter(i => {
    if (filters.status && filters.status !== 'All' && mapStatus(i.status) !== filters.status.toLowerCase()) return false;
    if (filters.currency && filters.currency !== '' && String(i.currency).toLowerCase() !== filters.currency.toLowerCase()) return false;
    if (filters.counterparty && !String(i.counterparty).toLowerCase().includes(filters.counterparty.toLowerCase())) return false;
    if (filters.dateFrom && new Date(i.value_date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(i.value_date) > new Date(filters.dateTo)) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: FONT_FAMILY }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1f2933' }}>Settlement Monitor</h2>
        <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#4b5563' }}>Track settlement payments: Future, Errors, Due, Released</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        {summary.map(s => (
          <div key={s.key} style={{ flex: 1, padding: 12, borderRadius: 6, backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ marginTop: 6, fontSize: 16, fontWeight: 700, color: statusColorLabel(s.key) }}>{s.count}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Amount</div>
                <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700 }}>{formatCurrency(s.totalAmt, 'USD')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#4b5563' }}>Date From</label>
          <input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} style={inputStyle()} />
          <label style={{ fontSize: 12, color: '#4b5563' }}>To</label>
          <input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} style={inputStyle()} />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#4b5563' }}>Status</label>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={inputStyle()}>
            <option>All</option>
            <option value="future">Future Payments</option>
            <option value="errors">Errors</option>
            <option value="due">Due for Release</option>
            <option value="released">Released</option>
          </select>

          <label style={{ fontSize: 12, color: '#4b5563' }}>Currency</label>
          <input placeholder="USD" value={filters.currency} onChange={e => setFilters({ ...filters, currency: e.target.value })} style={inputStyle()} />

          <label style={{ fontSize: 12, color: '#4b5563' }}>Counterparty</label>
          <input placeholder="Search..." value={filters.counterparty} onChange={e => setFilters({ ...filters, counterparty: e.target.value })} style={inputStyle()} />

          <button onClick={loadData} style={buttonPrimaryStyle()}>Refresh</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} /> Auto-refresh
          </label>
        </div>
      </div>

      {message && (
        <div style={{ padding: 8, backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#92400e', borderRadius: 6, marginBottom: 12 }}>{message}</div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={thStyle()}>Payment Ref</th>
              <th style={thStyle()}>Trade ID</th>
              <th style={thStyle()}>Counterparty</th>
              <th style={thStyle()}>Currency</th>
              <th style={thStyle()}>Amount</th>
              <th style={thStyle()}>Value Date</th>
              <th style={thStyle()}>Status</th>
              <th style={thStyle()}>Assigned To</th>
              <th style={{ ...thStyle(), textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No settlement items</td></tr>
            ) : (
              filtered.map((row, idx) => (
                <tr key={row.payment_ref || row.id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fbfafa', cursor: 'pointer' }} onClick={() => setSelected(row)}>
                  <td style={tdStyle()}>{row.payment_ref || row.id}</td>
                  <td style={tdStyle()}>{row.trade_id || '-'}</td>
                  <td style={tdStyle()}>{row.counterparty || row.beneficiary || '-'}</td>
                  <td style={tdStyle()}>{row.currency || '-'}</td>
                  <td style={tdStyle()}>{formatCurrency(Number(row.amount) || 0, row.currency)}</td>
                  <td style={tdStyle()}>{row.value_date ? new Date(row.value_date).toLocaleDateString() : '-'}</td>
                  <td style={tdStyle()}>
                    <span style={{ padding: '4px 8px', borderRadius: 4, backgroundColor: statusColor(row.status), color: '#fff', fontWeight: 700, fontSize: 11 }}>{row.status}</span>
                    {isOverdue(row.value_date) && <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 700 }}>⚠</span>}
                  </td>
                  <td style={tdStyle()}>{row.assigned_to || '-'}</td>
                  <td style={{ ...tdStyle(), textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      {mapStatus(row.status) === 'errors' && <button onClick={() => handleAction('retry', row)} style={smallButtonStyle()}>Retry</button>}
                      {mapStatus(row.status) === 'due' && <button onClick={() => handleAction('release', row)} style={smallButtonPrimaryStyle()}>Release</button>}
                      <button onClick={() => handleAction('hold', row)} style={smallButtonStyle()}>Hold</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drill-down panel/modal */}
      {selected && (
        <div style={modalBackdrop()} onClick={() => setSelected(null)}>
          <div style={modalContent()} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px 0' }}>Payment Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><strong>Payment Ref</strong><div>{selected.payment_ref || selected.id}</div></div>
              <div><strong>Trade ID</strong><div>{selected.trade_id}</div></div>
              <div><strong>Counterparty</strong><div>{selected.counterparty || selected.beneficiary}</div></div>
              <div><strong>Currency / Amount</strong><div>{formatCurrency(Number(selected.amount) || 0, selected.currency)}</div></div>
              <div><strong>Value Date</strong><div>{selected.value_date ? new Date(selected.value_date).toLocaleString() : '-'}</div></div>
              <div><strong>Status</strong><div>{selected.status}</div></div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Reason / Notes</strong><div>{selected.reason || selected.notes || '-'}</div></div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {mapStatus(selected.status) === 'errors' && <button onClick={() => handleAction('retry', selected)} style={buttonPrimaryStyle()}>Retry Error</button>}
              {mapStatus(selected.status) === 'due' && <button onClick={() => handleAction('release', selected)} style={buttonPrimaryStyle()}>Release Payment</button>}
              <button onClick={() => handleAction('hold', selected)} style={buttonStyle()}>Hold for Review</button>
              <button onClick={() => setSelected(null)} style={buttonSecondaryStyle()}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>Last refresh: {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : '-'}</div>
    </div>
  );
}

// Helper small styles and mock data
const thStyle = () => ({ padding: '8px 12px', textAlign: 'left', color: '#4b5563', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' });
const tdStyle = () => ({ padding: '10px 12px', color: '#374151', fontSize: 13 });
const inputStyle = () => ({ padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 12 });
const buttonPrimaryStyle = () => ({ padding: '8px 10px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700 });
const buttonSecondaryStyle = () => ({ padding: '8px 10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer' });
const buttonStyle = () => ({ padding: '8px 10px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer' });
const smallButtonStyle = () => ({ padding: '6px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontWeight: 600 });
const smallButtonPrimaryStyle = () => ({ padding: '6px 8px', backgroundColor: '#f59e0b', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#fff', fontWeight: 700 });

function modalBackdrop() { return { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }; }
function modalContent() { return { width: '720px', maxHeight: '80vh', overflowY: 'auto', background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.12)' }; }

function statusColorLabel(key) {
  switch (key) {
    case 'future': return '#1e40af';
    case 'errors': return '#b91c1c';
    case 'due': return '#b45309';
    case 'released': return '#065f46';
    default: return '#374151';
  }
}

function isOverdue(valueDate) {
  if (!valueDate) return false;
  const now = new Date();
  const v = new Date(valueDate);
  return v < now;
}

function mockData() {
  return [
    { payment_ref: 'PMT-20251215-001', trade_id: 'TR-20251213-001', counterparty: 'JPM', currency: 'USD', amount: 125000.50, value_date: new Date(Date.now() + 86400000).toISOString(), status: 'Future Payments', assigned_to: 'Alice', reason: '' },
    { payment_ref: 'PMT-20251213-002', trade_id: 'TR-20251210-002', counterparty: 'GS', currency: 'USD', amount: 50000, value_date: new Date(Date.now() - 86400000*2).toISOString(), status: 'Errors', assigned_to: 'Bob', reason: 'Insufficient balance' },
    { payment_ref: 'PMT-20251214-003', trade_id: 'TR-20251213-003', counterparty: 'CITI', currency: 'EUR', amount: 75000, value_date: new Date().toISOString(), status: 'Due for Release', assigned_to: 'Charlie', reason: '' },
    { payment_ref: 'PMT-20251212-004', trade_id: 'TR-20251211-004', counterparty: 'BNY', currency: 'GBP', amount: 30000, value_date: new Date(Date.now() - 86400000*5).toISOString(), status: 'Released', assigned_to: 'Ops', reason: '' },
  ];
}
