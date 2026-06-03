import { useEffect, useRef } from 'react';
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

function HouseCrestMini({ house }: { house: string }) {
  const colors = HOUSE_COLORS[house] || { primary: '#D4AF37', secondary: '#D4AF37' };
  return (
    <svg viewBox="0 0 30 35" width="22" height="26" style={{ opacity: 0.15 }}>
      <path
        d="M15 2 L28 7 L28 18 Q28 29 15 34 Q2 29 2 18 L2 7 Z"
        fill={colors.primary}
        stroke={colors.secondary}
        strokeWidth="1.5"
      />
      <line x1="2" y1="7" x2="28" y2="7" stroke={colors.secondary} strokeWidth="0.8" opacity="0.6"/>
      <line x1="15" y1="2" x2="15" y2="34" stroke={colors.secondary} strokeWidth="0.8" opacity="0.6"/>
    </svg>
  );
}

function HouseAnimalPortrait({ house }: { house: string }) {
  const colors = HOUSE_COLORS[house] || { primary: '#D4AF37', secondary: '#D4AF37' };
  return (
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
      style={{
        background: `radial-gradient(circle, ${colors.primary}30, ${colors.primary}10)`,
        border: `2px solid ${colors.primary}60`,
        animation: 'float 3s ease-in-out infinite',
      }}
    >
      <svg viewBox="0 0 40 40" width="56" height="56" style={{ color: colors.secondary, opacity: 0.7 }}>
        {house === 'gryffindor' && (
          <>
            <ellipse cx="20" cy="24" rx="10" ry="8" fill="currentColor" opacity="0.8"/>
            <circle cx="20" cy="16" r="7" fill="currentColor"/>
            <circle cx="20" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.5"/>
            <circle cx="17" cy="15" r="1.5" fill="#0a0a14"/>
            <circle cx="23" cy="15" r="1.5" fill="#0a0a14"/>
          </>
        )}
        {house === 'slytherin' && (
          <>
            <path d="M8 34 Q14 28 20 22 Q26 16 32 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <ellipse cx="32" cy="10" rx="5" ry="3.5" fill="currentColor" transform="rotate(-45 32 10)"/>
            <circle cx="30" cy="8" r="1" fill="#0a0a14"/>
          </>
        )}
        {house === 'ravenclaw' && (
          <>
            <ellipse cx="20" cy="22" rx="6" ry="9" fill="currentColor"/>
            <path d="M14 18 Q6 12 4 6 Q10 14 14 18Z" fill="currentColor" opacity="0.8"/>
            <path d="M26 18 Q34 12 36 6 Q30 14 26 18Z" fill="currentColor" opacity="0.8"/>
            <circle cx="20" cy="13" r="4" fill="currentColor"/>
            <circle cx="18.5" cy="12" r="1.2" fill="#0a0a14"/>
            <circle cx="21.5" cy="12" r="1.2" fill="#0a0a14"/>
          </>
        )}
        {house === 'hufflepuff' && (
          <>
            <ellipse cx="20" cy="24" rx="13" ry="9" fill="currentColor"/>
            <circle cx="20" cy="15" r="8" fill="currentColor"/>
            <rect x="16" y="11" width="8" height="3" rx="1" fill="#f0f0f0" opacity="0.6"/>
            <circle cx="17.5" cy="14" r="1.2" fill="#0a0a14"/>
            <circle cx="22.5" cy="14" r="1.2" fill="#0a0a14"/>
          </>
        )}
        {!house && (
          <text x="10" y="28" fontSize="20" fill="currentColor">✦</text>
        )}
      </svg>
    </div>
  );
}

