import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Wand2 } from 'lucide-react';

interface VideoTileProps {
  stream: MediaStream | null;
  muted?: boolean;
  label: string;
  className?: string;
  wizardName?: string;
  house?: string;
  isSpellActive?: boolean;
  spellColor?: string;
  isAudioActive?: boolean;
  style?: React.CSSProperties;
}

const HOUSE_COLORS: Record<string, { primary: string; secondary: string }> = {
  gryffindor: { primary: '#C41E3A', secondary: '#D4AF37' },
  slytherin:  { primary: '#1A472A', secondary: '#AAAAAA' },
  ravenclaw:  { primary: '#0E1A40', secondary: '#946B2D' },
  hufflepuff: { primary: '#F0C75E', secondary: '#372E29' },
};

function HouseFrame({ house, color }: { house: string; color: string }) {
  if (house === 'gryffindor') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 2 }}>
        <path d="M0 8 Q0 0 8 0 L0 0 Z" fill={color} opacity="0.7"/>
        <path d="M92 0 Q100 0 100 8 L100 0 Z" fill={color} opacity="0.7"/>
        <path d="M0 92 Q0 100 8 100 L0 100 Z" fill={color} opacity="0.7"/>
        <path d="M100 92 Q100 100 92 100 L100 100 Z" fill={color} opacity="0.7"/>
        <ellipse cx="8" cy="8" rx="5" ry="4" fill={color} opacity="0.5"/>
        <circle cx="8" cy="6" r="2.5" fill={color} opacity="0.6"/>
        <circle cx="8" cy="6" r="3.5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.4"/>
        <ellipse cx="92" cy="8" rx="5" ry="4" fill={color} opacity="0.5"/>
        <circle cx="92" cy="6" r="2.5" fill={color} opacity="0.6"/>
        <circle cx="92" cy="6" r="3.5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.4"/>
        <rect x="0" y="0" width="100" height="100" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" rx="1"/>
        <path d="M4 4 L96 4 M4 96 L96 96 M4 4 L4 96 M96 4 L96 96" stroke={color} strokeWidth="0.4" opacity="0.3" fill="none"/>
        <path d="M35 0 Q50 6 65 0" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M35 100 Q50 94 65 100" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5"/>
      </svg>
    );
  }
  if (house === 'slytherin') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 2 }}>
        <path d="M2 10 Q5 18 2 26 Q5 34 2 42 Q5 50 2 58 Q5 66 2 74 Q5 82 2 90" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
        <path d="M98 10 Q95 18 98 26 Q95 34 98 42 Q95 50 98 58 Q95 66 98 74 Q95 82 98 90" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
        <path d="M10 2 Q18 5 26 2 Q34 5 42 2 Q50 5 58 2 Q66 5 74 2 Q82 5 90 2" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
        <path d="M10 98 Q18 95 26 98 Q34 95 42 98 Q50 95 58 98 Q66 95 74 98 Q82 95 90 98" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
        <ellipse cx="5" cy="5" rx="4" ry="3" fill={color} opacity="0.3"/>
        <ellipse cx="95" cy="5" rx="4" ry="3" fill={color} opacity="0.3"/>
        <ellipse cx="5" cy="95" rx="4" ry="3" fill={color} opacity="0.3"/>
        <ellipse cx="95" cy="95" rx="4" ry="3" fill={color} opacity="0.3"/>
      </svg>
    );
  }
  if (house === 'ravenclaw') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 2 }}>
        <rect x="1" y="1" width="98" height="98" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5" rx="1"/>
        <rect x="4" y="4" width="92" height="92" fill="none" stroke={color} strokeWidth="0.4" opacity="0.3" rx="1"/>
        <path d="M0 0 Q8 4 4 12 Q0 8 0 0Z" fill={color} opacity="0.4"/>
        <path d="M100 0 Q92 4 96 12 Q100 8 100 0Z" fill={color} opacity="0.4"/>
        <path d="M0 20 L8 14 L16 20 L8 26 Z" fill={color} opacity="0.25"/>
        <path d="M100 20 L92 14 L84 20 L92 26 Z" fill={color} opacity="0.25"/>
        <path d="M0 80 L8 74 L16 80 L8 86 Z" fill={color} opacity="0.25"/>
        <path d="M100 80 L92 74 L84 80 L92 86 Z" fill={color} opacity="0.25"/>
        <path d="M20 1 L30 4 L40 1 L50 4 L60 1 L70 4 L80 1" stroke={color} strokeWidth="0.5" fill="none" opacity="0.4"/>
        <path d="M20 99 L30 96 L40 99 L50 96 L60 99 L70 96 L80 99" stroke={color} strokeWidth="0.5" fill="none" opacity="0.4"/>
      </svg>
    );
  }
  if (house === 'hufflepuff') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 2 }}>
        <rect x="0" y="0" width="100" height="100" fill="none" stroke={color} strokeWidth="0.8" opacity="0.4"/>
        <rect x="0" y="0" width="12" height="3" fill={color} opacity="0.4"/>
        <rect x="0" y="5" width="8" height="2" fill={color} opacity="0.3"/>
        <rect x="88" y="0" width="12" height="3" fill={color} opacity="0.4"/>
        <rect x="92" y="5" width="8" height="2" fill={color} opacity="0.3"/>
        <rect x="0" y="97" width="12" height="3" fill={color} opacity="0.4"/>
        <rect x="0" y="93" width="8" height="2" fill={color} opacity="0.3"/>
        <rect x="88" y="97" width="12" height="3" fill={color} opacity="0.4"/>
        <rect x="92" y="93" width="8" height="2" fill={color} opacity="0.3"/>
        <path d="M20 0 L24 4 L28 0" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M40 0 L44 4 L48 0" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M60 0 L64 4 L68 0" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M20 100 L24 96 L28 100" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M40 100 L44 96 L48 100" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M60 100 L64 96 L68 100" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5"/>
      </svg>
    );
  }
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 2 }}>
      <path d="M0 8 Q0 0 8 0 L0 0 Z" fill={color} opacity="0.5"/>
      <path d="M92 0 Q100 0 100 8 L100 0 Z" fill={color} opacity="0.5"/>
      <path d="M0 92 Q0 100 8 100 L0 100 Z" fill={color} opacity="0.5"/>
      <path d="M100 92 Q100 100 92 100 L100 100 Z" fill={color} opacity="0.5"/>
    </svg>
  );
}

