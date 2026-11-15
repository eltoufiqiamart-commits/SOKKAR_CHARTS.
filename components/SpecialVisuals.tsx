'use client';
/* Animated, self-contained simulations for flagship experiences. */
import { useEffect, useRef, useState } from 'react';

const fmt2 = (n: number) => (Math.round(n * 100) / 100).toString();

/* ── Hooke's law spring ─────────────────────────────────────────── */
function SpringViz() {
  const [k, setK] = useState(50);
  const [amp, setAmp] = useState(0.25);
  const [running, setRunning] = useState(true);
  const [t, setT] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const tick = (now: number) => {
      setT(prev => prev + (now - last) / 1000);
      last = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);
  const omega = Math.sqrt(k); // m = 1 kg
  const x = amp * Math.sin(omega * t);
  const force = k * Math.abs(x);
  // spring geometry: anchor left at x=20, free end at 150 + x*160 px
  const anchor = 24, rest = 170, stretch = x * 170;
  const coils = 9, springEnd = rest + stretch;
  const seg: string[] = [`M ${anchor} 70 H ${anchor + 14}`];
  const startX = anchor + 14, len = springEnd - startX;
  for (let i = 0; i <= coils; i++) {
    const px = startX + (len * i) / coils;
    const py = i === 0 || i === coils ? 70 : i % 2 === 0 ? 48 : 92;
    seg.push(`L ${px} ${py}`);
  }
  seg.push(`L ${springEnd + 14} 70 H ${springEnd + 18}`);
  return (
    <div className="sim-shell">
      <div className="sim-head"><strong style={{ fontSize: '.82rem' }}>Live Spring — F = k·x</strong>
        <button className="btn-icon" onClick={() => setRunning(r => !r)} aria-pressed={running}>{running ? 'Pause' : 'Resume'}</button>
      </div>
      <div className="sim-body">
        <svg viewBox="0 0 340 140" width="100%" role="img" aria-label={`Animated spring oscillating with amplitude ${fmt2(amp)} metres, spring constant ${k} newtons per metre`}>
          <rect x="0" y="20" width="12" height="100" fill="#111" rx="2"/>
          <path d={seg.join(' ')} stroke="#000" strokeWidth="2.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
          <rect x={springEnd + 18} y="42" width="34" height="56" fill="#000" rx="4"/>
          <line x1={180} y1={126} x2={300} y2={126} stroke="#C9C9C9" strokeDasharray="4 4"/>
          <line x1={rest + 18} y1={118} x2={rest + 18} y2={134} stroke="#C9C9C9" strokeDasharray="2 3"/>
          <text x={rest + 24} y={115} fontSize="8" fill="#888" fontFamily="monospace">equilibrium</text>
        </svg>
        <div className="grid-2" style={{ marginTop: 8 }}>
          <div className="field"><label htmlFor="spring-k">Spring constant k</label><div className="input-wrap"><input id="spring-k" className="input" type="number" min={10} max={200} value={k} onChange={e => setK(Math.max(5, Number(e.target.value) || 5))}/><span className="unit">N/m</span></div></div>
          <div className="field"><label htmlFor="spring-a">Amplitude</label><div className="input-wrap"><input id="spring-a" className="input" type="number" min={0.05} max={0.45} step={0.05} value={amp} onChange={e => setAmp(Math.min(0.45, Math.max(0.05, Number(e.target.value) || 0.05)))}/><span className="unit">m</span></div></div>
        </div>
        <div className="grid-4" style={{ marginTop: 10 }}>
          <div className="kpi"><div className="k">Displacement x</div><div className="v">{x >= 0 ? '+' : ''}{fmt2(x)} m</div></div>
          <div className="kpi"><div className="k">Force |F|</div><div className="v">{fmt2(force)} N</div></div>
          <div className="kpi"><div className="k">ω = √(k/m)</div><div className="v">{fmt2(omega)} rad/s</div></div>
          <div className="kpi"><div className="k">Period T</div><div className="v">{fmt2((2 * Math.PI) / omega)} s</div></div>
        </div>
      </div>
    </div>
  );
}

