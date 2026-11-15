import type { Metadata } from 'next';
import SearchClient from './SearchClient';
import { ALL_EXPERIENCES } from '@/lib/experiences';

export const metadata: Metadata = { title: 'Search all 60 experiences', description: 'Search SOKKAR by title, topic, formula or keyword across Life Systems, Physics and Mathematics.' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <div>
      <header style={{ borderBottom: '1px solid var(--border)', padding: '36px 0 30px' }}>
        <div className="container">
          <span className="eyebrow">Global Search</span>
          <h1 className="h1" style={{ marginTop: 12 }}>Search the library</h1>
          <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>Titles, formulas, topics and keywords — all {ALL_EXPERIENCES.length} experiences, ranked live as you type.</p>
        </div>
      </header>
      <div className="container section" style={{ paddingTop: 28 }}>
        <SearchClient initialQuery={q ?? ''} />
      </div>
    </div>
  );
}
