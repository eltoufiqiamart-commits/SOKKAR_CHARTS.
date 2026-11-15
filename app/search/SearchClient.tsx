'use client';
import ExperienceBrowser from '@/components/ExperienceBrowser';
import { ALL_EXPERIENCES } from '@/lib/experiences';

const ALL_SLUGS = ALL_EXPERIENCES.map(e => e.slug);

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  return <ExperienceBrowser slugs={ALL_SLUGS} showCategoryFilter autoFocus initialQuery={initialQuery} />;
}
