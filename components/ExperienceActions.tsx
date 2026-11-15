'use client';
import { useEffect } from 'react';
import { useProgress } from '@/lib/progress';

export default function ExperienceActions({ slug }: { slug: string }) {
  const { isSaved, isCompleted, toggleSaved, toggleCompleted, recordVisit, hydrated } = useProgress();
  useEffect(() => { recordVisit(slug); }, [slug, recordVisit]);
  const saved = hydrated && isSaved(slug);
  const done = hydrated && isCompleted(slug);
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="btn-icon" aria-pressed={saved} onClick={() => toggleSaved(slug)}
        aria-label={saved ? 'Remove from saved experiences' : 'Save this experience'} title={saved ? 'Saved' : 'Save'}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill={saved ? 'currentColor' : 'none'} aria-hidden="true"><path d="M3.5 2.5h8a1 1 0 0 1 1 1V13l-5-3.2L2.5 13V3.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
        {saved ? 'Saved' : 'Save'}
      </button>
      <button className="btn-icon" aria-pressed={done} onClick={() => toggleCompleted(slug)}
        aria-label={done ? 'Mark as not completed' : 'Mark as completed'} title={done ? 'Completed' : 'Mark complete'}
        style={done ? { background: '#000', color: '#fff', borderColor: '#000' } : undefined}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M2.5 8 6 11.5 12.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {done ? 'Completed' : 'Mark complete'}
      </button>
    </div>
  );
}
