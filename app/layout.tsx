import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://sokkar.app'),
  title: { default: 'SOKKAR — Think. Visualize. Execute.', template: '%s — SOKKAR' },
  description: 'Learn mathematics, physics and real-world systems through interactive algorithms and flowcharts. 60 hands-on experiences: understand the problem, define the logic, visualize the flowchart, execute the algorithm.',
  keywords: ['algorithms', 'flowcharts', 'mathematics', 'physics', 'computational thinking', 'education', 'STEM', 'interactive learning'],
  openGraph: { title: 'SOKKAR — Think. Visualize. Execute.', description: 'Interactive educational platform connecting mathematics, physics and real-world systems through algorithms and flowcharts.', type: 'website', siteName: 'SOKKAR' },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#000000', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main" className="skip-link" style={{ position: 'absolute', left: '-9999px', top: 0, background: '#000', color: '#fff', padding: '10px 18px', zIndex: 200, fontSize: '.8rem', fontWeight: 700 }}>Skip to content</a>
        <Nav />
        <div className="page">
          <main id="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
