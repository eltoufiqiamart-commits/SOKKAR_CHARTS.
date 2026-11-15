'use client';
import Link from 'next/link';
import { useProgress, readStreak } from '@/lib/progress';
import { ALL_EXPERIENCES, byCategory } from '@/lib/experiences';
import { CATEGORIES } from '@/lib/types';
import ExperienceCard from '@/components/ExperienceCard';

export default function ProgressClient() {
  const { completed, saved, hydrated, toggleCompleted } = useProgress();
  const total = ALL_EXPERIENCES.length;
  const doneCount = hydrated ? completed.length : 0;
  const pct = Math.round((doneCount / total) * 100);
  const savedList = ALL_EXPERIENCES.filter(e => saved.includes(e.slug));
  const doneList = ALL_EXPERIENCES.filter(e => completed.includes(e.slug));
  const perCategory = CATEGORIES.map(c => ({ id: c.id, done: byCategory(c.id).filter(e => completed.includes(e.slug)).length }));
  const streak = hydrated ? readStreak().count : 0;

  const milestones = [
    { id: 'first', title: 'First Algorithm', desc: 'Complete your first experience', target: 1, current: doneCount },
    { id: 'five', title: 'Warming Up', desc: 'Complete 5 experiences', target: 5, current: doneCount },
    { id: 'ten', title: 'Momentum', desc: 'Complete 10 experiences', target: 10, current: doneCount },
    { id: 'every', title: 'Every Discipline', desc: 'Complete at least one experience in each category', target: 3, current: perCategory.filter(c => c.done > 0).length },
    { id: 'quarter', title: 'Quarter Library', desc: 'Complete 15 experiences', target: 15, current: doneCount },
    { id: 'specialist', title: 'Category Closer', desc: 'Complete all 20 in any one category', target: 20, current: Math.max(0, ...perCategory.map(c => c.done)) },
    { id: 'half', title: 'Halfway There', desc: 'Complete 30 experiences', target: 30, current: doneCount },
    { id: 'curator', title: 'Curator', desc: 'Save 5 experiences for later', target: 5, current: saved.length },
    { id: 'streak', title: 'Consistency', desc: 'Reach a 3-day completion streak', target: 3, current: streak },
    { id: 'master', title: 'SOKKAR Master', desc: 'Complete all 60 experiences', target: 60, current: doneCount },
  ].map(m => ({ ...m, earned: m.current >= m.target }));
  const earnedCount = milestones.filter(m => m.earned).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* headline stats */}
      <div className="grid-4">
        <div className="kpi"><div className="k">Completed</div><div className="v" style={{ fontSize: '1.5rem' }}>{doneCount}<span className="muted" style={{ fontSize: '.8rem' }}> / {total}</span></div></div>
        <div className="kpi"><div className="k">Mastery</div><div className="v" style={{ fontSize: '1.5rem' }}>{pct}%</div></div>
        <div className="kpi"><div className="k">Saved</div><div className="v" style={{ fontSize: '1.5rem' }}>{saved.length}</div></div>
        <div className="kpi"><div className="k">Remaining</div><div className="v" style={{ fontSize: '1.5rem' }}>{total - doneCount}</div></div>
      </div>
      <div className="bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Overall completion">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* per-category breakdown */}
      <div className="grid-3">
        {CATEGORIES.map(cat => {
          const items = byCategory(cat.id);
          const done = items.filter(e => completed.includes(e.slug)).length;
          const catPct = Math.round((done / items.length) * 100);
          return (
            <Link key={cat.id} href={`/category/${cat.id}`} className="card" style={{ padding: 20, textDecoration: 'none', color: 'inherit' }}>
              <div className="tag" style={{ marginBottom: 6 }}>{cat.name.toUpperCase()}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{done}<span className="muted" style={{ fontSize: '.8rem' }}> / {items.length}</span></span>
                <span className="mono" style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>{catPct}%</span>
              </div>
              <div className="bar-track" style={{ marginTop: 10 }}><div className="bar-fill" style={{ width: `${catPct}%` }} /></div>
            </Link>
          );
        })}
      </div>

      {/* milestones */}
      <section aria-labelledby="milestones-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 id="milestones-heading" className="h2">Milestones</h2>
          <span className="mono" style={{ fontSize: '.72rem', color: 'var(--text-secondary)' }}>{earnedCount} / {milestones.length} earned</span>
        </div>
        <ul className="milestone-grid">
          {milestones.map(m => (
            <li key={m.id} className={`milestone${m.earned ? ' earned' : ''}`} aria-label={`${m.title}: ${m.earned ? 'earned' : `${Math.min(m.current, m.target)} of ${m.target}`}`}>
              <span className="milestone-box" aria-hidden="true">
                {m.earned
                  ? <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6.5 5 9.5 10 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.4" rx="1"/></svg>}
              </span>
              <span>
                <span className="milestone-title">{m.title}</span>
                <span className="milestone-desc">{m.desc}</span>
                {!m.earned && <span className="milestone-progress">{Math.min(m.current, m.target)} / {m.target}</span>}
              </span>
            </li>
          ))}
        </ul>
        {streak > 0 && <p className="muted" style={{ marginTop: 10, fontSize: '.78rem' }}>Current streak: <strong>{streak} {streak === 1 ? 'day' : 'days'}</strong> — complete at least one experience each day to keep it alive.</p>}
      </section>

      {/* saved */}
      {savedList.length > 0 && (
        <section aria-labelledby="saved-heading">
          <h2 id="saved-heading" className="h2" style={{ marginBottom: 14 }}>Saved for later</h2>
          <div className="grid-3">{savedList.map(e => <ExperienceCard key={e.slug} slug={e.slug} />)}</div>
        </section>
      )}

      {/* completed */}
      <section aria-labelledby="done-heading">
        <h2 id="done-heading" className="h2" style={{ marginBottom: 14 }}>Completed experiences</h2>
        {doneList.length === 0 ? (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p className="muted" style={{ marginBottom: 16 }}>Nothing completed yet. Every experience ends with a short challenge — answer it correctly to mark it done.</p>
            <Link href="/category/life-systems" className="btn">Start with Life Systems</Link>
          </div>
        ) : (
          <div className="grid-3">{doneList.map(e => <ExperienceCard key={e.slug} slug={e.slug} />)}</div>
        )}
      </section>

      {/* reset */}
      {doneList.length > 0 && (
        <div>
          <button className="btn-ghost" style={{ color: 'var(--error)', fontSize: '.75rem' }}
            onClick={() => { if (window.confirm('Reset all SOKKAR progress on this device? This cannot be undone.')) { for (const slug of completed) toggleCompleted(slug); } }}>
            Reset all progress
          </button>
        </div>
      )}
    </div>
  );
}
