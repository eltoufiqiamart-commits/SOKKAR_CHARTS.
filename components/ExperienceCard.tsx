'use client';
import Link from 'next/link';
import { getExperience } from '@/lib/experiences';
import { categoryName } from '@/lib/types';
import { useProgress } from '@/lib/progress';

export default function ExperienceCard({ slug }: { slug: string }) {
  const experience = getExperience(slug)!;
  const { isCompleted, hydrated } = useProgress();
  const done = hydrated && isCompleted(experience.slug);
  return (
    <Link href={`/experience/${experience.slug}`} className="card exp-card" aria-label={`${experience.title} — ${categoryName(experience.category)}`}>
      <div className="chip-row">
        <span className={`chip chip-cat-${experience.category}`}>{categoryName(experience.category).toUpperCase()}</span>
        <span className="chip"><span className="diff-dot" />{experience.difficulty}</span>
        <span className="chip">{experience.duration} min</span>
        {done && <span className="done-badge"><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6.5 5 9.5 10 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>Done</span>}
      </div>
      <h3>{experience.title}</h3>
      <p>{experience.description}</p>
      {experience.formula && <div className="mono" style={{ fontSize: '.66rem', color: '#555', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={experience.formula}>{experience.formula}</div>}
      <div className="card-foot">
        <span className="card-open">Open Experience
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        <span className="tag">{experience.keywords.length} topics</span>
      </div>
    </Link>
  );
}
