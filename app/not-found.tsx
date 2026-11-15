import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="container" style={{ padding: '96px 24px', textAlign: 'center' }}>
      <div className="tag">ERROR 404</div>
      <h1 className="h1" style={{ margin: '12px 0' }}>This node does not exist.</h1>
      <p className="muted" style={{ maxWidth: 420, margin: '0 auto 24px' }}>The page you are looking for is not part of the flowchart. It may have moved or never existed.</p>
      <Link href="/" className="btn">Back to start</Link>
    </div>
  );
}
