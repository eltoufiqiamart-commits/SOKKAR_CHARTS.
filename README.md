# SOKKAR

**Think. Visualize. Execute.** — SOKKAR turns real problems into interactive algorithmic experiences. Learn mathematics, physics and real-world systems by reading the algorithm, generating its flowchart, running it step by step, and watching every decision happen live.

Live preview: served on port **3100** (`npm start`).

## What's inside

- **60 experiences, 3 disciplines** — 20 Life Systems, 20 Physics, 20 Mathematics. Each is complete: concept, formula with variable breakdown, interactive workspace (inputs + simulator/calculator), an executable flowchart, a step-by-step execution console, a numbered algorithm breakdown, a worked example and a challenge. No placeholders.
- **One engine, sixty experiences** — every experience is a structured content definition (inputs, validation, compute steps, flowchart nodes/edges). Flowchart, algorithm and executor share a single source of truth, so the diagram can never disagree with the run.
- **Safe execution model** — algorithms are executed by a small interpreter (sequences, inputs, validation, assignment, arithmetic, comparisons, branching, bounded loops). No `eval`, no arbitrary code execution.
- **Interactive flowcharts** — standard symbols (oval Start/End, parallelogram I/O, rectangle Process, diamond Decision), zoom/pan/fit, node inspector, follow-execution highlighting, drag-vs-click disambiguation.
- **Learning features** — challenges that mark experiences complete, saved list, per-category mastery bars, 10 milestones, day streak, localStorage persistence. No account, no backend — nothing leaves the device.
- **Global search & filters** — instant search across titles, descriptions, formulas, topics and keywords; filter by category, difficulty, duration and completion; sort by recommended/title/duration/difficulty.
- **Accessible & responsive** — semantic HTML, skip link, keyboard-operable flowchart (Enter/Space selects nodes), visible focus, ARIA live console, `prefers-reduced-motion` support, no horizontal overflow on small screens.

All financial figures in Life Systems are illustrative and configurable — educational simulations, not integrations.

## Quickstart

```bash
npm install
npm run build   # production build (72 static pages)
npm start -- -p 3100 -H 0.0.0.0
```

Development: `npm run dev` (Next.js dev server).

## Scripts

| Command | Purpose |
|---|---|
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | 183 unit tests — algorithm traces, validation, edge cases (division by zero, negative discriminant, insufficient balance, empty input) |
| `npm run typecheck` | Strict TypeScript |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run test:e2e` | Playwright smoke suite against `localhost:3100` (22 checks) |
| `npm run test:interactions` | Playwright interaction suite — challenges, pause/resume/reset/step, zoom, node inspector, keyboard (14 checks) |
| `npm run test:sweep` | Playwright sweep of **all 60** experience pages: generate flowchart → run at max speed → assert a Result banner, zero console errors |

`test:e2e`, `test:interactions` and `test:sweep` expect the production server on port 3100.

## Architecture

```
app/                    Routes (App Router, all static)
  page.tsx              Home
  experiences/          Full library (all 60)
  category/[category]/  Life Systems / Physics / Mathematics libraries
  experience/[slug]/    60 statically generated experience pages
  search/  progress/  about/  privacy/
components/             FlowChart (custom SVG engine), Workspace, Challenge,
                        ExperienceBrowser (search/filter/sort), SpecialVisuals
                        (interactive simulations), Nav, Footer, Logo, …
lib/
  types.ts              Experience definition schema
  engine.ts             Layout (Sugiyama-style) + safe trace interpreter
  experiences/          Content: life.ts, physics.ts, math.ts + registry
  progress.ts           localStorage progress (completed / saved / streak)
test/                   Unit tests + Playwright suites
```

Design rules: black/white only (`#FFF`/`#000` primary, `#F7F7F7` surface, `#EAEAEA` border, `#737373` secondary text, `#111` dark surfaces). Color appears only for functional purposes (result ok/error, category chips). No gradients, glow or decorative iconography; SVG icons only where they do work.

## Notes

- State lives in `localStorage` (`sokkar:completed`, `sokkar:saved`, `sokkar:streak`, `sokkar:last-opened`). Clear it from `/progress` → "Reset all progress".
- Physics uses SI units with units beside every I/O; assumptions are printed on each page. Simplified models are labelled as such.
- Made by VELIX AI — https://web-3-velix-ai.vercel.app/
