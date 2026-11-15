'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { edgePath, layoutFlow, wrapLabel } from '@/lib/engine';
import type { FlowEdge, FlowNode as FlowNodeType } from '@/lib/types';

interface Props {
  nodes: FlowNodeType[];
  edges: FlowEdge[];
  generated: boolean;
  activeId: string | null;
  doneIds: Set<string>;
  doneEdges: Set<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  revealKey: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export default function FlowChart({
  nodes,
  edges,
  generated,
  activeId,
  doneIds,
  doneEdges,
  selectedId,
  onSelect,
  revealKey
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [stage, setStage] = useState({ w: 900, h: 540 });

  const drag = useRef<{
    px: number;
    py: number;
    vx: number;
    vy: number;
    moved: boolean;
  } | null>(null);

  const movedRef = useRef(false);

  const layout = useMemo(() => layoutFlow(nodes, edges), [nodes, edges]);

  const byId = useMemo(
    () => new Map(layout.nodes.map(n => [n.id, n])),
    [layout]
  );

  const CY_OFFSET = 70;
  const contentH = layout.height + 30;

  const fit = useCallback(() => {
    const k = clamp(
      Math.min(
        (stage.w - 36) / layout.width,
        (stage.h - 36) / contentH
      ),
      0.18,
      1.3
    );

    setView({
      k,
      x: (stage.w - layout.width * k) / 2,
      y: (stage.h - contentH * k) / 2
    });
  }, [stage.w, stage.h, layout.width, contentH]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const measure = () => {
      setStage({
        w: el.clientWidth,
        h: el.clientHeight
      });
    };

    measure();

    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (generated) fit();
  }, [generated, revealKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Zoom using a native wheel listener so preventDefault works correctly.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!generated) return;

      e.preventDefault();

      const rect = el.getBoundingClientRect();

      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      setView(v => {
        const k = clamp(
          v.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12),
          0.2,
          2.6
        );

        const s = k / v.k;

        return {
          k,
          x: mx - (mx - v.x) * s,
          y: my - (my - v.y) * s
        };
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [generated]);

  const zoomBy = (factor: number) => {
    const cx = stage.w / 2;
    const cy = stage.h / 2;

    setView(v => {
      const k = clamp(v.k * factor, 0.2, 2.6);
      const s = k / v.k;

      return {
        k,
        x: cx - (cx - v.x) * s,
        y: cy - (cy - v.y) * s
      };
    });
  };

  // Pan handling.
  // Keep a local reference to the drag data so asynchronous state updates
  // never attempt to read drag.current after it has been cleared.
  const onPointerDown = (e: React.PointerEvent) => {
    if (!generated) return;

    movedRef.current = false;

    const start = {
      px: e.clientX,
      py: e.clientY,
      vx: view.x,
      vy: view.y
    };

    const currentDrag = {
      ...start,
      moved: false
    };

    drag.current = currentDrag;

    const move = (ev: PointerEvent) => {
      const activeDrag = drag.current;

      if (!activeDrag) return;

      const dx = ev.clientX - activeDrag.px;
      const dy = ev.clientY - activeDrag.py;

      if (Math.abs(dx) + Math.abs(dy) > 4) {
        activeDrag.moved = true;
        movedRef.current = true;
      }

      if (activeDrag.moved) {
        // Copy the values before calling setView.
        // Do not access drag.current inside the state updater.
        const { vx, vy } = activeDrag;

        setView(v => ({
          ...v,
          x: vx + dx,
          y: vy + dy
        }));
      }
    };

    const up = () => {
      drag.current = null;

      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const nodeKeyHandler = (n: FlowNodeType) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(selectedId === n.id ? null : n.id);
    }
  };

  return (
    <div
      className="flow-stage"
      ref={stageRef}
      aria-label="Flowchart canvas"
    >
      {!generated && (
        <div className="flow-empty">
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="18"
              y="4"
              width="36"
              height="16"
              rx="8"
              stroke="#111"
              strokeWidth="2"
            />

            <polygon
              points="36,30 66,44 36,58 6,44"
              stroke="#111"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <rect x="18" y="62" width="36" height="0" />

            <line
              x1="36"
              y1="20"
              x2="36"
              y2="30"
              stroke="#111"
              strokeWidth="2"
            />
          </svg>

          <p
            style={{
              maxWidth: 340,
              fontSize: '.85rem',
              lineHeight: 1.6
            }}
          >
            Use the Generate Flowchart button in the workspace to see exactly
            how this algorithm thinks — node by node.
          </p>
        </div>
      )}

      {generated && (
        <>
          <svg
            ref={svgRef}
            role="application"
            aria-label="Interactive algorithm flowchart"
            onPointerDown={onPointerDown}
            style={{ touchAction: 'none' }}
          >
            <g
              transform={`translate(${view.x},${view.y}) scale(${view.k})`}
              key={revealKey}
            >
              {/* Edges */}
              {layout.edges.map((e, i) => {
                const a = byId.get(e.from);
                const b = byId.get(e.to);

                if (!a || !b) return null;

                const pa = {
                  ...a,
                  y: a.y + CY_OFFSET
                };

                const pb = {
                  ...b,
                  y: b.y + CY_OFFSET
                };

                const path = edgePath(pa, pb, e.back ?? false);
                const done = doneEdges.has(`${e.from}->${e.to}`);
                const mid = path.mid;

                return (
                  <g key={i}>
                    <path
                      d={path.d}
                      className={`flow-edge ${done ? 'done' : ''}`}
                      markerEnd={`url(#arrow-${done ? 'done' : 'idle'})`}
                      strokeLinejoin="round"
                    />

                    {e.label && (
                      <g transform={`translate(${mid.x},${mid.y})`}>
                        <rect
                          x={-14}
                          y={-8}
                          width={28}
                          height={16}
                          fill="#fff"
                          stroke={done ? '#000' : '#D8D8D8'}
                          strokeWidth={1}
                          rx={3}
                        />

                        <text
                          textAnchor="middle"
                          dy={3.5}
                          fontSize={9.5}
                          fontFamily="var(--mono)"
                          fill={done ? '#000' : '#555'}
                        >
                          {e.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {layout.nodes.map((n, idx) => {
                const cy = n.y + CY_OFFSET;

                const isActive = activeId === n.id;
                const isDone = doneIds.has(n.id);
                const isSelected = selectedId === n.id;

                const cls = [
                  'flow-node',
                  'reveal',
                  isActive ? 'active' : '',
                  isDone && !isActive ? 'done' : '',
                  isSelected ? 'selected' : ''
                ]
                  .filter(Boolean)
                  .join(' ');

                const lines = wrapLabel(
                  n.label,
                  n.type === 'decision' ? 20 : 26
                );

                const lineH = 15;

                const textTop =
                  -((lines.length - 1) * lineH) / 2 +
                  (n.type === 'start' || n.type === 'end' ? 4.5 : 1);

                return (
                  <g
                    key={n.id}
                    className={cls}
                    style={{ animationDelay: `${idx * 65}ms` }}
                    transform={`translate(${n.x},${cy})`}
                    onClick={ev => {
                      ev.stopPropagation();

                      if (movedRef.current) return;

                      onSelect(isSelected ? null : n.id);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.type} node: ${n.label}`}
                    aria-pressed={isSelected}
                    onKeyDown={nodeKeyHandler(n)}
                  >
                    {n.type === 'decision' ? (
                      <polygon
                        className="node-body"
                        points={`0,${-n.h / 2} ${n.w / 2},0 0,${n.h / 2} ${-n.w / 2},0`}
                        strokeLinejoin="round"
                      />
                    ) : n.type === 'start' || n.type === 'end' ? (
                      <rect
                        className="node-body"
                        x={-n.w / 2}
                        y={-n.h / 2}
                        width={n.w}
                        height={n.h}
                        rx={n.h / 2}
                      />
                    ) : n.type === 'input' ? (
                      <polygon
                        className="node-body"
                        points={`${-n.w / 2 + 16},${-n.h / 2} ${n.w / 2},${-n.h / 2} ${n.w / 2 - 16},${n.h / 2} ${-n.w / 2},${n.h / 2}`}
                        strokeLinejoin="round"
                      />
                    ) : n.type === 'output' ? (
                      <polygon
                        className="node-body"
                        points={`${-n.w / 2},${-n.h / 2} ${n.w / 2 - 16},${-n.h / 2} ${n.w / 2},${n.h / 2} ${-n.w / 2 + 16},${n.h / 2}`}
                        strokeLinejoin="round"
                      />
                    ) : (
                      <rect
                        className="node-body"
                        x={-n.w / 2}
                        y={-n.h / 2}
                        width={n.w}
                        height={n.h}
                        rx={5}
                      />
                    )}

                    {lines.map((line, li) => (
                      <text
                        key={li}
                        className="node-text"
                        textAnchor="middle"
                        y={textTop + li * lineH}
                      >
                        {line}
                      </text>
                    ))}

                    <text
                      className="node-sub"
                      textAnchor="middle"
                      y={n.h / 2 - 7}
                    >
                      {n.type.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </g>

            <defs>
              <marker
                id="arrow-idle"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path
                  d="M0,0L10,5L0,10z"
                  className="edge-arrow"
                />
              </marker>

              <marker
                id="arrow-done"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path
                  d="M0,0L10,5L0,10z"
                  className="edge-arrow done"
                />
              </marker>
            </defs>
          </svg>

          {/* Zoom controls */}
          <div
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <button
              className="btn-icon"
              onClick={() => zoomBy(1.25)}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
              >
                <path
                  d="M7.5 3v9M3 7.5h9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <button
              className="btn-icon"
              onClick={() => zoomBy(1 / 1.25)}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
              >
                <path
                  d="M3 7.5h9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <button
              className="btn-icon"
              onClick={fit}
              aria-label="Fit flowchart to screen"
              title="Fit to screen"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
              >
                <path
                  d="M2 5.5V2h3.5M13 9.5V13H9.5M13 5.5V2H9.5M2 9.5V13h3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Symbol legend */}
          <details
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              background: 'rgba(255,255,255,.94)',
              border: '1px solid var(--border-strong)',
              borderRadius: 8,
              fontSize: '.68rem',
              maxWidth: 190
            }}
          >
            <summary
              style={{
                padding: '7px 12px',
                cursor: 'pointer',
                fontWeight: 700,
                letterSpacing: '.04em'
              }}
            >
              SYMBOL LEGEND
            </summary>

            <div
              style={{
                padding: '4px 12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                fontFamily: 'var(--mono)'
              }}
            >
              <span>( ) Stadium — Start / End</span>
              <span>/ / Parallelogram — Input / Output</span>
              <span>[ ] Rectangle — Process</span>
              <span>◇ Diamond — Decision</span>

              <span
                className="muted"
                style={{ fontFamily: 'var(--font)' }}
              >
                Arrows show execution order. Curved arrows on the right edge
                mark loop cycles.
              </span>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
