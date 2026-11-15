/* SOKKAR — Mathematics experiences (20). */
import { formulaExperience, fmt } from './shared';
import { isNum, num } from '../engine';
import type { Challenge, ComputeResult, Experience, FlowEdge, FlowNode, TraceStep, WorkedExample, CategoryId, Difficulty, InputDef } from '../types';

interface LoopCfg {
  slug: string; title: string; category?: CategoryId; difficulty: Difficulty; duration: number;
  description: string; keywords: string[]; featured?: boolean;
  concept: string[]; formula: string; formulaNote?: string;
  variables: { symbol: string; meaning: string; unit?: string }[];
  assumptions?: string[];
  inputDefs: InputDef[];
  inputLabel: string; validateLabel: string; outputLabel: string;
  nodes: FlowNode[]; edges: FlowEdge[];
  validate: (v: Record<string, number>, raw: Record<string, string>) => string | null;
  solve: (v: Record<string, number>, raw: Record<string, string>) => { steps: TraceStep[]; output: string; value?: number };
  workedExample: WorkedExample; challenge: Challenge; related: string[];
  algorithm: string[];
}
function loopExperience(cfg: LoopCfg): Experience {
  const compute = (values: Record<string, string>): ComputeResult => {
    const raw = { ...values };
    const v: Record<string, number> = {};
    const steps: TraceStep[] = [];
    for (const def of cfg.inputDefs) v[def.id] = num(raw[def.id] ?? '');
    steps.push({ nodeId: 'start', text: 'Algorithm started', tone: 'info' });
    steps.push({ nodeId: 'input', text: `Read ${cfg.inputDefs.map(d => d.label).join(', ')}`, tone: 'info', vars: Object.fromEntries(cfg.inputDefs.map(d => [d.label, raw[d.id] ?? ''])) });
    const numericCheck = cfg.inputDefs.filter(d => d.type === 'number').find(d => !isNum(raw[d.id] ?? ''));
    let error: string | null = numericCheck ? `${numericCheck.label} must be a valid number.` : cfg.validate(v, raw);
    if (error) {
      steps.push({ nodeId: 'validate', text: `Check failed -> ${error}`, tone: 'decision', decision: { question: cfg.validateLabel, result: 'No' } });
      steps.push({ nodeId: 'errout', text: error, tone: 'err' });
      steps.push({ nodeId: 'end', text: 'Algorithm finished with an error', tone: 'err' });
      return { ok: false, error, steps };
    }
    steps.push({ nodeId: 'validate', text: 'Inputs are valid', tone: 'decision', decision: { question: cfg.validateLabel, result: 'Yes' } });
    const solved = cfg.solve(v, raw);
    steps.push(...solved.steps);
    if (cfg.nodes.some(n => n.id === 'output')) {
      steps.push({ nodeId: 'output', text: solved.output, tone: 'output', vars: { Result: solved.output } });
    }
    steps.push({ nodeId: 'end', text: 'Algorithm finished successfully', tone: 'ok' });
    return { ok: true, output: solved.output, outputValue: solved.value, steps };
  };
  return {
    slug: cfg.slug, title: cfg.title, category: 'mathematics' as CategoryId, difficulty: cfg.difficulty, duration: cfg.duration,
    description: cfg.description, keywords: cfg.keywords, featured: cfg.featured,
    concept: cfg.concept, formula: cfg.formula, formulaNote: cfg.formulaNote, variables: cfg.variables, assumptions: cfg.assumptions,
    inputs: cfg.inputDefs, compute, nodes: cfg.nodes, edges: cfg.edges, algorithm: cfg.algorithm,
    workedExample: cfg.workedExample, challenge: cfg.challenge, related: cfg.related,
  };
}

const isInt = (n: number) => Number.isInteger(n);

