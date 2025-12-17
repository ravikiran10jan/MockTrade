import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function currencyFmt(amount, currency = 'USD') {
  if (amount == null) return '-';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch (e) {
    return `${currency} ${amount}`;
  }
}

export default function AccountingModule() {
  const { getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('portfolio');

  // Portfolio Accounting state
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [positions, setPositions] = useState([]);
  const [pnlEntries, setPnlEntries] = useState([]);
  const [contingents, setContingents] = useState([]);

  // Trading Accounting state
  const [trades, setTrades] = useState([]);
  const [tradeFilters, setTradeFilters] = useState({ dateFrom: '', dateTo: '', desk: '', strategy: '', instrument: '' });
  const [selectedTrade, setSelectedTrade] = useState(null);

  useEffect(() => {
    // attempt to fetch from backend endpoints if implemented, otherwise load sample data
    (async () => {
      try {
        const [pfRes, trRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/accounting/portfolio-summary`, {
            headers: getAuthHeaders()
          }).catch(() => null),
          fetch(`${API_BASE}/api/v1/accounting/trades`, {
            headers: getAuthHeaders()
          }).catch(() => null)
        ]);

        if (pfRes && pfRes.ok) {
          const pf = await pfRes.json();
          setPortfolios(Array.isArray(pf) ? pf : []);
          if (pf && pf.length) setSelectedPortfolio(pf[0].portfolio);
        } else {
          setPortfolios(samplePortfolios());
          setSelectedPortfolio('PORT-001');
        }

        if (trRes && trRes.ok) {
          const tr = await trRes.json();
          setTrades(Array.isArray(tr) ? tr : []);
        } else {
          setTrades(sampleTrades());
        }

        // load details for selected portfolio
        setPositions(samplePositions());
        setPnlEntries(samplePnlEntries());
        setContingents(sampleContingents());
      } catch {
        // fallback to sample data
        setPortfolios(samplePortfolios());
        setSelectedPortfolio('PORT-001');
        setPositions(samplePositions());
        setPnlEntries(samplePnlEntries());
        setContingents(sampleContingents());
        setTrades(sampleTrades());
      }
    })();
  }, []);

  // Derived metrics for portfolio selected
  const portfolioPositions = positions.filter(p => p.portfolio === selectedPortfolio);
  const portfolioPnl = pnlEntriesForPortfolio(pnlEntries, selectedPortfolio);
  const portfolioContingent = contingents.filter(c => c.portfolio === selectedPortfolio);

  // Trading accounting derived
  const filteredTrades = trades.filter(t => {
    if (tradeFilters.desk && !t.desk.toLowerCase().includes(tradeFilters.desk.toLowerCase())) return false;
    if (tradeFilters.strategy && !t.strategy.toLowerCase().includes(tradeFilters.strategy.toLowerCase())) return false;
    if (tradeFilters.instrument && !t.instrument.toLowerCase().includes(tradeFilters.instrument.toLowerCase())) return false;
    if (tradeFilters.dateFrom && new Date(t.trade_date) < new Date(tradeFilters.dateFrom)) return false;
    if (tradeFilters.dateTo && new Date(t.trade_date) > new Date(tradeFilters.dateTo)) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: FONT_FAMILY }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1f2933' }}>Accounting</h2>
        <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#4b5563' }}>Portfolio & Trading Accounting (P&L / Positions / Contingent)</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setActiveTab('portfolio')} style={tabButtonStyle(activeTab === 'portfolio')}>Portfolio Accounting</button>
        <button onClick={() => setActiveTab('trading')} style={tabButtonStyle(activeTab === 'trading')}>Trading Accounting</button>
      </div>

      {activeTab === 'portfolio' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 240 }}>
              <label style={{ fontSize: 12, color: '#4b5563' }}>Portfolio</label>
              <select value={selectedPortfolio || ''} onChange={e => setSelectedPortfolio(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}>
                {portfolios.map(p => <option key={p.portfolio} value={p.portfolio}>{p.portfolio} — {p.owner}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Unrealized P&L</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{currencyFmt(sumUnrealized(portfolioPositions), 'USD')}</div>
              </div>
              <div style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Realized P&L</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{currencyFmt(sumRealized(portfolioPnl), 'USD')}</div>
              </div>
              <div style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Accrual P&L</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{currencyFmt(sumAccrual(portfolioPnl), 'USD')}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 13, marginBottom: 8 }}>Positions</h3>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={posTh()}>Instrument</th>
                      <th style={posTh()}>Qty</th>
                      <th style={posTh()}>Avg Cost</th>
                      <th style={posTh()}>MTM Price</th>
                      <th style={posTh()}>MTM Value</th>
                      <th style={posTh()}>Unrealized P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioPositions.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={posTd()}>{p.instrument}</td>
                        <td style={posTd()}>{p.quantity}</td>
                        <td style={posTd()}>{currencyFmt(p.avg_cost, p.currency)}</td>
                        <td style={posTd()}>{currencyFmt(p.mtm_price, p.currency)}</td>
                        <td style={posTd()}>{currencyFmt(p.mtm_value, p.currency)}</td>
                        <td style={posTd()}>{currencyFmt(p.unrealized_pnl, p.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 style={{ fontSize: 13, margin: '12px 0 8px 0' }}>P&L Entries</h3>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={posTh()}>Date</th>
                      <th style={posTh()}>Type</th>
                      <th style={posTh()}>Amount</th>
                      <th style={posTh()}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioPnl.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={posTd()}>{new Date(r.date).toLocaleDateString()}</td>
                        <td style={posTd()}>{r.type}</td>
                        <td style={posTd()}>{currencyFmt(r.amount, r.currency)}</td>
                        <td style={posTd()}>{r.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 13, marginBottom: 8 }}>Contingent Exposures</h3>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={posTh()}>Instrument</th>
                      <th style={posTh()}>Notional</th>
                      <th style={posTh()}>Direction</th>
                      <th style={posTh()}>Counterparty</th>
                      <th style={posTh()}>MTM (if available)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioContingent.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={posTd()}>{c.instrument}</td>
                        <td style={posTd()}>{currencyFmt(c.notional, c.currency)}</td>
                        <td style={posTd()}>{c.direction}</td>
                        <td style={posTd()}>{c.counterparty}</td>
                        <td style={posTd()}>{c.mtm ? currencyFmt(c.mtm, c.currency) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trading' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <input type="date" value={tradeFilters.dateFrom} onChange={e => setTradeFilters({ ...tradeFilters, dateFrom: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
            <input type="date" value={tradeFilters.dateTo} onChange={e => setTradeFilters({ ...tradeFilters, dateTo: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
            <input placeholder="Desk" value={tradeFilters.desk} onChange={e => setTradeFilters({ ...tradeFilters, desk: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
            <input placeholder="Strategy" value={tradeFilters.strategy} onChange={e => setTradeFilters({ ...tradeFilters, strategy: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
            <input placeholder="Instrument" value={tradeFilters.instrument} onChange={e => setTradeFilters({ ...tradeFilters, instrument: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }} />
            <button onClick={() => { /* noop - filters reactive */ }} style={{ padding: '8px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 4 }}>Filter</button>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={posTh()}>Trade ID</th>
                  <th style={posTh()}>Instrument</th>
                  <th style={posTh()}>Side</th>
                  <th style={posTh()}>Qty</th>
                  <th style={posTh()}>Price</th>
                  <th style={posTh()}>Trade Date</th>
                  <th style={posTh()}>Settle Date</th>
                  <th style={posTh()}>Desk</th>
                  <th style={posTh()}>Strategy</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onClick={() => setSelectedTrade(t)}>
                    <td style={posTd()}>{t.trade_id}</td>
                    <td style={posTd()}>{t.instrument}</td>
                    <td style={posTd()}>{t.side}</td>
                    <td style={posTd()}>{t.quantity}</td>
                    <td style={posTd()}>{currencyFmt(t.price, t.currency)}</td>
                    <td style={posTd()}>{new Date(t.trade_date).toLocaleDateString()}</td>
                    <td style={posTd()}>{t.settle_date ? new Date(t.settle_date).toLocaleDateString() : '-'}</td>
                    <td style={posTd()}>{t.desk}</td>
                    <td style={posTd()}>{t.strategy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedTrade && (
            <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Trade Details & Accounting</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Position Impact</div>
                  <div style={{ fontWeight: 700 }}>{selectedTrade.instrument} — {selectedTrade.quantity} @ {currencyFmt(selectedTrade.price, selectedTrade.currency)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Realized P&L</div>
                  <div style={{ fontWeight: 700 }}>{currencyFmt(selectedTrade.realized_pnl || 0, selectedTrade.currency)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Unrealized (MTM) P&L</div>
                  <div style={{ fontWeight: 700 }}>{currencyFmt(selectedTrade.unrealized_pnl || 0, selectedTrade.currency)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Accrual P&L</div>
                  <div style={{ fontWeight: 700 }}>{currencyFmt(selectedTrade.accrual_pnl || 0, selectedTrade.currency)}</div>
                </div>
              </div>

              <h5 style={{ marginTop: 12 }}>Contingent</h5>
              <div style={{ background: '#f9fafb', padding: 8, borderRadius: 4 }}>{selectedTrade.contingent ? JSON.stringify(selectedTrade.contingent) : 'None'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- small helpers and styles ----------
function tabButtonStyle(active) {
  return {
    padding: '8px 12px',
    background: active ? '#eef2ff' : '#f3f4f6',
    border: active ? '1px solid #c7d2fe' : '1px solid #e5e7eb',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 700
  };
}

function posTh() { return { padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#4b5563', fontWeight: 700 }; }
function posTd() { return { padding: '8px 12px', textAlign: 'left', fontSize: 13, color: '#1f2933' }; }

function sumUnrealized(positions) {
  return positions.reduce((s, p) => s + (p.unrealized_pnl || 0), 0);
}
function sumRealized(pnlEntries) {
  return pnlEntries.filter(r => r.type === 'REALIZED').reduce((s, r) => s + (r.amount || 0), 0);
}
function sumAccrual(pnlEntries) {
  return pnlEntries.filter(r => r.type === 'ACCRUAL').reduce((s, r) => s + (r.amount || 0), 0);
}
function pnlEntriesForPortfolio(all, portfolio) {
  return all.filter(r => r.portfolio === portfolio);
}

// ---------- sample/mock data ----------
function samplePortfolios() {
  return [
    { portfolio: 'PORT-001', owner: 'Equity Desk' },
    { portfolio: 'PORT-002', owner: 'Macro Desk' }
  ];
}

function samplePositions() {
  return [
    { portfolio: 'PORT-001', instrument: 'AAPL', quantity: 1200, avg_cost: 145.3, mtm_price: 150.5, mtm_value: 1200 * 150.5, unrealized_pnl: (150.5 - 145.3) * 1200, currency: 'USD' },
    { portfolio: 'PORT-001', instrument: 'GOOGL', quantity: 200, avg_cost: 2500, mtm_price: 2520, mtm_value: 200 * 2520, unrealized_pnl: (2520 - 2500) * 200, currency: 'USD' },
    { portfolio: 'PORT-002', instrument: 'US10Y', quantity: -100000, avg_cost: 100, mtm_price: 101.2, mtm_value: -100000 * 101.2, unrealized_pnl: (-100000 * (101.2 - 100)), currency: 'USD' }
  ];
}

function samplePnlEntries() {
  return [
    { portfolio: 'PORT-001', date: new Date().toISOString(), type: 'REALIZED', amount: 1250, currency: 'USD', desc: 'Realized PnL from trade TR-001' },
    { portfolio: 'PORT-001', date: new Date().toISOString(), type: 'ACCRUAL', amount: 32.5, currency: 'USD', desc: 'Accrued coupon' },
    { portfolio: 'PORT-002', date: new Date().toISOString(), type: 'REALIZED', amount: -500, currency: 'USD', desc: 'Realized loss' }
  ];
}

function sampleContingents() {
  return [
    { portfolio: 'PORT-001', instrument: 'AAPL_CALL_202603', notional: 100000, direction: 'LONG_OPTION', counterparty: 'CITI', mtm: 4200, currency: 'USD' },
    { portfolio: 'PORT-002', instrument: 'FXFWD_USDINR', notional: 200000, direction: 'SHORT', counterparty: 'BNY', mtm: null, currency: 'USD' }
  ];
}

function sampleTrades() {
  return [
    { trade_id: 'TR-001', instrument: 'AAPL', side: 'BUY', quantity: 1200, price: 145.3, trade_date: new Date().toISOString(), settle_date: null, desk: 'Equity', strategy: 'Core', currency: 'USD', realized_pnl: 1250, unrealized_pnl: 5400, accrual_pnl: 0, contingent: null },
    { trade_id: 'TR-002', instrument: 'AAPL_CALL_202603', side: 'SELL', quantity: 10, price: 10.5, trade_date: new Date().toISOString(), settle_date: null, desk: 'Deriv', strategy: 'Options', currency: 'USD', realized_pnl: 0, unrealized_pnl: 4200, accrual_pnl: 0, contingent: { type: 'OPTION_NOT_EXERCISED', notional: 100000 } }
  ];
}
