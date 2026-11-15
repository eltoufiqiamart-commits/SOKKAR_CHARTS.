'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FlowChart from './FlowChart';
import type { ComputeResult, TraceStep } from '@/lib/types';
import { getExperience } from '@/lib/experiences';

const SPEEDS = [0.5, 1, 2, 4] as const;

const toneClass = (t?: string) =>
  t === 'ok' ? 'ok' : t === 'err' ? 'err' : t === 'decision' ? 'dec' : t === 'output' ? 'out' : '';

export default function Workspace({ slug }: { slug: string }) {
  const experience = getExperience(slug)!;
  const defaults = useMemo(() => Object.fromEntries(experience.inputs.map(i => [i.id, i.default ?? ''])), [experience]);
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [generated, setGenerated] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'running' | 'paused' | 'done'>('idle');
  const [trace, setTrace] = useState<ComputeResult | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [lines, setLines] = useState<TraceStep[]>([]);
  const [vars, setVars] = useState<Record<string, string | number>>({});
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [doneEdges, setDoneEdges] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [speedIdx, setSpeedIdx] = useState(1);
  const consoleRef = useRef<HTMLDivElement>(null);

  const speed = SPEEDS[speedIdx];
  const running = phase === 'running';
  const traceActive = trace !== null;

  const readInputs = () => experience.compute(values);

  const resetExecution = useCallback((keepGenerated = true) => {
    setPhase('idle');
    setTrace(null);
    setStepIndex(-1);
    setLines([]);
    setVars({});
    setDoneIds(new Set());
    setDoneEdges(new Set());
    setActiveId(null);
    if (!keepGenerated) setGenerated(false);
  }, []);

  const applyStep = useCallback((steps: TraceStep[], i: number) => {
    const step = steps[i];
    setActiveId(step.nodeId);
    setLines(prev => [...prev, step]);
    setDoneIds(prev => new Set(prev).add(step.nodeId));
    if (i > 0) setDoneEdges(prev => new Set(prev).add(`${steps[i - 1].nodeId}->${step.nodeId}`));
    if (step.vars) setVars(prev => ({ ...prev, ...step.vars }));
  }, []);

  const prepareTrace = useCallback((): ComputeResult => {
    const result = readInputs();
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, experience]);

  const handleRun = () => {
    if (running) return;
    if (!generated) { setGenerated(true); setRevealKey(k => k + 1); }
    if (phase === 'paused' && trace) { setPhase('running'); return; }
    // fresh run
    setLines([]); setVars({}); setDoneIds(new Set()); setDoneEdges(new Set()); setStepIndex(-1);
    const result = readInputs();
    setTrace(result);
    setPhase('running');
  };

  const handleStep = () => {
    if (running) return;
    if (!generated) { setGenerated(true); setRevealKey(k => k + 1); }
    let steps: TraceStep[];
    if (!trace) {
      const result = readInputs();
      setTrace(result);
      steps = result.steps;
      setLines([]); setVars({}); setDoneIds(new Set()); setDoneEdges(new Set()); setStepIndex(-1);
      // apply first step immediately
      setStepIndex(0);
      applyStep(steps, 0);
      setPhase('paused');
      return;
    }
    steps = trace.steps;
    const next = stepIndex + 1;
    if (next >= steps.length) { setPhase('done'); setActiveId(null); return; }
    setStepIndex(next);
    applyStep(steps, next);
    setPhase(next + 1 >= steps.length ? 'done' : 'paused');
    if (next + 1 >= steps.length) setActiveId(null);
  };

  const handlePause = () => { if (running) setPhase('paused'); };
  const handleReset = () => resetExecution(true);

  // execution loop
  useEffect(() => {
    if (phase !== 'running' || !trace) return;
    if (stepIndex + 1 >= trace.steps.length) { setPhase('done'); setActiveId(null); return; }
    const delay = Math.max(200, 950 / speed);
    const t = window.setTimeout(() => {
      const next = stepIndex + 1;
      setStepIndex(next);
      applyStep(trace.steps, next);
      if (next + 1 >= trace.steps.length) { setPhase('done'); setActiveId(null); }
    }, delay);
    return () => window.clearTimeout(t);
  }, [phase, stepIndex, trace, speed, applyStep]);

  // autoscroll console
  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const result: ComputeResult | null = phase === 'done' && trace ? trace : null;
  const currentOp = activeId ? experience.nodes.find(n => n.id === activeId) : null;
  const selectedNode = selectedId ? experience.nodes.find(n => n.id === selectedId) : null;

  return (
    <div className="workspace" aria-label="Interactive workspace">
      {/* ── Left: inputs & console ─────────────────────────── */}
      <div className="ws-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div className="tag" style={{ color: '#000' }}>Input Panel</div>
          {running && <span className="chip chip-solid" aria-live="polite">RUNNING</span>}
          {phase === 'paused' && <span className="chip">PAUSED</span>}
          {phase === 'done' && <span className="chip" style={{ borderColor: '#0F7B3D', color: '#0F7B3D' }}>DONE</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {experience.inputs.map(def => (
            <div className="field" key={def.id}>
              <label htmlFor={`in-${def.id}`}>{def.label}</label>
              {def.type === 'select' ? (
                <select id={`in-${def.id}`} className="input" value={values[def.id]} disabled={running}
                  onChange={e => setValues(v => ({ ...v, [def.id]: e.target.value }))}>
                  {(def.options ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <div className="input-wrap">
                  <input id={`in-${def.id}`} className="input" type={def.type === 'number' ? 'number' : 'text'} inputMode={def.type === 'number' ? 'decimal' : 'text'}
                    value={values[def.id]} placeholder={def.placeholder} disabled={running}
                    onChange={e => setValues(v => ({ ...v, [def.id]: e.target.value }))}
                    aria-describedby={def.hint ? `hint-${def.id}` : undefined} />
                  {def.unit && <span className="unit">{def.unit}</span>}
                </div>
              )}
              {def.hint && <span className="field-hint" id={`hint-${def.id}`}>{def.hint}</span>}
            </div>
          ))}
        </div>

        <button className="btn" onClick={() => { setGenerated(true); setRevealKey(k => k + 1); }} style={{ justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 3h12M2 8h8M2 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="13" cy="8" r="1.6" fill="currentColor"/></svg>
          {generated ? 'Regenerate Flowchart' : 'Generate Flowchart'}
        </button>

        {/* execution console */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label className="tag" htmlFor="exec-console" style={{ color: '#000' }}>Execution Console</label>
            <span className="mono" style={{ fontSize: '.62rem', color: 'var(--text-secondary)' }}>{lines.length} step{lines.length === 1 ? '' : 's'}</span>
          </div>
          <div className="console" id="exec-console" ref={consoleRef} aria-live="polite" aria-label="Algorithm execution log">
            {lines.length === 0 && <div className="console-empty">{'>'} Press Run to execute the algorithm…</div>}
            {lines.map((l, i) => (
              <div className={`console-line ${toneClass(l.tone)}`} key={i}>
                <span className="ln">{String(i + 1).padStart(2, '0')}</span>
                <span className="txt">{l.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* variables */}
        {Object.keys(vars).length > 0 && (
          <div>
            <div className="tag" style={{ marginBottom: 6, color: '#000' }}>Variables</div>
            <div className="vars-grid">
              {Object.entries(vars).map(([k, v]) => (
                <div className="var-cell" key={k}><b>{k}</b> = {String(v)}</div>
              ))}
            </div>
          </div>
        )}

        {/* result banner */}
        {result && (
          <div className={`result-banner ${result.ok ? 'result-ok' : 'result-err'}`} role="status">
            <strong>{result.ok ? 'Result' : 'Error'}:</strong> {result.output ?? result.error}
          </div>
        )}

        {/* node inspector */}
        {selectedNode && (
          <div className="node-inspector" role="dialog" aria-label={`Node: ${selectedNode.label}`}>
            <b>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="#000"/><text x="6" y="9" textAnchor="middle" fontSize="7" fill="#fff" fontFamily="monospace">i</text></svg>
              {selectedNode.type} node
              <button className="btn-ghost" style={{ marginLeft: 'auto', fontSize: '.68rem' }} onClick={() => setSelectedId(null)} aria-label="Close node description">Close</button>
            </b>
            <p style={{ marginTop: 6, fontWeight: 700 }}>{selectedNode.label}</p>
            <p className="muted" style={{ marginTop: 3, lineHeight: 1.55 }}>{selectedNode.detail}</p>
          </div>
        )}
      </div>

      {/* ── Right: toolbar + canvas ─────────────────────────── */}
      <div className="ws-canvas-wrap">
        <div className="flow-toolbar" role="toolbar" aria-label="Execution controls">
          <button className="btn btn-sm" onClick={handleRun} disabled={running} aria-label={phase === 'paused' ? 'Resume execution' : 'Run algorithm'}>
            {phase === 'paused'
              ? <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 1a5 5 0 1 0 5 5" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M5 4l4 2-4 2z"/></svg>
              : <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.8v8.4c0 .9 1 1.5 1.8 1L11 6.9a1.2 1.2 0 0 0 0-1.9L4.8.9C4 .4 3 1 3 1.8Z"/></svg>}
            {phase === 'paused' ? 'Resume' : 'Run'}
          </button>
          <button className="btn-icon" onClick={handleStep} disabled={running} aria-label="Execute one step" title="Step">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 2.5v9l7-4.5z" fill="currentColor"/><path d="M12 2.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Step
          </button>
          <button className="btn-icon" onClick={handlePause} disabled={!running} aria-label="Pause execution" title="Pause">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4.5 2.5v9M9.5 2.5v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Pause
          </button>
          <button className="btn-icon" onClick={handleReset} aria-label="Reset execution" title="Reset">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7a4.5 4.5 0 1 0 1.3-3.2M2.5 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Reset
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <label htmlFor="speed" className="tag">SPEED</label>
            <input id="speed" type="range" min={0} max={SPEEDS.length - 1} step={1} value={speedIdx} onChange={e => setSpeedIdx(Number(e.target.value))}
              aria-valuetext={`${speed}x speed`} style={{ width: 90, accentColor: '#000' }} />
            <span className="mono" style={{ fontSize: '.7rem', minWidth: 30 }}>{speed}×</span>
          </div>
          {currentOp && <span className="chip chip-solid" style={{ marginLeft: 4 }} title="Current operation">{currentOp.type.toUpperCase()}</span>}
        </div>
        <FlowChart
          nodes={experience.nodes}
          edges={experience.edges}
          generated={generated}
          activeId={activeId}
          doneIds={doneIds}
          doneEdges={doneEdges}
          selectedId={selectedId}
          onSelect={setSelectedId}
          revealKey={revealKey}
        />
      </div>
    </div>
  );
}
