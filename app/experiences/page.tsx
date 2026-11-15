import type { Metadata } from 'next';
import ExperienceBrowser from '@/components/ExperienceBrowser';
import { ALL_EXPERIENCES } from '@/lib/experiences';

export const metadata: Metadata = {
  title: 'All experiences',
  description: 'Browse the full SOKKAR library — 60 interactive experiences across Life Systems, Physics and Mathematics. Filter, search and sort by difficulty, duration and status.',
};

const ALL_SLUGS = ALL_EXPERIENCES.map(e => e.slug);

export default function ExperiencesPage() {
  return (
    <div>
      <header style={{ borderBottom: '1px solid var(--border)', padding: '36px 0 30px' }}>
        <div className="container">
          <span className="eyebrow">The Library</span>
          <h1 className="h1" style={{ marginTop: 12 }}>All experiences</h1>
          <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>
            Every SOKKAR experience — {ALL_EXPERIENCES.length} interactive algorithms across three disciplines.
            Filter by category, difficulty or duration, or search by keyword.
          </p>
        </div>
      </header>
      <div className="container section" style={{ paddingTop: 28 }}>
        <ExperienceBrowser slugs={ALL_SLUGS} showCategoryFilter />
      </div>
    </div>
  );
}