export const mathExperiences: Experience[] = [
  formulaExperience({
    slug: 'basic-arithmetic',
    title: 'Basic Arithmetic Calculator',
    category: 'mathematics', difficulty: 'Beginner', duration: 8,
    description: 'Add, subtract, multiply and divide — with division-by-zero protection built in.',
    keywords: ['add', 'subtract', 'multiply', 'divide', 'arithmetic', 'calculator', 'operations'],
    concept: [
      'Arithmetic is the foundation of all computation. Every algorithm, from sorting a list to rendering this page, ultimately reduces to addition, subtraction, multiplication and division.',
      'Computers must handle edge cases explicitly: division by zero is undefined, and floating-point arithmetic has finite precision. Good programs check before they calculate.',
    ],
    formula: 'a + b  ·  a − b  ·  a × b  ·  a ÷ b',
    variables: [
      { symbol: 'a', meaning: 'First operand', unit: '—' },
      { symbol: 'b', meaning: 'Second operand', unit: '—' },
      { symbol: 'op', meaning: 'Operation to apply', unit: '—' },
    ],
    inputDefs: [
      { id: 'a', label: 'First number a', type: 'number', default: '12' },
      { id: 'b', label: 'Second number b', type: 'number', default: '5' },
      { id: 'op', label: 'Operation', type: 'select', default: 'add', options: [
        { value: 'add', label: 'Addition (a + b)' }, { value: 'subtract', label: 'Subtraction (a − b)' },
        { value: 'multiply', label: 'Multiplication (a × b)' }, { value: 'divide', label: 'Division (a ÷ b)' }] },
    ],
    inputLabel: 'Read a, b, operation', validateLabel: 'b ≠ 0 when dividing?', computeLabel: 'Apply the selected operation', outputLabel: 'Display result',
    validate: (v, raw) => (raw.op === 'divide' && v.b === 0 ? 'Division by zero is undefined.' : null),
    solve: (v, raw) => {
      const ops: Record<string, { sym: string; fn: (a: number, b: number) => number }> = {
        add: { sym: '+', fn: (a, b) => a + b }, subtract: { sym: '−', fn: (a, b) => a - b },
        multiply: { sym: '×', fn: (a, b) => a * b }, divide: { sym: '÷', fn: (a, b) => a / b },
      };
      const o = ops[raw.op] ?? ops.add;
      const r = o.fn(v.a, v.b);
      return {
        steps: [
          { text: `Operation: a ${o.sym} b` },
          { text: `${fmt(v.a)} ${o.sym} ${fmt(v.b)} = ${fmt(r)}`, vars: { a: v.a, b: v.b, result: fmt(r) } },
        ],
        output: `= ${fmt(r)}`, value: r,
      };
    },
    workedExample: {
      title: 'What is 17 × 24?',
      steps: ['Choose operation: multiply', 'a = 17, b = 24', '17 × 24 = 408'],
      result: '408',
    },
    challenge: { mode: 'numeric', question: 'Compute 144 ÷ 12.', answer: '12', tolerance: 0.001, explanation: '144 ÷ 12 = 12 exactly.' },
    related: ['percentage-calculator', 'average-calculator', 'greatest-common-divisor'],
  }),

  formulaExperience({
    slug: 'percentage-calculator',
    title: 'Percentage Calculator',
    category: 'mathematics', difficulty: 'Beginner', duration: 10,
    description: 'Percentages, percentage change and reverse percentages — three views of one idea.',
    keywords: ['percentage', 'percent', 'change', 'discount', 'increase', 'decrease', 'ratio'],
    concept: [
      '“Percent” means “per hundred”. 35% is simply 0.35, a ratio of 35 parts to 100. Discounts, tax, interest rates and poll results are all percentages.',
      'Percentage change compares a new value to an original: change = (new − old) ÷ |old| × 100. A rise from 80 to 100 is a +25% change, not +20%.',
    ],
    formula: 'change % = (new − old) ÷ |old| × 100',
    variables: [
      { symbol: 'p', meaning: 'Percentage (as a number, e.g. 20 for 20%)', unit: '%' },
      { symbol: 'N', meaning: 'The base value', unit: '—' },
      { symbol: 'old / new', meaning: 'Values before and after a change', unit: '—' },
    ],
    inputDefs: [
      { id: 'kind', label: 'What do you want to compute?', type: 'select', default: 'of', options: [
        { value: 'of', label: 'p percent of N' },
        { value: 'what', label: 'X is what percent of Y' },
        { value: 'change', label: 'Percentage change from A to B' }] },
      { id: 'a', label: 'First value', type: 'number', default: '25', hint: 'p (percent of), X (what percent), or old value A (change).' },
      { id: 'b', label: 'Second value', type: 'number', default: '200', hint: 'N (percent of), Y (what percent), or new value B (change).' },
    ],
    inputLabel: 'Read the values', validateLabel: 'base ≠ 0?', computeLabel: 'Apply the percentage rule', outputLabel: 'Display result',
    validate: (v, raw) => (raw.kind === 'of' ? null : v.b === 0 ? 'The base (second value) must not be zero.' : null),
    solve: (v, raw) => {
      if (raw.kind === 'of') {
        const r = (v.a / 100) * v.b;
        return { steps: [{ text: `${fmt(v.a)}% of ${fmt(v.b)} = (${fmt(v.a)} ÷ 100) × ${fmt(v.b)}` }, { text: `= ${fmt(r)}`, vars: { result: fmt(r) } }], output: `${fmt(v.a)}% of ${fmt(v.b)} = ${fmt(r)}`, value: r };
      }
      if (raw.kind === 'what') {
        const r = (v.a / v.b) * 100;
        return { steps: [{ text: `What % is ${fmt(v.a)} of ${fmt(v.b)}: (${fmt(v.a)} ÷ ${fmt(v.b)}) × 100` }, { text: `= ${fmt(r)}%`, vars: { result: `${fmt(r)}%` } }], output: `${fmt(v.a)} is ${fmt(r)}% of ${fmt(v.b)}`, value: r };
      }
      const change = ((v.b - v.a) / Math.abs(v.a)) * 100;
      return { steps: [{ text: `Change = (${fmt(v.b)} − ${fmt(v.a)}) ÷ |${fmt(v.a)}| × 100` }, { text: `= ${fmt(change)}%`, vars: { change: `${fmt(change)}%` } }], output: `Change from ${fmt(v.a)} to ${fmt(v.b)} = ${change >= 0 ? '+' : ''}${fmt(change)}%`, value: change };
    },
    workedExample: {
      title: 'A price rises from 80 to 100',
      steps: ['Change = new − old = 20', 'Base = |old| = 80', 'Change % = 20 ÷ 80 × 100 = 25%'],
      result: '+25% increase',
    },
    challenge: { mode: 'numeric', question: 'What is 15% of 240?', answer: '36', tolerance: 0.001, explanation: '15% of 240 = 0.15 × 240 = 36.' },
    related: ['average-calculator', 'basic-arithmetic', 'e-commerce-shopping'],
  }),

  formulaExperience({
    slug: 'average-calculator',
    title: 'Average Calculator',
    category: 'mathematics', difficulty: 'Beginner', duration: 10,
    description: 'The arithmetic mean — plus sum, count, minimum and maximum from one list.',
    keywords: ['average', 'mean', 'arithmetic', 'statistics', 'list', 'sum'],
    concept: [
      'The arithmetic mean is the great equalizer: add everything, then divide by how many items there are. It answers “what is the fair share?”',
      'Means are everywhere — test scores, monthly spending, average speed. Be careful: a few extreme values (like one 1000 among 1s) can drag the mean far from typical.',
    ],
    formula: 'mean = (x₁ + x₂ + … + xₙ) / n',
    variables: [
      { symbol: 'x₁…xₙ', meaning: 'The list of numbers', unit: '—' },
      { symbol: 'n', meaning: 'How many numbers', unit: '—' },
      { symbol: 'mean', meaning: 'The arithmetic average', unit: '—' },
    ],
    inputDefs: [
      { id: 'list', label: 'Numbers (comma-separated)', type: 'text', default: '4, 8, 15, 16, 23, 42', placeholder: 'e.g. 4, 8, 15' },
    ],
    inputLabel: 'Read the list', validateLabel: 'list non-empty & numeric?', computeLabel: 'mean = Σx ÷ n', outputLabel: 'Display statistics',
    validate: (_v, raw) => {
      const parts = (raw.list ?? '').split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length === 0) return 'Enter at least one number.';
      for (const p of parts) if (!Number.isFinite(parseFloat(p))) return `“${p}” is not a number.`;
      return null;
    },
    solve: (_v, raw) => {
      const list = (raw.list ?? '').split(',').map(s => parseFloat(s.trim()));
      const sum = list.reduce((a, b) => a + b, 0);
      const mean = sum / list.length;
      const min = Math.min(...list), max = Math.max(...list);
      return {
        steps: [
          { text: `Count: n = ${list.length}` },
          { text: `Sum: ${list.map(x => fmt(x)).join(' + ')} = ${fmt(sum)}` },
          { text: `Mean = ${fmt(sum)} ÷ ${list.length} = ${fmt(mean)}`, vars: { n: list.length, sum: fmt(sum), mean: fmt(mean), min: fmt(min), max: fmt(max) } },
        ],
        output: `Mean = ${fmt(mean)} (sum ${fmt(sum)}, min ${fmt(min)}, max ${fmt(max)})`, value: mean,
      };
    },
    workedExample: {
      title: 'Average of 10, 20, 30, 40',
      steps: ['Sum = 100', 'Count n = 4', 'Mean = 100 ÷ 4 = 25'],
      result: 'Mean = 25',
    },
    challenge: { mode: 'numeric', question: 'What is the mean of 2, 4, 6, 8, 10?', answer: '6', tolerance: 0.001, explanation: 'Sum = 30, n = 5, mean = 30 ÷ 5 = 6.' },
    related: ['basic-arithmetic', 'arithmetic-sequence', 'percentage-calculator'],
  }),

  loopExperience({
    slug: 'greatest-common-divisor',
    title: 'Greatest Common Divisor',
    category: 'mathematics', difficulty: 'Intermediate', duration: 15, featured: true,
    description: 'Euclid’s 2300-year-old algorithm — still the fastest way to share a common measure.',
    keywords: ['gcd', 'hcf', 'greatest', 'common', 'divisor', 'euclidean', 'factor'],
    concept: [
      'The GCD of two integers is the largest integer that divides both exactly. GCD(48, 36) = 12 because 12 is the biggest number that fits into both.',
      'Euclid’s insight: gcd(a, b) = gcd(b, a mod b). Keep replacing until the remainder is zero — the last non-zero remainder is the answer. It terminates fast even for very large numbers.',
    ],
    formula: 'gcd(a, b) = gcd(b, a mod b),  until b = 0',
    variables: [
      { symbol: 'a, b', meaning: 'The two integers', unit: '—' },
      { symbol: 'r', meaning: 'Remainder a mod b', unit: '—' },
      { symbol: 'u, v', meaning: 'Running values inside the loop', unit: '—' },
    ],
    assumptions: ['Inputs are whole numbers ≥ 1 (negatives use their absolute value).', 'gcd(a, 0) = a by definition.'],
    inputDefs: [
      { id: 'a', label: 'Integer a', type: 'number', default: '252' },
      { id: 'b', label: 'Integer b', type: 'number', default: '105' },
    ],
    inputLabel: 'Read a, b', validateLabel: 'a ≥ 1 and b ≥ 1?', outputLabel: 'Display gcd',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the Euclidean algorithm.' },
      { id: 'input', type: 'input', label: 'Read a, b', detail: 'Two integers to measure.' },
      { id: 'validate', type: 'decision', label: 'a ≥ 1 and b ≥ 1?', detail: 'GCD is defined for positive integers.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Reports the invalid input and stops.' },
      { id: 'init', type: 'process', label: 'u = |a|, v = |b|', detail: 'Work on magnitudes so signs cannot distract the algorithm.' },
      { id: 'loop', type: 'decision', label: 'v ≠ 0?', detail: 'Each pass replaces (u, v) with (v, u mod v). The remainder strictly shrinks, so the loop always terminates.' },
      { id: 'body', type: 'process', label: 'r = u mod v, u = v, v = r', detail: 'One Euclid step: divide u by v, keep the remainder.' },
      { id: 'output', type: 'output', label: 'Display gcd = u', detail: 'When v becomes 0, u holds the greatest common divisor.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'init', label: 'Yes' }, { from: 'init', to: 'loop' },
      { from: 'loop', to: 'body', label: 'Yes' }, { from: 'body', to: 'loop' },
      { from: 'loop', to: 'output', label: 'No' }, { from: 'output', to: 'end' },
    ],
    validate: v => (Number.isFinite(v.a) && Number.isFinite(v.b) && Math.abs(v.a) >= 1 && Math.abs(v.b) >= 1 ? null : 'Both values must be non-zero integers.'),
    solve: (v) => {
      const t: TraceStep[] = [];
      let u = Math.abs(Math.trunc(v.a)), w = Math.abs(Math.trunc(v.b));
      t.push({ nodeId: 'init', text: `u = ${u}, v = ${w}`, tone: 'info', vars: { u, v: w } });
      let guard = 0;
      while (w !== 0 && guard < 200) {
        guard++;
        const r = u % w;
        t.push({ nodeId: 'loop', text: `v = ${w} ≠ 0 → continue`, tone: 'decision', decision: { question: 'v ≠ 0?', result: 'Yes' }, vars: { u, v: w } });
        t.push({ nodeId: 'body', text: `r = ${u} mod ${w} = ${r} → u = ${w}, v = ${r}`, tone: 'info', vars: { r, u: w, v: r } });
        u = w; w = r;
      }
      t.push({ nodeId: 'loop', text: 'v = 0 → stop', tone: 'decision', decision: { question: 'v ≠ 0?', result: 'No' }, vars: { u, v: 0 } });
      return { steps: t, output: `gcd = ${u}`, value: u };
    },
    algorithm: ['Start.', 'Read a and b.', 'Check both are non-zero integers.', 'Set u = |a|, v = |b|.', 'While v ≠ 0: r = u mod v; u = v; v = r.', 'Display gcd = u.', 'End.'],
    workedExample: {
      title: 'gcd(252, 105)',
      steps: ['252 mod 105 = 42 → (105, 42)', '105 mod 42 = 21 → (42, 21)', '42 mod 21 = 0 → stop', 'gcd = 21'],
      result: 'gcd = 21',
    },
    challenge: { mode: 'numeric', question: 'What is gcd(84, 126)?', answer: '42', tolerance: 0, explanation: '126 mod 84 = 42; 84 mod 42 = 0 → gcd = 42.' },
    related: ['least-common-multiple', 'prime-number-checker', 'even-or-odd-checker'],
  }),

  loopExperience({
    slug: 'least-common-multiple',
    title: 'Least Common Multiple',
    category: 'mathematics', difficulty: 'Intermediate', duration: 12,
    description: 'The smallest number both integers divide — computed via the GCD in two lines.',
    keywords: ['lcm', 'least', 'common', 'multiple', 'gcd', 'factor'],
    concept: [
      'The LCM is the first value where two counting patterns coincide — every 6th and every 8th second both ring at 24.',
      'Instead of listing multiples, use the identity lcm(a, b) = |a × b| ÷ gcd(a, b). It works for every pair of non-zero integers.',
    ],
    formula: 'lcm(a, b) = |a × b| ÷ gcd(a, b)',
    variables: [
      { symbol: 'a, b', meaning: 'The two integers', unit: '—' },
      { symbol: 'gcd', meaning: 'Greatest common divisor of a and b', unit: '—' },
    ],
    assumptions: ['a and b are non-zero integers.', 'Uses Euclidean GCD internally — guaranteed to terminate.'],
    inputDefs: [
      { id: 'a', label: 'Integer a', type: 'number', default: '12' },
      { id: 'b', label: 'Integer b', type: 'number', default: '18' },
    ],
    inputLabel: 'Read a, b', validateLabel: 'a ≠ 0 and b ≠ 0?', outputLabel: 'Display lcm',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the LCM algorithm.' },
      { id: 'input', type: 'input', label: 'Read a, b', detail: 'Two integers.' },
      { id: 'validate', type: 'decision', label: 'a ≠ 0 and b ≠ 0?', detail: 'lcm with zero is not meaningful.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'gcdstep', type: 'process', label: 'g = gcd(a, b)', detail: 'Euclidean algorithm: repeated remainder until zero.' },
      { id: 'compute', type: 'process', label: 'lcm = |a × b| ÷ g', detail: 'Multiply then divide by the GCD.' },
      { id: 'output', type: 'output', label: 'Display lcm', detail: 'The least common multiple.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'gcdstep', label: 'Yes' }, { from: 'gcdstep', to: 'compute' },
      { from: 'compute', to: 'output' }, { from: 'output', to: 'end' },
    ],
    validate: v => (Number.isFinite(v.a) && Number.isFinite(v.b) && Math.trunc(v.a) !== 0 && Math.trunc(v.b) !== 0 ? null : 'Both integers must be non-zero.'),
    solve: (v) => {
      let u = Math.abs(Math.trunc(v.a)), w = Math.abs(Math.trunc(v.b));
      const a0 = u, b0 = w;
      const t: TraceStep[] = [];
      while (w !== 0) { const r = u % w; t.push({ nodeId: 'gcdstep', text: `gcd step: ${u} mod ${w} = ${r}`, tone: 'info', vars: { u, v: w, r } }); u = w; w = r; }
      t.push({ nodeId: 'gcdstep', text: `gcd(${a0}, ${b0}) = ${u}`, tone: 'info', vars: { g: u } });
      const lcm = (a0 / u) * b0;
      t.push({ nodeId: 'compute', text: `lcm = (${a0} ÷ ${u}) × ${b0} = ${fmt(lcm)}`, tone: 'info', vars: { g: u, lcm: fmt(lcm) } });
      return { steps: t, output: `lcm = ${fmt(lcm)}`, value: lcm };
    },
    algorithm: ['Start.', 'Read a and b.', 'Check both non-zero.', 'Compute g = gcd(a, b) via Euclid.', 'lcm = |a × b| ÷ g.', 'Display lcm.', 'End.'],
    workedExample: {
      title: 'lcm(12, 18)',
      steps: ['gcd(12, 18): 18 mod 12 = 6; 12 mod 6 = 0 → gcd = 6', 'lcm = (12 × 18) ÷ 6', 'lcm = 216 ÷ 6 = 36'],
      result: 'lcm = 36',
    },
    challenge: { mode: 'numeric', question: 'What is lcm(15, 20)?', answer: '60', tolerance: 0, explanation: 'gcd = 5; lcm = 300 ÷ 5 = 60.' },
    related: ['greatest-common-divisor', 'prime-number-checker', 'factorial-calculator'],
  }),

  loopExperience({
    slug: 'prime-number-checker',
    title: 'Prime Number Checker',
    category: 'mathematics', difficulty: 'Intermediate', duration: 15, featured: true,
    description: 'Trial division up to √n — the classic primality algorithm, executed step by step.',
    keywords: ['prime', 'composite', 'factor', 'divisibility', 'trial division', 'primality'],
    concept: [
      'A prime number has exactly two divisors: 1 and itself. Everything else is composite. 2 is the only even prime; 1 is not prime at all.',
      'To test n, you only need to try divisors up to √n — if n had a factor bigger than √n, its partner would be smaller than √n and would already have been found.',
    ],
    formula: 'n is prime ⟺ no integer i with 2 ≤ i ≤ √n divides n',
    variables: [
      { symbol: 'n', meaning: 'The integer to test', unit: '—' },
      { symbol: 'i', meaning: 'Candidate divisor in the loop', unit: '—' },
      { symbol: '√n', meaning: 'Stopping point of the loop', unit: '—' },
    ],
    assumptions: ['n is an integer ≥ 2.', 'Trial division is simple and exact; very large n use probabilistic tests in practice.'],
    inputDefs: [{ id: 'n', label: 'Integer to test', type: 'number', default: '97' }],
    inputLabel: 'Read n', validateLabel: 'integer ≥ 2?', outputLabel: 'Display verdict',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the primality test.' },
      { id: 'input', type: 'input', label: 'Read n', detail: 'The candidate number.' },
      { id: 'validate', type: 'decision', label: 'integer n ≥ 2?', detail: 'Primes are defined among integers ≥ 2; 1 is neither prime nor composite.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'init', type: 'process', label: 'i = 2', detail: 'Start testing from the smallest prime.' },
      { id: 'loop', type: 'decision', label: 'i × i ≤ n?', detail: 'Only need to test up to √n.' },
      { id: 'body', type: 'process', label: 'r = n mod i', detail: 'Divide and keep the remainder.' },
      { id: 'divisible', type: 'decision', label: 'r = 0?', detail: 'Exact division found — n is composite.' },
      { id: 'notprime', type: 'output', label: 'Display: not prime', detail: 'Reports n with its divisor i.' },
      { id: 'iadd', type: 'process', label: 'i = i + 1', detail: 'Advance to the next candidate.' },
      { id: 'primeout', type: 'output', label: 'Display: prime', detail: 'No divisor found up to √n — n is prime.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'init', label: 'Yes' }, { from: 'init', to: 'loop' },
      { from: 'loop', to: 'body', label: 'Yes' }, { from: 'body', to: 'divisible' },
      { from: 'divisible', to: 'notprime', label: 'Yes' }, { from: 'notprime', to: 'end' },
      { from: 'divisible', to: 'iadd', label: 'No' }, { from: 'iadd', to: 'loop' },
      { from: 'loop', to: 'primeout', label: 'No' }, { from: 'primeout', to: 'end' },
    ],
    validate: v => (Number.isFinite(v.n) && isInt(v.n) && v.n >= 2 ? null : 'Enter an integer n ≥ 2.'),
    solve: (v) => {
      const n = Math.trunc(v.n);
      const t: TraceStep[] = [];
      t.push({ nodeId: 'init', text: 'i = 2', tone: 'info', vars: { i: 2, n } });
      let i = 2, traced = 0;
      while (i * i <= n) {
        const r = n % i;
        if (traced < 14) {
          t.push({ nodeId: 'loop', text: `i×i = ${i * i} ≤ ${n} → test i = ${i}`, tone: 'decision', decision: { question: 'i × i ≤ n?', result: 'Yes' }, vars: { i, n } });
          t.push({ nodeId: 'body', text: `r = ${n} mod ${i} = ${r}`, tone: 'info', vars: { r, i, n } });
        }
        if (r === 0) {
          if (traced >= 14) t.push({ nodeId: 'body', text: `… found divisor ${i}`, tone: 'info' });
          t.push({ nodeId: 'divisible', text: `r = 0 → divisible by ${i}`, tone: 'decision', decision: { question: 'r = 0?', result: 'Yes' } });
          t.push({ nodeId: 'notprime', text: `${n} = ${i} × ${n / i} — not prime`, tone: 'output', vars: { divisor: i } });
          return { steps: t, output: `${n} is not prime (divisible by ${i})`, value: 0 };
        }
        if (traced < 14) t.push({ nodeId: 'divisible', text: 'r ≠ 0 → keep testing', tone: 'decision', decision: { question: 'r = 0?', result: 'No' } });
        i++; traced++;
      }
      t.push({ nodeId: 'loop', text: `i×i = ${i * i} > ${n} → no divisors found`, tone: 'decision', decision: { question: 'i × i ≤ n?', result: 'No' }, vars: { i, n } });
      t.push({ nodeId: 'primeout', text: `${n} is prime`, tone: 'output' });
      return { steps: t, output: `${n} is prime`, value: 1 };
    },
    algorithm: ['Start.', 'Read n (integer ≥ 2).', 'Set i = 2.', 'While i² ≤ n: if n mod i = 0 → report not prime.', 'i = i + 1, repeat.', 'If loop ends with no divisor → n is prime.', 'End.'],
    workedExample: {
      title: 'Is 97 prime?',
      steps: ['Check i = 2, 3, 5, 7 (since 9² = 81 ≤ 97 < 100)', '97 mod 2 = 1, 97 mod 3 = 1, 97 mod 5 = 2, 97 mod 7 = 6', 'No divisors found → 97 is prime'],
      result: '97 is prime',
    },
    challenge: { mode: 'choice', question: 'Which of these is NOT prime?', options: ['91', '97', '89', '83'], answer: '91', explanation: '91 = 7 × 13. The others are prime.' },
    related: ['prime-number-generator', 'greatest-common-divisor', 'even-or-odd-checker'],
  }),

  loopExperience({
    slug: 'prime-number-generator',
    title: 'Prime Number Generator',
    category: 'mathematics', difficulty: 'Advanced', duration: 18,
    description: 'Enumerate every prime in a range with a nested primality test.',
    keywords: ['prime', 'generate', 'range', 'list', 'sieve', 'primes'],
    concept: [
      'Generating primes is a classic programming exercise: walk every candidate in the range and keep the ones with no divisors up to their square root.',
      'For small ranges trial division is perfectly fine. For millions of numbers, a different algorithm — the Sieve of Eratosthenes — crosses out multiples and is vastly faster.',
    ],
    formula: 'primes in [a, b] = { n : a ≤ n ≤ b and no i, 2 ≤ i ≤ √n, divides n }',
    variables: [
      { symbol: 'a', meaning: 'Range start', unit: '—' },
      { symbol: 'b', meaning: 'Range end', unit: '—' },
      { symbol: 'c', meaning: 'Candidate being tested', unit: '—' },
    ],
    assumptions: ['Start must be ≥ 2, end ≥ start.', 'b − a ≤ 1000 to keep the browser fast.', 'Very large ranges need a sieve, not trial division.'],
    inputDefs: [
      { id: 'a', label: 'Start a', type: 'number', default: '1' },
      { id: 'b', label: 'End b', type: 'number', default: '50' },
    ],
    inputLabel: 'Read a, b', validateLabel: '2 ≤ a ≤ b and b−a ≤ 1000?', outputLabel: 'Display primes',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the prime generator.' },
      { id: 'input', type: 'input', label: 'Read range a, b', detail: 'The inclusive range to scan.' },
      { id: 'validate', type: 'decision', label: 'range valid?', detail: 'Start must be ≥ 2, end ≥ start, and the range must be small enough to scan live.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid range.' },
      { id: 'init', type: 'process', label: 'c = max(2, a)', detail: 'Candidates below 2 are skipped — 1 is not prime.' },
      { id: 'loop', type: 'decision', label: 'c ≤ b?', detail: 'Outer loop walks every candidate.' },
      { id: 'body', type: 'process', label: 'Test divisibility of c', detail: 'Inner loop tries divisors up to √c.' },
      { id: 'found', type: 'decision', label: 'c is prime?', detail: 'If no divisor was found, c joins the output list.' },
      { id: 'collect', type: 'process', label: 'Append c to primes', detail: 'Store the confirmed prime.' },
      { id: 'cnext', type: 'process', label: 'c = c + 1', detail: 'Next candidate.' },
      { id: 'output', type: 'output', label: 'Display prime list', detail: 'All primes found in the range.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'init', label: 'Yes' }, { from: 'init', to: 'loop' },
      { from: 'loop', to: 'body', label: 'Yes' }, { from: 'body', to: 'found' },
      { from: 'found', to: 'collect', label: 'Yes' }, { from: 'collect', to: 'cnext' },
      { from: 'found', to: 'cnext', label: 'No' }, { from: 'cnext', to: 'loop' },
      { from: 'loop', to: 'output', label: 'No' }, { from: 'output', to: 'end' },
    ],
    validate: v => {
      const a = Math.ceil(v.a), b = Math.floor(v.b);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return 'Range bounds must be numbers.';
      if (b < 2) return 'No primes exist below 2.';
      const lo = Math.max(2, a);
      if (lo > b) return 'Range is empty.';
      if (b - lo > 1000) return 'Keep the range within 1000 numbers.';
      return null;
    },
    solve: (v) => {
      const a = Math.max(2, Math.ceil(v.a)), b = Math.floor(v.b);
      const t: TraceStep[] = [];
      t.push({ nodeId: 'init', text: `c starts at ${a}`, tone: 'info', vars: { a, b } });
      const primes: number[] = [];
      let traced = 0;
      for (let c = a; c <= b; c++) {
        let isP = true;
        for (let i = 2; i * i <= c; i++) if (c % i === 0) { isP = false; break; }
        if (traced < 24) {
          t.push({ nodeId: 'found', text: isP ? `${c} is prime → collected` : `${c} is composite`, tone: 'decision', decision: { question: 'c is prime?', result: isP ? 'Yes' : 'No' }, vars: { c, collected: primes.length + (isP ? 1 : 0) } });
        }
        if (isP) primes.push(c);
        traced++;
      }
      t.push({ nodeId: 'loop', text: `c exceeded ${b} → stop`, tone: 'decision', decision: { question: 'c ≤ b?', result: 'No' }, vars: { found: primes.length } });
      const listText = primes.length <= 60 ? primes.join(', ') : primes.slice(0, 60).join(', ') + ` … (+${primes.length - 60} more)`;
      return { steps: t, output: `Found ${primes.length} prime(s): ${listText}`, value: primes.length };
    },
    algorithm: ['Start.', 'Read range a, b and validate it.', 'Set c = max(2, a).', 'For each c ≤ b, test divisors up to √c.', 'If none divide c, collect c.', 'c = c + 1, repeat.', 'Display the collected primes.', 'End.'],
    workedExample: {
      title: 'Primes between 10 and 30',
      steps: ['Test 11, 13, 17, 19, 23, 29 (the rest are composite)', 'Every composite has a divisor ≤ its square root'],
      result: '11, 13, 17, 19, 23, 29',
    },
    challenge: { mode: 'numeric', question: 'How many primes lie between 1 and 30 (inclusive)?', answer: '10', tolerance: 0, explanation: '2, 3, 5, 7, 11, 13, 17, 19, 23, 29 — ten primes.' },
    related: ['prime-number-checker', 'greatest-common-divisor', 'arithmetic-sequence'],
  }),

  loopExperience({
    slug: 'even-or-odd-checker',
    title: 'Even or Odd Checker',
    category: 'mathematics', difficulty: 'Beginner', duration: 8,
    description: 'Parity in one operation — the mod operator in action.',
    keywords: ['even', 'odd', 'parity', 'mod', 'modulo', 'remainder'],
    concept: [
      'Every integer is either divisible by 2 (even) or leaves remainder 1 (odd). That single bit of information — parity — drives load balancing, checksums and alternating row stripes.',
      'In most languages the test is “n % 2 == 0”. Negative numbers are handled with the absolute value.',
    ],
    formula: 'n is even ⟺ n mod 2 = 0',
    variables: [
      { symbol: 'n', meaning: 'The integer to inspect', unit: '—' },
      { symbol: 'r', meaning: 'n mod 2', unit: '—' },
    ],
    assumptions: ['n must be a whole number.', 'Parity works for negatives using |n|.'],
    inputDefs: [{ id: 'n', label: 'Integer n', type: 'number', default: '42' }],
    inputLabel: 'Read n', validateLabel: 'n is a whole number?', outputLabel: 'Display parity',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the parity test.' },
      { id: 'input', type: 'input', label: 'Read n', detail: 'The integer to classify.' },
      { id: 'validate', type: 'decision', label: 'n is a whole number?', detail: 'Parity is only defined for integers.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'compute', type: 'process', label: 'r = |n| mod 2', detail: 'One remainder operation.' },
      { id: 'parity', type: 'decision', label: 'r = 0?', detail: 'Remainder zero → even; otherwise odd.' },
      { id: 'even', type: 'output', label: 'Display: Even', detail: 'n divides by 2 exactly.' },
      { id: 'odd', type: 'output', label: 'Display: Odd', detail: 'n leaves remainder 1.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'compute', label: 'Yes' }, { from: 'compute', to: 'parity' },
      { from: 'parity', to: 'even', label: 'Yes' }, { from: 'even', to: 'end' },
      { from: 'parity', to: 'odd', label: 'No' }, { from: 'odd', to: 'end' },
    ],
    validate: v => (Number.isFinite(v.n) && isInt(v.n) ? null : 'Enter a whole number (no decimals).'),
    solve: (v) => {
      const n = Math.trunc(v.n);
      const r = Math.abs(n) % 2;
      const t: TraceStep[] = [
        { nodeId: 'compute', text: `r = |${n}| mod 2 = ${r}`, tone: 'info', vars: { r } },
        { nodeId: 'parity', text: r === 0 ? 'r = 0 → even' : 'r = 1 → odd', tone: 'decision', decision: { question: 'r = 0?', result: r === 0 ? 'Yes' : 'No' } },
      ];
      const out = r === 0 ? 'even' : 'odd';
      t.push({ nodeId: r === 0 ? 'even' : 'odd', text: `${n} is ${out}`, tone: 'output' });
      return { steps: t, output: `${n} is ${out}`, value: r === 0 ? 1 : 0 };
    },
    algorithm: ['Start.', 'Read n.', 'Check n is a whole number.', 'r = |n| mod 2.', 'If r = 0 → even, else odd.', 'End.'],
    workedExample: {
      title: 'Is 57 even or odd?',
      steps: ['r = 57 mod 2', '57 = 2 × 28 + 1', 'r = 1 → odd'],
      result: '57 is odd',
    },
    challenge: { mode: 'choice', question: 'Which of these is even?', options: ['101', '203', '348', '999'], answer: '348', explanation: '348 ÷ 2 = 174 exactly. The others leave remainder 1.' },
    related: ['greatest-common-divisor', 'prime-number-checker', 'factorial-calculator'],
  }),

  loopExperience({
    slug: 'factorial-calculator',
    title: 'Factorial Calculator',
    category: 'mathematics', difficulty: 'Beginner', duration: 12,
    description: 'n! = 1 × 2 × 3 × … × n — a loop that multiplies its way up.',
    keywords: ['factorial', 'n!', 'permutation', 'loop', 'product', 'combinatorics'],
    concept: [
      'The factorial counts how many ways you can arrange n distinct objects: 3 books can be ordered 3 × 2 × 1 = 6 ways. It grows ferociously — 20! ≈ 2.4 × 10¹⁸.',
      'Factorials power permutations, combinations, series expansions and probability. The algorithm is a single accumulating loop — the perfect first loop to trace.',
    ],
    formula: 'n! = n × (n−1) × … × 2 × 1,   0! = 1',
    variables: [
      { symbol: 'n', meaning: 'The non-negative integer', unit: '—' },
      { symbol: 'result', meaning: 'Accumulating product', unit: '—' },
      { symbol: 'i', meaning: 'Loop counter', unit: '—' },
    ],
    assumptions: ['n is an integer between 0 and 170 (beyond that, double precision overflows).', '0! = 1 by definition — an empty product.'],
    inputDefs: [{ id: 'n', label: 'Integer n', type: 'number', default: '6' }],
    inputLabel: 'Read n', validateLabel: '0 ≤ n ≤ 170?', outputLabel: 'Display n!',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the factorial loop.' },
      { id: 'input', type: 'input', label: 'Read n', detail: 'The upper bound of the product.' },
      { id: 'validate', type: 'decision', label: '0 ≤ n ≤ 170?', detail: 'Factorial is defined for non-negative integers; 170 is the largest n before double-precision overflow.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'init', type: 'process', label: 'result = 1, i = 1', detail: '1 is the multiplicative identity — the empty product.' },
      { id: 'loop', type: 'decision', label: 'i ≤ n?', detail: 'Keep multiplying until i passes n.' },
      { id: 'body', type: 'process', label: 'result = result × i, i = i + 1', detail: 'Accumulate the product, advance the counter.' },
      { id: 'output', type: 'output', label: 'Display result', detail: 'n!.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'init', label: 'Yes' }, { from: 'init', to: 'loop' },
      { from: 'loop', to: 'body', label: 'Yes' }, { from: 'body', to: 'loop' },
      { from: 'loop', to: 'output', label: 'No' }, { from: 'output', to: 'end' },
    ],
    validate: v => (Number.isFinite(v.n) && isInt(v.n) && v.n >= 0 && v.n <= 170 ? null : 'Enter a whole number between 0 and 170.'),
    solve: (v) => {
      const n = Math.trunc(v.n);
      const t: TraceStep[] = [];
      t.push({ nodeId: 'init', text: 'result = 1, i = 1', tone: 'info', vars: { result: 1, i: 1 } });
      let result = 1;
      const limit = Math.min(n, 14);
      for (let i = 1; i <= n; i++) {
        const prev = result;
        result *= i;
        if (i <= limit) t.push({ nodeId: 'body', text: `result = ${fmt(prev)} × ${i} = ${fmt(result)}`, tone: 'info', vars: { result: fmt(result), i } });
        else if (i === limit + 1) t.push({ nodeId: 'body', text: '… continuing the loop (trace condensed) …', tone: 'info' });
      }
      t.push({ nodeId: 'loop', text: 'i > n → loop ends', tone: 'decision', decision: { question: 'i ≤ n?', result: 'No' }, vars: { result: fmt(result) } });
      return { steps: t, output: `${n}! = ${fmt(result)}`, value: result };
    },
    algorithm: ['Start.', 'Read n and validate 0 ≤ n ≤ 170.', 'result = 1, i = 1.', 'While i ≤ n: result = result × i; i = i + 1.', 'Display result.', 'End.'],
    workedExample: {
      title: 'Compute 5!',
      steps: ['result = 1', '×1 → 1, ×2 → 2, ×3 → 6, ×4 → 24, ×5 → 120', '5! = 120'],
      result: '120',
    },
    challenge: { mode: 'numeric', question: 'What is 7! (7 factorial)?', answer: '5040', tolerance: 0, explanation: '7! = 1×2×3×4×5×6×7 = 5040.' },
    related: ['fibonacci-sequence', 'arithmetic-sequence', 'prime-number-checker'],
  }),

  loopExperience({
    slug: 'fibonacci-sequence',
    title: 'Fibonacci Sequence Generator',
    category: 'mathematics', difficulty: 'Beginner', duration: 12, featured: true,
    description: '0, 1, 1, 2, 3, 5, 8… — the most famous recurrence in mathematics.',
    keywords: ['fibonacci', 'sequence', 'golden', 'ratio', 'recursion', 'series'],
    concept: [
      'Each Fibonacci number is the sum of the two before it. Starting from 0 and 1: 0, 1, 1, 2, 3, 5, 8, 13…',
      'The sequence shows up in sunflower spirals and pinecones, and the ratio of consecutive terms approaches φ ≈ 1.618, the golden ratio. The iterative algorithm uses just two variables.',
    ],
    formula: 'F₀ = 0, F₁ = 1,  Fn = Fₙ₋₁ + Fₙ₋₂',
    variables: [
      { symbol: 'Fₙ', meaning: 'The n-th Fibonacci number', unit: '—' },
      { symbol: 'a, b', meaning: 'The two running terms', unit: '—' },
      { symbol: 'n', meaning: 'How many terms to generate', unit: '—' },
    ],
    assumptions: ['n between 1 and 45 (F₄₅ ≈ 1.13 billion, still exact in doubles).', 'Iterative algorithm — O(n) time, O(1) extra memory.'],
    inputDefs: [{ id: 'n', label: 'Number of terms', type: 'number', default: '10' }],
    inputLabel: 'Read n', validateLabel: '1 ≤ n ≤ 45?', outputLabel: 'Display sequence',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the Fibonacci generator.' },
      { id: 'input', type: 'input', label: 'Read n', detail: 'How many terms to produce.' },
      { id: 'validate', type: 'decision', label: '1 ≤ n ≤ 45?', detail: 'Kept small so every term fits exactly in double precision.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'init', type: 'process', label: 'a = 0, b = 1, i = 0', detail: 'Seed the recurrence with F₀ and F₁.' },
      { id: 'loop', type: 'decision', label: 'i < n?', detail: 'Produce exactly n terms.' },
      { id: 'body', type: 'process', label: 'output a; next = a + b; a = b; b = next', detail: 'Shift the window one step forward.' },
      { id: 'output', type: 'output', label: 'Display sequence', detail: 'The n Fibonacci numbers.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'init', label: 'Yes' }, { from: 'init', to: 'loop' },
      { from: 'loop', to: 'body', label: 'Yes' }, { from: 'body', to: 'loop' },
      { from: 'loop', to: 'output', label: 'No' }, { from: 'output', to: 'end' },
    ],
    validate: v => (Number.isFinite(v.n) && isInt(v.n) && v.n >= 1 && v.n <= 45 ? null : 'Enter a whole number between 1 and 45.'),
    solve: (v) => {
      const n = Math.trunc(v.n);
      const t: TraceStep[] = [];
      let a = 0, b = 1;
      const out: number[] = [];
      const limit = Math.min(n, 15);
      t.push({ nodeId: 'init', text: 'a = 0, b = 1, i = 0', tone: 'info', vars: { a, b } });
      for (let i = 0; i < n; i++) {
        out.push(a);
        const next = a + b;
        if (i < limit) t.push({ nodeId: 'body', text: `emit ${a}; next = ${a} + ${b} = ${next}`, tone: 'info', vars: { a: next, b, emitted: out.length } });
        else if (i === limit) t.push({ nodeId: 'body', text: '… continuing (trace condensed) …', tone: 'info' });
        a = b; b = next;
      }
      t.push({ nodeId: 'loop', text: `i = n = ${n} → stop`, tone: 'decision', decision: { question: 'i < n?', result: 'No' } });
      return { steps: t, output: `Sequence: ${out.join(', ')}`, value: out[out.length - 1] };
    },
    algorithm: ['Start.', 'Read n (1–45).', 'a = 0, b = 1.', 'Repeat n times: emit a; next = a + b; shift.', 'Display the emitted sequence.', 'End.'],
    workedExample: {
      title: 'First 8 Fibonacci numbers',
      steps: ['Start 0, 1', 'Then 1, 2, 3, 5, 8, 13', 'Sequence: 0, 1, 1, 2, 3, 5, 8, 13'],
      result: '0, 1, 1, 2, 3, 5, 8, 13',
    },
    challenge: { mode: 'numeric', question: 'What is the 10th Fibonacci number? (Counting F₁ = 1, F₂ = 1)', answer: '55', tolerance: 0, explanation: 'The sequence 1,1,2,3,5,8,13,21,34,55 — the 10th term is 55.' },
    related: ['arithmetic-sequence', 'geometric-sequence', 'factorial-calculator'],
  }),

  loopExperience({
    slug: 'linear-equation',
    title: 'Linear Equation Solver',
    category: 'mathematics', difficulty: 'Intermediate', duration: 14,
    description: 'Solve ax + b = 0 — including the degenerate cases a = 0.',
    keywords: ['linear', 'equation', 'solve', 'ax + b = 0', 'root', 'x'],
    concept: [
      'A linear equation ax + b = 0 has exactly one solution when a ≠ 0: x = −b/a. Its graph is a straight line crossing the x-axis once.',
      'Degenerate cases matter. If a = 0 and b = 0, every number works (infinite solutions). If a = 0 and b ≠ 0, nothing works (no solution). A complete solver must handle all three.',
    ],
    formula: 'x = −b / a   (a ≠ 0);   a = 0 ∧ b = 0 → all x;   a = 0 ∧ b ≠ 0 → no solution',
    variables: [
      { symbol: 'a', meaning: 'Coefficient of x', unit: '—' },
      { symbol: 'b', meaning: 'Constant term', unit: '—' },
      { symbol: 'x', meaning: 'The solution', unit: '—' },
    ],
    assumptions: ['a and b are finite real numbers.', 'Compare a to zero with the exact value entered — be cautious with near-zero coefficients.'],
    inputDefs: [
      { id: 'a', label: 'Coefficient a', type: 'number', default: '3' },
      { id: 'b', label: 'Constant b', type: 'number', default: '-9' },
    ],
    inputLabel: 'Read a, b', validateLabel: 'a, b are finite numbers?', outputLabel: 'Display solution',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the linear solver.' },
      { id: 'input', type: 'input', label: 'Read a, b', detail: 'Coefficient and constant.' },
      { id: 'validate', type: 'decision', label: 'a, b finite?', detail: 'Rejects empty or non-numeric input.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'aEq0', type: 'decision', label: 'a = 0?', detail: 'The leading coefficient decides the case.' },
      { id: 'linOut', type: 'output', label: 'Display: x = −b ÷ a', detail: 'The unique solution.' },
      { id: 'bZero', type: 'decision', label: 'b = 0?', detail: 'Separates the two degenerate cases.' },
      { id: 'infinite', type: 'output', label: 'Display: all real numbers', detail: '0·x + 0 = 0 is true for every x.' },
      { id: 'nosol', type: 'output', label: 'Display: no solution', detail: '0·x + b = 0 with b ≠ 0 is impossible.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'aEq0', label: 'Yes' },
      { from: 'aEq0', to: 'linOut', label: 'No' }, { from: 'linOut', to: 'end' },
      { from: 'aEq0', to: 'bZero', label: 'Yes' },
      { from: 'bZero', to: 'infinite', label: 'Yes' }, { from: 'infinite', to: 'end' },
      { from: 'bZero', to: 'nosol', label: 'No' }, { from: 'nosol', to: 'end' },
    ],
    validate: (v, raw) => (isNum(raw.a ?? '') && isNum(raw.b ?? '') ? null : 'Both a and b must be numbers.'),
    solve: (v) => {
      const t: TraceStep[] = [];
      t.push({ nodeId: 'aEq0', text: v.a === 0 ? 'a = 0 → degenerate case' : `a = ${fmt(v.a)} ≠ 0 → unique solution`, tone: 'decision', decision: { question: 'a = 0?', result: v.a === 0 ? 'Yes' : 'No' } });
      if (v.a === 0) {
        t.push({ nodeId: 'bZero', text: v.b === 0 ? 'b = 0 → every real number satisfies 0 = 0' : `b = ${fmt(v.b)} ≠ 0 → impossible`, tone: 'decision', decision: { question: 'b = 0?', result: v.b === 0 ? 'Yes' : 'No' } });
        const node = v.b === 0 ? 'infinite' : 'nosol';
        const msg = v.b === 0 ? 'Infinite solutions (all real numbers)' : 'No solution';
        t.push({ nodeId: node, text: msg, tone: 'output' });
        return { steps: t, output: msg, value: NaN };
      }
      const x = -v.b / v.a;
      t.push({ nodeId: 'linOut', text: `x = −(${fmt(v.b)}) ÷ ${fmt(v.a)} = ${fmt(x)}`, tone: 'output', vars: { x: fmt(x) } });
      return { steps: t, output: `x = ${fmt(x)}`, value: x };
    },
    algorithm: ['Start.', 'Read a and b.', 'Check both are finite numbers.', 'If a ≠ 0: x = −b / a.', 'If a = 0 and b = 0: infinite solutions.', 'If a = 0 and b ≠ 0: no solution.', 'End.'],
    workedExample: {
      title: 'Solve 3x − 9 = 0',
      steps: ['a = 3, b = −9', 'x = −b ÷ a = 9 ÷ 3', 'x = 3'],
      result: 'x = 3',
    },
    challenge: { mode: 'numeric', question: 'Solve 5x + 20 = 0. What is x?', answer: '-4', tolerance: 0.001, explanation: 'x = −20 ÷ 5 = −4.' },
    related: ['quadratic-equation', 'basic-arithmetic', 'pythagorean-theorem'],
  }),

  loopExperience({
    slug: 'quadratic-equation',
    title: 'Quadratic Equation Solver',
    category: 'mathematics', difficulty: 'Advanced', duration: 18, featured: true,
    description: 'Solve ax² + bx + c = 0 via the discriminant — two roots, one root, or none.',
    keywords: ['quadratic', 'equation', 'discriminant', 'roots', 'parabola'],
    concept: [
      'A quadratic equation describes any parabola. Its roots — where it crosses the x-axis — come from x = (−b ± √D) / 2a, where D = b² − 4ac is the discriminant.',
      'The discriminant decides everything before you compute: D > 0 gives two real roots, D = 0 one repeated root, D < 0 a conjugate pair of complex roots.',
    ],
    formula: 'x = (−b ± √(b² − 4ac)) / 2a',
    variables: [
      { symbol: 'a, b, c', meaning: 'Coefficients of the quadratic', unit: '—' },
      { symbol: 'D', meaning: 'Discriminant b² − 4ac', unit: '—' },
      { symbol: 'x₁, x₂', meaning: 'The two roots', unit: '—' },
    ],
    assumptions: ['a ≠ 0 for a true quadratic (a = 0 falls back to the linear case).', 'Complex roots are shown in a ± bi form.', 'Double precision — very large coefficients lose accuracy.'],
    inputDefs: [
      { id: 'a', label: 'Coefficient a', type: 'number', default: '1' },
      { id: 'b', label: 'Coefficient b', type: 'number', default: '-5' },
      { id: 'c', label: 'Coefficient c', type: 'number', default: '6' },
    ],
    inputLabel: 'Read a, b, c', validateLabel: 'a, b, c finite?', outputLabel: 'Display roots',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the quadratic solver.' },
      { id: 'input', type: 'input', label: 'Read a, b, c', detail: 'Coefficients.' },
      { id: 'validate', type: 'decision', label: 'a, b, c finite?', detail: 'Rejects empty or non-numeric fields.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'aEq0', type: 'decision', label: 'a = 0?', detail: 'With a = 0 the equation is linear: solve b x + c = 0.' },
      { id: 'lin', type: 'process', label: 'x = −c ÷ b', detail: 'Linear fallback path.' },
      { id: 'discr', type: 'process', label: 'D = b² − 4ac', detail: 'The discriminant classifies the roots.' },
      { id: 'dneg', type: 'decision', label: 'D < 0?', detail: 'Negative discriminant → no real roots.' },
      { id: 'complexOut', type: 'output', label: 'Display complex roots', detail: 'Two complex conjugate roots a ± bi.' },
      { id: 'dzero', type: 'decision', label: 'D = 0?', detail: 'Zero discriminant → one repeated root.' },
      { id: 'oneroot', type: 'output', label: 'Display x = −b ÷ 2a', detail: 'Repeated root at the vertex.' },
      { id: 'tworoot', type: 'output', label: 'Display x₁, x₂', detail: 'The two real roots.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'aEq0', label: 'Yes' },
      { from: 'aEq0', to: 'lin', label: 'Yes' }, { from: 'lin', to: 'end' },
      { from: 'aEq0', to: 'discr', label: 'No' }, { from: 'discr', to: 'dneg' },
      { from: 'dneg', to: 'complexOut', label: 'Yes' }, { from: 'complexOut', to: 'end' },
      { from: 'dneg', to: 'dzero', label: 'No' },
      { from: 'dzero', to: 'oneroot', label: 'Yes' }, { from: 'oneroot', to: 'end' },
      { from: 'dzero', to: 'tworoot', label: 'No' }, { from: 'tworoot', to: 'end' },
    ],
    validate: (_v, raw) => (isNum(raw.a ?? '') && isNum(raw.b ?? '') && isNum(raw.c ?? '') ? null : 'a, b and c must all be numbers.'),
    solve: (v) => {
      const { a, b, c } = v;
      const t: TraceStep[] = [];
      t.push({ nodeId: 'aEq0', text: a === 0 ? 'a = 0 → linear case' : `a = ${fmt(a)} ≠ 0 → quadratic`, tone: 'decision', decision: { question: 'a = 0?', result: a === 0 ? 'Yes' : 'No' } });
      if (a === 0) {
        if (b === 0) {
          const msg = c === 0 ? 'Infinite solutions' : 'No solution';
          t.push({ nodeId: 'lin', text: msg, tone: 'err' });
          return { steps: t, output: msg, value: NaN };
        }
        const x = -c / b;
        t.push({ nodeId: 'lin', text: `x = −(${fmt(c)}) ÷ ${fmt(b)} = ${fmt(x)}`, tone: 'info', vars: { x: fmt(x) } });
        return { steps: t, output: `Linear case: x = ${fmt(x)}`, value: x };
      }
      const D = b * b - 4 * a * c;
      t.push({ nodeId: 'discr', text: `D = ${fmt(b)}² − 4 × ${fmt(a)} × ${fmt(c)} = ${fmt(D)}`, tone: 'info', vars: { D: fmt(D) } });
      t.push({ nodeId: 'dneg', text: D < 0 ? `D = ${fmt(D)} < 0 → two complex roots` : 'D ≥ 0 → real roots', tone: 'decision', decision: { question: 'D < 0?', result: D < 0 ? 'Yes' : 'No' } });
      if (D < 0) {
        const re = -b / (2 * a), im = Math.sqrt(-D) / (2 * a);
        const msg = `x = ${fmt(re)} ± ${fmt(im)}i  (complex conjugates)`;
        t.push({ nodeId: 'complexOut', text: msg, tone: 'output', vars: { re: fmt(re), im: fmt(im) } });
        return { steps: t, output: msg, value: re };
      }
      t.push({ nodeId: 'dzero', text: D === 0 ? 'D = 0 → one repeated root' : 'D > 0 → two distinct roots', tone: 'decision', decision: { question: 'D = 0?', result: D === 0 ? 'Yes' : 'No' } });
      if (D === 0) {
        const x = -b / (2 * a);
        t.push({ nodeId: 'oneroot', text: `x = −(${fmt(b)}) ÷ (2 × ${fmt(a)}) = ${fmt(x)}`, tone: 'output', vars: { x: fmt(x) } });
        return { steps: t, output: `x = ${fmt(x)} (repeated root)`, value: x };
      }
      const sq = Math.sqrt(D);
      const x1 = (-b + sq) / (2 * a), x2 = (-b - sq) / (2 * a);
      t.push({ nodeId: 'tworoot', text: `√D = ${fmt(sq)};  x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}`, tone: 'output', vars: { x1: fmt(x1), x2: fmt(x2) } });
      return { steps: t, output: `x₁ = ${fmt(x1)},  x₂ = ${fmt(x2)}`, value: x1 };
    },
    algorithm: ['Start.', 'Read a, b, c.', 'Check all finite; if a = 0 solve the linear equation.', 'Compute D = b² − 4ac.', 'D < 0 → complex roots; D = 0 → repeated root; D > 0 → two real roots.', 'Display roots.', 'End.'],
    workedExample: {
      title: 'Solve x² − 5x + 6 = 0',
      steps: ['D = 25 − 24 = 1', 'x = (5 ± 1) ÷ 2', 'x = 3 or x = 2'],
      result: 'x₁ = 3, x₂ = 2',
    },
    challenge: { mode: 'numeric', question: 'For 2x² − 8 = 0, what is the positive root?', answer: '2', tolerance: 0.001, explanation: 'D = 0 + 64 = 64; x = ±8 ÷ 4 → x = 2 or −2.' },
    related: ['linear-equation', 'pythagorean-theorem', 'basic-arithmetic'],
  }),

  formulaExperience({
    slug: 'pythagorean-theorem',
    title: 'Pythagorean Theorem',
    category: 'mathematics', difficulty: 'Beginner', duration: 12, featured: true,
    description: 'The right-triangle identity behind navigation, construction and every distance formula.',
    keywords: ['pythagoras', 'right', 'triangle', 'hypotenuse', 'c = sqrt(a2+b2)'],
    concept: [
      'In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the legs: a² + b² = c². Inverting it: c = √(a² + b²).',
      'It is the distance formula, the screen-collision check in every game, and the rule that lets a surveyor measure across a river with a rope.',
    ],
    formula: 'c = √(a² + b²)',
    variables: [
      { symbol: 'a, b', meaning: 'The two legs (sides forming the right angle)', unit: 'same unit' },
      { symbol: 'c', meaning: 'The hypotenuse (opposite the right angle)', unit: 'same unit' },
    ],
    assumptions: ['a and b are strictly positive lengths.', 'Both legs must form a true right angle.'],
    inputDefs: [
      { id: 'a', label: 'Leg a', type: 'number', default: '3' },
      { id: 'b', label: 'Leg b', type: 'number', default: '4' },
    ],
    inputLabel: 'Read leg a, leg b', validateLabel: 'a > 0 and b > 0?', computeLabel: 'c = √(a² + b²)', outputLabel: 'Display hypotenuse',
    validate: v => (v.a > 0 && v.b > 0 ? null : 'Both legs must be greater than 0.'),
    solve: v => {
      const s = v.a * v.a + v.b * v.b;
      const c = Math.sqrt(s);
      return {
        steps: [
          { text: `a² + b² = ${fmt(v.a)}² + ${fmt(v.b)}² = ${fmt(s)}` },
          { text: `c = √${fmt(s)} = ${fmt(c)}`, vars: { a: v.a, b: v.b, c: fmt(c) } },
        ],
        output: `c = ${fmt(c)}`, value: c,
      };
    },
    workedExample: {
      title: 'Legs 6 and 8',
      steps: ['a² + b² = 36 + 64 = 100', 'c = √100', 'c = 10 (a 6-8-10 Pythagoras triple)'],
      result: 'c = 10',
    },
    challenge: { mode: 'numeric', question: 'Legs 5 and 12 form a right triangle. Hypotenuse?', answer: '13', tolerance: 0.001, explanation: '25 + 144 = 169; √169 = 13.' },
    related: ['distance-between-points', 'circle-calculator', 'triangle-calculator'],
  }),

  formulaExperience({
    slug: 'circle-calculator',
    title: 'Circle Calculator',
    category: 'mathematics', difficulty: 'Beginner', duration: 10,
    description: 'Area, circumference and diameter from a single radius.',
    keywords: ['circle', 'area', 'circumference', 'radius', 'diameter', 'pi'],
    concept: [
      'Every circle shares the same magic ratio π ≈ 3.14159 between its circumference and diameter. One number — the radius — defines the whole curve.',
      'A = πr² is why a 13-inch pizza has far more than twice the area of an 8-inch pizza.',
    ],
    formula: 'A = πr²,   C = 2πr,   d = 2r',
    variables: [
      { symbol: 'r', meaning: 'Radius', unit: 'm, cm…' },
      { symbol: 'd', meaning: 'Diameter', unit: 'same as r' },
      { symbol: 'C', meaning: 'Circumference', unit: 'same as r' },
      { symbol: 'A', meaning: 'Area', unit: 'square of r' },
    ],
    assumptions: ['Radius must be ≥ 0.', 'Uses π ≈ 3.141592653589793.'],
    inputDefs: [{ id: 'r', label: 'Radius', unit: 'units', type: 'number', default: '7' }],
    inputLabel: 'Read radius', validateLabel: 'r ≥ 0?', computeLabel: 'd = 2r, C = 2πr, A = πr²', outputLabel: 'Display circle measures',
    validate: v => (v.r >= 0 ? null : 'Radius cannot be negative.'),
    solve: v => {
      const d = 2 * v.r, C = 2 * Math.PI * v.r, A = Math.PI * v.r * v.r;
      return {
        steps: [
          { text: `d = 2r = ${fmt(d)}` },
          { text: `C = 2πr ≈ 6.28319 × ${fmt(v.r)} = ${fmt(C, 7)}` },
          { text: `A = πr² ≈ 3.14159 × ${fmt(v.r * v.r)} = ${fmt(A, 7)}`, vars: { d: fmt(d), C: fmt(C, 7), A: fmt(A, 7) } },
        ],
        output: `d = ${fmt(d)},  C ≈ ${fmt(C, 7)},  A ≈ ${fmt(A, 7)} square units`, value: A,
      };
    },
    workedExample: {
      title: 'Radius 7 cm',
      steps: ['d = 14 cm', 'C = 2π × 7 ≈ 43.98 cm', 'A = π × 49 ≈ 153.94 cm²'],
      result: 'A ≈ 153.94 cm²',
    },
    challenge: { mode: 'numeric', question: 'What is the area of a circle with radius 10? (Use π ≈ 3.14159)', answer: '314.159', unit: 'square units', tolerance: 0.01, explanation: 'A = π × 100 ≈ 314.159.' },
    related: ['rectangle-calculator', 'pythagorean-theorem', 'triangle-calculator'],
  }),

  formulaExperience({
    slug: 'rectangle-calculator',
    title: 'Rectangle Calculator',
    category: 'mathematics', difficulty: 'Beginner', duration: 8,
    description: 'Area and perimeter of the most common shape in the built world.',
    keywords: ['rectangle', 'area', 'perimeter', 'length', 'width'],
    concept: [
      'A rectangle is the workhorse of geometry — rooms, screens, football pitches, pixels. Its area is length × width; its perimeter is twice the sum of both sides.',
      'When one side is unknown, the perimeter formula inverts easily: width = P/2 − length.',
    ],
    formula: 'A = l × w,   P = 2(l + w)',
    variables: [
      { symbol: 'l', meaning: 'Length', unit: 'units' },
      { symbol: 'w', meaning: 'Width', unit: 'units' },
      { symbol: 'A', meaning: 'Area', unit: 'square units' },
      { symbol: 'P', meaning: 'Perimeter', unit: 'units' },
    ],
    assumptions: ['Length and width are strictly positive.'],
    inputDefs: [
      { id: 'l', label: 'Length', unit: 'units', type: 'number', default: '12' },
      { id: 'w', label: 'Width', unit: 'units', type: 'number', default: '8' },
    ],
    inputLabel: 'Read length, width', validateLabel: 'l > 0 and w > 0?', computeLabel: 'A = l × w,  P = 2(l + w)', outputLabel: 'Display area & perimeter',
    validate: v => (v.l > 0 && v.w > 0 ? null : 'Length and width must be greater than 0.'),
    solve: v => {
      const A = v.l * v.w, P = 2 * (v.l + v.w);
      return {
        steps: [
          { text: `A = ${fmt(v.l)} × ${fmt(v.w)} = ${fmt(A)}` },
          { text: `P = 2 × (${fmt(v.l)} + ${fmt(v.w)}) = ${fmt(P)}`, vars: { A: fmt(A), P: fmt(P) } },
        ],
        output: `A = ${fmt(A)} square units,  P = ${fmt(P)} units`, value: A,
      };
    },
    workedExample: {
      title: 'A 5 m by 3 m room',
      steps: ['A = 5 × 3 = 15 m²', 'P = 2 × (5 + 3) = 16 m'],
      result: 'Area 15 m², perimeter 16 m',
    },
    challenge: { mode: 'numeric', question: 'A rectangle is 15 by 9. What is its area?', answer: '135', unit: 'square units', tolerance: 0.001, explanation: 'A = 15 × 9 = 135.' },
    related: ['circle-calculator', 'triangle-calculator', 'basic-arithmetic'],
  }),

  formulaExperience({
    slug: 'triangle-calculator',
    title: 'Triangle Calculator',
    category: 'mathematics', difficulty: 'Beginner', duration: 10,
    description: 'Area from base and height — half of a rectangle, always.',
    keywords: ['triangle', 'area', 'base', 'height', 'half'],
    concept: [
      'Any triangle is exactly half of a rectangle sharing its base and height. That is the whole reason A = ½ b h.',
      'The height must be perpendicular to the chosen base. For slanted heights, drop a perpendicular from the apex to the base line first.',
    ],
    formula: 'A = ½ × b × h',
    variables: [
      { symbol: 'b', meaning: 'Base', unit: 'units' },
      { symbol: 'h', meaning: 'Height (perpendicular to base)', unit: 'units' },
      { symbol: 'A', meaning: 'Area', unit: 'square units' },
    ],
    assumptions: ['Base and height are strictly positive.', 'Height is perpendicular to the chosen base.'],
    inputDefs: [
      { id: 'b', label: 'Base', unit: 'units', type: 'number', default: '10' },
      { id: 'h', label: 'Height', unit: 'units', type: 'number', default: '6' },
    ],
    inputLabel: 'Read base, height', validateLabel: 'b > 0 and h > 0?', computeLabel: 'A = ½ × b × h', outputLabel: 'Display area',
    validate: v => (v.b > 0 && v.h > 0 ? null : 'Base and height must be greater than 0.'),
    solve: v => {
      const A = 0.5 * v.b * v.h;
      return {
        steps: [
          { text: `A = ½ × ${fmt(v.b)} × ${fmt(v.h)}`, vars: { b: v.b, h: v.h, A: fmt(A) } },
        ],
        output: `A = ${fmt(A)} square units`, value: A,
      };
    },
    workedExample: {
      title: 'Base 10 cm, height 6 cm',
      steps: ['A = ½ × 10 × 6', 'A = 30 cm²'],
      result: 'Area = 30 cm²',
    },
    challenge: { mode: 'numeric', question: 'A triangle has base 14 and height 9. Its area?', answer: '63', unit: 'square units', tolerance: 0.001, explanation: 'A = ½ × 14 × 9 = 63.' },
    related: ['pythagorean-theorem', 'rectangle-calculator', 'circle-calculator'],
  }),

  formulaExperience({
    slug: 'distance-between-points',
    title: 'Distance Between Two Points',
    category: 'mathematics', difficulty: 'Beginner', duration: 10,
    description: 'The Euclidean distance formula — Pythagoras applied to a coordinate plane.',
    keywords: ['distance', 'points', 'coordinate', 'euclidean', 'geometry'],
    concept: [
      'On a coordinate plane, two points form a right triangle with legs |x₂−x₁| and |y₂−y₁|. The distance is the hypotenuse: √((x₂−x₁)² + (y₂−y₁)²).',
      'This single formula powers GPS proximity checks, collision detection and k-nearest-neighbours machine learning.',
    ],
    formula: 'd = √((x₂ − x₁)² + (y₂ − y₁)²)',
    variables: [
      { symbol: '(x₁, y₁)', meaning: 'First point', unit: '—' },
      { symbol: '(x₂, y₂)', meaning: 'Second point', unit: '—' },
      { symbol: 'd', meaning: 'Euclidean distance', unit: 'same unit as coordinates' },
    ],
    assumptions: ['Any finite real coordinates.', 'Euclidean (flat) geometry — not for long distances on a globe.'],
    inputDefs: [
      { id: 'x1', label: 'x₁', type: 'number', default: '1' },
      { id: 'y1', label: 'y₁', type: 'number', default: '2' },
      { id: 'x2', label: 'x₂', type: 'number', default: '4' },
      { id: 'y2', label: 'y₂', type: 'number', default: '6' },
    ],
    inputLabel: 'Read x₁, y₁, x₂, y₂', validateLabel: 'all finite?', computeLabel: 'd = √((x₂−x₁)² + (y₂−y₁)²)', outputLabel: 'Display distance',
    solve: v => {
      const dx = v.x2 - v.x1, dy = v.y2 - v.y1;
      const d = Math.hypot(dx, dy);
      return {
        steps: [
          { text: `Δx = ${fmt(dx)},  Δy = ${fmt(dy)}` },
          { text: `d = √(${fmt(dx)}² + ${fmt(dy)}²) = √${fmt(dx * dx + dy * dy)}` },
          { text: `d = ${fmt(d)}`, vars: { dx: fmt(dx), dy: fmt(dy), d: fmt(d) } },
        ],
        output: `d = ${fmt(d)}`, value: d,
      };
    },
    workedExample: {
      title: 'Distance from (1, 2) to (4, 6)',
      steps: ['Δx = 3, Δy = 4', 'd = √(9 + 16) = √25', 'd = 5'],
      result: 'd = 5 units',
    },
    challenge: { mode: 'numeric', question: 'Distance between (0, 0) and (6, 8)?', answer: '10', tolerance: 0.001, explanation: '√(36 + 64) = √100 = 10.' },
    related: ['pythagorean-theorem', 'circle-calculator', 'arithmetic-sequence'],
  }),

  loopExperience({
    slug: 'arithmetic-sequence',
    title: 'Arithmetic Sequence',
    category: 'mathematics', difficulty: 'Beginner', duration: 12,
    description: 'Add the same step every time — the predictable pattern.',
    keywords: ['arithmetic', 'sequence', 'common', 'difference', 'series', 'progression'],
    concept: [
      'An arithmetic sequence marches forward with a constant step: 3, 7, 11, 15… with common difference 4. Every term is the first term plus n steps.',
      'Savings plans, staircases and seating rows are arithmetic sequences. The n-th term and the sum have closed forms — but the loop teaches you why they work.',
    ],
    formula: 'aₙ = a₁ + (n − 1)d,   Sₙ = n(a₁ + aₙ) / 2',
    variables: [
      { symbol: 'a₁', meaning: 'First term', unit: '—' },
      { symbol: 'd', meaning: 'Common difference', unit: '—' },
      { symbol: 'n', meaning: 'Number of terms', unit: '—' },
      { symbol: 'Sₙ', meaning: 'Sum of the first n terms', unit: '—' },
    ],
    assumptions: ['n between 1 and 30 for a readable trace.', 'd may be negative (counts down).'],
    inputDefs: [
      { id: 'a1', label: 'First term a₁', type: 'number', default: '3' },
      { id: 'd', label: 'Common difference d', type: 'number', default: '4' },
      { id: 'n', label: 'Number of terms n', type: 'number', default: '6' },
    ],
    inputLabel: 'Read a₁, d, n', validateLabel: '1 ≤ n ≤ 30?', outputLabel: 'Display sequence & sum',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the sequence generator.' },
      { id: 'input', type: 'input', label: 'Read a₁, d, n', detail: 'First term, step and count.' },
      { id: 'validate', type: 'decision', label: '1 ≤ n ≤ 30?', detail: 'Keeps the trace readable.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'init', type: 'process', label: 'term = a₁, sum = 0, i = 1', detail: 'Seed the loop.' },
      { id: 'loop', type: 'decision', label: 'i ≤ n?', detail: 'Produce exactly n terms.' },
      { id: 'body', type: 'process', label: 'emit term; sum += term; term += d; i++', detail: 'Emit, accumulate, step.' },
      { id: 'output', type: 'output', label: 'Display terms & sum', detail: 'The full sequence and its sum.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'init', label: 'Yes' }, { from: 'init', to: 'loop' },
      { from: 'loop', to: 'body', label: 'Yes' }, { from: 'body', to: 'loop' },
      { from: 'loop', to: 'output', label: 'No' }, { from: 'output', to: 'end' },
    ],
    validate: v => (Number.isFinite(v.n) && isInt(v.n) && v.n >= 1 && v.n <= 30 ? null : 'Enter n as a whole number between 1 and 30.'),
    solve: (v) => {
      const n = Math.trunc(v.n), t0 = v.a1, d = v.d;
      const t: TraceStep[] = [];
      const terms: number[] = [];
      let sum = 0, term = t0;
      t.push({ nodeId: 'init', text: `term = ${fmt(t0)}, sum = 0`, tone: 'info', vars: { term: fmt(term), i: 1 } });
      for (let i = 1; i <= n; i++) {
        terms.push(term); sum += term;
        t.push({ nodeId: 'body', text: `term #${i} = ${fmt(term)} (sum = ${fmt(sum)})`, tone: 'info', vars: { term: fmt(term), sum: fmt(sum), i } });
        term += d;
      }
      t.push({ nodeId: 'loop', text: 'i > n → loop ends', tone: 'decision', decision: { question: 'i ≤ n?', result: 'No' } });
      return { steps: t, output: `Terms: ${terms.map(x => fmt(x)).join(', ')}  |  Sum = ${fmt(sum)}`, value: sum };
    },
    algorithm: ['Start.', 'Read a₁, d, n (1–30).', 'term = a₁, sum = 0.', 'Repeat n times: emit term; sum += term; term += d.', 'Display terms and sum.', 'End.'],
    workedExample: {
      title: 'First 5 terms of 3, 7, 11…',
      steps: ['a₁ = 3, d = 4', 'Terms: 3, 7, 11, 15, 19', 'Sum = 3 + 7 + 11 + 15 + 19 = 55'],
      result: 'Sum = 55',
    },
    challenge: { mode: 'numeric', question: 'In the sequence 5, 8, 11, 14…, what is the 10th term?', answer: '32', tolerance: 0.001, explanation: 'a₁₀ = 5 + 9×3 = 32.' },
    related: ['geometric-sequence', 'fibonacci-sequence', 'average-calculator'],
  }),

  loopExperience({
    slug: 'geometric-sequence',
    title: 'Geometric Sequence',
    category: 'mathematics', difficulty: 'Intermediate', duration: 12,
    description: 'Multiply by the same factor repeatedly — exponential growth in action.',
    keywords: ['geometric', 'sequence', 'ratio', 'exponential', 'growth', 'progression'],
    concept: [
      'A geometric sequence multiplies by a fixed ratio each step: 2, 6, 18, 54… with ratio 3. Populations, compound interest and viral sharing all grow geometrically.',
      'The ratio decides the personality: |r| > 1 explosive growth, |r| < 1 decay toward zero, r < 0 sign oscillation.',
    ],
    formula: 'aₙ = a₁ × rⁿ⁻¹,   Sₙ = a₁(rⁿ − 1) / (r − 1)   (r ≠ 1)',
    variables: [
      { symbol: 'a₁', meaning: 'First term', unit: '—' },
      { symbol: 'r', meaning: 'Common ratio', unit: '—' },
      { symbol: 'n', meaning: 'Number of terms', unit: '—' },
      { symbol: 'Sₙ', meaning: 'Sum of the first n terms', unit: '—' },
    ],
    assumptions: ['n between 1 and 20 to avoid astronomical numbers.', 'r may be any real number; r = 1 gives a constant sequence.'],
    inputDefs: [
      { id: 'a1', label: 'First term a₁', type: 'number', default: '2' },
      { id: 'r', label: 'Common ratio r', type: 'number', default: '3' },
      { id: 'n', label: 'Number of terms n', type: 'number', default: '5' },
    ],
    inputLabel: 'Read a₁, r, n', validateLabel: '1 ≤ n ≤ 20?', outputLabel: 'Display sequence & sum',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', detail: 'Enter the sequence generator.' },
      { id: 'input', type: 'input', label: 'Read a₁, r, n', detail: 'First term, ratio and count.' },
      { id: 'validate', type: 'decision', label: '1 ≤ n ≤ 20?', detail: 'Geometric growth overflows quickly.' },
      { id: 'errout', type: 'output', label: 'Display error', detail: 'Invalid input.' },
      { id: 'init', type: 'process', label: 'term = a₁, sum = 0, i = 1', detail: 'Seed the loop.' },
      { id: 'loop', type: 'decision', label: 'i ≤ n?', detail: 'Produce exactly n terms.' },
      { id: 'body', type: 'process', label: 'emit term; sum += term; term = term × r; i++', detail: 'Emit, accumulate, multiply.' },
      { id: 'output', type: 'output', label: 'Display terms & sum', detail: 'The sequence and its sum.' },
      { id: 'end', type: 'end', label: 'End', detail: 'Done.' },
    ],
    edges: [
      { from: 'start', to: 'input' }, { from: 'input', to: 'validate' },
      { from: 'validate', to: 'errout', label: 'No' }, { from: 'errout', to: 'end' },
      { from: 'validate', to: 'init', label: 'Yes' }, { from: 'init', to: 'loop' },
      { from: 'loop', to: 'body', label: 'Yes' }, { from: 'body', to: 'loop' },
      { from: 'loop', to: 'output', label: 'No' }, { from: 'output', to: 'end' },
    ],
    validate: v => (Number.isFinite(v.n) && isInt(v.n) && v.n >= 1 && v.n <= 20 ? null : 'Enter n as a whole number between 1 and 20.'),
    solve: (v) => {
      const n = Math.trunc(v.n), t0 = v.a1, r = v.r;
      const t: TraceStep[] = [];
      const terms: number[] = [];
      let sum = 0, term = t0;
      t.push({ nodeId: 'init', text: `term = ${fmt(t0)}, sum = 0`, tone: 'info', vars: { term: fmt(term), i: 1 } });
      for (let i = 1; i <= n; i++) {
        terms.push(term); sum += term;
        t.push({ nodeId: 'body', text: `term #${i} = ${fmt(term)} (sum = ${fmt(sum)})`, tone: 'info', vars: { term: fmt(term), sum: fmt(sum), i } });
        term *= r;
      }
      t.push({ nodeId: 'loop', text: 'i > n → loop ends', tone: 'decision', decision: { question: 'i ≤ n?', result: 'No' } });
      return { steps: t, output: `Terms: ${terms.map(x => fmt(x)).join(', ')}  |  Sum = ${fmt(sum)}`, value: sum };
    },
    algorithm: ['Start.', 'Read a₁, r, n (1–20).', 'term = a₁, sum = 0.', 'Repeat n times: emit term; sum += term; term = term × r.', 'Display terms and sum.', 'End.'],
    workedExample: {
      title: 'First 4 terms of 2, 6, 18…',
      steps: ['a₁ = 2, r = 3', 'Terms: 2, 6, 18, 54', 'Sum = 80'],
      result: 'Sum = 80',
    },
    challenge: { mode: 'numeric', question: 'A colony doubles yearly starting from 100 cells. How many after 5 doublings?', answer: '3200', tolerance: 0.001, explanation: '100 × 2⁵ = 100 × 32 = 3200.' },
    related: ['arithmetic-sequence', 'fibonacci-sequence', 'percentage-calculator'],
  }),

  formulaExperience({
    slug: 'number-base-converter',
    title: 'Number Base Converter',
    category: 'mathematics', difficulty: 'Intermediate', duration: 16,
    description: 'Convert between binary, decimal, octal and hexadecimal — see every division step.',
    keywords: ['binary', 'decimal', 'octal', 'hex', 'base', 'hexadecimal', 'conversion', 'bits'],
    concept: [
      'Positional notation: the value of a digit is digit × base^position. In 1011₂ the digits mean 8 + 0 + 2 + 1 = 11₁₀.',
      'Base 16 uses 0–9 then A–F for 10–15. Programmers read memory in hex because one hex digit is exactly four bits.',
    ],
    formula: 'value = Σ dᵢ × baseⁱ',
    variables: [
      { symbol: 'dᵢ', meaning: 'The digit at position i (from the right, starting at 0)', unit: '—' },
      { symbol: 'base', meaning: '2 (binary), 8 (octal), 10 (decimal), 16 (hex)', unit: '—' },
    ],
    assumptions: ['Integer inputs only (negatives convert by sign).', 'Hex digits A–F may be upper or lower case.', 'Safe up to 2⁵³ − 1.'],
    inputDefs: [
      { id: 'number', label: 'Number', type: 'text', default: '255', placeholder: 'e.g. 255 or FF' },
      { id: 'from', label: 'From base', type: 'select', default: '10', options: [
        { value: '2', label: 'Binary (2)' }, { value: '8', label: 'Octal (8)' },
        { value: '10', label: 'Decimal (10)' }, { value: '16', label: 'Hexadecimal (16)' }] },
      { id: 'to', label: 'To base', type: 'select', default: '16', options: [
        { value: '2', label: 'Binary (2)' }, { value: '8', label: 'Octal (8)' },
        { value: '10', label: 'Decimal (10)' }, { value: '16', label: 'Hexadecimal (16)' }] },
    ],
    inputLabel: 'Read number, bases', validateLabel: 'digits valid for source base?', computeLabel: 'Parse → divide → reassemble', outputLabel: 'Display result',
    validate: (_v, raw) => {
      const s = (raw.number ?? '').trim().replace(/^[+-]/, '');
      const from = parseInt(raw.from ?? '10', 10);
      if (!s) return 'Enter a number.';
      const digits = from === 16 ? /^[0-9a-fA-F]+$/ : from === 8 ? /^[0-7]+$/ : from === 2 ? /^[01]+$/ : /^[0-9]+$/;
      if (!digits.test(s)) return `Invalid digits for base ${from}.`;
      if (parseInt(s, from) > Number.MAX_SAFE_INTEGER) return 'Number exceeds the safe integer range (2⁵³ − 1).';
      return null;
    },
    solve: (_v, raw) => {
      const s = (raw.number ?? '').trim();
      const sign = s.startsWith('-') ? -1 : 1;
      const magnitude = s.replace(/^[+-]/, '');
      const from = parseInt(raw.from ?? '10', 10), to = parseInt(raw.to ?? '10', 10);
      const decimal = sign * parseInt(magnitude, from);
      const DIG = '0123456789ABCDEF';
      const stepsOut: { text: string; vars?: Record<string, string | number> }[] = [];
      stepsOut.push({ text: `Parse “${s}” from base ${from} → decimal ${decimal}` });
      if (to === 10) {
        stepsOut.push({ text: `Already decimal → ${decimal}`, vars: { result: String(decimal) } });
        return { steps: stepsOut, output: `${s} (base ${from}) = ${decimal} (base 10)`, value: decimal };
      }
      let n = Math.abs(decimal);
      const rem: string[] = [];
      let guard = 0;
      while (n > 0 && guard < 60) {
        const q = Math.floor(n / to), r = n % to;
        stepsOut.push({ text: `${n} ÷ ${to} = ${q} remainder ${DIG[r]}` });
        rem.unshift(DIG[r]);
        n = q; guard++;
      }
      if (Math.abs(decimal) === 0) rem.push('0');
      const result = (sign < 0 ? '-' : '') + rem.join('');
      stepsOut.push({ text: `Read remainders bottom-up: ${result}`, vars: { result } });
      return { steps: stepsOut, output: `${s} (base ${from}) = ${result} (base ${to})`, value: decimal };
    },
    workedExample: {
      title: 'Convert 255₁₀ to hexadecimal',
      steps: ['255 ÷ 16 = 15 r 15 (F)', '15 ÷ 16 = 0 r 15 (F)', 'Read bottom-up: FF', '255₁₀ = FF₁₆'],
      result: 'FF₁₆',
    },
    challenge: { mode: 'choice', question: 'What is binary 1010 in decimal?', options: ['8', '10', '12', '16'], answer: '10', explanation: '1010₂ = 8 + 0 + 2 + 0 = 10₁₀.' },
    related: ['basic-arithmetic', 'even-or-odd-checker', 'greatest-common-divisor'],
  }),
];
