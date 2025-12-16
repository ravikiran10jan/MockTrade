// Lightweight FIX 4.1/4.2 parser and dictionary

// Dictionary: tag -> { name, description, enums? }
const FIX_DICT = {
  // Header
  8: { name: 'BeginString', description: 'Identifies the beginning of a FIX message and the version.' },
  9: { name: 'BodyLength', description: 'Length of the message body.' },
  35: { name: 'MsgType', description: 'Message type (e.g., D = New Order - Single, 8 = Execution Report).',
    enums: { D: 'New Order - Single', '8': 'Execution Report' } },
  49: { name: 'SenderCompID', description: 'ID of message sender.' },
  56: { name: 'TargetCompID', description: 'ID of message target.' },
  34: { name: 'MsgSeqNum', description: 'Message sequence number.' },
  52: { name: 'SendingTime', description: 'Time of message transmission.' },

  // Order identifiers
  11: { name: 'ClOrdID', description: 'Client order identifier as assigned by the institution.' },
  37: { name: 'OrderID', description: 'OrderID assigned by broker/exchange.' },

  // Instrument
  55: { name: 'Symbol', description: 'Instrument symbol.' },

  // Side / qty / price
  54: { name: 'Side', description: 'Side of order (Buy/Sell).', enums: { '1': 'Buy', '2': 'Sell', '5': 'Sell short' } },
  38: { name: 'OrderQty', description: 'Quantity ordered.' },
  40: { name: 'OrdType', description: 'Order Type (Market/Limit).', enums: { '1': 'Market', '2': 'Limit', '3': 'Stop' } },
  44: { name: 'Price', description: 'Price for limit orders.' },
  151: { name: 'LeavesQty', description: 'Quantity open for further execution.' },
  14: { name: 'CumQty', description: 'Quantity already filled.' },

  // Status / result
  39: { name: 'OrdStatus', description: 'Order status.', enums: { '0': 'New', '1': 'Partially filled', '2': 'Filled', '4': 'Canceled', '8': 'Rejected' } },
  150: { name: 'ExecType', description: 'Execution type.', enums: { '0': 'New', '1': 'Partial fill', '2': 'Fill', '4': 'Canceled', '8': 'Rejected' } },
  58: { name: 'Text', description: 'Free text field, often used for human-readable messages.' },

  // Timestamps
  60: { name: 'TransactTime', description: 'Time of execution/transaction.' }
};

function normalizeFixString(raw) {
  if (!raw) return '';
  return String(raw);
}

function splitFields(raw) {
  const s = normalizeFixString(raw);
  // Replace SOH (ASCII 1) with pipe and split on pipe to avoid control-regex issues
  const soh = String.fromCharCode(1);
  const withPipes = s.split(soh).join('|');
  const parts = withPipes.split('|').filter(Boolean);
  return parts;
}

function parseFix(raw) {
  const parts = splitFields(raw);
  const fields = [];
  for (const p of parts) {
    const eq = p.indexOf('=');
    if (eq === -1) continue; // malformed, skip
    const tag = p.substring(0, eq);
    const value = p.substring(eq + 1);
    const meta = FIX_DICT[tag] || null;
    const name = meta ? meta.name : `Tag ${tag}`;
    const description = meta ? meta.description : '';
    let displayValue = value;
    // decode enums where available
    if (meta && meta.enums && Object.prototype.hasOwnProperty.call(meta.enums, value)) {
      displayValue = `${value} (${meta.enums[value]})`;
    }
    fields.push({ tag, name, value, displayValue, description });
  }
  return fields;
}

// Export for use in UI
export { parseFix, splitFields, normalizeFixString, FIX_DICT };
