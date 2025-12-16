import React, { useState } from 'react';
import FIXModal from './FIXModal';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function ViewFIXButton({ order }) {
  const [open, setOpen] = useState(false);
  const [fixRaw, setFixRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchFix = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    // Generate FIX message from order object directly
    try {
      const fixMsg = generateFixMessage(order);
      setFixRaw(fixMsg);
      setErrorMsg(null);
      setOpen(true);
    } catch (e) {
      console.error('Failed to generate FIX', e);
      setErrorMsg('Unable to generate FIX message');
      setFixRaw('');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Generate FIX 4.2 message from order
  const generateFixMessage = (order) => {
    const SOH = '|'; // Use pipe for display
    const fields = [];
    
    // Standard FIX header
    fields.push('8=FIX.4.2'); // BeginString
    fields.push('35=D'); // MsgType (D = New Order Single)
    fields.push('49=MOCKTRADE'); // SenderCompID
    fields.push('56=BROKER'); // TargetCompID
    fields.push(`34=${Math.floor(Math.random() * 10000)}`); // MsgSeqNum
    fields.push(`52=${new Date().toISOString().replace(/[-:]/g, '').substring(0, 17)}`);
    
    // Order fields
    fields.push(`11=${order.id || order.order_id || 'N/A'}`); // ClOrdID
    fields.push(`55=${order.instrument || order.symbol || 'N/A'}`); // Symbol
    fields.push(`54=${order.side === 'BUY' ? '1' : '2'}`); // Side (1=Buy, 2=Sell)
    fields.push(`38=${order.qty || 0}`); // OrderQty
    fields.push(`40=${order.type === 'LIMIT' ? '2' : '1'}`); // OrdType (1=Market, 2=Limit)
    
    if (order.price) {
      fields.push(`44=${order.price}`); // Price
    }
    
    fields.push(`59=${order.tif === 'DAY' ? '0' : order.tif === 'GTC' ? '1' : '0'}`); // TimeInForce
    
    if (order.account) {
      fields.push(`1=${order.account}`); // Account
    }
    
    // Checksum (simplified - just use field count)
    fields.push(`10=${String(fields.length).padStart(3, '0')}`);
    
    return fields.join(SOH) + SOH;
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); fetchFix(); }}
        style={{ padding: '5px 10px', fontSize: 11, borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#1d4ed8', fontWeight: 500, transition: 'all 0.15s' }}
        disabled={loading}
        onMouseEnter={(e) => !loading && (e.target.style.background = '#f0f9ff')}
        onMouseLeave={(e) => !loading && (e.target.style.background = '#fff')}
      >
        {loading ? 'Loading...' : 'View FIX'}
      </button>
      <FIXModal open={open} onClose={() => setOpen(false)} fixRaw={fixRaw} errorMsg={errorMsg} orderSummary={{ id: order.id, instrument: order.instrument, side: order.side, qty: order.qty }} order={order} />
    </>
  );
}

export default ViewFIXButton;

