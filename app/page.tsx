import Link from 'next/link';
import Image from 'next/image';
import ExperienceCard from '@/components/ExperienceCard';
import { CATEGORIES } from '@/lib/types';

const FEATURED = ['banking-account', 'traffic-light-control', 'hookes-law', 'ohms-law', 'quadratic-equation', 'greatest-common-divisor'];

const STEPS = [
  { n: '01', title: 'Understand', body: 'Grasp the scientific or real-world problem first — what is actually being asked?' },
  { n: '02', title: 'Define', body: 'Identify inputs, variables, conditions and the expected output. Name everything.' },
  { n: '03', title: 'Visualize', body: 'Generate the flowchart of the algorithm — from Start to End, branch by branch.' },
  { n: '04', title: 'Execute', body: 'Run it, step through it, watch variables change and see why the answer is what it is.' },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Interactive Learning Platform</span>
            <h1 className="display" style={{ marginTop: 18 }}>Turn Real Problems Into <span style={{ borderBottom: '6px solid #000' }}>Logical Solutions.</span></h1>
            <p className="muted" style={{ fontSize: '1.02rem', marginTop: 20, maxWidth: 520, lineHeight: 1.65 }}>
              Explore mathematics, understand physics, and discover how real-world systems work — through interactive algorithms and flowcharts.
            </p>
            <div className="hero-ctas">
              <Link href="/experiences" className="btn" style={{ fontSize: '.88rem', padding: '14px 26px' }}>Explore Experiences
                <svg width="15" height="15" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="#how" className="btn btn-outline" style={{ fontSize: '.88rem', padding: '14px 26px' }}>How It Works</Link>
            </div>
            <div className="kicker-row" aria-label="Platform facts">
              <span className="kicker"><span className="logo-dot" style={{ width: 6, height: 6 }} />60 experiences</span>
              <span className="kicker"><span className="logo-dot" style={{ width: 6, height: 6 }} />3 disciplines</span>
              <span className="kicker"><span className="logo-dot" style={{ width: 6, height: 6 }} />No account needed</span>
              <span className="kicker"><span className="logo-dot" style={{ width: 6, height: 6 }} />Runs in your browser</span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div style={{ position: 'relative', border: '1px solid var(--border-strong)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <Image src="/images/hero-flowchart.jpg" alt="Minimal geometric flowchart illustration" width={640} height={760} priority style={{ width: '100%', height: 'auto', display: 'block' }} />
              <div style={{ position: 'absolute', left: 14, bottom: 14, background: '#000', color: '#fff', borderRadius: 8, padding: '10px 14px', maxWidth: 230 }}>
                <div className="mono" style={{ fontSize: '.58rem', letterSpacing: '.12em', opacity: .75 }}>ALGORITHM PREVIEW</div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, marginTop: 3 }}>v = s ÷ t</div>
                <div className="mono" style={{ fontSize: '.6rem', opacity: .8, marginTop: 2 }}>start → input → validate → compute → end</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────── */}
      <section className="section-tight" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container">
          <div className="grid-3">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.id} href={`/category/${cat.id}`} className="card" style={{ padding: '26px 24px', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
                <span className="mono" style={{ fontSize: '.68rem', color: 'var(--text-secondary)' }}>0{i + 1}</span>
                <h2 style={{ fontSize: '1.35rem', letterSpacing: '-0.02em', fontWeight: 800 }}>{cat.name.toUpperCase()}</h2>
                <p style={{ fontSize: '.85rem', color: '#333', lineHeight: 1.55 }}>{cat.tagline}</p>
                <span className="card-open" style={{ marginTop: 'auto', paddingTop: 14 }}>20 experiences
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured experiences ─────────────────────────────────── */}
      <section className="section" aria-labelledby="featured-heading">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            <div>
              <span className="eyebrow">Featured</span>
              <h2 id="featured-heading" className="h1" style={{ marginTop: 12 }}>Start with these.</h2>
            </div>
            <Link href="/experiences" className="btn-outline btn btn-sm">View all 60</Link>
          </div>
          <div className="grid-3">
            {FEATURED.map(slug => <ExperienceCard key={slug} slug={slug} />)}
          </div>
        </div>
      </section>

      {/* ── How SOKKAR works ─────────────────────────────────── */}
      <section className="section" id="how" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }} aria-labelledby="how-heading">
        <div className="container">
          <span className="eyebrow">The Method</span>
          <h2 id="how-heading" className="h1" style={{ margin: '12px 0 10px', maxWidth: 640 }}>How SOKKAR Works</h2>
          <p className="muted" style={{ marginBottom: 30, maxWidth: 560, fontSize: '.95rem' }}>Understand the problem. Define the logic. Visualize the algorithm. Execute the solution.</p>
          <ol className="process-steps" style={{ listStyle: 'none' }}>
            {STEPS.map(s => (
              <li className="process-step" key={s.n}>
                <div className="process-num">{s.n}</div>
                <h3 className="h3" style={{ margin: '8px 0 6px' }}>{s.title}</h3>
                <p style={{ fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="muted" style={{ marginTop: 26, fontSize: '.8rem' }}>Every experience follows the same loop: concept → inputs → flowchart → execution trace → challenge. One method, sixty doorways.</p>
        </div>
      </section>

      {/* ── Closing CTA ─────────────────────────────────── */}
      <section style={{ background: '#000', color: '#fff', padding: '84px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '.66rem', letterSpacing: '.2em', opacity: .7 }}>SOKKAR — THINK. VISUALIZE. EXECUTE.</div>
          <h2 className="h1" style={{ margin: '16px auto 14px', maxWidth: 780, color: '#fff' }}>An algorithm is just a recipe you can watch the computer cook.</h2>
          <p style={{ opacity: .75, maxWidth: 480, margin: '0 auto 30px', lineHeight: 1.65 }}>Pick any experience, generate its flowchart, press Run and watch every decision happen live.</p>
          <Link href="/category/mathematics" className="btn" style={{ background: '#fff', color: '#000', borderColor: '#fff' }}>Start with Mathematics
            <svg width="15" height="15" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </section>
    </>
  );
}