/* ── Circular motion ────────────────────────────────────────────── */
function CircularViz() {
  const [period, setPeriod] = useState(2);
  const [angle, setAngle] = useState(0);
  const [running, setRunning] = useState(true);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const tick = (now: number) => {
      setAngle(a => (a + ((now - last) / 1000) * ((2 * Math.PI) / period)) % (2 * Math.PI));
      last = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running, period]);
  const omega = (2 * Math.PI) / period;
  const cx = 110, cy = 90, r = 62;
  const px = cx + r * Math.cos(angle), py = cy - r * Math.sin(angle);
  const arcEnd = { x: cx + r * Math.cos(Math.min(angle, Math.PI * 2)), y: cy - r * Math.sin(Math.min(angle, Math.PI * 2)) };
  return (
    <div className="sim-shell">
      <div className="sim-head"><strong style={{ fontSize: '.82rem' }}>Uniform Circular Motion — ω = 2π / T</strong>
        <button className="btn-icon" onClick={() => setRunning(r => !r)} aria-pressed={running}>{running ? 'Pause' : 'Resume'}</button>
      </div>
      <div className="sim-body" style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 220 180" width="220" height="180" role="img" aria-label={`Point moving in a circle, angular velocity ${fmt2(omega)} radians per second`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#111" strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round"/>
          <circle cx={cx} cy={cy} r={3} fill="#000"/>
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="#C9C9C9" strokeWidth="1.5"/>
          <path d={`M ${cx + 18} ${cy} A 18 18 0 0 0 ${cx + 18 * Math.cos(angle)} ${cy - 18 * Math.sin(angle)}`} stroke="#000" strokeWidth="1.6" fill="none"/>
          <circle cx={px} cy={py} r={8.5} fill="#000"/>
          <circle cx={arcEnd.x} cy={arcEnd.y} r="0" fill="none"/>
          <text x={cx} y={cy + r + 22} textAnchor="middle" fontSize="9" fill="#555" fontFamily="monospace">θ = {fmt2(angle)} rad</text>
        </svg>
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="field"><label htmlFor="circ-t">Period T</label>
            <input id="circ-t" type="range" min={0.5} max={5} step={0.1} value={period} onChange={e => setPeriod(Number(e.target.value))} style={{ accentColor: '#000' }} aria-valuetext={`${period} seconds`} />
            <span className="field-hint">{fmt2(period)} s per revolution</span>
          </div>
          <div className="kpi"><div className="k">Angular velocity ω</div><div className="v">{fmt2(omega)} rad/s</div></div>
          <div className="kpi"><div className="k">Frequency f</div><div className="v">{fmt2(1 / period)} Hz</div></div>
        </div>
      </div>
    </div>
  );
}

/* ── Free fall ──────────────────────────────────────────────────── */
function FreeFallViz() {
  const g = 9.81;
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const [dropped, setDropped] = useState(0);
  const raf = useRef<number>(0);
  const maxH = 45; // metres visible
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const tick = (now: number) => {
      setT(prev => {
        const nt = prev + (now - last) / 1000;
        const h = 0.5 * g * nt * nt;
        if (h >= maxH) { setRunning(false); setDropped(d => d + 1); return Math.sqrt((2 * maxH) / g); }
        return nt;
      });
      last = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);
  const h = Math.min(0.5 * g * t * t, maxH);
  const v = g * t;
  const trackH = 220, ballY = (h / maxH) * (trackH - 24) + 4;
  return (
    <div className="sim-shell">
      <div className="sim-head"><strong style={{ fontSize: '.82rem' }}>Free Fall from Rest — h = ½ g t²</strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-icon" onClick={() => { setT(0); setRunning(true); }}>Drop</button>
          <button className="btn-icon" onClick={() => { setRunning(false); setT(0); }}>Reset</button>
        </div>
      </div>
      <div className="sim-body" style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <svg viewBox={`0 0 90 ${trackH}`} width="90" height={trackH} role="img" aria-label={`Ball ${fmt2(h)} metres into its fall`}>
          <line x1="45" y1="0" x2="45" y2={trackH} stroke="#E4E4E4" strokeWidth="2" strokeDasharray="3 5"/>
          <circle cx="45" cy={ballY} r="11" fill="#000"/>
          <rect x="0" y={trackH - 4} width="90" height="4" fill="#111"/>
        </svg>
        <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="kpi"><div className="k">Time t</div><div className="v">{fmt2(t)} s</div></div>
          <div className="kpi"><div className="k">Distance fallen</div><div className="v">{fmt2(h)} m</div></div>
          <div className="kpi"><div className="k">Speed v = g·t</div><div className="v">{fmt2(v)} m/s</div></div>
          <div className="kpi"><div className="k">Drops completed</div><div className="v">{dropped}</div></div>
        </div>
      </div>
    </div>
  );
}

