import React, { useEffect, useRef, useState } from 'react';
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

const HOUSE_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  gryffindor: { primary: '#C41E3A', secondary: '#D4AF37', glow: '#FF2244' },
  slytherin:  { primary: '#1A6B3A', secondary: '#AAAAAA', glow: '#22CC66' },
  ravenclaw:  { primary: '#1A3A80', secondary: '#946B2D', glow: '#4488FF' },
  hufflepuff: { primary: '#F0C75E', secondary: '#372E29', glow: '#FFD700' },
};

// Animated stained-glass light ray overlay per house
function StainedGlassOverlay({ house, borderColor }: { house?: string; borderColor: string }) {
  const rayColors: Record<string, string[]> = {
    gryffindor: ['rgba(200,30,50,0.18)','rgba(212,175,55,0.14)','rgba(180,20,40,0.12)'],
    slytherin:  ['rgba(26,107,58,0.18)','rgba(170,170,170,0.10)','rgba(10,80,30,0.14)'],
    ravenclaw:  ['rgba(26,58,128,0.18)','rgba(148,107,45,0.12)','rgba(60,110,200,0.14)'],
    hufflepuff: ['rgba(240,199,94,0.20)','rgba(55,46,41,0.12)','rgba(220,180,60,0.15)'],
  };
  const rays = rayColors[house ?? ''] ?? ['rgba(212,175,55,0.14)','rgba(180,140,20,0.10)','rgba(200,160,40,0.12)'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" style={{ zIndex: 1 }}>
      {rays.map((color, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 0,
          left: `${15 + i * 28}%`,
          width: `${12 + i * 4}%`,
          height: '100%',
          background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
          transform: `skewX(${-8 + i * 4}deg)`,
          animation: `stainedRay ${3.5 + i * 0.8}s ease-in-out ${i * 0.6}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function HouseFrame({ house, borderColor }: { house?: string; borderColor: string }) {
  if (house === 'gryffindor') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 3 }}>
      {/* animated border shimmer */}
      <defs>
        <linearGradient id="gryfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={borderColor} stopOpacity="0.3">
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" stopColor="#FFD700" stopOpacity="0.7">
            <animate attributeName="stop-opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor={borderColor} stopOpacity="0.3">
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="url(#gryfGrad)" strokeWidth="1.5" rx="1"/>
      <path d="M10,2 Q15,0 20,2 Q25,0 30,2 Q35,0 40,2 Q45,0 50,2 Q55,0 60,2 Q65,0 70,2 Q75,0 80,2 Q85,0 90,2"
        stroke={borderColor} strokeWidth="0.8" fill="none" opacity="0.7"/>
      <path d="M10,98 Q15,100 20,98 Q25,100 30,98 Q35,100 40,98 Q45,100 50,98 Q55,100 60,98 Q65,100 70,98 Q75,100 80,98 Q85,100 90,98"
        stroke={borderColor} strokeWidth="0.8" fill="none" opacity="0.7"/>
      {([[5,5],[95,5],[5,95],[95,95]] as [number,number][]).map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          <circle r="5" fill={borderColor} opacity="0.20"/>
          <circle r="5" fill="none" stroke={borderColor} strokeWidth="0.7" opacity="0.8"/>
          <circle r="2.5" fill={borderColor} opacity="0.45"/>
          <path d="M-2.5,-1.5 Q0,-3.5 2.5,-1.5 Q3.5,0.5 0,2.5 Q-3.5,0.5 -2.5,-1.5Z" fill={borderColor} opacity="0.7"/>
        </g>
      ))}
      <line x1="2" y1="14" x2="2" y2="86" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <line x1="98" y1="14" x2="98" y2="86" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
    </svg>
  );

  if (house === 'slytherin') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 3 }}>
      <defs>
        <linearGradient id="slythGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A6B3A" stopOpacity="0.6">
            <animate attributeName="stop-opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#AAAAAA" stopOpacity="0.4">
            <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="url(#slythGrad)" strokeWidth="1.2" rx="1"/>
      <path d="M2,10 Q5,22 2,34 Q-1,46 2,58 Q5,70 2,82 Q-1,90 2,98"
        stroke={borderColor} strokeWidth="0.9" fill="none" opacity="0.55"/>
      <path d="M98,10 Q95,22 98,34 Q101,46 98,58 Q95,70 98,82 Q101,90 98,98"
        stroke={borderColor} strokeWidth="0.9" fill="none" opacity="0.55"/>
      {[10,22,34,46,58,70,82].map((x,i) => (
        <g key={i}>
          <path d={`M${x},2 L${x+3.5},6 L${x},10 L${x-3.5},6 Z`} fill={borderColor} opacity="0.4" stroke={borderColor} strokeWidth="0.3"/>
          <path d={`M${x},90 L${x+3.5},94 L${x},98 L${x-3.5},94 Z`} fill={borderColor} opacity="0.4" stroke={borderColor} strokeWidth="0.3"/>
        </g>
      ))}
      {([[4,4],[96,4],[4,96],[96,96]] as [number,number][]).map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="4.5" ry="5.5" fill={borderColor} opacity="0.22" stroke={borderColor} strokeWidth="0.6"/>
      ))}
    </svg>
  );

  if (house === 'ravenclaw') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 3 }}>
      <defs>
        <linearGradient id="ravenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A3A80" stopOpacity="0.8">
            <animate attributeName="stop-opacity" values="0.8;0.3;0.8" dur="5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#946B2D" stopOpacity="0.5">
            <animate attributeName="stop-opacity" values="0.5;0.9;0.5" dur="5s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="url(#ravenGrad)" strokeWidth="1.5" rx="2"/>
      <rect x="3" y="3" width="94" height="94" fill="none" stroke={borderColor} strokeWidth="0.35" opacity="0.3"/>
      {[10,25,40,55,70,85].map((x,i) => (
        <g key={i}>
          <path d={`M${x},1 L${x+5},7 L${x+10},1`} stroke={borderColor} strokeWidth="0.7" fill="none" opacity="0.55"/>
          <path d={`M${x},99 L${x+5},93 L${x+10},99`} stroke={borderColor} strokeWidth="0.7" fill="none" opacity="0.55"/>
        </g>
      ))}
      <path d="M2,9 Q9,4.5 16,9 Q11,13 2,9Z" fill={borderColor} opacity="0.4"/>
      <path d="M98,9 Q91,4.5 84,9 Q89,13 98,9Z" fill={borderColor} opacity="0.4"/>
      <path d="M2,91 Q9,95.5 16,91 Q11,87 2,91Z" fill={borderColor} opacity="0.4"/>
      <path d="M98,91 Q91,95.5 84,91 Q89,87 98,91Z" fill={borderColor} opacity="0.4"/>
      <path d="M45,1 L50,6 L55,1 L50,-2Z" fill={borderColor} opacity="0.55"/>
    </svg>
  );

  if (house === 'hufflepuff') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 3 }}>
      <defs>
        <linearGradient id="huffGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F0C75E" stopOpacity="0.7">
            <animate attributeName="stop-opacity" values="0.7;0.2;0.7" dur="3.5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" stopColor="#FFD700" stopOpacity="0.9">
            <animate attributeName="stop-opacity" values="0.9;0.5;0.9" dur="3.5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#F0C75E" stopOpacity="0.7">
            <animate attributeName="stop-opacity" values="0.7;0.2;0.7" dur="3.5s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="url(#huffGrad)" strokeWidth="1.5" rx="1"/>
      {[8,20,32,44,56,68,80,92].map((x,i) => (
        <g key={i}>
          <path d={`M${x},1 L${x+4},5 L${x+4},9 L${x},12 L${x-4},9 L${x-4},5 Z`}
            fill="none" stroke={borderColor} strokeWidth="0.7" opacity="0.5"/>
          <path d={`M${x},88 L${x+4},92 L${x+4},96 L${x},99 L${x-4},96 L${x-4},92 Z`}
            fill="none" stroke={borderColor} strokeWidth="0.7" opacity="0.5"/>
        </g>
      ))}
      {[[4,4],[96,4],[4,96],[96,96]].map(([cx,cy],i) => (
        <g key={i}>
          {[0,60,120,180,240,300].map(deg => (
            <ellipse key={deg}
              cx={(cx as number) + Math.cos(deg*Math.PI/180)*3}
              cy={(cy as number) + Math.sin(deg*Math.PI/180)*3}
              rx="1.8" ry="2.2"
              transform={`rotate(${deg} ${(cx as number)+Math.cos(deg*Math.PI/180)*3} ${(cy as number)+Math.sin(deg*Math.PI/180)*3})`}
              fill={borderColor} opacity="0.55"/>
          ))}
        </g>
      ))}
    </svg>
  );

  // Default — elegant corner brackets with glow
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 3 }}>
      <defs>
        <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8">
            <animate attributeName="stop-opacity" values="0.8;0.2;0.8" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0.4">
            <animate attributeName="stop-opacity" values="0.4;0.9;0.4" dur="4s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="url(#defGrad)" strokeWidth="0.8" rx="2"/>
      <path d="M0 10 Q0 0 10 0 L0 0 Z" fill={borderColor} opacity="0.55"/>
      <path d="M90 0 Q100 0 100 10 L100 0 Z" fill={borderColor} opacity="0.55"/>
      <path d="M0 90 Q0 100 10 100 L0 100 Z" fill={borderColor} opacity="0.55"/>
      <path d="M100 90 Q100 100 90 100 L100 100 Z" fill={borderColor} opacity="0.55"/>
      {/* Inner corner lines */}
      <line x1="0" y1="20" x2="8" y2="20" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <line x1="20" y1="0" x2="20" y2="8" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <line x1="80" y1="0" x2="80" y2="8" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <line x1="92" y1="20" x2="100" y2="20" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <line x1="0" y1="80" x2="8" y2="80" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <line x1="20" y1="92" x2="20" y2="100" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <line x1="80" y1="92" x2="80" y2="100" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <line x1="92" y1="80" x2="100" y2="80" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
    </svg>
  );
}

function HouseCrestMini({ house }: { house: string }) {
  const colors = HOUSE_COLORS[house] || { primary: '#D4AF37', secondary: '#D4AF37', glow: '#FFD700' };
  return (
    <svg viewBox="0 0 32 38" width="24" height="28" style={{ opacity: 0.22, filter: `drop-shadow(0 0 4px ${colors.glow})` }}>
      <path d="M16 2 L30 8 L30 20 Q30 32 16 37 Q2 32 2 20 L2 8 Z" fill={colors.primary} stroke={colors.secondary} strokeWidth="1.5"/>
      <line x1="2" y1="8" x2="30" y2="8" stroke={colors.secondary} strokeWidth="0.9" opacity="0.65"/>
      <line x1="16" y1="2" x2="16" y2="37" stroke={colors.secondary} strokeWidth="0.9" opacity="0.65"/>
      {/* decorative cross */}
      <path d="M10 15 L13 15 L13 12 L19 12 L19 15 L22 15 L22 19 L19 19 L19 22 L13 22 L13 19 L10 19 Z"
        fill={colors.secondary} opacity="0.35"/>
    </svg>
  );
}

function HouseAnimalPortrait({ house }: { house: string }) {
  const colors = HOUSE_COLORS[house] || { primary: '#D4AF37', secondary: '#D4AF37', glow: '#FFD700' };
  return (
    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
      style={{
        background: `radial-gradient(circle, ${colors.primary}35, ${colors.primary}12)`,
        border: `2px solid ${colors.primary}70`,
        animation: 'float 3s ease-in-out infinite',
        boxShadow: `0 0 20px ${colors.glow}30, inset 0 0 15px ${colors.primary}20`,
      }}>
      <svg viewBox="0 0 40 40" width="58" height="58" style={{ color: colors.secondary, opacity: 0.75 }}>
        {house === 'gryffindor' && (<>
          <ellipse cx="20" cy="25" rx="11" ry="8.5" fill="currentColor" opacity="0.85"/>
          <circle cx="20" cy="16" r="7.5" fill="currentColor"/>
          <circle cx="20" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.45"/>
          <circle cx="20" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.22"/>
          <circle cx="17" cy="15" r="1.8" fill="#08080f"/>
          <circle cx="23" cy="15" r="1.8" fill="#08080f"/>
          <circle cx="17.5" cy="14.5" r="0.6" fill="white" opacity="0.8"/>
          <circle cx="23.5" cy="14.5" r="0.6" fill="white" opacity="0.8"/>
        </>)}
        {house === 'slytherin' && (<>
          <path d="M6 36 Q12 28 20 22 Q28 16 34 8" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
          <path d="M6 36 Q12 28 20 22 Q28 16 34 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
          <ellipse cx="34" cy="8" rx="5.5" ry="3.5" fill="currentColor" transform="rotate(-45 34 8)"/>
          <circle cx="32" cy="6" r="1.2" fill="#08080f"/>
          <path d="M34 12 L37 15 L31 15 Z" fill="currentColor" opacity="0.7"/>
        </>)}
        {house === 'ravenclaw' && (<>
          <ellipse cx="20" cy="24" rx="6.5" ry="10" fill="currentColor"/>
          <path d="M13.5 18 Q5 11 3 4 Q10 14 13.5 18Z" fill="currentColor" opacity="0.85"/>
          <path d="M26.5 18 Q35 11 37 4 Q30 14 26.5 18Z" fill="currentColor" opacity="0.85"/>
          <circle cx="20" cy="13" r="4.5" fill="currentColor"/>
          <circle cx="18.5" cy="12" r="1.3" fill="#08080f"/>
          <circle cx="21.5" cy="12" r="1.3" fill="#08080f"/>
          <circle cx="18.9" cy="11.5" r="0.45" fill="white" opacity="0.8"/>
          <circle cx="21.9" cy="11.5" r="0.45" fill="white" opacity="0.8"/>
        </>)}
        {house === 'hufflepuff' && (<>
          <ellipse cx="20" cy="25" rx="14" ry="10" fill="currentColor"/>
          <circle cx="20" cy="15" r="9" fill="currentColor"/>
          <rect x="15" y="10.5" width="10" height="4" rx="1.5" fill="#f0f0f0" opacity="0.65"/>
          <circle cx="17.5" cy="15" r="1.5" fill="#08080f"/>
          <circle cx="22.5" cy="15" r="1.5" fill="#08080f"/>
          <circle cx="18" cy="14.5" r="0.5" fill="white" opacity="0.8"/>
          <circle cx="23" cy="14.5" r="0.5" fill="white" opacity="0.8"/>
        </>)}
        {!house && <text x="8" y="30" fontSize="22" fill="currentColor">✦</text>}
      </svg>
    </div>
  );
}

function AudioVisualizer({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-[2px]" style={{ height: '24px' }}>
      {[1,2,3,4,5,6,7].map(i => (
        <div key={i} style={{
          width: '3px',
          borderRadius: '2px',
          background: color,
          boxShadow: `0 0 4px ${color}`,
          animation: `audioBar${i} ${0.38 + i * 0.065}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.04}s`,
        }} />
      ))}
    </div>
  );
}

export function VideoTile({
  stream, muted = false, label, className, wizardName, house,
  isSpellActive = false, spellColor, isAudioActive = false, style: externalStyle,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const houseColors = house ? HOUSE_COLORS[house] : null;
  const borderColor = houseColors ? houseColors.primary : '#D4AF37';
  const glowColor   = houseColors ? houseColors.glow   : '#D4AF37';
  const displayName = wizardName || label;

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div
      className={cn('relative rounded-xl overflow-hidden parchment isolate shadow-2xl flex items-center justify-center', className)}
      style={{
        border: `1px solid ${borderColor}70`,
        boxShadow: isSpellActive
          ? `0 0 0 2px ${spellColor || borderColor}, 0 0 25px ${spellColor || borderColor}80, 0 0 60px ${spellColor || borderColor}30, inset 0 0 18px ${borderColor}10`
          : `inset 0 0 18px ${borderColor}10, 0 0 20px ${glowColor}30, 0 0 50px ${glowColor}12`,
        filter: isSpellActive ? `drop-shadow(0 0 10px ${spellColor || borderColor})` : undefined,
        animation: isSpellActive ? 'spellHitShake 0.5s ease' : undefined,
        transition: 'box-shadow 0.4s ease, filter 0.4s ease',
        ...externalStyle,
      }}>

      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden"
          style={{ animation: 'portraitSway 7s ease-in-out infinite' }}>

          {/* Canvas linen texture */}
          <div className="absolute inset-0" style={{
            background: `
              repeating-linear-gradient(0deg,   rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 5px),
              repeating-linear-gradient(90deg,  rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 5px),
              repeating-linear-gradient(45deg,  rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 10px)
            `,
          }} />

          {/* Oil-paint sheen sweep */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `linear-gradient(110deg, transparent 30%, rgba(255,220,100,0.08) 50%, transparent 70%)`,
            backgroundSize: '200% 100%',
            animation: 'oilSheen 5s ease-in-out infinite',
          }} />

          {/* Portrait oval frame */}
          <div style={{
            width: 92, height: 112,
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            border: `2px solid ${borderColor}65`,
            background: `radial-gradient(ellipse at 38% 32%, ${borderColor}25, rgba(0,0,0,0.55))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            boxShadow: `inset 0 0 22px rgba(0,0,0,0.65), 0 0 24px ${glowColor}25, 0 4px 12px rgba(0,0,0,0.5)`,
            position: 'relative',
          }}>
            {house ? <HouseAnimalPortrait house={house} /> : (
              <Wand2 className="w-10 h-10 text-primary" style={{ opacity: 0.5, animation: 'float 3s ease-in-out infinite' }} />
            )}
          </div>

          <p className="font-fell text-sm italic" style={{
            color: `${borderColor}aa`,
            textShadow: `0 0 8px ${borderColor}50`,
          }}>
            Awaiting {displayName}…
          </p>
        </div>
      )}

      {/* Stained glass light overlay */}
      <StainedGlassOverlay house={house} borderColor={borderColor} />

      {/* House-specific animated frame */}
      <HouseFrame house={house} borderColor={borderColor} />

      {/* Spell bloom flash */}
      {isSpellActive && spellColor && (
        <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
          background: `radial-gradient(ellipse at center, ${spellColor}50 0%, ${spellColor}18 40%, transparent 70%)`,
          animation: 'spellCharge 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
          mixBlendMode: 'screen',
          zIndex: 5,
        }} />
      )}

      {/* Edge vignette on spell */}
      {isSpellActive && (
        <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
          boxShadow: `inset 0 0 30px ${spellColor || borderColor}60`,
          zIndex: 6,
        }} />
      )}

      {/* Pulsing rune ring when spell active */}
      {isSpellActive && (
        <div className="absolute top-2 left-2 pointer-events-none" style={{
          width: 32, height: 32,
          border: `1px solid ${spellColor || borderColor}`,
          borderRadius: '50%',
          animation: 'runeRotate 1.8s linear infinite',
          opacity: 0.7,
          zIndex: 20,
          boxShadow: `0 0 8px ${spellColor || borderColor}`,
        }}>
          <svg viewBox="0 0 32 32" width="32" height="32">
            {['ᛟ','ᚷ','ᚱ','ᛏ','ᛖ','ᚠ'].map((r, i) => (
              <text key={i}
                x={16 + 12 * Math.cos(i * Math.PI / 3)}
                y={16 + 12 * Math.sin(i * Math.PI / 3)}
                textAnchor="middle" dominantBaseline="middle" fontSize="4.5"
                fill={spellColor || borderColor} opacity="0.85">
                {r}
              </text>
            ))}
          </svg>
        </div>
      )}

      {/* Name label */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-md z-10"
        style={{
          background: 'rgba(0,0,0,0.65)',
          border: `1px solid ${borderColor}45`,
          boxShadow: `0 0 8px ${glowColor}20`,
        }}>
        <span className="font-cinzel text-xs font-semibold" style={{
          color: houseColors?.secondary || '#D4AF37',
          textShadow: `0 0 6px ${glowColor}60`,
        }}>
          {displayName}
        </span>
      </div>

      {house && (
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <HouseCrestMini house={house} />
        </div>
      )}

      {isAudioActive && (
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <AudioVisualizer color={glowColor} />
        </div>
      )}
    </div>
  );
}
