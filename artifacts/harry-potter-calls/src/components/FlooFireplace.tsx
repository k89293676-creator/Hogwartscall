import { useMemo } from 'react';

interface Particle {
  width: number; height: number;
  left: string; bottom: string;
  color: string; shadow: string;
  duration: number; delay: string;
}

export function FlooFireplace() {
  const particles = useMemo<Particle[]>(() => Array.from({ length: 20 }, (_, i) => {
    const color = i % 3 === 0 ? '#00FF88' : i % 3 === 1 ? '#00CC66' : '#88FFCC';
    return {
      width: 4 + Math.random() * 5,
      height: 4 + Math.random() * 5,
      left: `${38 + (Math.random() - 0.5) * 18}%`,
      bottom: `${5 + Math.random() * 25}%`,
      color,
      shadow: `0 0 6px ${color}`,
      duration: 2.5 + Math.random() * 1.5,
      delay: `${(i * 0.18) % 3}s`,
    };
  }), []);

  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ zIndex: -1 }}>
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div key={i} className="floo-particle absolute rounded-full"
            style={{
              width: `${p.width}px`, height: `${p.height}px`,
              left: p.left, bottom: p.bottom,
              background: p.color, boxShadow: p.shadow,
              animation: `rise ${p.duration}s ease-in infinite`,
              animationDelay: p.delay, opacity: 0.8,
            }} />
        ))}
      </div>
      <svg width="320" height="260" viewBox="0 0 320 260" style={{ marginBottom: '-20px' }}>
        <rect x="20" y="40" width="40" height="200" rx="6" fill="#2a2a3a" />
        <rect x="260" y="40" width="40" height="200" rx="6" fill="#2a2a3a" />
        <path d="M20,90 Q20,20 160,20 Q300,20 300,90" fill="none" stroke="#2a2a3a" strokeWidth="38" strokeLinecap="round" />
        {[60, 95, 130, 165, 200].map(y => <rect key={y} x="22" y={y} width="36" height="2" rx="1" fill="#1a1a2a" opacity="0.6" />)}
        {[60, 95, 130, 165, 200].map(y => <rect key={y} x="262" y={y} width="36" height="2" rx="1" fill="#1a1a2a" opacity="0.6" />)}
        <path d="M60,240 L60,90 Q60,50 160,50 Q260,50 260,90 L260,240 Z" fill="#0a0a12" />
        <ellipse cx="160" cy="200" rx="80" ry="50" fill="#00FF88" opacity="0.7" style={{ animation: 'flicker 0.8s ease-in-out infinite', transformOrigin: '160px 240px' }} />
        <ellipse cx="160" cy="185" rx="65" ry="55" fill="#00CC66" opacity="0.65" style={{ animation: 'flicker 0.9s ease-in-out infinite', animationDelay: '0.15s', transformOrigin: '160px 240px' }} />
        <ellipse cx="160" cy="165" rx="50" ry="55" fill="#00FF88" opacity="0.55" style={{ animation: 'flicker 1.0s ease-in-out infinite', animationDelay: '0.3s', transformOrigin: '160px 240px' }} />
        <ellipse cx="160" cy="140" rx="35" ry="50" fill="#88FFCC" opacity="0.5" style={{ animation: 'flicker 0.85s ease-in-out infinite', animationDelay: '0.45s', transformOrigin: '160px 240px' }} />
        <ellipse cx="160" cy="115" rx="22" ry="40" fill="#CCFFEE" opacity="0.45" style={{ animation: 'flicker 0.75s ease-in-out infinite', animationDelay: '0.1s', transformOrigin: '160px 240px' }} />
        <rect x="10" y="35" width="300" height="16" rx="4" fill="#2a2a3a" />
        <rect x="0" y="48" width="320" height="8" rx="2" fill="#1e1e2e" />
        <rect x="55" y="232" width="210" height="12" rx="3" fill="#1e1e2e" />
        <ellipse cx="160" cy="244" rx="90" ry="8" fill="#00AA44" opacity="0.25" />
      </svg>
    </div>
  );
}
