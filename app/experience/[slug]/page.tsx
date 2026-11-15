import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Workspace from '@/components/Workspace';
import ChallengeBox from '@/components/Challenge';
import ExperienceCard from '@/components/ExperienceCard';
import ExperienceActions from '@/components/ExperienceActions';
import SpecialVisual from '@/components/SpecialVisuals';
import { ALL_EXPERIENCES, getExperience, byCategory } from '@/lib/experiences';
import { CATEGORIES, categoryName } from '@/lib/types';

export function generateStaticParams() {
  return ALL_EXPERIENCES.map(e => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exp = getExperience(slug);
  if (!exp) return { title: 'Experience not found' };
  return { title: exp.title, description: exp.description, openGraph: { title: `${exp.title} — SOKKAR`, description: exp.description } };
}

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exp = getExperience(slug);
  if (!exp) notFound();

  const related = exp.related.map(getExperience).filter(Boolean).slice(0, 3);
  const siblings = byCategory(exp.category);
  const idx = siblings.findIndex(e => e.slug === exp.slug);
  const prev = siblings[(idx - 1 + siblings.length) % siblings.length];
  const next = siblings[(idx + 1) % siblings.length];
  const catInfo = CATEGORIES.find(c => c.id === exp.category)!;

  return (
    <article>
      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '34px 0 30px' }}>
        <div className="container">
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumb">
              <li><Link href="/">Home</Link></li><li aria-hidden="true">›</li>
              <li><Link href={`/category/${exp.category}`}>{categoryName(exp.category)}</Link></li><li aria-hidden="true">›</li>
              <li aria-current="page" style={{ color: '#000', fontWeight: 700 }}>{exp.title}</li>
            </ol>
          </nav>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 760 }}>
              <div className="chip-row" style={{ marginBottom: 12 }}>
                <span className={`chip chip-cat-${exp.category}`}>{categoryName(exp.category).toUpperCase()}</span>
                <span className="chip"><span className="diff-dot" />{exp.difficulty}</span>
                <span className="chip">≈ {exp.duration} minutes</span>
              </div>
              <h1 className="h1">{exp.title}</h1>
              <p className="muted" style={{ marginTop: 12, fontSize: '.95rem', lineHeight: 1.65 }}>{exp.description}</p>
            </div>
            <ExperienceActions slug={exp.slug} />
          </div>
        </div>
      </header>

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 56, padding: '40px 0 20px' }}>
        {/* ── Concept & formula ─────────────────────────────────── */}
        <section aria-labelledby="concept-heading" className="grid-2" style={{ alignItems: 'start' }}>
          <div>
            <span className="eyebrow">The Concept</span>
            <h2 id="concept-heading" className="h2" style={{ margin: '10px 0 16px' }}>What is really going on</h2>
            {exp.concept.map((p, i) => <p key={i} style={{ fontSize: '.9rem', lineHeight: 1.75, color: '#262626', marginBottom: 12 }}>{p}</p>)}
            {exp.assumptions && exp.assumptions.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginTop: 16 }}>
                <div className="tag" style={{ marginBottom: 6 }}>Assumptions & notes</div>
                <ul style={{ paddingLeft: 18, fontSize: '.78rem', color: '#333', lineHeight: 1.7 }}>
                  {exp.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
          {exp.formula && (
            <div>
              <span className="eyebrow">Formula / Logic</span>
              <div className="formula-box" style={{ marginTop: 10 }}>
                <div className="formula-math">{exp.formula}</div>
                {exp.formulaNote && <p className="muted" style={{ fontSize: '.72rem', marginTop: 10 }}>{exp.formulaNote}</p>}
              </div>
              {exp.variables && exp.variables.length > 0 && (
                <table className="var-table" style={{ marginTop: 18 }}>
                  <thead><tr><th scope="col">Symbol</th><th scope="col">Meaning</th><th scope="col">Unit</th></tr></thead>
                  <tbody>
                    {exp.variables.map((v, i) => (
                      <tr key={i}><td>{v.symbol}</td><td>{v.meaning}</td><td className="mono" style={{ fontSize: '.72rem' }}>{v.unit ?? '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>

        {/* ── Interactive simulation (flagship experiences) ───────── */}
        {['hookes-law', 'circular-motion', 'free-fall', 'pythagorean-theorem', 'traffic-light-control', 'elevator-control'].includes(exp.slug) && (
          <section aria-labelledby="simulation-heading">
            <span className="eyebrow">Interactive Simulation</span>
            <h2 id="simulation-heading" className="h2" style={{ margin: '10px 0 14px' }}>See it move</h2>
            <SpecialVisual slug={exp.slug} />
          </section>
        )}

        {/* ── The engine room ─────────────────────────────────── */}
        <section aria-labelledby="workspace-heading">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <span className="eyebrow">Algorithmic Workspace</span>
              <h2 id="workspace-heading" className="h2" style={{ marginTop: 10 }}>Generate the flowchart. Run it. Watch it think.</h2>
            </div>
            <p className="muted" style={{ fontSize: '.75rem', maxWidth: 300, lineHeight: 1.55 }}>The flowchart and the executor are the same object — step through it node by node, or press Run and watch.</p>
          </div>
          <Workspace slug={exp.slug} />
        </section>

        {/* ── Algorithm steps + worked example ─────────────────────── */}
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <section aria-labelledby="algorithm-heading">
            <span className="eyebrow">Algorithm</span>
            <h2 id="algorithm-heading" className="h2" style={{ margin: '10px 0 16px' }}>Step by step</h2>
            <ol className="steps-list">
              {exp.algorithm.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </section>
          <section aria-labelledby="example-heading">
            <span className="eyebrow">Worked Example</span>
            <h2 id="example-heading" className="h2" style={{ margin: '10px 0 16px' }}>{exp.workedExample.title}</h2>
            <div className="card" style={{ padding: 20 }}>
              <ol className="steps-list">
                {exp.workedExample.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <div style={{ borderTop: '2px solid #000', marginTop: 12, paddingTop: 12, fontWeight: 800, fontSize: '.92rem' }}>
                {exp.workedExample.result}
              </div>
            </div>
          </section>
        </div>

        {/* ── Challenge ─────────────────────────────────── */}
        <section aria-labelledby="challenge-section">
          <span className="eyebrow">Test Your Understanding</span>
          <h2 id="challenge-section" className="h2" style={{ margin: '10px 0 16px' }}>Your turn</h2>
          <ChallengeBox challenge={exp.challenge} slug={exp.slug} />
        </section>

        {/* ── Related ─────────────────────────────────── */}
        <section aria-labelledby="related-heading">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <span className="eyebrow">Keep Going</span>
              <h2 id="related-heading" className="h2" style={{ marginTop: 10 }}>Related experiences</h2>
            </div>
            <Link href={`/category/${exp.category}`} className="btn-outline btn btn-sm">All {categoryName(exp.category)}</Link>
          </div>
          <div className="grid-3">
            {related.map(r => r && <ExperienceCard key={r.slug} slug={r.slug} />)}
          </div>
        </section>

        {/* ── Prev / Next ─────────────────────────────────── */}
        <nav aria-label="More experiences in category" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 22, paddingBottom: 8 }}>
          <Link href={`/experience/${prev.slug}`} className="btn-ghost" style={{ textDecoration: 'none', maxWidth: '48%' }}>
            <span className="tag">← Previous in {categoryName(exp.category)}</span><br />
            <strong style={{ fontSize: '.85rem' }}>{prev.title}</strong>
          </Link>
          <Link href={`/experience/${next.slug}`} className="btn-ghost" style={{ textDecoration: 'none', textAlign: 'right', maxWidth: '48%', marginLeft: 'auto' }}>
            <span className="tag">Next →</span><br />
            <strong style={{ fontSize: '.85rem' }}>{next.title}</strong>
          </Link>
        </nav>
      </div>
    </article>
  );
}
