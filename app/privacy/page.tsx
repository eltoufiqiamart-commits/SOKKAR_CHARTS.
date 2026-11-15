import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy', description: 'SOKKAR privacy: no accounts, no tracking, no data leaves your device. Progress is stored in your browser’s local storage.' };
export default function PrivacyPage() {
  const h2 = { fontSize: '1.05rem', margin: '26px 0 8px', letterSpacing: '-0.01em' } as const;
  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <span className="eyebrow">Privacy</span>
      <h1 className="h1" style={{ margin: '14px 0 18px' }}>Your learning stays on your device.</h1>
      <p style={{ lineHeight: 1.8, color: '#262626' }}>SOKKAR is designed to work without an account. This page states exactly what is stored and where — plainly and completely.</p>

      <h2 style={h2}>What we store, and where</h2>
      <p style={{ lineHeight: 1.8, color: '#262626' }}>SOKKAR saves two things in your browser’s local storage: the list of experiences you have completed (with timestamps of nothing else), and your saved/bookmarked experiences. If you clear your browser data, this information is erased. It never leaves your device.</p>

      <h2 style={h2}>What we do not collect</h2>
      <p style={{ lineHeight: 1.8, color: '#262626' }}>No name, email, school, location, IP address or usage analytics are collected. There are no advertising or tracking cookies. SOKKAR does not run third-party analytics scripts.</p>

      <h2 style={h2}>External links</h2>
      <p style={{ lineHeight: 1.8, color: '#262626' }}>The footer contains a link to VELIX AI (web-3-velix-ai.vercel.app). Following that link means interacting with a separate site governed by its own privacy practices.</p>

      <h2 style={h2}>Educational simulations</h2>
      <p style={{ lineHeight: 1.8, color: '#262626' }}>Life Systems experiences are educational simulations. No real financial transactions, reservations, registrations or orders are created, and no data is transmitted.</p>

      <p className="muted" style={{ marginTop: 26, fontSize: '.8rem' }}>Questions? Reach out via the VELIX AI site linked in the footer.</p>
    </div>
  );
}
