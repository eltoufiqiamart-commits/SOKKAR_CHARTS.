import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div style={{ maxWidth: 320 }}>
            <Link href="/" aria-label="SOKKAR — home" style={{ textDecoration: 'none' }}><Logo size={26} /></Link>
            <p className="muted" style={{ fontSize: '.8rem', marginTop: 12, lineHeight: 1.7 }}>Learn the logic behind the world. Mathematics, physics and real systems — through algorithms and flowcharts.</p>
          </div>
          <nav aria-label="Footer">
            <div className="tag" style={{ marginBottom: 12 }}>Explore</div>
            <ul className="footer-links" style={{ flexDirection: 'column', gap: 8 }}>
              <li><Link href="/category/life-systems">Life Systems</Link></li>
              <li><Link href="/category/physics">Physics</Link></li>
              <li><Link href="/category/mathematics">Mathematics</Link></li>
              <li><Link href="/search">Search</Link></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <div className="tag" style={{ marginBottom: 12 }}>Company</div>
            <ul className="footer-links" style={{ flexDirection: 'column', gap: 8 }}>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/progress">Your Progress</Link></li>
            </ul>
          </nav>
        </div>
        <div className="attribution">
          <span>© {year} SOKKAR. All computations happen on your device.</span>
          <span>Made by <a href="https://web-3-velix-ai.vercel.app/" target="_blank" rel="noopener noreferrer">VELIX AI</a></span>
        </div>
      </div>
    </footer>
  );
}