function AudioVisualizer() {
  return (
    <div className="flex items-end gap-[2px]" style={{ height: '24px' }}>
      {[1, 2, 3, 4, 5, 6, 7].map(i => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary"
          style={{
            animation: `audioBar${i} ${0.4 + i * 0.07}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

export function VideoTile({
  stream,
  muted = false,
  label,
  className,
  wizardName,
  house,
  isSpellActive = false,
  spellColor,
  isAudioActive = false,
  style: externalStyle,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const houseColors = house ? HOUSE_COLORS[house] : null;
  const borderColor = houseColors ? houseColors.primary : '#D4AF37';
  const displayName = wizardName || label;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={cn('relative rounded-xl overflow-hidden parchment isolate shadow-2xl flex items-center justify-center', className)}
      style={{
        border: `1px solid ${borderColor}66`,
        boxShadow: isSpellActive
          ? `0 0 0 2px ${spellColor || borderColor}, 0 0 20px ${spellColor || borderColor}60, inset 0 0 15px ${borderColor}08`
          : `inset 0 0 15px ${borderColor}08, 0 0 15px ${borderColor}25`,
        filter: isSpellActive ? `drop-shadow(0 0 8px ${spellColor || borderColor})` : undefined,
        animation: isSpellActive ? 'magicShake 0.4s ease' : undefined,
        transition: 'box-shadow 0.3s ease, filter 0.3s ease',
        ...externalStyle,
      }}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          {house ? (
            <HouseAnimalPortrait house={house} />
          ) : (
            <Wand2 className="w-12 h-12 mb-4 text-primary opacity-50 animate-pulse" />
          )}
          <p className="font-cinzel text-sm">Waiting for wizard...</p>
        </div>
      )}

      {/* Ornate house frame overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ zIndex: 2 }}
      >
        <path d="M0 8 Q0 0 8 0 L0 0 Z" fill={borderColor} opacity="0.5"/>
        <path d="M92 0 Q100 0 100 8 L100 0 Z" fill={borderColor} opacity="0.5"/>
        <path d="M0 92 Q0 100 8 100 L0 100 Z" fill={borderColor} opacity="0.5"/>
        <path d="M100 92 Q100 100 92 100 L100 100 Z" fill={borderColor} opacity="0.5"/>
        <path d="M2 2 L12 2 M2 2 L2 12 M4 4 L10 4 M4 4 L4 10" stroke={borderColor} strokeWidth="0.5" fill="none" opacity="0.6"/>
        <path d="M98 2 L88 2 M98 2 L98 12 M96 4 L90 4 M96 4 L96 10" stroke={borderColor} strokeWidth="0.5" fill="none" opacity="0.6"/>
        <path d="M2 98 L12 98 M2 98 L2 88 M4 96 L10 96 M4 96 L4 90" stroke={borderColor} strokeWidth="0.5" fill="none" opacity="0.6"/>
        <path d="M98 98 L88 98 M98 98 L98 88 M96 96 L90 96 M96 96 L96 90" stroke={borderColor} strokeWidth="0.5" fill="none" opacity="0.6"/>
        <path d="M12 1 Q30 3 50 1 Q70 3 88 1" stroke={borderColor} strokeWidth="0.3" fill="none" opacity="0.4"/>
        <path d="M12 99 Q30 97 50 99 Q70 97 88 99" stroke={borderColor} strokeWidth="0.3" fill="none" opacity="0.4"/>
        <path d="M1 12 Q3 30 1 50 Q3 70 1 88" stroke={borderColor} strokeWidth="0.3" fill="none" opacity="0.4"/>
        <path d="M99 12 Q97 30 99 50 Q97 70 99 88" stroke={borderColor} strokeWidth="0.3" fill="none" opacity="0.4"/>
      </svg>

      {/* Wizard name label */}
      <div
        className="absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-md z-10"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: `1px solid ${borderColor}40`,
        }}
      >
        <span className="font-cinzel text-xs font-semibold" style={{ color: houseColors?.secondary || '#D4AF37' }}>
          {displayName}
        </span>
      </div>

      {/* House crest watermark bottom-right */}
      {house && (
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <HouseCrestMini house={house} />
        </div>
      )}

      {/* Audio visualizer bottom-left */}
      {isAudioActive && (
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <AudioVisualizer />
        </div>
      )}
    </div>
  );
}
