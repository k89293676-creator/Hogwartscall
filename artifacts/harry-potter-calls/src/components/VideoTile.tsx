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

function HouseFrame({ house, borderColor }: { house?: string; borderColor: string }) {
  if (house === 'gryffindor') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 2 }}>
      <path d="M10,2 Q15,0 20,2 Q25,0 30,2 Q35,0 40,2 Q45,0 50,2 Q55,0 60,2 Q65,0 70,2 Q75,0 80,2 Q85,0 90,2"
        stroke={borderColor} strokeWidth="0.8" fill="none" opacity="0.7"/>
      <path d="M10,98 Q15,100 20,98 Q25,100 30,98 Q35,100 40,98 Q45,100 50,98 Q55,100 60,98 Q65,100 70,98 Q75,100 80,98 Q85,100 90,98"
        stroke={borderColor} strokeWidth="0.8" fill="none" opacity="0.7"/>
      {([[5,5],[95,5],[5,95],[95,95]] as [number,number][]).map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          <circle r="4.5" fill={borderColor} opacity="0.25"/>
          <circle r="4.5" fill="none" stroke={borderColor} strokeWidth="0.6" opacity="0.7"/>
          <circle r="2" fill={borderColor} opacity="0.4"/>
          <path d="M-2.5,-1.5 Q0,-3 2.5,-1.5 Q3,0.5 0,2 Q-3,0.5 -2.5,-1.5Z" fill={borderColor} opacity="0.6"/>
        </g>
      ))}
      <line x1="2" y1="12" x2="2" y2="88" stroke={borderColor} strokeWidth="0.4" opacity="0.4"/>
      <line x1="98" y1="12" x2="98" y2="88" stroke={borderColor} strokeWidth="0.4" opacity="0.4"/>
      <path d="M35,2 Q50,-2 65,2" stroke={borderColor} strokeWidth="1" fill="none" opacity="0.5"/>
    </svg>
  );

  if (house === 'slytherin') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 2 }}>
      <path d="M2,10 Q5,20 2,30 Q-1,40 2,50 Q5,60 2,70 Q-1,80 2,90"
        stroke={borderColor} strokeWidth="0.8" fill="none" opacity="0.55"/>
      <path d="M98,10 Q95,20 98,30 Q101,40 98,50 Q95,60 98,70 Q101,80 98,90"
        stroke={borderColor} strokeWidth="0.8" fill="none" opacity="0.55"/>
      {[10,20,30,40,50,60,70,80,90].map((x,i) => (
        <g key={i}>
          <path d={`M${x},2 L${x+3},5 L${x},8 L${x-3},5 Z`} fill={borderColor} opacity="0.35" stroke={borderColor} strokeWidth="0.3"/>
          <path d={`M${x},92 L${x+3},95 L${x},98 L${x-3},95 Z`} fill={borderColor} opacity="0.35" stroke={borderColor} strokeWidth="0.3"/>
        </g>
      ))}
      {([[4,4],[96,4],[4,96],[96,96]] as [number,number][]).map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="4" ry="5" fill={borderColor} opacity="0.22" stroke={borderColor} strokeWidth="0.5"/>
      ))}
    </svg>
  );

  if (house === 'ravenclaw') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 2 }}>
      <rect x="1" y="1" width="98" height="98" fill="none" stroke={borderColor} strokeWidth="0.5" opacity="0.4"/>
      <rect x="3" y="3" width="94" height="94" fill="none" stroke={borderColor} strokeWidth="0.3" opacity="0.25"/>
      {[10,25,40,55,70,85].map((x,i) => (
        <g key={i}>
          <path d={`M${x},1 L${x+5},6 L${x+10},1`} stroke={borderColor} strokeWidth="0.6" fill="none" opacity="0.5"/>
          <path d={`M${x},99 L${x+5},94 L${x+10},99`} stroke={borderColor} strokeWidth="0.6" fill="none" opacity="0.5"/>
        </g>
      ))}
      <path d="M2,8 Q8,4 14,8 Q10,12 2,8Z" fill={borderColor} opacity="0.35"/>
      <path d="M98,8 Q92,4 86,8 Q90,12 98,8Z" fill={borderColor} opacity="0.35"/>
      <path d="M2,92 Q8,96 14,92 Q10,88 2,92Z" fill={borderColor} opacity="0.35"/>
      <path d="M98,92 Q92,96 86,92 Q90,88 98,92Z" fill={borderColor} opacity="0.35"/>
      <path d="M46,1 L50,5 L54,1 L50,-2Z" fill={borderColor} opacity="0.5"/>
    </svg>
  );

  if (house === 'hufflepuff') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 2 }}>
      {[8,20,32,44,56,68,80,92].map((x,i) => (
        <g key={i}>
          <path d={`M${x},1 L${x+4},4 L${x+4},8 L${x},11 L${x-4},8 L${x-4},4 Z`}
            fill="none" stroke={borderColor} strokeWidth="0.6" opacity="0.45"/>
          <path d={`M${x},89 L${x+4},92 L${x+4},96 L${x},99 L${x-4},96 L${x-4},92 Z`}
            fill="none" stroke={borderColor} strokeWidth="0.6" opacity="0.45"/>
        </g>
      ))}
      <line x1="1" y1="35" x2="5" y2="35" stroke={borderColor} strokeWidth="2" opacity="0.6"/>
      <line x1="1" y1="38" x2="5" y2="38" stroke={borderColor} strokeWidth="1" opacity="0.4"/>
      <line x1="1" y1="62" x2="5" y2="62" stroke={borderColor} strokeWidth="2" opacity="0.6"/>
      <line x1="1" y1="65" x2="5" y2="65" stroke={borderColor} strokeWidth="1" opacity="0.4"/>
      <line x1="95" y1="35" x2="99" y2="35" stroke={borderColor} strokeWidth="2" opacity="0.6"/>
      <line x1="95" y1="38" x2="99" y2="38" stroke={borderColor} strokeWidth="1" opacity="0.4"/>
      <line x1="95" y1="62" x2="99" y2="62" stroke={borderColor} strokeWidth="2" opacity="0.6"/>
      <line x1="95" y1="65" x2="99" y2="65" stroke={borderColor} strokeWidth="1" opacity="0.4"/>
      {([[5,5],[95,5],[5,95],[95,95]] as [number,number][]).map(([cx,cy],i) => (
        <g key={i}>
          {[0,60,120,180,240,300].map(deg => (
            <ellipse key={deg} cx={cx + Math.cos(deg*Math.PI/180)*3} cy={cy + Math.sin(deg*Math.PI/180)*3}
              rx="1.5" ry="2"
              transform={`rotate(${deg} ${cx + Math.cos(deg*Math.PI/180)*3} ${cy + Math.sin(deg*Math.PI/180)*3})`}
              fill={borderColor} opacity="0.5"/>
          ))}
        </g>
      ))}
    </svg>
  );

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ zIndex: 2 }}>
      <path d="M0 8 Q0 0 8 0 L0 0 Z" fill={borderColor} opacity="0.5"/>
      <path d="M92 0 Q100 0 100 8 L100 0 Z" fill={borderColor} opacity="0.5"/>
      <path d="M0 92 Q0 100 8 100 L0 100 Z" fill={borderColor} opacity="0.5"/>
      <path d="M100 92 Q100 100 92 100 L100 100 Z" fill={borderColor} opacity="0.5"/>
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
        <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden"
          style={{ animation: 'portraitSway 6s ease-in-out infinite' }}>
          {/* Canvas-texture overlay */}
          <div className="absolute inset-0" style={{
            background: `
              repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px)
            `,
          }} />
          {/* Portrait oval */}
          <div style={{
            width: 90, height: 110,
            borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
            border: `2px solid ${borderColor}60`,
            background: `radial-gradient(ellipse at 40% 35%, ${borderColor}20, rgba(0,0,0,0.5))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            boxShadow: `inset 0 0 20px rgba(0,0,0,0.6), 0 0 20px ${borderColor}20`,
          }}>
            {house ? <HouseAnimalPortrait house={house} /> : (
              <Wand2 className="w-10 h-10 text-primary" style={{ opacity: 0.5, animation: 'float 3s ease-in-out infinite' }} />
            )}
          </div>
          <p className="font-fell text-sm italic" style={{ color: `${borderColor}99` }}>
            Awaiting {displayName}…
          </p>
          <div className="absolute inset-0 pointer-events-none" style={{ animation: 'eyeTrack 4s ease-in-out infinite' }} />
        </div>
      )}

      {/* House-specific stained glass frame */}
      <HouseFrame house={house} borderColor={borderColor} />

      {/* Spell bloom flash */}
      {isSpellActive && spellColor && (
        <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
          background: `radial-gradient(ellipse at center, ${spellColor}40 0%, transparent 70%)`,
          animation: 'spellCharge 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
          mixBlendMode: 'screen',
          zIndex: 5,
        }} />
      )}

      {/* Pulsing rune ring when spell active */}
      {isSpellActive && (
        <div className="absolute top-2 left-2 pointer-events-none" style={{
          width: 28, height: 28,
          border: `1px solid ${spellColor || borderColor}`,
          borderRadius: '50%',
          animation: 'runeRotate 2s linear infinite',
          opacity: 0.6,
          zIndex: 20,
        }}>
          <svg viewBox="0 0 28 28" width="28" height="28">
            {['ᛟ','ᚷ','ᚱ','ᛏ'].map((r, i) => (
              <text key={i}
                x={14 + 10 * Math.cos(i * Math.PI / 2)}
                y={14 + 10 * Math.sin(i * Math.PI / 2)}
                textAnchor="middle" dominantBaseline="middle" fontSize="5"
                fill={spellColor || borderColor} opacity="0.8">
                {r}
              </text>
            ))}
          </svg>
        </div>
      )}

      {/* Name label */}
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
