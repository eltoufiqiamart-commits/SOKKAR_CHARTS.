import type { Metadata } from 'next';
import ProgressClient from './ProgressClient';
export const metadata: Metadata = { title: 'Your Progress', description: 'Your SOKKAR learning progress — completed experiences, saved items and per-category mastery. Everything stays on your device.' };
export default function ProgressPage() {
  return (
    <div>
      <header style={{ borderBottom: '1px solid var(--border)', padding: '36px 0 30px' }}>
        <div className="container">
          <span className="eyebrow">Your Progress</span>
          <h1 className="h1" style={{ marginTop: 12 }}>Learning dashboard</h1>
          <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>Completion is earned by answering each experience’s challenge correctly. Stored locally — private by default.</p>
        </div>
      </header>
      <div className="container section" style={{ paddingTop: 28 }}>
        <ProgressClient />
      </div>
    </div>
  );
}
