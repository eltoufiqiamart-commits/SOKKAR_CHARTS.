/* Factory for experiences built on the standard skeleton:
   Start -> Read inputs -> Validate (decision) -> Compute -> Display -> End.
   The same skeleton drives the flowchart, the numbered algorithm and the
   execution trace, so they can never diverge. */

import { fmt, isNum, num, money } from '../engine';
import type { Challenge, ComputeResult, Experience, FlowEdge, FlowNode, InputDef, TraceStep, WorkedExample, CategoryId, Difficulty } from '../types';

interface FormulaCfg {
  slug: string; title: string; category: CategoryId; difficulty: Difficulty; duration: number;
  description: string; keywords: string[]; featured?: boolean;
  concept: string[]; formula: string; formulaNote?: string;
  variables: { symbol: string; meaning: string; unit?: string }[];
  assumptions?: string[];
  inputDefs: InputDef[];
  inputLabel: string;         // parallelogram text, e.g. "Read distance, time"
  validateLabel: string;      // decision text, e.g. "time > 0?"
  computeLabel: string;       // process text, e.g. "v = s ÷ t"
  outputLabel: string;        // e.g. "Display velocity"
  validate?: (v: Record<string, number>, raw: Record<string, string>) => string | null;
  solve: (v: Record<string, number>, raw: Record<string, string>) => { steps: { text: string; vars?: Record<string, string | number> }[]; output: string; value?: number };
  workedExample: WorkedExample;
  challenge: Challenge;
  related: string[];
  algorithmExtras?: string[]; // inserted between validate and compute steps in the numbered list
}

export function formulaExperience(cfg: FormulaCfg): Experience {
  const nodes: FlowNode[] = [
    { id: 'start', type: 'start', label: 'Start', detail: 'The algorithm begins. Execution enters here.' },
    { id: 'input', type: 'input', label: cfg.inputLabel, detail: 'Reads the values entered by the user. These become the algorithm’s variables.' },
    { id: 'validate', type: 'decision', label: cfg.validateLabel, detail: 'Every computer program checks its inputs before doing real work. If this check fails, the algorithm reports the problem and stops safely.' },
    { id: 'errout', type: 'output', label: 'Display error', detail: 'Shows a clear message describing why the input was rejected. No calculation is attempted with invalid data.' },
    { id: 'compute', type: 'process', label: cfg.computeLabel, detail: 'Applies the governing rule to the validated values and stores the result in memory.' },
    { id: 'output', type: 'output', label: cfg.outputLabel, detail: 'Presents the final result together with its unit (where applicable).' },
    { id: 'end', type: 'end', label: 'End', detail: 'The algorithm finishes. Control returns to the interface.' },
  ];
  const edges: FlowEdge[] = [
    { from: 'start', to: 'input' },
    { from: 'input', to: 'validate' },
    { from: 'validate', to: 'errout', label: 'No' },
    { from: 'errout', to: 'end' },
    { from: 'validate', to: 'compute', label: 'Yes' },
    { from: 'compute', to: 'output' },
    { from: 'output', to: 'end' },
  ];

  const inputNames = cfg.inputDefs.map(i => i.label);
  const readText = `Read ${inputNames.join(', ')}`;

  const compute = (values: Record<string, string>): ComputeResult => {
    const raw = { ...values };
    const steps: TraceStep[] = [];
    const v: Record<string, number> = {};
    for (const def of cfg.inputDefs) v[def.id] = num(raw[def.id] ?? '');

    steps.push({ nodeId: 'start', text: 'Algorithm started', tone: 'info' });
    steps.push({ nodeId: 'input', text: readText, tone: 'info', vars: Object.fromEntries(cfg.inputDefs.map(d => [d.label, raw[d.id] ?? ''])) });

    const numericCheck = cfg.inputDefs.filter(d => d.type === 'number').find(d => !isNum(raw[d.id] ?? ''));
    let error: string | null = null;
    if (numericCheck) error = `${numericCheck.label} must be a valid number.`;
    else if (cfg.validate) error = cfg.validate(v, raw);

    if (error) {
      steps.push({ nodeId: 'validate', text: `Check failed → ${error}`, tone: 'decision', decision: { question: cfg.validateLabel, result: 'No' } });
      steps.push({ nodeId: 'errout', text: error, tone: 'err' });
      steps.push({ nodeId: 'end', text: 'Algorithm finished with an error', tone: 'err' });
      return { ok: false, error, steps };
    }
    steps.push({ nodeId: 'validate', text: 'All inputs pass validation', tone: 'decision', decision: { question: cfg.validateLabel, result: 'Yes' } });

    const solved = cfg.solve(v, raw);
    for (const s of solved.steps) steps.push({ nodeId: 'compute', text: s.text, tone: 'info', vars: s.vars });
    steps.push({ nodeId: 'output', text: solved.output, tone: 'output', vars: { Result: solved.output } });
    steps.push({ nodeId: 'end', text: 'Algorithm finished successfully', tone: 'ok' });
    return { ok: true, output: solved.output, outputValue: solved.value, steps };
  };

  const algorithm = [
    'Start.',
    `${readText}.`,
    `Validate the inputs (${cfg.validateLabel}).`,
    ...(cfg.algorithmExtras ?? []),
    `Compute: ${cfg.computeLabel}.`,
    'Display the result with its unit.',
    'End.',
  ];

  return {
    slug: cfg.slug, title: cfg.title, category: cfg.category, difficulty: cfg.difficulty, duration: cfg.duration,
    description: cfg.description, keywords: cfg.keywords, featured: cfg.featured,
    concept: cfg.concept, formula: cfg.formula, formulaNote: cfg.formulaNote, variables: cfg.variables, assumptions: cfg.assumptions,
    inputs: cfg.inputDefs, compute, nodes, edges, algorithm,
    workedExample: cfg.workedExample, challenge: cfg.challenge, related: cfg.related,
  };
}

