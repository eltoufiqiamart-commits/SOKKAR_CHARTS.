/* SOKKAR — Life Systems experiences (20).
   All business rules, prices and limits are illustrative and configurable.
   These are educational simulations inspired by familiar workflows —
   they are NOT real banking, payment or transport integrations. */
import { formulaExperience, fmt, money } from './shared';
import { customExperience } from './shared';
import type { Experience } from '../types';

const ILLEGAL_NOTE = 'Illustrative simulation — prices and business rules are configurable examples, not real market rates.';

export const lifeExperiences: Experience[] = [
  formulaExperience({
    slug: 'banking-account',
    title: 'Banking Account System',
    category: 'life-systems', difficulty: 'Beginner', duration: 12, featured: true,
    description: 'Check balances, deposit and withdraw — and see why banks validate every transaction.',
    keywords: ['bank', 'account', 'deposit', 'withdraw', 'balance', 'transaction', 'money'],
    concept: [
      'Every banking app you have ever used is built on a handful of rules: never let the balance go below the allowed minimum, never accept a transaction you cannot honour, and record every movement.',
      'This simulation models a single current account. Deposits raise the balance; withdrawals lower it after a sufficiency check; invalid amounts are rejected before anything changes.',
    ],
    formula: 'new_balance = balance + deposit,  or  balance − withdrawal (if ≥ 0)',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'balance', meaning: 'Current account balance', unit: '$' },
      { symbol: 'amount', meaning: 'Amount in the transaction', unit: '$' },
      { symbol: 'op', meaning: 'Operation: check, deposit or withdraw', unit: '—' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Single-account, single-currency model.', 'Withdrawals that would make the balance negative are rejected.'],
    inputDefs: [
      { id: 'balance', label: 'Current balance', unit: '$', type: 'number', default: '1250' },
      { id: 'op', label: 'Operation', type: 'select', default: 'withdraw', options: [
        { value: 'check', label: 'Check balance' }, { value: 'deposit', label: 'Deposit' }, { value: 'withdraw', label: 'Withdraw' }] },
      { id: 'amount', label: 'Amount', unit: '$', type: 'number', default: '200' },
    ],
    inputLabel: 'Read balance, operation, amount', validateLabel: 'amount valid & funds sufficient?', computeLabel: 'Apply the transaction', outputLabel: 'Display result',
    validate: (v, raw) => {
      if (raw.op === 'check') return v.balance >= 0 ? null : 'Balance cannot be negative.';
      if (!(v.amount > 0)) return 'Amount must be greater than zero.';
      if (raw.op === 'withdraw' && v.amount > v.balance) return `Insufficient funds: trying to withdraw ${money(v.amount)} with ${money(v.balance)} available.`;
      return v.balance >= 0 ? null : 'Balance cannot be negative.';
    },
    solve: (v, raw) => {
      if (raw.op === 'check') return { steps: [{ text: `Balance inquiry → ${money(v.balance)}`, vars: { balance: money(v.balance) } }], output: `Available balance: ${money(v.balance)}`, value: v.balance };
      if (raw.op === 'deposit') {
        const nb = v.balance + v.amount;
        return { steps: [{ text: `new = ${money(v.balance)} + ${money(v.amount)} = ${money(nb)}` }], output: `Deposited ${money(v.amount)}. New balance: ${money(nb)}`, value: nb };
      }
      const nb = v.balance - v.amount;
      return { steps: [{ text: `funds check: ${money(v.amount)} ≤ ${money(v.balance)} → approved` }, { text: `new = ${money(v.balance)} − ${money(v.amount)} = ${money(nb)}`, vars: { balance: money(nb) } }], output: `Withdrew ${money(v.amount)}. New balance: ${money(nb)}`, value: nb };
    },
    workedExample: {
      title: 'Withdraw $200 from $1,250',
      steps: ['Validate: 200 > 0 ✓, 200 ≤ 1250 ✓', 'new balance = 1250 − 200 = 1050'],
      result: 'New balance $1,050.00',
    },
    challenge: { mode: 'choice', question: 'What happens when you try to withdraw more than the balance?', options: ['The balance goes negative', 'The transaction is rejected', 'The account closes', 'The bank lends the difference automatically'], answer: 'The transaction is rejected', explanation: 'The sufficiency check runs before the balance is ever modified — the account never goes negative.' },
    related: ['atm-withdrawal', 'digital-wallet', 'inventory-management'],
  }),

  formulaExperience({
    slug: 'atm-withdrawal',
    title: 'ATM Withdrawal System',
    category: 'life-systems', difficulty: 'Beginner', duration: 14,
    description: 'PIN check, limits, balance check and greedy cash dispensing — an ATM in ten steps.',
    keywords: ['atm', 'cash', 'withdraw', 'pin', 'dispenser', 'bank'],
    concept: [
      'An ATM is a guarded loop: it authenticates you, asks what you want, verifies the request against rules (daily limit, dispenser availability, balance) and only then moves money.',
      'Cash dispensing uses a greedy strategy — biggest notes first — which uses the fewest notes possible for this denomination set. Try $280: two hundreds, three fifties? No — greedy gives 100+100+50+20+10 = five notes.',
    ],
    formula: 'dispense = greedy(amount, notes = 100, 50, 20, 10)',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'pin', meaning: '4-digit PIN entered by the user', unit: '—' },
      { symbol: 'amount', meaning: 'Requested withdrawal (multiple of 10)', unit: '$' },
      { symbol: 'balance', meaning: 'Available account balance', unit: '$' },
      { symbol: 'limit', meaning: 'Daily cash limit', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Demo PIN is 2580 — a real ATM never stores it in plain text.', 'Withdrawal must be a multiple of $10, at most $1,900 per day.', 'Denominations: $100, $50, $20, $10 (greedy algorithm).'],
    inputDefs: [
      { id: 'pin', label: 'PIN (demo: 2580)', type: 'text', default: '2580', placeholder: '2580' },
      { id: 'amount', label: 'Amount', unit: '$', type: 'number', default: '280' },
      { id: 'balance', label: 'Available balance', unit: '$', type: 'number', default: '1500' },
    ],
    inputLabel: 'Read PIN, amount, balance', validateLabel: 'PIN correct, limit & funds OK?', computeLabel: 'Greedy cash dispensing', outputLabel: 'Dispense cash',
    validate: (v, raw) => {
      const pin = (raw.pin ?? '').trim();
      if (pin !== '2580') return 'Incorrect PIN. Attempt logged. (Demo PIN: 2580)';
      if (!(v.amount > 0)) return 'Amount must be greater than zero.';
      if (v.amount % 10 !== 0) return 'Amount must be a multiple of $10.';
      if (v.amount > 1900) return 'Exceeds the daily limit of $1,900.';
      if (v.amount > v.balance) return `Insufficient funds: ${money(v.amount)} requested, ${money(v.balance)} available.`;
      return null;
    },
    solve: (v) => {
      let remaining = v.amount;
      const notes: [number, number][] = [[100, 0], [50, 0], [20, 0], [10, 0]];
      const t: { text: string }[] = [];
      for (const [note] of notes) {
        const count = Math.floor(remaining / note);
        if (count > 0) { notes.find(n => n[0] === note)![1] = count; t.push({ text: `Dispense ${count} × $${note}` }); remaining -= count * note; }
      }
      const totalNotes = notes.reduce((a, n) => a + n[1], 0);
      const nb = v.balance - v.amount;
      t.push({ text: `New balance: ${money(nb)}` });
      return { steps: t, output: `Dispensed ${totalNotes} notes: ${notes.filter(n => n[1] > 0).map(n => `${n[1]}×$${n[0]}`).join(', ')}. New balance: ${money(nb)}`, value: nb };
    },
    workedExample: {
      title: 'Withdraw $280 at the ATM',
      steps: ['PIN 2580 ✓', 'Multiple of 10 ✓, ≤ 1900 ✓, funds OK ✓', 'Greedy: 2×$100 → 80 left; 1×$50 → 30 left; 1×$20 → 10 left; 1×$10 → 0', '5 notes total'],
      result: '2×$100, 1×$50, 1×$20, 1×$10',
    },
    challenge: { mode: 'choice', question: 'Why must the withdrawal be a multiple of $10 with this denomination set?', options: ['Banks like round numbers', 'The smallest note is $10, and greedy can build any multiple of 10 from $10+ notes', 'The ATM cannot count smaller notes', 'It is a legal requirement'], answer: 'The smallest note is $10, and greedy can build any multiple of 10 from $10+ notes', explanation: 'With $10 as the smallest denomination, any amount that is not a multiple of 10 simply cannot be assembled.' },
    related: ['banking-account', 'digital-wallet', 'online-order-processing'],
  }),

  formulaExperience({
    slug: 'e-commerce-shopping',
    title: 'E-Commerce Shopping System',
    category: 'life-systems', difficulty: 'Beginner', duration: 15, featured: true,
    description: 'Cart totals, discount codes and shipping — the checkout math every shop runs.',
    keywords: ['shop', 'cart', 'checkout', 'discount', 'coupon', 'shipping', 'ecommerce'],
    concept: [
      'A checkout is a pipeline: total the cart, subtract qualified discounts, add tax and shipping, and never charge more than the customer agreed to.',
      'Order of operations matters. SOKKAR applies the discount to the items subtotal, then adds shipping if the discounted subtotal is below the free-shipping threshold.',
    ],
    formula: 'total = (subtotal − discount) + shipping,  shipping = (discounted ≥ $50) ? $0 : $4.99',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'subtotal', meaning: 'Sum of item prices × quantities', unit: '$' },
      { symbol: 'code', meaning: 'Optional discount code', unit: '—' },
      { symbol: 'shipping', meaning: '$0 above $50 discounted, otherwise $4.99', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Codes (demo): WELCOME10 → 10%, STUDENT15 → 15%, SOKKAR20 → 20%.', 'Discount applies to items only, not shipping.', 'Free shipping when the discounted subtotal is ≥ $50.'],
    inputDefs: [
      { id: 'subtotal', label: 'Cart subtotal', unit: '$', type: 'number', default: '84.50' },
      { id: 'code', label: 'Discount code (optional)', type: 'text', default: 'WELCOME10', placeholder: 'WELCOME10' },
    ],
    inputLabel: 'Read subtotal, code', validateLabel: 'subtotal ≥ 0 & code known?', computeLabel: 'Apply discount + shipping', outputLabel: 'Display total',
    validate: (v, raw) => {
      if (!(v.subtotal >= 0)) return 'Subtotal cannot be negative.';
      const code = (raw.code ?? '').trim().toUpperCase();
      if (code && !['WELCOME10', 'STUDENT15', 'SOKKAR20'].includes(code)) return `Unknown code “${code}”. Try WELCOME10, STUDENT15 or SOKKAR20.`;
      return null;
    },
    solve: (v, raw) => {
      const code = (raw.code ?? '').trim().toUpperCase();
      const rates: Record<string, number> = { WELCOME10: 0.10, STUDENT15: 0.15, SOKKAR20: 0.20 };
      const rate = code ? rates[code] : 0;
      const discount = v.subtotal * rate;
      const after = v.subtotal - discount;
      const shipping = after >= 50 ? 0 : 4.99;
      const total = after + shipping;
      const t: { text: string }[] = [];
      if (rate > 0) t.push({ text: `Discount ${code}: ${rate * 100}% → −${money(discount)}` });
      else t.push({ text: 'No discount code applied' });
      t.push({ text: `Discounted subtotal: ${money(after)}` });
      t.push({ text: shipping === 0 ? 'Free shipping (≥ $50)' : 'Shipping: $4.99 (below $50 threshold)' });
      return { steps: t, output: `Total = ${money(total)} (${rate > 0 ? `saved ${money(discount)}` : 'no discount'}, shipping ${shipping === 0 ? 'free' : '$4.99'})`, value: total };
    },
    workedExample: {
      title: '$84.50 cart with WELCOME10',
      steps: ['Discount: 84.50 × 10% = $8.45 off', 'Discounted: $76.05 (≥ $50 → free shipping)', 'Total: $76.05'],
      result: 'Total $76.05 — you saved $8.45',
    },
    challenge: { mode: 'numeric', question: 'Cart of $40.00, code SOKKAR20. What is the total (free shipping impossible)? Use $4.99 shipping.', answer: '36.99', unit: '$', tolerance: 0.01, explanation: 'Discount = 20% of 40 = $8 → $32. Below $50 so shipping $4.99 → $36.99.' },
    related: ['online-order-processing', 'digital-wallet', 'percentage-calculator'],
  }),

  customExperience({
    slug: 'online-order-processing',
    title: 'Online Order Processing',
    category: 'life-systems', difficulty: 'Intermediate', duration: 18, featured: true,
    description: 'Follow an order through payment, inventory, picking, packing and delivery — with failure paths.',
    keywords: ['order', 'checkout', 'fulfillment', 'delivery', 'shipping', 'payment', 'pipeline'],
    concept: [
      'When you tap “Place order”, the platform runs a pipeline: take the payment, reserve stock, allocate a courier, move the parcel through stages. Each stage can fail, and every failure needs a designed path — refund, restock, cancel — never dead air.',
      'Reliable systems make failure a first-class path. This simulation lets you toggle the two realistic failure points: payment declined, and item out of stock.',
    ],
    formula: 'order → pay → stock → confirm → pack → ship → deliver',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'payment', meaning: 'card (pre-paid) or cash-on-delivery', unit: '—' },
      { symbol: 'result', meaning: 'Simulated gateway response', unit: '—' },
      { symbol: 'stock', meaning: 'Warehouse availability check', unit: '—' },
    ],
    assumptions: [ILLEGAL_NOTE, 'COD orders skip the payment gate and are verified on delivery.', 'On payment failure the order is cancelled immediately.', 'On stock-out the authorized payment is auto-refunded.'],
    inputDefs: [
      { id: 'method', label: 'Payment method', type: 'select', default: 'card', options: [
        { value: 'card', label: 'Card (pay now)' }, { value: 'cod', label: 'Cash on delivery' }] },
      { id: 'payResult', label: 'Card gateway result', type: 'select', default: 'success', options: [
        { value: 'success', label: 'Approved' }, { value: 'failed', label: 'Declined' }] },
      { id: 'stock', label: 'Warehouse availability', type: 'select', default: 'in_stock', options: [
        { value: 'in_stock', label: 'In stock' }, { value: 'out_of_stock', label: 'Out of stock' }] },
    ],
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Customer taps “Place order”.' },
      { id: 'input', type: 'input', label: 'Read method, gateway, stock', detail: 'Order details and simulated external responses.' },
      { id: 'validate', type: 'decision', label: 'input selections made?', detail: 'All three selections are always present — the gate validates them.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Missing selection.' },
      { id: 'received', type: 'process', label: 'Order received & logged', detail: 'The order is persisted with a unique reference before any external call.' },
      { id: 'paid', type: 'decision', label: 'Payment OK?', detail: 'Card payments are verified against the (simulated) gateway. COD passes automatically.' },
      { id: 'cancelled', type: 'output', label: 'Order cancelled — payment failed', detail: 'The customer is notified and no stock is reserved.' },
      { id: 'inStock', type: 'decision', label: 'Items in stock?', detail: 'The warehouse is queried for every line item.' },
      { id: 'refunded', type: 'output', label: 'Refunded & cancelled', detail: 'Payment is released back; the customer is notified to choose alternatives.' },
      { id: 'confirmed', type: 'process', label: 'Confirmed — pick & pack', detail: 'Stock is reserved, the picker is assigned and the parcel is packed.' },
      { id: 'shipped', type: 'process', label: 'Shipped — out for delivery', detail: 'A courier is allocated; tracking becomes live.' },
      { id: 'delivered', type: 'output', label: 'Delivered', detail: 'POD captured; the order closes.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Order closed.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'received', label: 'Yes' }, { from: 'received', to: 'paid' },
      { from: 'paid', to: 'cancelled', label: 'No' }, { from: 'cancelled', to: 'end' },
      { from: 'paid', to: 'inStock', label: 'Yes' },
      { from: 'inStock', to: 'refunded', label: 'No' }, { from: 'refunded', to: 'end' },
      { from: 'inStock', to: 'confirmed', label: 'Yes' },
      { from: 'confirmed', to: 'shipped' }, { from: 'shipped', to: 'delivered' }, { from: 'delivered', to: 'end' },
    ],
    validateLabel: 'all selections valid?',
    validate: raw => (['card', 'cod'].includes(raw.method) && ['success', 'failed'].includes(raw.payResult) && ['in_stock', 'out_of_stock'].includes(raw.stock) ? null : 'Select one option in each field.'),
    solve: (raw) => {
      const t: { nodeId: string; text: string; tone?: 'info' | 'ok' | 'err' | 'decision' | 'output'; decision?: { question: string; result: string } }[] = [];
      t.push({ nodeId: 'received', text: 'Order received and logged with reference ORD-2481', tone: 'info' });
      const paymentOk = raw.method === 'cod' || raw.payResult === 'success';
      t.push({ nodeId: 'paid', text: raw.method === 'cod' ? 'COD → payment gate skipped (collect on delivery)' : `Gateway says: ${raw.payResult === 'success' ? 'approved' : 'declined'}`, tone: 'decision', decision: { question: 'Payment OK?', result: paymentOk ? 'Yes' : 'No' } });
      if (!paymentOk) {
        t.push({ nodeId: 'cancelled', text: 'Order cancelled — the bank declined the card. No charge made.', tone: 'err' });
        return { steps: t, output: 'Order cancelled at the payment stage.', value: 0 };
      }
      const stockOk = raw.stock === 'in_stock';
      t.push({ nodeId: 'inStock', text: stockOk ? 'All line items available in warehouse WH-1' : 'One or more items unavailable', tone: 'decision', decision: { question: 'Items in stock?', result: stockOk ? 'Yes' : 'No' } });
      if (!stockOk) {
        t.push({ nodeId: 'refunded', text: 'Payment authorized earlier is now refunded in full (1–3 days).', tone: 'err' });
        return { steps: t, output: 'Order cancelled — out of stock. Payment refunded.', value: 0 };
      }
      t.push({ nodeId: 'confirmed', text: 'Stock reserved, picker assigned, parcel packed', tone: 'info' });
      t.push({ nodeId: 'shipped', text: 'Courier allocated — parcel out for delivery', tone: 'info' });
      t.push({ nodeId: 'delivered', text: 'Delivered and proof captured. Order closed.', tone: 'output' });
      return { steps: t, output: 'Order delivered. ORD-2481 closed successfully.', value: 1 };
    },
    algorithm: ['Start.', 'Read payment method, gateway result and warehouse stock.', 'Log the order with a reference.', 'If card payment fails → cancel the order.', 'If any item is out of stock → refund and cancel.', 'Otherwise confirm: pick, pack, ship, deliver.', 'End.'],
    workedExample: {
      title: 'Card approved, but the last item is out of stock',
      steps: ['Order received → payment approved', 'Stock check fails', 'System auto-refunds the authorization and cancels', 'Customer gets an email with alternatives'],
      result: 'Refunded & cancelled — no phantom charge',
    },
    challenge: { mode: 'choice', question: 'In this pipeline, what happens if payment fails?', options: ['The warehouse ships anyway and bills later', 'The order is cancelled before stock is touched', 'The system retries forever', 'The order ships COD automatically'], answer: 'The order is cancelled before stock is touched', explanation: 'The payment gate runs before any warehouse work — a failed payment ends the pipeline.' },
    related: ['e-commerce-shopping', 'package-tracking', 'food-delivery'],
  }),

  formulaExperience({
    slug: 'ride-booking',
    title: 'Ride Booking System',
    category: 'life-systems', difficulty: 'Beginner', duration: 14,
    description: 'Fare estimation and driver assignment — how ride apps price your trip.',
    keywords: ['ride', 'taxi', 'uber', 'fare', 'distance', 'booking', 'driver'],
    concept: [
      'A ride fare is transparent arithmetic: a booking fee, a per-kilometre rate for the chosen class, sometimes a per-minute rate. No magic — the same numbers the backend uses are shown to you up front.',
      'Driver assignment is a nearest-driver search: the system ranks available drivers by ETA and offers the trip, escalating outward until someone accepts.',
    ],
    formula: 'fare = booking_fee + base_fare + (price_per_km × distance)',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'distance', meaning: 'Estimated trip distance', unit: 'km' },
      { symbol: 'class', meaning: 'standard | comfort | xl', unit: '—' },
      { symbol: 'fare', meaning: 'Estimated total fare', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'standard: $2.50 + $3.20/km. comfort: $4.00 + $4.50/km. xl: $6.00 + $6.00/km. Booking fee $1.50.', 'Estimate only — final fare varies with route, waiting and surge.'],
    inputDefs: [
      { id: 'pickup', label: 'Pickup location', type: 'text', default: 'Central Station', placeholder: 'e.g. Central Station' },
      { id: 'destination', label: 'Destination', type: 'text', default: 'Riverside Park', placeholder: 'e.g. Riverside Park' },
      { id: 'distance', label: 'Estimated distance', unit: 'km', type: 'number', default: '6.5' },
      { id: 'rideType', label: 'Ride class', type: 'select', default: 'standard', options: [
        { value: 'standard', label: 'Standard' }, { value: 'comfort', label: 'Comfort' }, { value: 'xl', label: 'XL (6 seats)' }] },
    ],
    inputLabel: 'Read pickup, destination, distance', validateLabel: 'route valid & distance sane?', computeLabel: 'Compute estimated fare', outputLabel: 'Display estimate',
    validate: (v, raw) => {
      const p = (raw.pickup ?? '').trim(), d = (raw.destination ?? '').trim();
      if (p.length < 2) return 'Pickup location is required.';
      if (d.length < 2) return 'Destination is required.';
      if (p.toLowerCase() === d.toLowerCase()) return 'Pickup and destination must be different.';
      if (!(v.distance > 0)) return 'Distance must be greater than 0 km.';
      if (v.distance > 150) return 'Estimate limited to 150 km for this simulation.';
      return null;
    },
    solve: (v, raw) => {
      const rates: Record<string, { base: number; perKm: number; label: string }> = {
        standard: { base: 2.50, perKm: 3.20, label: 'Standard' },
        comfort: { base: 4.00, perKm: 4.50, label: 'Comfort' },
        xl: { base: 6.00, perKm: 6.00, label: 'XL' },
      };
      const r = rates[raw.rideType] ?? rates.standard;
      const tripFare = v.distance * r.perKm;
      const total = 1.50 + r.base + tripFare;
      return {
        steps: [
          { text: `${r.label}: base ${money(r.base)} + ${money(r.perKm)}/km × ${fmt(v.distance)} km = ${money(tripFare)}` },
          { text: `Booking fee: ${money(1.50)}` },
          { text: `Estimated total: ${money(1.50)} + ${money(r.base)} + ${money(tripFare)} = ${money(total)}`, vars: { class: r.label, distance: `${fmt(v.distance)} km`, fare: money(total) } },
        ],
        output: `${r.label} estimate: ${money(total)} — ${fmt(v.distance)} km, driver ETA ≈ ${Math.max(2, Math.round(v.distance))} min`, value: total,
      };
    },
    workedExample: {
      title: 'Standard ride, 6.5 km',
      steps: ['Trip fare = 6.5 × $3.20 = $20.80', 'Base $2.50 + fee $1.50', 'Total = 20.80 + 2.50 + 1.50 = $24.80'],
      result: '≈ $24.80',
    },
    challenge: { mode: 'numeric', question: 'Comfort ride, 10 km. Booking fee $1.50, base $4.00, $4.50/km. Total fare in dollars?', answer: '50.50', unit: '$', tolerance: 0.01, explanation: '1.50 + 4.00 + 10×4.50 = 50.50.' },
    related: ['food-delivery', 'parking-management', 'package-tracking'],
  }),

  formulaExperience({
    slug: 'food-delivery',
    title: 'Food Delivery System',
    category: 'life-systems', difficulty: 'Beginner', duration: 14,
    description: 'Order totals with delivery and service fees — and why the fees differ by distance.',
    keywords: ['food', 'delivery', 'restaurant', 'fee', 'order', 'meal'],
    concept: [
      'A food-delivery bill has three parts: the items, a distance-based delivery fee paying the courier, and a small platform service fee.',
      'Distance-based fees exist because courier time is the scarce resource. Short trips are subsidised by a minimum fee; long trips rise linearly up to the cap.',
    ],
    formula: 'total = items × 1.05 + max(2.50, min(8.00, 0.80 × km))',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'items', meaning: 'Sum of the meal prices', unit: '$' },
      { symbol: 'km', meaning: 'Distance from restaurant to door', unit: 'km' },
      { symbol: 'service', meaning: '5% platform service fee', unit: '$' },
      { symbol: 'delivery', meaning: 'max($2.50, min($8.00, $0.80/km))', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Service fee = 5% of items total. Delivery fee = $0.80 per km, floor $2.50, cap $8.00.', 'No tip included — tipping is optional and goes 100% to the courier.'],
    inputDefs: [
      { id: 'itemsTotal', label: 'Items total', unit: '$', type: 'number', default: '36.40' },
      { id: 'distanceKm', label: 'Delivery distance', unit: 'km', type: 'number', default: '3.5' },
    ],
    inputLabel: 'Read items total, distance', validateLabel: 'total > 0 & 0 ≤ km ≤ 30?', computeLabel: 'Compute delivery & service fees', outputLabel: 'Display order total',
    validate: (v, _raw) => {
      if (!(v.itemsTotal > 0)) return 'Items total must be greater than $0.';
      if (!(v.distanceKm >= 0) || v.distanceKm > 30) return 'Delivery distance must be between 0 and 30 km.';
      return null;
    },
    solve: (v) => {
      const service = v.itemsTotal * 0.05;
      const delivery = Math.max(2.5, Math.min(8, 0.8 * v.distanceKm));
      const total = v.itemsTotal + service + delivery;
      return {
        steps: [
          { text: `Service fee = 5% × ${money(v.itemsTotal)} = ${money(service)}` },
          { text: `Delivery fee = max(2.50, min(8.00, 0.80 × ${fmt(v.distanceKm)})) = ${money(delivery)}` },
          { text: `Total = ${money(v.itemsTotal)} + ${money(service)} + ${money(delivery)} = ${money(total)}`, vars: { service: money(service), delivery: money(delivery), total: money(total) } },
        ],
        output: `Order total: ${money(total)} (service ${money(service)}, delivery ${money(delivery)})`, value: total,
      };
    },
    workedExample: {
      title: '$36.40 of food, 3.5 km away',
      steps: ['Service = 36.40 × 5% = $1.82', 'Delivery = 0.80 × 3.5 = $2.80', 'Total = 36.40 + 1.82 + 2.80 = $41.02'],
      result: '$41.02',
    },
    challenge: { mode: 'numeric', question: 'Items $20.00, distance 1 km. Service 5%, delivery minimum $2.50. Total?', answer: '23.50', unit: '$', tolerance: 0.01, explanation: 'Service $1.00 + delivery $2.50 → 20 + 1 + 2.50 = $23.50.' },
    related: ['ride-booking', 'e-commerce-shopping', 'restaurant-reservation'],
  }),

  formulaExperience({
    slug: 'library-management',
    title: 'Library Management System',
    category: 'life-systems', difficulty: 'Beginner', duration: 14,
    description: 'Loans, due dates and overdue fines — the rules behind every library desk.',
    keywords: ['library', 'book', 'borrow', 'return', 'fine', 'overdue', 'loan'],
    concept: [
      'A library loan is a simple contract: you may keep the book for 14 days; beyond that, a small daily fine accrues to encourage timely returns.',
      'Librarians search a catalogue by title or author, check shelf availability, and the system generates the due date at checkout. Returning early closes the loan with no fine.',
    ],
    formula: 'fine = max(0, borrowedDays − 14) × dailyRate',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'borrowedDays', meaning: 'Days since checkout', unit: 'days' },
      { symbol: 'rate', meaning: 'Fine per overdue day', unit: '$ / day' },
      { symbol: 'fine', meaning: 'Total overdue fine', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Standard loan period: 14 days.', 'Default fine rate: $0.25 per overdue day (configurable).', 'Maximum fine per book: $20.00.'],
    inputDefs: [
      { id: 'borrowedDays', label: 'Days borrowed', unit: 'days', type: 'number', default: '19' },
      { id: 'dailyRate', label: 'Daily fine rate', unit: '$ / day', type: 'number', default: '0.25' },
    ],
    inputLabel: 'Read days borrowed, rate', validateLabel: 'days ≥ 0 & rate ≥ 0?', computeLabel: 'Compute fine & status', outputLabel: 'Display loan status',
    validate: (v, _raw) => (v.borrowedDays >= 0 && v.borrowedDays <= 365 && v.dailyRate >= 0 ? null : 'Days must be 0–365 and rate ≥ 0.'),
    solve: (v) => {
      const overdue = Math.max(0, v.borrowedDays - 14);
      const fine = Math.min(20, overdue * v.dailyRate);
      const status = overdue === 0 ? 'Within loan period' : `OVERDUE by ${overdue} day(s)`;
      return {
        steps: [
          { text: `Loan period used: ${v.borrowedDays} / 14 days` },
          { text: overdue === 0 ? 'No overdue days' : `Overdue days = ${v.borrowedDays} − 14 = ${overdue}` },
          { text: `Fine = min($20, ${overdue} × ${money(v.dailyRate)}) = ${money(fine)}`, vars: { overdue, fine: money(fine) } },
        ],
        output: `${status} — fine ${money(fine)}`, value: fine,
      };
    },
    workedExample: {
      title: 'Book returned after 19 days (rate $0.25)',
      steps: ['Overdue = 19 − 14 = 5 days', 'Fine = 5 × 0.25 = $1.25'],
      result: 'Fine $1.25',
    },
    challenge: { mode: 'numeric', question: 'A book is returned 30 days after checkout (14-day loan, $0.25/day). Fine in dollars?', answer: '4', unit: '$', tolerance: 0.01, explanation: 'Overdue = 16 days; 16 × 0.25 = $4.00.' },
    related: ['student-registration', 'school-attendance', 'movie-ticket-booking'],
  }),

  formulaExperience({
    slug: 'student-registration',
    title: 'Student Registration System',
    category: 'life-systems', difficulty: 'Intermediate', duration: 16,
    description: 'Validate a student ID, enforce the 5-course cap, and check seat availability.',
    keywords: ['student', 'register', 'course', 'enrollment', 'capacity', 'registration'],
    concept: [
      'University registration is rule enforcement at scale: the student must exist, the courses must be valid codes, nobody may take more than five, and each course may be full.',
      'This simulation applies those four checks in order. In the demo rule, any course code ending in 9 is treated as full — a simple way to teach the capacity check without a database.',
    ],
    formula: 'registered = courses where valid AND seats_available;  |selection| ≤ 5',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'id', meaning: 'Student ID — 2 letters + 4 digits, e.g. ST2041', unit: '—' },
      { symbol: 'courses', meaning: 'Comma-separated course codes, e.g. CS101, MATH201', unit: '—' },
    ],
    assumptions: [ILLEGAL_NOTE, 'ID format: exactly 2 letters + 4+ digits (e.g. ST2041).', 'Maximum 5 courses per term.', 'Demo capacity rule: codes ending in 9 are full.'],
    inputDefs: [
      { id: 'name', label: 'Student name', type: 'text', default: 'Sara Ahmed', placeholder: 'e.g. Sara Ahmed' },
      { id: 'studentId', label: 'Student ID', type: 'text', default: 'ST2041', placeholder: 'e.g. ST2041' },
      { id: 'courses', label: 'Course codes (comma-separated)', type: 'text', default: 'CS101, MATH201, PHY110', placeholder: 'CS101, MATH201' },
    ],
    inputLabel: 'Read name, ID, courses', validateLabel: 'name, ID & codes valid?', computeLabel: 'Validate capacity & register', outputLabel: 'Display registration',
    validate: (_v, raw) => {
      const name = (raw.name ?? '').trim();
      if (name.length < 2) return 'Student name is required (min 2 characters).';
      if (!/^[A-Za-z]{2}[0-9]{4,}$/.test((raw.studentId ?? '').trim())) return 'Invalid ID — expected 2 letters followed by at least 4 digits (e.g. ST2041).';
      const codes = (raw.courses ?? '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      if (codes.length === 0) return 'Enter at least one course code.';
      if (codes.length > 5) return `Too many courses: ${codes.length}. Maximum is 5.`;
      for (const c of codes) if (!/^[A-Z]{2,5}[0-9]{2,3}$/.test(c)) return `“${c}” is not a valid course code (e.g. CS101, MATH201).`;
      if (new Set(codes).size !== codes.length) return 'Duplicate course codes detected.';
      return null;
    },
    solve: (_v, raw) => {
      const codes = (raw.courses ?? '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      const full = codes.filter(c => c.endsWith('9'));
      const ok = codes.filter(c => !c.endsWith('9'));
      const t: { text: string }[] = [
        { text: `Validating ID ${(raw.studentId ?? '').trim().toUpperCase()} ✓ — format OK` },
        { text: `${codes.length} course(s) requested, cap is 5 ✓` },
      ];
      for (const c of codes) t.push({ text: c.endsWith('9') ? `${c}: FULL — no seats available` : `${c}: seat available — reserved` });
      if (ok.length) t.push({ text: `Registered in: ${ok.join(', ')}` });
      if (full.length) t.push({ text: `Waitlisted / rejected: ${full.join(', ')}` });
      const out = ok.length ? `Registered in ${ok.length} course(s): ${ok.join(', ')}${full.length ? ` — ${full.join(', ')} full` : ''}` : 'No seats available in the requested courses.';
      return { steps: t, output: out, value: ok.length };
    },
    workedExample: {
      title: 'Register for CS101, MATH201, PHY119',
      steps: ['Name ✓, ID format ✓, 3 courses ≤ 5 ✓', 'PHY119 ends in 9 → FULL (demo rule)', 'Registered: CS101, MATH201'],
      result: 'Registered in 2 of 3 courses',
    },
    challenge: { mode: 'choice', question: 'Which input is rejected before any course is checked?', options: ['ID "ST20A1"', 'Course code "CS101"', '3 selected courses', 'Name "Sara"'], answer: 'ID "ST20A1"', explanation: 'The ID must match 2 letters + digits. “ST20A1” contains a letter in the digit section.' },
    related: ['school-attendance', 'library-management', 'student-registration'],
  }),

  formulaExperience({
    slug: 'school-attendance',
    title: 'School Attendance System',
    category: 'life-systems', difficulty: 'Beginner', duration: 12,
    description: 'Mark attendance and compute the percentage that governs exam eligibility.',
    keywords: ['attendance', 'school', 'present', 'absent', 'percentage', 'eligibility'],
    concept: [
      'Most schools require 75% attendance to sit the final exam. The math is a ratio: present days ÷ total days × 100.',
      'Tracking it daily — not at term-end — is what lets a warning go out after two absences instead of after it is too late.',
    ],
    formula: 'attendance% = presentDays / totalDays × 100',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'present', meaning: 'Days the student attended', unit: 'days' },
      { symbol: 'total', meaning: 'Days school was in session', unit: 'days' },
      { symbol: 'pct', meaning: 'Attendance percentage', unit: '%' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Eligibility threshold for exams: 75%.', '≥ 90% = Excellent, ≥ 75% = Meets requirement, ≥ 50% = At risk, below = Critical.'],
    inputDefs: [
      { id: 'presentDays', label: 'Days present', unit: 'days', type: 'number', default: '41' },
      { id: 'totalDays', label: 'Total school days', unit: 'days', type: 'number', default: '46' },
    ],
    inputLabel: 'Read present, total days', validateLabel: '0 ≤ present ≤ total, total > 0?', computeLabel: 'pct = present ÷ total × 100', outputLabel: 'Display attendance',
    validate: (v, _raw) => (v.totalDays > 0 ? (v.presentDays >= 0 && v.presentDays <= v.totalDays ? null : 'Present days must be between 0 and total days.') : 'Total school days must be greater than 0.'),
    solve: (v) => {
      const pct = (v.presentDays / v.totalDays) * 100;
      const status = pct >= 90 ? 'Excellent — exemplary attendance' : pct >= 75 ? 'Meets requirement (exam eligible)' : pct >= 50 ? 'At risk — below 75% threshold' : 'Critical — exam ineligible';
      return {
        steps: [
          { text: `${v.presentDays} ÷ ${v.totalDays} = ${fmt(v.presentDays / v.totalDays, 4)}` },
          { text: `× 100 = ${fmt(pct, 4)}%` },
          { text: `Status: ${status}`, vars: { pct: `${fmt(pct, 4)}%` } },
        ],
        output: `Attendance ${fmt(pct, 2)}% — ${status}`, value: pct,
      };
    },
    workedExample: {
      title: '41 days present out of 46',
      steps: ['41 ÷ 46 ≈ 0.8913', '× 100 ≈ 89.13%', '≥ 75% → meets requirement'],
      result: '89.1% — meets requirement',
    },
    challenge: { mode: 'numeric', question: 'A student attends 36 of 48 days. Attendance percentage?', answer: '75', unit: '%', tolerance: 0.01, explanation: '36 ÷ 48 = 0.75 = 75% — exactly at the threshold.' },
    related: ['student-registration', 'average-calculator', 'percentage-calculator'],
  }),

  formulaExperience({
    slug: 'hotel-reservation',
    title: 'Hotel Reservation System',
    category: 'life-systems', difficulty: 'Beginner', duration: 12,
    description: 'Nights, room class and taxes — the math behind the booking confirmation.',
    keywords: ['hotel', 'reservation', 'room', 'booking', 'night', 'stay'],
    concept: [
      'A hotel price is nights × nightly rate, plus tax and service. Everything else — room type, occupancy, breakfast — is an add-on layer.',
      'Booking systems also check the calendar for double-booking: a room already committed to overlapping dates cannot be sold twice.',
    ],
    formula: 'total = nights × nightlyRate × 1.10 (10% service & tax)',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'nights', meaning: 'Length of stay', unit: 'nights' },
      { symbol: 'rate', meaning: 'Nightly rate of the chosen room class', unit: '$ / night' },
      { symbol: 'total', meaning: 'Final price including 10% service & tax', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Room classes (per night): Standard $80, Deluxe $140, Suite $260.', 'Service & tax: 10% added to the room total.', 'Maximum stay: 60 nights.'],
    inputDefs: [
      { id: 'nights', label: 'Nights', unit: 'nights', type: 'number', default: '3' },
      { id: 'roomType', label: 'Room type', type: 'select', default: 'deluxe', options: [
        { value: 'standard', label: 'Standard — $80/night' }, { value: 'deluxe', label: 'Deluxe — $140/night' }, { value: 'suite', label: 'Suite — $260/night' }] },
      { id: 'guests', label: 'Guests', unit: 'people', type: 'number', default: '2' },
    ],
    inputLabel: 'Read nights, room, guests', validateLabel: 'nights 1–60 & guests 1–8?', computeLabel: 'total = nights × rate × 1.10', outputLabel: 'Display quote',
    validate: (v, _raw) => (v.nights >= 1 && v.nights <= 60 ? (v.guests >= 1 && v.guests <= 8 ? null : 'Guests must be between 1 and 8.') : 'Nights must be between 1 and 60.'),
    solve: (v, raw) => {
      const rates: Record<string, number> = { standard: 80, deluxe: 140, suite: 260 };
      const rate = rates[raw.roomType] ?? 140;
      const room = v.nights * rate;
      const service = room * 0.10;
      const total = room + service;
      return {
        steps: [
          { text: `${v.nights} night(s) × ${money(rate)} = ${money(room)}` },
          { text: `Service & tax 10% = ${money(service)}` },
          { text: `Total = ${money(total)}`, vars: { nights: v.nights, rate: money(rate), total: money(total) } },
        ],
        output: `${v.nights} night(s), ${raw.roomType}: ${money(total)} (incl. 10% service & tax)`, value: total,
      };
    },
    workedExample: {
      title: '3 nights in a Deluxe room',
      steps: ['3 × $140 = $420', 'Service & tax = $42', 'Total = $462'],
      result: '$462.00',
    },
    challenge: { mode: 'numeric', question: '2 nights in a Standard room ($80/night) with 10% service & tax. Total in dollars?', answer: '176', unit: '$', tolerance: 0.01, explanation: '2 × 80 = 160; +10% = $176.' },
    related: ['restaurant-reservation', 'parking-management', 'electricity-bill-calculator'],
  }),

  formulaExperience({
    slug: 'parking-management',
    title: 'Parking Management System',
    category: 'life-systems', difficulty: 'Beginner', duration: 12,
    description: 'Assign spaces, log entry time, bill by the hour with a daily cap.',
    keywords: ['parking', 'car', 'fee', 'duration', 'space', 'garage'],
    concept: [
      'A parking garage sells the same space repeatedly — its product is time. Pricing is usually: a rate per started hour, with a daily maximum so customers are never punished for leaving the car overnight.',
      'Occupancy sensors feed a counter; entry cameras record number plates and timestamps; exit computes the fee from the difference.',
    ],
    formula: 'fee = min(dailyCap, hours × hourlyRate)',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'hours', meaning: 'Time parked (rounded up to the next half hour)', unit: 'hours' },
      { symbol: 'rate', meaning: 'Hourly rate for the vehicle class', unit: '$ / hour' },
      { symbol: 'cap', meaning: 'Daily maximum charge', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Motorcycle $2/hr (cap $12), Car $4/hr (cap $25), SUV $6/hr (cap $35).', 'First 30 minutes free.', 'Rates rounded up to the nearest half hour.'],
    inputDefs: [
      { id: 'vehicleType', label: 'Vehicle type', type: 'select', default: 'car', options: [
        { value: 'motorcycle', label: 'Motorcycle — $2/hr' }, { value: 'car', label: 'Car — $4/hr' }, { value: 'suv', label: 'SUV — $6/hr' }] },
      { id: 'hours', label: 'Time parked', unit: 'hours', type: 'number', default: '3.5' },
    ],
    inputLabel: 'Read vehicle, hours', validateLabel: '(0, 720] hours?', computeLabel: 'fee = min(cap, hours × rate)', outputLabel: 'Display fee',
    validate: (v, _raw) => (v.hours > 0 && v.hours <= 720 ? null : 'Time parked must be between 0 and 720 hours.'),
    solve: (v, raw) => {
      const conf: Record<string, { rate: number; cap: number; label: string }> = {
        motorcycle: { rate: 2, cap: 12, label: 'Motorcycle' },
        car: { rate: 4, cap: 25, label: 'Car' },
        suv: { rate: 6, cap: 35, label: 'SUV' },
      };
      const r = conf[raw.vehicleType] ?? conf.car;
      const free = Math.min(v.hours, 0.5);
      const billable = Math.max(0, v.hours - free);
      const rounded = Math.ceil(billable * 2) / 2;
      const rawFee = rounded * r.rate;
      const fee = Math.min(r.cap, rawFee);
      return {
        steps: [
          { text: `First 30 minutes free: billable = ${fmt(v.hours)} − 0.5 = ${fmt(Math.max(0, v.hours - 0.5))} h` },
          { text: `Rounded up to half-hour steps: ${fmt(rounded)} h × ${money(r.rate)} = ${money(rounded * r.rate)}` },
          { text: `Daily cap for ${r.label}: ${money(r.cap)} → final ${money(fee)}`, vars: { hours: fmt(v.hours), fee: money(fee) } },
        ],
        output: `${r.label} — ${fmt(v.hours)} h parked, fee ${money(fee)}`, value: fee,
      };
    },
    workedExample: {
      title: 'Car parked for 3.5 hours',
      steps: ['First 0.5 h free → 3.0 h billable', '3.0 × $4 = $12.00 (under the $25 cap)'],
      result: 'Fee $12.00',
    },
    challenge: { mode: 'numeric', question: 'A car parks for 12 hours. Rate $4/h, daily cap $25, first 30 min free. Fee in dollars?', answer: '25', unit: '$', tolerance: 0.01, explanation: 'Billable = 11.5 h × $4 = $46 → capped at $25.' },
    related: ['ride-booking', 'hotel-reservation', 'electricity-bill-calculator'],
  }),

  customExperience({
    slug: 'traffic-light-control',
    title: 'Traffic Light Control System',
    category: 'life-systems', difficulty: 'Intermediate', duration: 15, featured: true,
    description: 'Timed red/amber/green cycles — the state machine every junction runs on.',
    keywords: ['traffic', 'light', 'signal', 'cycle', 'timing', 'junction', 'state machine'],
    concept: [
      'A traffic light is a cyclic state machine with three states — GREEN, AMBER, RED — and fixed dwell times. After RED it returns to GREEN, forever.',
      'Real junctions add vehicle-detection loops and pedestrian requests, but the safety interlock is the same: never GREEN in conflicting directions at once.',
    ],
    formula: 'cycle = green + yellow + red,  then repeats forever',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'green', meaning: 'Green phase duration', unit: 's' },
      { symbol: 'yellow', meaning: 'Amber (caution) phase duration', unit: 's' },
      { symbol: 'red', meaning: 'Red phase duration', unit: 's' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Phase order is always GREEN → AMBER → RED → GREEN.', 'Each phase between 2 and 120 seconds.', 'Pedestrian crossing requests are served by extending RED.'],
    inputDefs: [
      { id: 'green', label: 'Green duration', unit: 's', type: 'number', default: '30' },
      { id: 'yellow', label: 'Amber duration', unit: 's', type: 'number', default: '5' },
      { id: 'red', label: 'Red duration', unit: 's', type: 'number', default: '30' },
    ],
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'The controller powers on and enters the cycle.' },
      { id: 'input', type: 'input', label: 'Read phase durations', detail: 'Green, amber and red dwell times from the plan.' },
      { id: 'validate', type: 'decision', label: '2 s ≤ phase ≤ 120 s?', detail: 'Unrealistic timings are rejected; the junction falls back to safe defaults.' },
      { id: 'errout', type: 'output', label: 'Display error / safe defaults', detail: 'Reports invalid timing.' },
      { id: 'greenPhase', type: 'process', label: 'GREEN — vehicles flow', detail: 'Through traffic moves; cross traffic sees red.' },
      { id: 'yellowPhase', type: 'process', label: 'AMBER — prepare to stop', detail: 'Warning only; no new entries into the junction.' },
      { id: 'redPhase', type: 'process', label: 'RED — stop', detail: 'Conflicting direction gets its green.' },
      { id: 'cycleEnd', type: 'decision', label: 'Cycle complete?', detail: 'A full GREEN → AMBER → RED pass forms one cycle.' },
      { id: 'output', type: 'output', label: 'Cycle logged & repeats', detail: 'The controller loops back to GREEN indefinitely.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Controller halted (maintenance mode).' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'greenPhase', label: 'Yes' },
      { from: 'greenPhase', to: 'yellowPhase' }, { from: 'yellowPhase', to: 'redPhase' },
      { from: 'redPhase', to: 'cycleEnd' }, { from: 'cycleEnd', to: 'output', label: 'Yes' },
      { from: 'cycleEnd', to: 'greenPhase', label: 'Loop' }, { from: 'output', to: 'end' },
    ],
    validateLabel: 'phases within 2–120 s?',
    validate: (_raw, v) => ([v.green, v.yellow, v.red].every(t => Number.isFinite(t) && t >= 2 && t <= 120) ? null : 'Each phase must be between 2 and 120 seconds.'),
    solve: (_raw, v) => {
      const cycle = v.green + v.yellow + v.red;
      const t: { nodeId: string; text: string; tone?: 'info' | 'decision' | 'output'; decision?: { question: string; result: string } }[] = [
        { nodeId: 'greenPhase', text: `GREEN for ${v.green}s — vehicles flow`, tone: 'info' },
        { nodeId: 'yellowPhase', text: `AMBER for ${v.yellow}s — prepare to stop`, tone: 'info' },
        { nodeId: 'redPhase', text: `RED for ${v.red}s — cross traffic flows`, tone: 'info' },
        { nodeId: 'cycleEnd', text: `One full cycle = ${cycle}s → repeat`, tone: 'decision', decision: { question: 'Cycle complete?', result: 'Yes' } },
        { nodeId: 'output', text: `Cycle length ${cycle}s. In 10 minutes the junction completes ≈ ${Math.floor(600 / cycle)} cycles.`, tone: 'output' },
        { nodeId: 'end', text: 'Simulation cycle complete (real controllers never stop).', tone: 'info' },
      ];
      return { steps: t, output: `Cycle = ${cycle}s (green ${v.green} + amber ${v.yellow} + red ${v.red})`, value: cycle };
    },
    algorithm: ['Start.', 'Read the three phase durations.', 'Validate each is between 2 and 120 seconds.', 'GREEN phase — vehicles flow.', 'AMBER phase — prepare to stop.', 'RED phase — cross traffic flows.', 'Check cycle complete? If yes, repeat from GREEN.', 'End.'],
    workedExample: {
      title: '30s green, 5s amber, 30s red',
      steps: ['Cycle = 30 + 5 + 30 = 65 s', 'In one hour: 3600 ÷ 65 ≈ 55 cycles'],
      result: '65-second cycle',
    },
    challenge: { mode: 'numeric', question: 'Green 40s, amber 4s, red 36s. One full cycle in seconds?', answer: '80', unit: 's', tolerance: 0, explanation: '40 + 4 + 36 = 80 seconds.' },
    related: ['elevator-control', 'parking-management', 'uniform-linear-motion'],
  }),

  formulaExperience({
    slug: 'elevator-control',
    title: 'Elevator Control System',
    category: 'life-systems', difficulty: 'Intermediate', duration: 15,
    description: 'Direction selection, floor counting and door logic — the elevator algorithm.',
    keywords: ['elevator', 'lift', 'floor', 'direction', 'call', 'door'],
    concept: [
      'An elevator controller receives calls from floors and from inside the car, then decides: go up, go down, or stay. The simplest policy — look direction — serves all requests in one direction, then reverses at the extreme.',
      'This simulation uses direct dispatch: given the current and requested floor, it computes direction, the number of floors travelled and the estimated time including door open/close.',
    ],
    formula: 'floors = |target − current|,  time ≈ floors × 3 s + 2 s (doors)',
    variables: [
      { symbol: 'current', meaning: 'Where the car is now', unit: 'floor 1–12' },
      { symbol: 'target', meaning: 'Requested floor', unit: 'floor 1–12' },
      { symbol: 'time', meaning: 'Estimated travel + door time', unit: 's' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Building has 12 floors.', 'Constant speed: 3 seconds per floor, plus 2 seconds door open/close.', 'Real controllers add capacity and direction-based dispatch.'],
    inputDefs: [
      { id: 'currentFloor', label: 'Current floor', unit: '1–12', type: 'number', default: '2' },
      { id: 'targetFloor', label: 'Target floor', unit: '1–12', type: 'number', default: '9' },
    ],
    inputLabel: 'Read current, target floor', validateLabel: 'floors within 1–12?', computeLabel: 'Compute direction, time', outputLabel: 'Display dispatch',
    validate: (v, _raw) => (Number.isInteger(v.currentFloor) && Number.isInteger(v.targetFloor) && v.currentFloor >= 1 && v.currentFloor <= 12 && v.targetFloor >= 1 && v.targetFloor <= 12 ? null : 'Both floors must be whole numbers between 1 and 12.'),
    solve: (v) => {
      const floors = Math.abs(v.targetFloor - v.currentFloor);
      const dir = v.targetFloor > v.currentFloor ? 'UP' : v.targetFloor < v.currentFloor ? 'DOWN' : 'STAY';
      const time = floors * 3 + (floors === 0 ? 0 : 2);
      return {
        steps: [
          { text: floors === 0 ? 'Target equals current floor — no travel needed' : `Direction: ${dir}, floors to travel: ${floors}` },
          ...(floors > 0 ? [{ text: `Travel ≈ ${floors} × 3 s = ${floors * 3}s; doors +2s → total ≈ ${time}s` }] : []),
          { text: 'Doors open on arrival, close after 3 s, car ready for next call' },
        ],
        output: floors === 0 ? `Already on floor ${v.currentFloor} — doors open.` : `Going ${dir} to floor ${v.targetFloor}: ${floors} floor(s), ≈ ${time}s`, value: time,
      };
    },
    workedExample: {
      title: 'From floor 2 to floor 9',
      steps: ['Δ = 9 − 2 = 7 floors up', '7 × 3 s = 21 s travel', '+2 s doors → ≈ 23 s'],
      result: '≈ 23 seconds',
    },
    challenge: { mode: 'numeric', question: 'Elevator from floor 11 to floor 4. Estimated seconds (3 s per floor + 2 s doors)?', answer: '23', unit: 's', tolerance: 0, explanation: '7 floors × 3 s = 21 s + 2 s doors = 23 s.' },
    related: ['traffic-light-control', 'parking-management', 'package-tracking'],
  }),

  formulaExperience({
    slug: 'electricity-bill-calculator',
    title: 'Electricity Bill Calculator',
    category: 'life-systems', difficulty: 'Intermediate', duration: 15,
    description: 'Progressive tariff tiers: the more you use, the higher the rate per kWh.',
    keywords: ['electricity', 'bill', 'tariff', 'kwh', 'energy', 'utility'],
    concept: [
      'Most utilities price electricity in progressive tiers: the first units each month are cheap, later units cost more. This encourages conservation — heavy users pay marginal rates.',
      'The bill = Σ (units in tier × tier rate) + a standing charge. This calculator applies the tiers shown below — change them to match your local utility.',
    ],
    formula: 'bill = 100×t₁ + 200×t₂ + max(0, kWh−300)×t₃ + standing',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'kWh', meaning: 'Units consumed this billing period', unit: 'kWh' },
      { symbol: 't₁…t₃', meaning: 'Tier rates (here: $0.12 / $0.18 / $0.24)', unit: '$ / kWh' },
      { symbol: 'standing', meaning: 'Fixed standing charge', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Demo tariff: 0–100 kWh @ $0.12, 101–300 kWh @ $0.18, above 300 kWh @ $0.24.', 'Standing charge: $3.00 per bill.', 'Tiers reset monthly. Taxes not included.'],
    inputDefs: [
      { id: 'kwh', label: 'Consumption', unit: 'kWh', type: 'number', default: '420' },
    ],
    inputLabel: 'Read kWh consumed', validateLabel: '0 ≤ kWh ≤ 5000?', computeLabel: 'Tiered tariff + standing charge', outputLabel: 'Display bill',
    validate: (v, _raw) => (v.kwh >= 0 && v.kwh <= 5000 ? null : 'Consumption must be between 0 and 5000 kWh.'),
    solve: (v) => {
      const t1 = Math.min(v.kwh, 100), t2 = Math.max(0, Math.min(v.kwh - 100, 200)), t3 = Math.max(0, v.kwh - 300);
      const c1 = t1 * 0.12, c2 = t2 * 0.18, c3 = t3 * 0.24, standing = 3.0;
      const total = c1 + c2 + c3 + standing;
      return {
        steps: [
          { text: `Tier 1: ${fmt(t1)} kWh × $0.12 = ${money(c1)}` },
          { text: `Tier 2: ${fmt(t2)} kWh × $0.18 = ${money(c2)}` },
          { text: `Tier 3: ${fmt(t3)} kWh × $0.24 = ${money(c3)}` },
          { text: `Standing charge = ${money(standing)}` },
          { text: `Total = ${money(total)}`, vars: { kwh: fmt(v.kwh), total: money(total) } },
        ],
        output: `Estimated bill: ${money(total)} (${fmt(v.kwh)} kWh + $3.00 standing)`, value: total,
      };
    },
    workedExample: {
      title: '420 kWh in a billing month',
      steps: ['Tier 1: 100 × 0.12 = $12.00', 'Tier 2: 200 × 0.18 = $36.00', 'Tier 3: 120 × 0.24 = $28.80', 'Standing $3.00 → total $79.80'],
      result: '$79.80',
    },
    challenge: { mode: 'numeric', question: 'Consumption is exactly 150 kWh. Bill in dollars? (Tiers 0.12/0.18/0.24, standing $3.00)', answer: '24', unit: '$', tolerance: 0.01, explanation: 'Tier 1: 100 × 0.12 = $12.00; tier 2: 50 × 0.18 = $9.00; standing $3.00 → $24.00.' },
    related: ['water-consumption-billing', 'parking-management', 'hotel-reservation'],
  }),

  formulaExperience({
    slug: 'water-consumption-billing',
    title: 'Water Consumption Billing System',
    category: 'life-systems', difficulty: 'Beginner', duration: 12,
    description: 'Meter deltas: read twice, subtract, bill the difference.',
    keywords: ['water', 'meter', 'billing', 'utility', 'consumption', 'reading'],
    concept: [
      'Water meters are cumulative odometers. The utility records the reading, and your usage is this reading minus the previous one — you are billed only for the difference.',
      'Most bills: consumption × volumetric rate + fixed service charge. Compare your bill against last month; a sudden jump usually means a hidden leak.',
    ],
    formula: 'usage = current − previous;  bill = usage × rate + fixed',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'prev', meaning: 'Previous meter reading', unit: 'm³' },
      { symbol: 'curr', meaning: 'Current meter reading', unit: 'm³' },
      { symbol: 'usage', meaning: 'Consumption this period', unit: 'm³' },
      { symbol: 'rate', meaning: 'Price per cubic metre', unit: '$ / m³' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Default rate: $1.50 per m³ plus $2.00 service charge.', 'Current reading must be ≥ previous reading.', 'Readings must be realistic (< 100,000 m³).'],
    inputDefs: [
      { id: 'previousReading', label: 'Previous reading', unit: 'm³', type: 'number', default: '10342' },
      { id: 'currentReading', label: 'Current reading', unit: 'm³', type: 'number', default: '10358' },
      { id: 'ratePerM3', label: 'Rate per m³', unit: '$ / m³', type: 'number', default: '1.50' },
    ],
    inputLabel: 'Read previous, current, rate', validateLabel: 'current ≥ previous?', computeLabel: 'usage × rate + service', outputLabel: 'Display bill',
    validate: (v, _raw) => (v.previousReading >= 0 && v.currentReading <= 100000 ? (v.currentReading >= v.previousReading ? (v.ratePerM3 >= 0 ? null : 'Rate cannot be negative.') : 'Current reading is below the previous one — check for a misread or a meter swap.') : 'Readings must be between 0 and 100,000 m³.'),
    solve: (v) => {
      const usage = v.currentReading - v.previousReading;
      const volumetric = usage * v.ratePerM3;
      const total = volumetric + 2.0;
      return {
        steps: [
          { text: `Consumption = ${fmt(v.currentReading)} − ${fmt(v.previousReading)} = ${fmt(usage)} m³` },
          { text: `Volumetric charge = ${fmt(usage)} × ${money(v.ratePerM3)} = ${money(volumetric)}` },
          { text: `Service charge = ${money(2.0)}` },
          { text: `Total = ${money(total)}`, vars: { usage: `${fmt(usage)} m³`, total: money(total) } },
        ],
        output: `Usage ${fmt(usage)} m³ — estimated bill ${money(total)}`, value: total,
      };
    },
    workedExample: {
      title: 'From 10,342 to 10,358 m³',
      steps: ['Usage = 16 m³', '16 × $1.50 = $24.00', '+ $2.00 service → $26.00'],
      result: '$26.00',
    },
    challenge: { mode: 'numeric', question: 'Previous 500, current 530, rate $1.50/m³, service $2.00. Bill in dollars?', answer: '47', unit: '$', tolerance: 0.01, explanation: '30 m³ × 1.50 = 45.00; + 2.00 = $47.00.' },
    related: ['electricity-bill-calculator', 'banking-account', 'library-management'],
  }),

  formulaExperience({
    slug: 'inventory-management',
    title: 'Inventory Management System',
    category: 'life-systems', difficulty: 'Beginner', duration: 14,
    description: 'Add, remove and audit stock — with automatic low-stock alerts.',
    keywords: ['inventory', 'stock', 'warehouse', 'sku', 'quantity', 'restock'],
    concept: [
      'Inventory is a ledger of units. Every delivery adds, every sale removes, and the count must never drift — that is why real systems log movements instead of just storing a final number.',
      'The critical control is the reorder point: when stock falls to or below the threshold, the system flags a purchase order before the shelf goes empty.',
    ],
    formula: 'newStock = stock + qty (in)  or  stock − qty (out);  alert if newStock ≤ threshold',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'stock', meaning: 'Units currently on hand', unit: 'units' },
      { symbol: 'qty', meaning: 'Units in the movement', unit: 'units' },
      { symbol: 'threshold', meaning: 'Low-stock reorder point', unit: 'units' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Negative stock is never allowed — removals larger than stock are rejected.', 'Alert fires at or below the threshold.'],
    inputDefs: [
      { id: 'currentStock', label: 'Current stock', unit: 'units', type: 'number', default: '34' },
      { id: 'op', label: 'Operation', type: 'select', default: 'out', options: [
        { value: 'in', label: 'Receive delivery (add)' }, { value: 'out', label: 'Ship order (remove)' }, { value: 'audit', label: 'Audit count (no change)' }] },
      { id: 'quantity', label: 'Quantity', unit: 'units', type: 'number', default: '12' },
      { id: 'lowStockAt', label: 'Low-stock threshold', unit: 'units', type: 'number', default: '5' },
    ],
    inputLabel: 'Read stock, operation, qty', validateLabel: 'movement valid?', computeLabel: 'Apply movement, check threshold', outputLabel: 'Display stock status',
    validate: (v, raw) => {
      if (!Number.isInteger(v.currentStock) || v.currentStock < 0) return 'Current stock must be a whole number ≥ 0.';
      if (raw.op === 'audit') return null;
      if (!Number.isInteger(v.quantity) || v.quantity < 1) return 'Quantity must be a whole number ≥ 1.';
      if (raw.op === 'out' && v.quantity > v.currentStock) return `Cannot remove ${v.quantity} units — only ${v.currentStock} on hand.`;
      return null;
    },
    solve: (v, raw) => {
      let ns = v.currentStock;
      if (raw.op === 'in') ns += v.quantity;
      else if (raw.op === 'out') ns -= v.quantity;
      const alert = ns <= v.lowStockAt;
      const status = ns === 0 ? 'OUT OF STOCK — reorder immediately' : alert ? `LOW STOCK — at/below threshold of ${v.lowStockAt}` : 'Stock healthy';
      return {
        steps: [
          { text: raw.op === 'audit' ? 'Audit only — stock unchanged' : raw.op === 'in' ? `Received ${v.quantity} units` : `Shipped ${v.quantity} units` },
          { text: `New stock = ${v.currentStock} ${raw.op === 'in' ? '+' : raw.op === 'out' ? '−' : '='} ${raw.op === 'audit' ? '' : v.quantity} → ${ns}`, vars: { stock: ns } },
          { text: `Threshold ${v.lowStockAt} → ${status}` },
        ],
        output: `On hand: ${ns} unit(s) — ${status}`, value: ns,
      };
    },
    workedExample: {
      title: 'Sell 12 units of a product with 34 in stock',
      steps: ['34 − 12 = 22 on hand', '22 > 5 → stock healthy, no alert'],
      result: '22 units, healthy',
    },
    challenge: { mode: 'choice', question: 'When does the system raise the low-stock alert?', options: ['When stock hits exactly 0', 'When stock is at or below the threshold', 'After every sale', 'Never automatically'], answer: 'When stock is at or below the threshold', explanation: 'The alert is inclusive — waiting for zero means shelves are already empty.' },
    related: ['banking-account', 'online-order-processing', 'e-commerce-shopping'],
  }),

  formulaExperience({
    slug: 'package-tracking',
    title: 'Package Delivery Tracking',
    category: 'life-systems', difficulty: 'Beginner', duration: 15,
    description: 'Tracking numbers, shipping stages and delivery confirmation.',
    keywords: ['package', 'tracking', 'shipping', 'delivery', 'parcel', 'courier'],
    concept: [
      'Every parcel gets a unique tracking reference at registration. Each facility scan appends a status event — received, departed, arrived, out for delivery, delivered.',
      'Tracking works because every scan is timestamped and chained to the reference. “Where is my package?” becomes a lookup, not a phone call.',
    ],
    formula: 'ETA = shipDate + serviceDays;  cost = base + perKg × weight',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'service', meaning: 'standard (5 days) | express (2 days) | same-day (1 day)', unit: '—' },
      { symbol: 'weight', meaning: 'Parcel weight', unit: 'kg' },
      { symbol: 'cost', meaning: 'Shipping cost', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'standard: $9.99 base + $1.50/kg, 5 days. express: $19.99 + $3.00/kg, 2 days. same-day: $39.99 + $5.00/kg, 1 day.', 'Tracking references are deterministic hashes in this simulation.', 'Max parcel weight: 70 kg.'],
    inputDefs: [
      { id: 'origin', label: 'Origin city', type: 'text', default: 'Cairo', placeholder: 'e.g. Cairo' },
      { id: 'destination', label: 'Destination city', type: 'text', default: 'Alexandria', placeholder: 'e.g. Alexandria' },
      { id: 'service', label: 'Service level', type: 'select', default: 'standard', options: [
        { value: 'standard', label: 'Standard — 5 days' }, { value: 'express', label: 'Express — 2 days' }, { value: 'sameday', label: 'Same day — 1 day' }] },
      { id: 'weight', label: 'Weight', unit: 'kg', type: 'number', default: '4.5' },
    ],
    inputLabel: 'Read origin, destination, service', validateLabel: 'route & weight valid?', computeLabel: 'Generate tracking + quote', outputLabel: 'Display shipment',
    validate: (v, raw) => {
      const o = (raw.origin ?? '').trim(), d = (raw.destination ?? '').trim();
      if (o.length < 2) return 'Origin city is required.';
      if (d.length < 2) return 'Destination city is required.';
      if (o.toLowerCase() === d.toLowerCase()) return 'Origin and destination must differ.';
      if (!(v.weight > 0) || v.weight > 70) return 'Weight must be between 0 and 70 kg.';
      return null;
    },
    solve: (v, raw) => {
      const conf: Record<string, { base: number; perKg: number; days: number; label: string }> = {
        standard: { base: 9.99, perKg: 1.5, days: 5, label: 'Standard' },
        express: { base: 19.99, perKg: 3.0, days: 2, label: 'Express' },
        sameday: { base: 39.99, perKg: 5.0, days: 1, label: 'Same day' },
      };
      const c = conf[raw.service] ?? conf.standard;
      const o = (raw.origin ?? '').trim(), d = (raw.destination ?? '').trim();
      let hash = 0;
      const seed = (o + '→' + d + raw.service).toLowerCase();
      for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      const tracking = `TRK-${hash.toString(36).toUpperCase().padStart(7, '0').slice(0, 7)}`;
      const cost = c.base + c.perKg * v.weight;
      const eta = new Date(Date.now() + c.days * 86400000);
      const etaText = eta.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      return {
        steps: [
          { text: `Tracking reference generated: ${tracking}` },
          { text: `Route: ${o} → ${d} (${c.label}, ${c.days} day(s))` },
          { text: `Cost = ${money(c.base)} + ${money(c.perKg)}/kg × ${fmt(v.weight)} kg = ${money(cost)}` },
          { text: `ETA: ${etaText}. Stages: registered → in transit → out for delivery → delivered` },
        ],
        output: `${tracking}: ${o} → ${d}, ${c.label}, ${money(cost)}, ETA ${etaText}`, value: cost,
      };
    },
    workedExample: {
      title: '4.5 kg from Cairo to Alexandria, Standard',
      steps: ['Tracking reference assigned at registration', 'Cost = 9.99 + 1.50 × 4.5 = $16.74', 'ETA = today + 5 days'],
      result: '≈ $16.74, 5-day delivery',
    },
    challenge: { mode: 'numeric', question: 'Express ($19.99 base + $3.00/kg), 10 kg parcel. Cost in dollars?', answer: '49.99', unit: '$', tolerance: 0.01, explanation: '19.99 + 3.00 × 10 = $49.99.' },
    related: ['online-order-processing', 'food-delivery', 'ride-booking'],
  }),

  formulaExperience({
    slug: 'movie-ticket-booking',
    title: 'Movie Ticket Booking',
    category: 'life-systems', difficulty: 'Beginner', duration: 14,
    description: 'Pick a show, pick seats, hold them while you pay — cinema booking logic.',
    keywords: ['movie', 'cinema', 'ticket', 'seat', 'booking', 'showtime'],
    concept: [
      'A cinema booking holds seats for a few minutes while you pay — concurrent users cannot take the same seat. The hard part is not the money; it is the concurrency.',
      'Ticket pricing stacks predictably: base price per ticket type, × quantity, minus any student discount, plus a small booking fee.',
    ],
    formula: 'total = qty × price × (1 − studentDiscount) + bookingFee',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'movie', meaning: 'Selected film', unit: '—' },
      { symbol: 'qty', meaning: 'Number of tickets', unit: 'tickets' },
      { symbol: 'price', meaning: 'Price per ticket', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Demo prices: “Dune: Part Three” $12.50, “The Silent Orbit” $10.00, “Karama” $8.50, “Nebula” $9.00.', 'Student discount: 15% with valid ID. Booking fee: $1.00 per transaction.', 'Maximum 10 tickets per booking.'],
    inputDefs: [
      { id: 'movie', label: 'Movie', type: 'select', default: 'dune3', options: [
        { value: 'dune3', label: 'Dune: Part Three — $12.50' }, { value: 'orbit', label: 'The Silent Orbit — $10.00' },
        { value: 'karama', label: 'Karama — $8.50' }, { value: 'nebula', label: 'Nebula — $9.00' }] },
      { id: 'quantity', label: 'Tickets', unit: '1–10', type: 'number', default: '2' },
      { id: 'student', label: 'Student discount (15%)', type: 'select', default: 'no', options: [
        { value: 'no', label: 'No' }, { value: 'yes', label: 'Yes — valid student ID' }] },
    ],
    inputLabel: 'Read movie, quantity, student', validateLabel: 'quantity 1–10?', computeLabel: 'Compute total with discount', outputLabel: 'Display booking',
    validate: (v, _raw) => (Number.isInteger(v.quantity) && v.quantity >= 1 && v.quantity <= 10 ? null : 'Ticket quantity must be a whole number between 1 and 10.'),
    solve: (v, raw) => {
      const prices: Record<string, number> = { dune3: 12.5, orbit: 10, karama: 8.5, nebula: 9 };
      const titles: Record<string, string> = { dune3: 'Dune: Part Three', orbit: 'The Silent Orbit', karama: 'Karama', nebula: 'Nebula' };
      const price = prices[raw.movie] ?? 12.5;
      const subtotal = price * v.quantity;
      const discount = raw.student === 'yes' ? subtotal * 0.15 : 0;
      const total = subtotal - discount + 1.0;
      return {
        steps: [
          { text: `${v.quantity} × ${money(price)} = ${money(subtotal)}` },
          ...(discount > 0 ? [{ text: `Student discount 15% → −${money(discount)}` }] : []),
          { text: `Booking fee ${money(1.0)}` },
          { text: `Total = ${money(total)}`, vars: { movie: titles[raw.movie] ?? raw.movie, qty: v.quantity, total: money(total) } },
        ],
        output: `${titles[raw.movie] ?? raw.movie}: ${v.quantity} ticket(s) — ${money(total)}`, value: total,
      };
    },
    workedExample: {
      title: '2 tickets to Dune with a student discount',
      steps: ['2 × $12.50 = $25.00', 'Student 15% off → −$3.75', '+$1.00 fee → Total $22.25'],
      result: '$22.25',
    },
    challenge: { mode: 'numeric', question: '3 adult tickets ($9.00) to Nebula, no discount, $1.00 booking fee. Total?', answer: '28', unit: '$', tolerance: 0.01, explanation: '3 × 9 = 27; +1 fee → $28.00.' },
    related: ['restaurant-reservation', 'e-commerce-shopping', 'online-order-processing'],
  }),

  formulaExperience({
    slug: 'restaurant-reservation',
    title: 'Restaurant Table Reservation',
    category: 'life-systems', difficulty: 'Beginner', duration: 12,
    description: 'Match party size to tables, hold the slot, prevent double-booking.',
    keywords: ['restaurant', 'table', 'reservation', 'booking', 'guests', 'dining'],
    concept: [
      'A reservation system answers one question: is there a suitable free table for this party at this time? It matches party size to table capacity, then holds the slot until the grace period expires.',
      'Large parties change the workflow — they trigger joined tables, a set menu, and often a small deposit to protect against no-shows.',
    ],
    formula: 'available if (tablesFree(≥ guests) at time) else first alternative offered',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'date', meaning: 'Reservation date (today or later)', unit: '—' },
      { symbol: 'time', meaning: 'Requested seating time', unit: '—' },
      { symbol: 'guests', meaning: 'Party size', unit: 'people' },
      { symbol: 'deposit', meaning: '$25 deposit for parties of 8+', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Standard tables seat 2–4; large tables seat 6–8.', 'Parties of 8+ require a $25 deposit per reservation.', '15-minute grace period past reservation time.'],
    inputDefs: [
      { id: 'date', label: 'Date (YYYY-MM-DD)', type: 'text', default: '2026-11-21', placeholder: '2026-11-21' },
      { id: 'time', label: 'Time', type: 'select', default: '19:30', options: [
        { value: '13:00', label: '13:00 — lunch' }, { value: '14:30', label: '14:30 — lunch late' },
        { value: '19:00', label: '19:00 — dinner' }, { value: '19:30', label: '19:30 — dinner' },
        { value: '21:00', label: '21:00 — dinner late' }, { value: '22:30', label: '22:30 — late seating' }] },
      { id: 'guests', label: 'Guests', unit: 'people', type: 'number', default: '4' },
    ],
    inputLabel: 'Read date, time, guests', validateLabel: 'future date & 1–12 guests?', computeLabel: 'Match table & confirm', outputLabel: 'Display confirmation',
    validate: (_v, raw) => {
      const d = new Date((raw.date ?? '').trim());
      if (Number.isNaN(d.getTime())) return 'Enter a valid date (YYYY-MM-DD).';
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (d < today) return 'Reservation date must be today or later.';
      const guests = parseInt(String(raw.guests ?? ''), 10);
      if (!Number.isInteger(guests) || guests < 1 || guests > 12) return 'Guests must be between 1 and 12.';
      return null;
    },
    solve: (v, raw) => {
      const guests = Math.trunc(v.guests);
      let hash = 0; const seed = `${raw.date}|${raw.time}|${guests}`;
      for (let i = 0; i < seed.length; i++) hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
      const confirmation = `RSV-${(hash % 46656).toString(36).toUpperCase().padStart(3, '0')}${guests}`;
      const tableType = guests <= 2 ? 'two-top by the window' : guests <= 4 ? 'four-top in the main hall' : guests <= 6 ? 'six-top, semi-private' : 'joined tables, semi-private room';
      const deposit = guests >= 8 ? 25 : 0;
      const depositNote = deposit > 0 ? ` Deposit due: ${money(deposit)} (refundable on arrival).` : '';
      return {
        steps: [
          { text: `Party of ${guests} on ${raw.date} at ${raw.time}` },
          { text: `Best fit: ${tableType}` },
          ...(deposit > 0 ? [{ text: `Large party → deposit ${money(deposit)} required` }] : []),
          { text: `Confirmation code: ${confirmation}` },
        ],
        output: `Table for ${guests} confirmed at ${raw.time} (${tableType}). Code ${confirmation}.${depositNote}`, value: deposit,
      };
    },
    workedExample: {
      title: '4 guests, Saturday 19:30',
      steps: ['Party of 4 → four-top in the main hall', 'No deposit (party < 8)', 'Confirmation code issued; table held for 15 minutes'],
      result: 'Confirmed — code RSV-XX4',
    },
    challenge: { mode: 'choice', question: 'What happens for a party of 9 in this restaurant?', options: ['Refused — maximum 8', 'A $25 deposit is required and tables are joined', 'Automatic private room at no cost', 'Split into two separate bookings silently'], answer: 'A $25 deposit is required and tables are joined', explanation: 'Parties of 8+ trigger the deposit rule and joined tables — visible to the guest before confirming.' },
    related: ['movie-ticket-booking', 'hotel-reservation', 'food-delivery'],
  }),

  formulaExperience({
    slug: 'digital-wallet',
    title: 'Digital Wallet System',
    category: 'life-systems', difficulty: 'Intermediate', duration: 15, featured: true,
    description: 'Balance checks, top-ups and transfers with a fee — wallet arithmetic done safely.',
    keywords: ['wallet', 'money', 'transfer', 'balance', 'payment', 'fintech'],
    concept: [
      'A digital wallet is an account with instant movement rules: top up freely, transfer instantly to other users — but never let the balance go negative, and never move more than exists.',
      'Transfers carry a small fee (here 0.5%, minimum $0.25) which the sender pays on top of the amount. The balance check therefore includes the fee.',
    ],
    formula: 'transfer: need amount + fee ≤ balance;  fee = max(0.25, 0.005 × amount)',
    formulaNote: ILLEGAL_NOTE,
    variables: [
      { symbol: 'balance', meaning: 'Current wallet balance', unit: '$' },
      { symbol: 'amount', meaning: 'Top-up or transfer amount', unit: '$' },
      { symbol: 'fee', meaning: 'Transfer fee (0.5%, min $0.25)', unit: '$' },
    ],
    assumptions: [ILLEGAL_NOTE, 'Top-up maximum: $10,000 per operation.', 'Transfer fee: 0.5% of amount, minimum $0.25, paid by sender.', 'Insufficient-balance transfers are rejected before any movement.'],
    inputDefs: [
      { id: 'balance', label: 'Current balance', unit: '$', type: 'number', default: '420' },
      { id: 'operation', label: 'Operation', type: 'select', default: 'transfer', options: [
        { value: 'add', label: 'Add money (top up)' }, { value: 'transfer', label: 'Transfer to another account' }] },
      { id: 'amount', label: 'Amount', unit: '$', type: 'number', default: '150' },
    ],
    inputLabel: 'Read balance, operation, amount', validateLabel: 'funds & limits valid?', computeLabel: 'Apply transfer rules', outputLabel: 'Display new balance',
    validate: (v, raw) => {
      if (!(v.amount > 0)) return 'Amount must be greater than zero.';
      if (raw.operation === 'add') return v.amount <= 10000 ? null : 'Top-up limit is $10,000 per operation.';
      const fee = Math.max(0.25, v.amount * 0.005);
      if (v.amount + fee > v.balance) return `Insufficient balance: need ${money(v.amount + fee)} (amount + ${money(fee)} fee), have ${money(v.balance)}.`;
      return null;
    },
    solve: (v, raw) => {
      if (raw.operation === 'add') {
        const nb = v.balance + v.amount;
        return { steps: [{ text: `Top-up ${money(v.amount)} approved` }, { text: `New balance = ${money(nb)}`, vars: { balance: money(nb) } }], output: `Added ${money(v.amount)}. New balance: ${money(nb)}`, value: nb };
      }
      const fee = Math.max(0.25, v.amount * 0.005);
      const nb = v.balance - v.amount - fee;
      return {
        steps: [
          { text: `Fee = max(0.25, 0.5% × ${money(v.amount)}) = ${money(fee)}` },
          { text: `Funds check: ${money(v.amount)} + ${money(fee)} ≤ ${money(v.balance)} ✓` },
          { text: `New balance = ${money(v.balance)} − ${money(v.amount)} − ${money(fee)} = ${money(nb)}`, vars: { fee: money(fee), balance: money(nb) } },
        ],
        output: `Transferred ${money(v.amount)} (fee ${money(fee)}). New balance: ${money(nb)}`, value: nb,
      };
    },
    workedExample: {
      title: 'Transfer $150 with $420 in the wallet',
      steps: ['Fee = max(0.25, 0.75) = $0.75', 'Need 150 + 0.75 = $150.75 ≤ $420 ✓', 'New balance = 420 − 150.75 = $269.25'],
      result: '$269.25 remaining',
    },
    challenge: { mode: 'numeric', question: 'Wallet holds $100. Transfer $50. Fee is 0.5% (minimum $0.25). What is the balance afterwards, in dollars?', answer: '49.75', unit: '$', tolerance: 0.01, explanation: 'Fee = max(0.25, 0.25) = $0.25. New balance = 100 − 50 − 0.25 = $49.75.' },
    related: ['banking-account', 'atm-withdrawal', 'e-commerce-shopping'],
  }),
];
