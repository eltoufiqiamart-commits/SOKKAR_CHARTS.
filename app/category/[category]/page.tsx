import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import ExperienceBrowser from '@/components/ExperienceBrowser';
import { byCategory } from '@/lib/experiences';
import { CATEGORIES } from '@/lib/types';

export function generateStaticParams() {
  return CATEGORIES.map(c => ({ category: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const info = CATEGORIES.find(c => c.id === category);
  if (!info) return { title: 'Category not found' };
  return { title: info.name, description: `${info.description} Browse all 20 ${info.name} experiences on SOKKAR.` };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const info = CATEGORIES.find(c => c.id === category);
  if (!info) notFound();
  const experiences = byCategory(info.id);
  const others = CATEGORIES.filter(c => c.id !== info.id);

  return (
    <div>
      <header style={{ borderBottom: '1px solid var(--border)', padding: '36px 0 30px' }}>
        <div className="container">
          <nav aria-label="Breadcrumb"><ol className="breadcrumb"><li><Link href="/">Home</Link></li><li aria-hidden="true">›</li><li aria-current="page" style={{ color: '#000', fontWeight: 700 }}>{info.name}</li></ol></nav>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginTop: 18, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 620 }}>
              <span className="eyebrow">{info.name}</span>
              <h1 className="h1" style={{ marginTop: 12 }}>{info.name}</h1>
              <p className="muted" style={{ marginTop: 12, lineHeight: 1.7 }}>{info.description}</p>
            </div>
            <div className="kpi" style={{ textAlign: 'right' }}>
              <div className="k">Experiences</div>
              <div className="v" style={{ fontSize: '1.6rem' }}>{experiences.length}</div>
            </div>
          </div>
        </div>
      </header>
      <div className="container section" style={{ paddingTop: 30 }}>
        <ExperienceBrowser slugs={experiences.map(e => e.slug)} />
        <nav aria-label="Other categories" style={{ display: 'flex', gap: 10, marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 22, flexWrap: 'wrap' }}>
          <span className="muted" style={{ fontSize: '.78rem', alignSelf: 'center' }}>Explore instead:</span>
          {others.map(o => <Link key={o.id} href={`/category/${o.id}`} className="btn-outline btn btn-sm">{o.name}</Link>)}
        </nav>
      </div>
    </div>
  );
}
