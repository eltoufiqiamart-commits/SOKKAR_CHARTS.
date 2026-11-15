export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="logo" aria-label="SOKKAR home">
      <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#000" />
        <text x="16" y="22.5" textAnchor="middle" fontFamily="var(--font-inter), Inter, sans-serif" fontWeight="800" fontSize="17" fill="#fff">S</text>
        <rect x="22.4" y="7.5" width="2.6" height="2.6" fill="#fff" transform="rotate(45 23.7 8.8)" />
      </svg>
      <span className="logo-word">SOKKAR</span>
    </span>
  );
}