function HouseCrestMini({ house }: { house: string }) {
  const colors = HOUSE_COLORS[house] || { primary: '#D4AF37', secondary: '#D4AF37' };
  return (
    <svg viewBox="0 0 30 35" width="22" height="26" style={{ opacity: 0.15 }}>
      <path d="M15 2 L28 7 L28 18 Q28 29 15 34 Q2 29 2 18 L2 7 Z" fill={colors.primary} stroke={colors.secondary} strokeWidth="1.5"/>
      <line x1="2" y1="7" x2="28" y2="7" stroke={colors.secondary} strokeWidth="0.8" opacity="0.6"/>
      <line x1="15" y1="2" x2="15" y2="34" stroke={colors.secondary} strokeWidth="0.8" opacity="0.6"/>
    </svg>
  );
}

function HouseAnimalPortrait({ house }: { house: string }) {
  const colors = HOUSE_COLORS[house] || { primary: '#D4AF37', secondary: '#D4AF37' };
  return (
    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
      style={{ background: `radial-gradient(circle, ${colors.primary}30, ${colors.primary}10)`, border: `2px solid ${colors.primary}60`, animation: 'float 3s ease-in-out infinite' }}>
      <svg viewBox="0 0 40 40" width="56" height="56" style={{ color: colors.secondary, opacity: 0.7 }}>
        {house === 'gryffindor' && (<>
          <ellipse cx="20" cy="24" rx="10" ry="8" fill="currentColor" opacity="0.8"/>
          <circle cx="20" cy="16" r="7" fill="currentColor"/>
          <circle cx="20" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.5"/>
          <circle cx="17" cy="15" r="1.5" fill="#0a0a14"/><circle cx="23" cy="15" r="1.5" fill="#0a0a14"/>
        </>)}
        {house === 'slytherin' && (<>
          <path d="M8 34 Q14 28 20 22 Q26 16 32 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <ellipse cx="32" cy="10" rx="5" ry="3.5" fill="currentColor" transform="rotate(-45 32 10)"/>
          <circle cx="30" cy="8" r="1" fill="#0a0a14"/>
        </>)}
        {house === 'ravenclaw' && (<>
          <ellipse cx="20" cy="22" rx="6" ry="9" fill="currentColor"/>
          <path d="M14 18 Q6 12 4 6 Q10 14 14 18Z" fill="currentColor" opacity="0.8"/>
          <path d="M26 18 Q34 12 36 6 Q30 14 26 18Z" fill="currentColor" opacity="0.8"/>
          <circle cx="20" cy="13" r="4" fill="currentColor"/>
          <circle cx="18.5" cy="12" r="1.2" fill="#0a0a14"/><circle cx="21.5" cy="12" r="1.2" fill="#0a0a14"/>
        </>)}
        {house === 'hufflepuff' && (<>
          <ellipse cx="20" cy="24" rx="13" ry="9" fill="currentColor"/>
          <circle cx="20" cy="15" r="8" fill="currentColor"/>
          <rect x="16" y="11" width="8" height="3" rx="1" fill="#f0f0f0" opacity="0.6"/>
          <circle cx="17.5" cy="14" r="1.2" fill="#0a0a14"/><circle cx="22.5" cy="14" r="1.2" fill="#0a0a14"/>
        </>)}
        {!house && <text x="10" y="28" fontSize="20" fill="currentColor">✦</text>}
      </svg>
    </div>
  );
}

