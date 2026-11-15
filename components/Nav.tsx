'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useProgress } from '@/lib/progress';
import { EXPERIENCE_COUNT } from '@/lib/experiences';

const LINKS = [
  { href: '/category/life-systems', label: 'Life Systems' },
  { href: '/category/physics', label: 'Physics' },
  { href: '/category/mathematics', label: 'Mathematics' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { completed, hydrated } = useProgress();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" aria-label="SOKKAR — home"><Logo /></Link>
        <nav aria-label="Primary">
          <ul className="nav-links">
            {LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href} className={`nav-link ${pathname.startsWith(l.href) ? 'active' : ''}`} aria-current={pathname.startsWith(l.href) ? 'page' : undefined}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-right">
          <Link href="/search" className="btn-icon" aria-label="Search all 60 experiences">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7.2" cy="7.2" r="5.4" stroke="currentColor" strokeWidth="1.6"/><path d="m11.5 11.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <span className="nav-search-label">Search</span>
          </Link>
          <Link href="/progress" className="progress-pill" aria-label={`Your progress: ${hydrated ? completed.length : 0} of ${EXPERIENCE_COUNT} experiences completed`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4.2 7.2 6.4 9.4 9.8 4.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {hydrated ? completed.length : 0}/{EXPERIENCE_COUNT}
          </Link>
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">{open ? <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/> : <path d="M3 5.5h12M3 9h12M3 12.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>}</svg>
          </button>
        </div>
      </div>
      <div id="mobile-menu" className={`mobile-menu ${open ? 'open' : ''}`}>
        {LINKS.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        <Link href="/search">Search</Link>
        <Link href="/progress">Your Progress</Link>
        <Link href="/about">About</Link>
      </div>
    </header>
  );
}
