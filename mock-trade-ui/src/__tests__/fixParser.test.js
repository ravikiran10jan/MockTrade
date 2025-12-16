// Simple Node-based tests for fixParser
import { parseFix } from '../utils/fixParser.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function run() {
  // Test 1: parse basic New Order Single (pipe delimited)
  const raw1 = '8=FIX.4.1|9=176|35=D|49=CLIENT1|56=BROKER1|34=2|52=20230101-12:00:00|11=ORD123|55=ES|54=1|38=100|40=2|44=4000.5|10=123|';
  const parsed1 = parseFix(raw1);
  assert(parsed1.find(f => f.tag === '35')?.value === 'D', 'MsgType should be D');
  const side = parsed1.find(f => f.tag === '54');
  assert(side?.displayValue.includes('Buy'), 'Side should decode to Buy');
  const price = parsed1.find(f => f.tag === '44');
  assert(price?.value === '4000.5', 'Price should be parsed');

  // Test 2: SOH delimited
  const SOH = String.fromCharCode(1);
  const raw2 = `8=FIX.4.1${SOH}35=8${SOH}37=ORD-EX1${SOH}39=2${SOH}14=100${SOH}`;
  const parsed2 = parseFix(raw2);
  assert(parsed2.find(f => f.tag === '35')?.value === '8', 'MsgType should be 8');
  assert(parsed2.find(f => f.tag === '37')?.value === 'ORD-EX1', 'OrderID parsed');
  assert(parsed2.find(f => f.tag === '39')?.displayValue.includes('Filled'), 'OrdStatus should decode to Filled');

  // Test 3: unknown tag handling
  const raw3 = '8=FIX.4.1|9999=FOO|11=ABC|';
  const parsed3 = parseFix(raw3);
  const unknown = parsed3.find(f => f.tag === '9999');
  assert(unknown, 'Unknown tag should still be present');

  console.log('All tests passed');
}

// If run directly with node, execute tests
(async () => {
  try {
    await run();
    // exit normally
  } catch (e) {
    console.error('Tests failed:', e.message);
    process.exit(1);
  }
})();