/* ── Right triangle ─────────────────────────────────────────────── */
function RightTriangleViz() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.hypot(a, b);
  const S = 150 / Math.max(a, b, 0.01);
  const A = a * S, B = b * S;
  const W = Math.max(A, B) + 260, H = B + 90;
  return (
    <div className="sim-shell">
      <div className="sim-head"><strong style={{ fontSize: '.82rem' }}>a² + b² = c² — drawn to scale</strong></div>
      <div className="sim-body">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Right triangle with legs ${a} and ${b}, hypotenuse ${fmt2(c)}`}>
          <polygon points={`40,${20 + B} ${40 + A},${20 + B} 40,20`} fill="#F7F7F7" stroke="#000" strokeWidth="2" strokeLinejoin="round"/>
          <rect x="40" y={20 + B - 14} width="14" height="14" fill="none" stroke="#000" strokeWidth="1.2"/>
          <text x={40 + A / 2} y={20 + B + 18} textAnchor="middle" fontSize="10" fontFamily="monospace">a = {fmt2(a)}</text>
          <text x="28" y={20 + B / 2} textAnchor="end" fontSize="10" fontFamily="monospace">b = {fmt2(b)}</text>
          <text x={40 + A / 2 + 8} y={20 + B / 2 - 6} textAnchor="middle" fontSize="10" fontFamily="monospace" transform={`rotate(${-Math.atan2(B, A) * 180 / Math.PI} ${40 + A / 2 + 8} ${20 + B / 2 - 6})`}>c = {fmt2(c)}</text>
        </svg>
        <div className="grid-2" style={{ marginTop: 6 }}>
          <div className="field"><label htmlFor="tri-a">Leg a</label><input id="tri-a" className="input" type="number" min={0.5} step={0.5} value={a} onChange={e => setA(Math.max(0.5, Number(e.target.value) || 0.5))}/></div>
          <div className="field"><label htmlFor="tri-b">Leg b</label><input id="tri-b" className="input" type="number" min={0.5} step={0.5} value={b} onChange={e => setB(Math.max(0.5, Number(e.target.value) || 0.5))}/></div>
        </div>
        <div className="vars-grid" style={{ marginTop: 10 }}>
          <div className="var-cell"><b>a²</b> = {fmt2(a * a)}</div>
          <div className="var-cell"><b>b²</b> = {fmt2(b * b)}</div>
          <div className="var-cell"><b>a²+b²</b> = {fmt2(a * a + b * b)}</div>
          <div className="var-cell"><b>c</b> = {fmt2(c)}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Traffic light ──────────────────────────────────────────────── */
function TrafficLightViz() {
  const [green, setGreen] = useState(30);
  const [yellow, setYellow] = useState(5);
  const [red, setRed] = useState(30);
  const cycle = green + yellow + red;
  const cycleRef = useRef(cycle);
  cycleRef.current = cycle;
  const [phase, setPhase] = useState<'green' | 'yellow' | 'red'>('green');
  const [left, setLeft] = useState(green);
  const [running, setRunning] = useState(true);
  useEffect(() => { if (!running) return; }, [running]);
  useEffect(() => {
    if (!running) return;
    const dur = phase === 'green' ? green : phase === 'yellow' ? yellow : red;
    setLeft(dur);
    const t = window.setInterval(() => setLeft(l => l - 1), 1000);
    const next = window.setTimeout(() => setPhase(p => (p === 'green' ? 'yellow' : p === 'yellow' ? 'red' : 'green')), dur * 1000);
    return () => { window.clearInterval(t); window.clearTimeout(next); };
  }, [phase, running, green, yellow, red]);
  useEffect(() => { setLeft(green); setPhase('green'); }, [green, yellow, red]);
  const light = (color: 'red' | 'yellow' | 'green') => (
    <div className={`tl-light tl-${color} ${phase === color ? 'on' : ''}`} aria-hidden={phase !== color} />
  );
  const phaseLabel = phase === 'green' ? 'GREEN — go' : phase === 'yellow' ? 'AMBER — prepare to stop' : 'RED — stop';
  return (
    <div className="sim-shell">
      <div className="sim-head"><strong style={{ fontSize: '.82rem' }}>Junction Signal — live cycle</strong>
        <button className="btn-icon" onClick={() => setRunning(r => !r)} aria-pressed={running}>{running ? 'Pause' : 'Start'}</button>
      </div>
      <div className="sim-body" style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="tl-housing" role="img" aria-label={`Traffic light showing ${phaseLabel}`}>
            {light('red')}{light('yellow')}{light('green')}
          </div>
          <div className="mono" aria-live="polite" style={{ fontSize: '.78rem', fontWeight: 700 }}>{phaseLabel}</div>
          <div className="mono" style={{ fontSize: '.68rem', color: '#555' }}>{Math.max(0, left)}s remaining</div>
        </div>
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {([['Green', green, setGreen], ['Amber', yellow, setYellow], ['Red', red, setRed]] as const).map(([label, val, setter]) => (
            <div className="field" key={label}><label>{label} duration</label>
              <div className="input-wrap"><input className="input" type="number" min={2} max={120} value={val} onChange={e => setter(Math.min(120, Math.max(2, Number(e.target.value) || 2)))} aria-label={`${label} duration in seconds`}/><span className="unit">s</span></div>
            </div>
          ))}
          <div className="kpi"><div className="k">Full cycle</div><div className="v">{cycle} s</div></div>
        </div>
      </div>
    </div>
  );
}

/* ── Elevator ───────────────────────────────────────────────────── */
function ElevatorViz() {
  const FLOORS = 6;
  const [current, setCurrent] = useState(1);
  const [target, setTarget] = useState(4);
  const [moving, setMoving] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const travel = (dest: number) => {
    if (moving) return;
    setTarget(dest);
    setDoorOpen(false);
    if (dest === current) { setDoorOpen(true); window.setTimeout(() => setDoorOpen(false), 1400); return; }
    setMoving(true);
    const dist = Math.abs(dest - current);
    window.setTimeout(() => { setCurrent(dest); setMoving(false); setDoorOpen(true); window.setTimeout(() => setDoorOpen(false), 1600); }, dist * 650 + 250);
  };
  const floorPct = (f: number) => ((FLOORS - f) / (FLOORS - 1)) * 78; // % top offset
  return (
    <div className="sim-shell">
      <div className="sim-head"><strong style={{ fontSize: '.82rem' }}>Elevator Dispatch — 6-storey demo</strong>
        <span className="mono" style={{ fontSize: '.7rem', fontWeight: 700 }} aria-live="polite">{moving ? (target > current ? '▲ Going up' : '▼ Going down') : doorOpen ? 'Doors open' : `Idle · floor ${current}`}</span>
      </div>
      <div className="sim-body" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="elevator-shaft" aria-label="Elevator shaft">
          <div className="elevator-cab" style={{ top: `${4 + floorPct(moving ? target : current)}%` }}>
            <div style={{ width: doorOpen ? 30 : 8, height: 34, background: '#EDEDED', borderRadius: 2, transition: 'width .45s ease' }} />
          </div>
          {Array.from({ length: FLOORS }, (_, i) => FLOORS - i).map(f => (
            <div key={f} style={{ position: 'absolute', right: 6, top: `calc(${floorPct(f)}% + 4px)`, fontSize: '.58rem', color: '#999', fontFamily: 'var(--mono)' }}>F{f}</div>
          ))}
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <div className="tag" style={{ marginBottom: 8 }}>Call car to floor</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {Array.from({ length: FLOORS }, (_, i) => i + 1).map(f => (
              <button key={f} className="btn-icon" onClick={() => travel(f)} aria-pressed={f === target && moving}
                style={{ justifyContent: 'center', background: f === current && !moving ? '#000' : undefined, color: f === current && !moving ? '#fff' : undefined }}>
                {f}
              </button>
            ))}
          </div>
          <div className="kpi" style={{ marginTop: 12 }}><div className="k">Current floor</div><div className="v">{moving ? `→ ${target}` : current}</div></div>
          <div className="kpi" style={{ marginTop: 8 }}><div className="k">Doors</div><div className="v">{doorOpen ? 'OPEN' : 'CLOSED'}</div></div>
        </div>
      </div>
    </div>
  );
}

export default function SpecialVisual({ slug }: { slug: string }) {
  switch (slug) {
    case 'hookes-law': return <SpringViz />;
    case 'circular-motion': return <CircularViz />;
    case 'free-fall': return <FreeFallViz />;
    case 'pythagorean-theorem': return <RightTriangleViz />;
    case 'traffic-light-control': return <TrafficLightViz />;
    case 'elevator-control': return <ElevatorViz />;
    default: return null;
  }
}
