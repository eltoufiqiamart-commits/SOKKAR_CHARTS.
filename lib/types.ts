/* SOKKAR — shared types. Single source of truth for experiences,
   their flowcharts and their execution traces. */

export type CategoryId = 'life-systems' | 'physics' | 'mathematics';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'life-systems', name: 'Life Systems', tagline: 'Discover the logic behind everyday digital systems.', description: 'Educational simulations of the systems you use every day — banking, transport, commerce and public services — shown as clear, executable logic.' },
  { id: 'physics', name: 'Physics', tagline: 'Transform physical laws into executable algorithms.', description: 'Turn SI-unit formulas into working calculators, simulations and step-by-step algorithmic solutions.' },
  { id: 'mathematics', name: 'Mathematics', tagline: 'Solve mathematical problems through computational thinking.', description: 'Arithmetic, number theory, algebra and geometry — each computed the way a computer would, step by step.' },
];

export const categoryName = (id: CategoryId) => CATEGORIES.find(c => c.id === id)?.name ?? id;

export interface InputDef {
  id: string;
  label: string;
  unit?: string;
  type: 'number' | 'text' | 'select';
  placeholder?: string;
  default?: string;
  options?: { value: string; label: string }[];
  hint?: string;
}

export type FlowNodeType = 'start' | 'end' | 'input' | 'output' | 'process' | 'decision';

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  detail: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface TraceStep {
  nodeId: string;
  text: string;
  tone?: 'info' | 'ok' | 'err' | 'decision' | 'output';
  vars?: Record<string, string | number>;
  decision?: { question: string; result: string };
}

export interface ComputeResult {
  ok: boolean;
  error?: string;
  output?: string;
  outputValue?: number;
  steps: TraceStep[];
}

export interface Challenge {
  question: string;
  mode: 'choice' | 'numeric';
  options?: string[];
  answer: string;
  tolerance?: number;
  unit?: string;
  placeholder?: string;
  explanation: string;
}

export interface WorkedExample {
  title: string;
  steps: string[];
  result: string;
}

export interface Experience {
  slug: string;
  title: string;
  category: CategoryId;
  difficulty: Difficulty;
  duration: number; // minutes
  description: string;
  keywords: string[];
  featured?: boolean;
  concept: string[];
  formula?: string;
  formulaNote?: string;
  latex?: string; // reserved for future KaTeX adoption; rendered as styled text today
  variables?: { symbol: string; meaning: string; unit?: string }[];
  assumptions?: string[];
  inputs: InputDef[];
  compute: (values: Record<string, string>) => ComputeResult;
  nodes: FlowNode[];
  edges: FlowEdge[];
  algorithm: string[];
  workedExample: WorkedExample;
  challenge: Challenge;
  related: string[];
}
