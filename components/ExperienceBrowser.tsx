'use client';
import { useEffect, useMemo, useState } from 'react';
import ExperienceCard from './ExperienceCard';
import type { CategoryId, Difficulty } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import { getExperience, searchExperiences } from '@/lib/experiences';
import { useProgress } from '@/lib/progress';

type SortKey = 'recommended' | 'title' | 'duration' | 'difficulty';
const DIFF_ORDER: Record<Difficulty, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

interface Props {
  slugs: string[];
  showCategoryFilter?: boolean;
  initialQuery?: string;
  autoFocus?: boolean;
}

export default function ExperienceBrowser({ slugs, showCategoryFilter = false, initialQuery = '', autoFocus = false }: Props) {
  const experiences = useMemo(() => slugs.map(s => getExperience(s)!).filter(Boolean), [slugs]);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<'all' | CategoryId>('all');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');
  const [duration, setDuration] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [status, setStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [sort, setSort] = useState<SortKey>('recommended');
  const { completed, hydrated } = useProgress();

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  const results = useMemo(() => {
    // Search ranks across the full set; structural filters apply on top.
    const searched = query.trim() ? searchExperiences(query).filter(e => experiences.includes(e)) : experiences;
    let list = searched.filter(e => {
      if (showCategoryFilter && category !== 'all' && e.category !== category) return false;
      if (difficulty !== 'all' && e.difficulty !== difficulty) return false;
      if (duration === 'short' && e.duration >= 10) return false;
      if (duration === 'medium' && (e.duration < 10 || e.duration > 15)) return false;
      if (duration === 'long' && e.duration <= 15) return false;
      if (status !== 'all' && hydrated) {
        const done = completed.includes(e.slug);
        if (status === 'completed' && !done) return false;
        if (status === 'pending' && done) return false;
      }
      return true;
    });
    switch (sort) {
      case 'title': list = [...list].sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'duration': list = [...list].sort((a, b) => a.duration - b.duration); break;
      case 'difficulty': list = [...list].sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]); break;
      default: break; // recommended = content order
    }
    return list;
  }, [experiences, query, category, difficulty, duration, status, sort, showCategoryFilter, completed, hydrated]);

  const clearAll = () => { setQuery(''); setCategory('all'); setDifficulty('all'); setDuration('all'); setStatus('all'); setSort('recommended'); };
  const filtersActive = query.trim() !== '' || category !== 'all' || difficulty !== 'all' || duration !== 'all' || status !== 'all' || sort !== 'recommended';

  return (
    <div>
      <div className="filter-bar" role="search" aria-label="Filter experiences">
        <div className="input-wrap search-input" style={{ minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7.2" cy="7.2" r="5.4" stroke="currentColor" strokeWidth="1.6"/><path d="m11.5 11.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <input className="input" style={{ paddingLeft: 36 }} type="search" placeholder="Search titles, formulas, topics…" value={query} autoFocus={autoFocus} onChange={e => setQuery(e.target.value)} aria-label="Search experiences" />
        </div>
        {showCategoryFilter && (
          <select className="input" value={category} onChange={e => setCategory(e.target.value as 'all' | CategoryId)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value as 'all' | Difficulty)} aria-label="Filter by difficulty">
          <option value="all">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select className="input" value={duration} onChange={e => setDuration(e.target.value as typeof duration)} aria-label="Filter by duration">
          <option value="all">Any length</option>
          <option value="short">Under 10 min</option>
          <option value="medium">10–15 min</option>
          <option value="long">Over 15 min</option>
        </select>
        <select className="input" value={status} onChange={e => setStatus(e.target.value as typeof status)} aria-label="Filter by completion status">
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Not completed</option>
        </select>
        <select className="input" value={sort} onChange={e => setSort(e.target.value as SortKey)} aria-label="Sort results">
          <option value="recommended">Sort: Recommended</option>
          <option value="title">Sort: A to Z</option>
          <option value="duration">Sort: Shortest first</option>
          <option value="difficulty">Sort: Easiest first</option>
        </select>
        {filtersActive && <button className="btn-ghost" onClick={clearAll}>Clear</button>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 2px 12px', gap: 10 }}>
        <p className="muted" role="status" aria-live="polite" style={{ fontSize: '.78rem' }}>
          <strong style={{ color: '#000' }}>{results.length}</strong> {results.length === 1 ? 'experience' : 'experiences'}{query.trim() ? <> for “<strong style={{ color: '#000' }}>{query.trim()}</strong>”</> : null}
        </p>
      </div>
      {results.length > 0 ? (
        <div className="grid-3">{results.map(e => <ExperienceCard key={e.slug} slug={e.slug} />)}</div>
      ) : (
        <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto 14px' }} aria-hidden="true"><circle cx="19" cy="19" r="13" stroke="#111" strokeWidth="1.6"/><path d="m29 29 9 9" stroke="#111" strokeWidth="1.6" strokeLinecap="round"/><path d="M14 19h10" stroke="#111" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <h2 className="h3">Nothing matches those filters</h2>
          <p className="muted" style={{ fontSize: '.85rem', margin: '8px auto 18px', maxWidth: 380 }}>Try a broader term — “velocity”, “discount” or “gcd” all work — or clear the filters below.</p>
          <button className="btn btn-outline btn-sm" onClick={clearAll}>Clear all filters</button>
        </div>
      )}
    </div>
  );
}
