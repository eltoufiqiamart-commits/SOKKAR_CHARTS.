import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'About', description: 'SOKKAR connects mathematics, physics and real-world systems through computational thinking — understand, define, visualize, execute.' };
export default function AboutPage() {
  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <span className="eyebrow">About</span>
      <h1 className="h1" style={{ margin: '14px 0 22px' }}>Learn the logic behind the world.</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, lineHeight: 1.8, color: '#262626' }}>
        <p>SOKKAR is an interactive learning platform that treats algorithms as a universal language. A bank transaction, a traffic junction, Ohm’s law and the Euclidean algorithm are the same intellectual act: define the inputs, choose the steps, branch on conditions, produce an output.</p>
        <p>Every one of the 60 experiences follows the same four-step loop:</p>
      </div>
      <ol className="steps-list" style={{ margin: '18px 0' }}>
        <li><strong>Understand</strong> — the problem in plain language, with a concrete scenario.</li>
        <li><strong>Define</strong> — every input, variable, condition and the expected output, named explicitly.</li>
        <li><strong>Visualize</strong> — a flowchart generated from the same structured algorithm that the computer will execute.</li>
        <li><strong>Execute</strong> — a step-through or full run with live variables, decisions and final output.</li>
      </ol>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, lineHeight: 1.8, color: '#262626' }}>
        <p>The simulations in Life Systems are educational models inspired by familiar services — they do not integrate with real banks, ride platforms or retailers, and all prices, fees and rules are illustrative and configurable. Physics experiences use SI units and state their assumptions. Mathematics experiences show every intermediate step.</p>
        <p>No account is required and nothing you do leaves your device. Progress is stored in your browser.</p>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
        <Link href="/category/life-systems" className="btn">Browse Life Systems</Link>
        <Link href="/category/physics" className="btn-outline btn">Browse Physics</Link>
        <Link href="/category/mathematics" className="btn-outline btn">Browse Mathematics</Link>
      </div>
    </div>
  );
}
