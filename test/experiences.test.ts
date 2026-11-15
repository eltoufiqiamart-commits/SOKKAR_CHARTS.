import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_EXPERIENCES, getExperience } from '../lib/experiences/index';
import { layoutFlow } from '../lib/engine';

const defaultValues = (exp: typeof ALL_EXPERIENCES[number]): Record<string, string> =>
  Object.fromEntries(exp.inputs.map(i => [i.id, i.default ?? (i.type === 'number' ? '1' : i.options?.[0]?.value ?? 'x')]));

test('exactly 60 experiences, 20 per category', () => {
  assert.equal(ALL_EXPERIENCES.length, 60);
  for (const cat of ['life-systems', 'physics', 'mathematics']) {
    assert.equal(ALL_EXPERIENCES.filter(e => e.category === cat).length, 20, cat);
  }
});

test('all slugs are unique and url-safe', () => {
  const slugs = ALL_EXPERIENCES.map(e => e.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/);
});

for (const exp of ALL_EXPERIENCES) {
  test(`flowchart integrity: ${exp.slug}`, () => {
    const nodeIds = new Set(exp.nodes.map(n => n.id));
    assert.ok(nodeIds.has('start') && nodeIds.has('end'), 'needs start/end');
    for (const e of exp.edges) {
      assert.ok(nodeIds.has(e.from), `edge from missing node ${e.from}`);
      assert.ok(nodeIds.has(e.to), `edge to missing node ${e.to}`);
    }
    // every node reachable from start via edges
    const adj = new Map<string, string[]>();
    for (const e of exp.edges) adj.set(e.from, [...(adj.get(e.from) ?? []), e.to]);
    const seen = new Set<string>();
    const stack = ['start'];
    while (stack.length) { const u = stack.pop()!; if (seen.has(u)) continue; seen.add(u); for (const v of adj.get(u) ?? []) stack.push(v); }
    for (const n of exp.nodes) assert.ok(seen.has(n.id), `unreachable node ${n.id}`);
    // layout does not crash and places all nodes
    const layout = layoutFlow(exp.nodes, exp.edges);
    assert.equal(layout.nodes.length, exp.nodes.length);
    assert.ok(layout.width > 0 && layout.height > 0);
  });

  test(`execution: ${exp.slug} runs with defaults and every trace step maps to a real node`, () => {
    const nodeIds = new Set(exp.nodes.map(n => n.id));
    const result = exp.compute(defaultValues(exp));
    assert.ok(result.steps.length >= 2, 'trace too short');
    for (const step of result.steps) assert.ok(nodeIds.has(step.nodeId), `trace step references missing node ${step.nodeId}`);
    assert.ok(typeof result.output === 'string' && result.output.length > 0, 'has output');
    assert.ok(result.ok || result.error, 'has output or error');
  });

  test(`content completeness: ${exp.slug}`, () => {
    assert.ok(exp.concept.length >= 2, 'concept paragraphs');
    assert.ok(exp.algorithm.length >= 3, 'algorithm steps');
    assert.ok(exp.workedExample.steps.length >= 2, 'worked example');
    assert.ok(exp.workedExample.result.length > 0);
    assert.ok(exp.challenge.explanation.length > 10, 'challenge explanation');
    assert.ok(exp.keywords.length >= 3);
    assert.ok(exp.related.length >= 2);
    for (const r of exp.related) assert.ok(getExperience(r), `related slug ${r} exists`);
    assert.ok(exp.duration > 0);
    assert.ok(['Beginner', 'Intermediate', 'Advanced'].includes(exp.difficulty));
  });
}

test('known-correct computed values', () => {
  const get = (slug: string) => getExperience(slug)!;
  const val = (slug: string, values: Record<string, string>) => get(slug).compute(values);

  assert.equal(val('uniform-linear-motion', { s: '100', t: '10' }).outputValue, 10);
  assert.equal(val('newtons-second-law', { m: '10', a: '2' }).outputValue, 20);
  assert.equal(val('kinetic-energy', { m: '2', v: '10' }).outputValue, 100);
  assert.equal(val('hookes-law', { k: '50', x: '0.2' }).outputValue, 10);
  assert.ok(Math.abs((val('ohms-law', { I: '2', R: '10' }).outputValue ?? 0) - 20) < 1e-9);
  assert.equal(val('greatest-common-divisor', { a: '252', b: '105' }).outputValue, 21);
  assert.equal(val('least-common-multiple', { a: '12', b: '18' }).outputValue, 36);
  assert.equal(val('factorial-calculator', { n: '5' }).outputValue, 120);
  const q = val('quadratic-equation', { a: '1', b: '-5', c: '6' });
  assert.ok((q.output ?? '').includes('3') && (q.output ?? '').includes('2'));
  const par = val('resistance-parallel', { list: '10, 10' });
  assert.ok(Math.abs((par.outputValue ?? 0) - 5) < 1e-9);
  // failure paths must not throw
  assert.equal(val('uniform-linear-motion', { s: '100', t: '0' }).ok, false);
  assert.equal(val('basic-arithmetic', { a: '1', b: '0', op: 'divide' }).ok, false);
  assert.equal(val('banking-account', { balance: '100', op: 'withdraw', amount: '500' }).ok, false);
  assert.equal(val('prime-number-checker', { n: '91' }).output?.includes('not prime'), true);
  assert.equal(val('prime-number-checker', { n: '97' }).output?.includes('prime'), true);
});