function AudioVisualizer() {
  return (
    <div className="flex items-end gap-[2px]" style={{ height: '24px' }}>
      {[1,2,3,4,5,6,7].map(i => (
        <div key={i} className="w-[3px] rounded-full bg-primary"
          style={{ animation: `audioBar${i} ${0.4 + i * 0.07}s ease-in-out infinite alternate`, animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  );
}

export function VideoTile({ stream, muted = false, label, className, wizardName, house, isSpellActive = false, spellColor, isAudioActive = false, style: externalStyle }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const houseColors = house ? HOUSE_COLORS[house] : null;
  const borderColor = houseColors ? houseColors.primary : '#D4AF37';
  const displayName = wizardName || label;

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className={cn('relative rounded-xl overflow-hidden parchment isolate shadow-2xl flex items-center justify-center', className)}
      style={{
        border: `1px solid ${borderColor}66`,
        boxShadow: isSpellActive
          ? `0 0 0 2px ${spellColor || borderColor}, 0 0 20px ${spellColor || borderColor}60, inset 0 0 15px ${borderColor}08`
          : `inset 0 0 15px ${borderColor}08, 0 0 15px ${borderColor}25`,
        filter: isSpellActive ? `drop-shadow(0 0 8px ${spellColor || borderColor})` : undefined,
        animation: isSpellActive ? 'magicShake 0.4s ease' : undefined,
        transition: 'box-shadow 0.3s ease, filter 0.3s ease',
        ...externalStyle,
      }}>
      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          {house ? <HouseAnimalPortrait house={house} /> : <Wand2 className="w-12 h-12 mb-4 text-primary opacity-50 animate-pulse" />}
          <p className="font-cinzel text-sm" style={{ animation: 'portraitSway 4s ease-in-out infinite' }}>Waiting for wizard...</p>
        </div>
      )}

      <HouseFrame house={house || ''} color={borderColor} />

      <div className="absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-md z-10"
        style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${borderColor}40` }}>
        <span className="font-cinzel text-xs font-semibold" style={{ color: houseColors?.secondary || '#D4AF37' }}>{displayName}</span>
      </div>

      {house && (
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <HouseCrestMini house={house} />
        </div>
      )}

      {isAudioActive && (
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <AudioVisualizer />
        </div>
      )}
    </div>
  );
}
