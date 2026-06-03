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

  const smokeWisps = useMemo(() => [0,1,2,3].map(i => ({
    left: `${44 + i * 3.5}%`,
    width: 6 + i * 2,
    height: 30 + i * 10,
    duration: 3 + i * 0.5,
    delay: `${i * 0.4}s`,
  })), []);

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

        {/* Smoke wisps */}
        {smokeWisps.map((w, i) => (
          <div key={`smoke-${i}`} className="absolute" style={{
            left: w.left,
            bottom: '52%',
            width: `${w.width}px`,
            height: `${w.height}px`,
            background: 'radial-gradient(ellipse, rgba(180,180,200,0.15), transparent)',
            borderRadius: '50%',
            filter: 'blur(4px)',
            animation: `rise ${w.duration}s ease-in ${w.delay} infinite`,
          }} />
        ))}
      </div>

      <svg width="320" height="260" viewBox="0 0 320 260" style={{ marginBottom: '-20px' }}>
        {/* Pillars with torch flicker */}
        <rect x="20" y="40" width="40" height="200" rx="6" fill="#2a2a3a"
          style={{ animation: 'torchFlicker 3s ease-in-out infinite' }} />
        <rect x="260" y="40" width="40" height="200" rx="6" fill="#2a2a3a"
          style={{ animation: 'torchFlicker 3s ease-in-out 0.5s infinite' }} />
        <path d="M20,90 Q20,20 160,20 Q300,20 300,90" fill="none" stroke="#2a2a3a" strokeWidth="38" strokeLinecap="round" />
        {[60, 95, 130, 165, 200].map(y => <rect key={y} x="22" y={y} width="36" height="2" rx="1" fill="#1a1a2a" opacity="0.6" />)}
        {[60, 95, 130, 165, 200].map(y => <rect key={y} x="262" y={y} width="36" height="2" rx="1" fill="#1a1a2a" opacity="0.6" />)}
        <path d="M60,240 L60,90 Q60,50 160,50 Q260,50 260,90 L260,240 Z" fill="#0a0a12" />

        {/* Ember glow on hearth floor */}
        <ellipse cx="160" cy="238" rx="85" ry="12"
          fill="rgba(255,100,20,0.18)"
          style={{ animation: 'spell-flash 2s ease-in-out infinite alternate' }} />

        {/* Floo flames */}
        <ellipse cx="160" cy="200" rx="80" ry="50" fill="#00FF88" opacity="0.7" style={{ animation: 'flicker 0.8s ease-in-out infinite', transformOrigin: '160px 240px' }} />
        <ellipse cx="160" cy="185" rx="65" ry="55" fill="#00CC66" opacity="0.65" style={{ animation: 'flicker 0.9s ease-in-out infinite', animationDelay: '0.15s', transformOrigin: '160px 240px' }} />
        <ellipse cx="160" cy="165" rx="50" ry="55" fill="#00FF88" opacity="0.55" style={{ animation: 'flicker 1.0s ease-in-out infinite', animationDelay: '0.3s', transformOrigin: '160px 240px' }} />
        <ellipse cx="160" cy="140" rx="35" ry="50" fill="#88FFCC" opacity="0.5" style={{ animation: 'flicker 0.85s ease-in-out infinite', animationDelay: '0.45s', transformOrigin: '160px 240px' }} />
        <ellipse cx="160" cy="115" rx="22" ry="40" fill="#CCFFEE" opacity="0.45" style={{ animation: 'flicker 0.75s ease-in-out infinite', animationDelay: '0.1s', transformOrigin: '160px 240px' }} />

        {/* Heat shimmer above flames */}
        <rect x="100" y="80" width="120" height="40" fill="rgba(0,255,136,0.03)"
          rx="4" style={{ filter: 'blur(1px)', animation: 'spell-flash 0.4s ease-in-out infinite alternate' }} />

        {/* Mantelpiece */}
        <rect x="10" y="35" width="300" height="16" rx="4" fill="#2a2a3a" />
        <rect x="0" y="48" width="320" height="8" rx="2" fill="#1e1e2e" />
        <rect x="55" y="232" width="210" height="12" rx="3" fill="#1e1e2e" />
        <ellipse cx="160" cy="244" rx="90" ry="8" fill="#00AA44" opacity="0.25" />

        {/* Potion bottles on mantelpiece */}
        {/* Purple bottle */}
        <rect x="80" y="20" width="10" height="14" rx="2" fill="#7B2FBE" opacity="0.9"/>
        <rect x="82" y="16" width="6" height="5" rx="1" fill="#9B4FDE" opacity="0.8"/>
        <ellipse cx="85" cy="16" rx="3" ry="2" fill="#FFD700" opacity="0.9"/>
        <ellipse cx="85" cy="28" rx="4" ry="2" fill="rgba(180,100,255,0.3)"/>
        {/* Green bottle */}
        <rect x="152" y="18" width="10" height="16" rx="2" fill="#1A6B3C" opacity="0.9"/>
        <rect x="154" y="14" width="6" height="5" rx="1" fill="#2A8B5C" opacity="0.8"/>
        <ellipse cx="157" cy="14" rx="3" ry="2" fill="#FFD700" opacity="0.9"/>
        <ellipse cx="157" cy="30" rx="4" ry="2" fill="rgba(50,200,100,0.3)"/>
        {/* Orange bottle */}
        <rect x="224" y="19" width="10" height="15" rx="2" fill="#CC4400" opacity="0.9"/>
        <rect x="226" y="15" width="6" height="5" rx="1" fill="#EE6620" opacity="0.8"/>
        <ellipse cx="229" cy="15" rx="3" ry="2" fill="#FFD700" opacity="0.9"/>
        <ellipse cx="229" cy="29" rx="4" ry="2" fill="rgba(255,120,50,0.3)"/>
      </svg>
    </div>
  );
}