export { fmt, money };

/* Factory for experiences with bespoke branching/loop flowcharts. */
export interface CustomCfg {
  slug: string; title: string; category: CategoryId; difficulty: Difficulty; duration: number;
  description: string; keywords: string[]; featured?: boolean;
  concept: string[]; formula: string; formulaNote?: string;
  variables: { symbol: string; meaning: string; unit?: string }[];
  assumptions?: string[];
  inputDefs: InputDef[];
  nodes: FlowNode[]; edges: FlowEdge[];
  validate: (raw: Record<string, string>, v: Record<string, number>) => string | null;
  validateLabel: string;
  solve: (raw: Record<string, string>, v: Record<string, number>) => { steps: TraceStep[]; output: string; value?: number };
  workedExample: WorkedExample; challenge: Challenge; related: string[]; algorithm: string[];
}

export function customExperience(cfg: CustomCfg): Experience {
  const compute = (values: Record<string, string>): ComputeResult => {
    const raw = { ...values };
    const v: Record<string, number> = {};
    for (const def of cfg.inputDefs) v[def.id] = def.type === 'number' ? num(raw[def.id] ?? '') : NaN;
    const steps: TraceStep[] = [];
    steps.push({ nodeId: 'start', text: 'Algorithm started', tone: 'info' });
    steps.push({ nodeId: 'input', text: `Read ${cfg.inputDefs.map(d => d.label).join(', ')}`, tone: 'info', vars: { ...raw } });
    const numericCheck = cfg.inputDefs.filter(d => d.type === 'number').find(d => !isNum(raw[d.id] ?? ''));
    let error: string | null = numericCheck ? `${numericCheck.label} must be a valid number.` : cfg.validate(raw, v);
    if (error) {
      steps.push({ nodeId: 'validate', text: `Check failed -> ${error}`, tone: 'decision', decision: { question: cfg.validateLabel, result: 'No' } });
      steps.push({ nodeId: 'errout', text: error, tone: 'err' });
      steps.push({ nodeId: 'end', text: 'Algorithm finished with an error', tone: 'err' });
      return { ok: false, error, steps };
    }
    steps.push({ nodeId: 'validate', text: 'Inputs are valid', tone: 'decision', decision: { question: cfg.validateLabel, result: 'Yes' } });
    const solved = cfg.solve(raw, v);
    steps.push(...solved.steps);
    if (!solved.steps.some(s => s.nodeId === 'end')) steps.push({ nodeId: 'end', text: 'Algorithm finished successfully', tone: 'ok' });
    return { ok: true, output: solved.output, outputValue: solved.value, steps };
  };
  return {
    slug: cfg.slug, title: cfg.title, category: cfg.category, difficulty: cfg.difficulty, duration: cfg.duration,
    description: cfg.description, keywords: cfg.keywords, featured: cfg.featured,
    concept: cfg.concept, formula: cfg.formula, formulaNote: cfg.formulaNote, variables: cfg.variables, assumptions: cfg.assumptions,
    inputs: cfg.inputDefs, compute, nodes: cfg.nodes, edges: cfg.edges, algorithm: cfg.algorithm,
    workedExample: cfg.workedExample, challenge: cfg.challenge, related: cfg.related,
  };
}
