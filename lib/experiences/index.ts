import { lifeExperiences } from './life';
import { physicsExperiences } from './physics';
import { mathExperiences } from './math';
import type { CategoryId, Experience } from '../types';

export const ALL_EXPERIENCES: Experience[] = [
  ...lifeExperiences,
  ...physicsExperiences,
  ...mathExperiences,
];

export function getExperience(slug: string): Experience | undefined {
  return ALL_EXPERIENCES.find(e => e.slug === slug);
}

export function byCategory(category: CategoryId): Experience[] {
  return ALL_EXPERIENCES.filter(e => e.category === category);
}

export function featuredExperiences(): Experience[] {
  return ALL_EXPERIENCES.filter(e => e.featured);
}

export function searchExperiences(query: string): Experience[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_EXPERIENCES;
  return ALL_EXPERIENCES.filter(e => {
    const hay = [
      e.title, e.description, e.formula ?? '', e.category, e.difficulty,
      ...e.keywords,
      ...(e.variables ?? []).flatMap(v => [v.symbol, v.meaning]),
    ].join(' ').toLowerCase();
    return q.split(/\s+/).every(word => hay.includes(word));
  });
}

export const EXPERIENCE_COUNT = ALL_EXPERIENCES.length;
