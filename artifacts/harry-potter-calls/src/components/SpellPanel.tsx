import React from 'react';
import { cn } from '@/lib/utils';
import type { Spell } from '@/utils/spells';

const SPELL_GLYPHS: Record<string, React.ReactNode> = {
  'Lumos': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9"/>
      {[0,45,90,135,180,225,270,315].map(deg => (
        <line key={deg}
          x1={12 + 6 * Math.cos(deg*Math.PI/180)} y1={12 + 6 * Math.sin(deg*Math.PI/180)}
          x2={12 + 10 * Math.cos(deg*Math.PI/180)} y2={12 + 10 * Math.sin(deg*Math.PI/180)}
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
      ))}
    </svg>
  ),
  'Incendio': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M12 3 Q14 7 11 9 Q15 7 16 11 Q18 9 17 13 Q19 12 19 16 Q19 21 12 21 Q5 21 5 16 Q5 12 7 13 Q6 9 8 11 Q9 7 13 9 Q10 7 12 3Z" fill="currentColor" opacity="0.85"/>
      <path d="M12 10 Q13 12 11.5 13.5 Q13 13 13.5 15 Q14.5 14 14 16.5 Q13 18.5 12 18.5 Q11 18.5 10 16.5 Q9.5 14 10.5 15 Q11 13 9.5 13.5 Q11 12 12 10Z" fill="rgba(255,255,220,0.7)"/>
    </svg>
  ),
  'Expelliarmus': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M4 20 L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 4 L20 4 L20 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 8 L4 6 L6 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  ),
  'Wingardium Leviosa': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M12 20 L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 8 Q8 12 4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M12 8 Q16 12 20 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <circle cx="12" cy="6" r="2.5" fill="currentColor" opacity="0.9"/>
      {[0,120,240].map(deg => (
        <line key={deg} x1={12 + 4*Math.cos(deg*Math.PI/180)} y1={6 + 4*Math.sin(deg*Math.PI/180)}
          x2={12 + 6*Math.cos(deg*Math.PI/180)} y2={6 + 6*Math.sin(deg*Math.PI/180)}
          stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      ))}
    </svg>
  ),
  'Patronus': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M12 4 Q14 7 12 9 Q10 7 12 4Z" fill="currentColor" opacity="0.8"/>
      <path d="M8 7 Q12 6 16 7 Q15 11 12 13 Q9 11 8 7Z" fill="currentColor" opacity="0.6"/>
      <line x1="12" y1="13" x2="10" y2="18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <line x1="12" y1="13" x2="14" y2="18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <line x1="10" y1="18" x2="9" y2="21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      <line x1="14" y1="18" x2="15" y2="21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  'Accio': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.8"/>
      {[[-8,-4],[-6,0],[-8,4]].map(([dx,dy],i) => (
        <line key={i} x1={12+dx} y1={12+dy} x2={12+dx-3} y2={12+dy}
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity={0.4+i*0.15}/>
      ))}
      <line x1="15" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
      <path d="M17 10 L20 12 L17 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  'Stupefy': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => (
        <line key={deg}
          x1={12 + 4*Math.cos(deg*Math.PI/180)} y1={12 + 4*Math.sin(deg*Math.PI/180)}
          x2={12 + 9*Math.cos(deg*Math.PI/180)} y2={12 + 9*Math.sin(deg*Math.PI/180)}
          stroke="currentColor" strokeWidth={deg%60===0?1.8:0.8} strokeLinecap="round" opacity={deg%60===0?1:0.5}/>
      ))}
      <circle cx="12" cy="12" r="3.5" fill="currentColor" opacity="0.9"/>
    </svg>
  ),
  'Protego': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M12 3 L20 7 L20 14 Q20 19 12 21 Q4 19 4 14 L4 7 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.9"/>
      <path d="M12 6 L17 9 L17 14 Q17 17.5 12 19 Q7 17.5 7 14 L7 9 Z" fill="currentColor" opacity="0.25"/>
      <line x1="12" y1="8" x2="12" y2="17" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
      <line x1="8" y1="8.5" x2="16" y2="8.5" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  ),
  'Nox': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M19 12 Q19 17 14 19 Q9 21 5 17 Q3 14 5 10 Q8 5 13 5 Q10 8 10 12 Q10 16 14 17 Q18 17 19 12Z" fill="currentColor" opacity="0.9"/>
    </svg>
  ),
  'Alohomora': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="10" cy="9" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.9"/>
      <line x1="15" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="14" x2="10" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'Riddikulus': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="12" cy="8" r="5" fill="currentColor" opacity="0.7"/>
      <path d="M7 6 Q4 2 7 2 Q10 2 9 6" fill="currentColor" opacity="0.8"/>
      <path d="M17 6 Q20 2 17 2 Q14 2 15 6" fill="currentColor" opacity="0.8"/>
      <path d="M9 10 Q12 13 15 10" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <circle cx="10" cy="7.5" r="1" fill="rgba(0,0,0,0.7)"/>
      <circle cx="14" cy="7.5" r="1" fill="rgba(0,0,0,0.7)"/>
      <line x1="9" y1="14" x2="15" y2="20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <line x1="15" y1="14" x2="9" y2="20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  'Expecto Patronum': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M12 3 Q15 7 13 10 Q16 8 18 11 Q20 10 20 14 Q20 19 12 21 Q4 19 4 14 Q4 10 6 11 Q8 8 11 10 Q9 7 12 3Z" fill="currentColor" opacity="0.7"/>
      <path d="M12 8 Q13.5 10 12 12 Q10.5 10 12 8Z" fill="white" opacity="0.9"/>
      <line x1="12" y1="12" x2="10" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      <line x1="12" y1="12" x2="14" y2="16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
};

interface SpellPanelProps {
  currentSpell: string | null;
  spells: Spell[];
  cooldowns: Record<string, number>;
  onSpellCast: (spellName: string) => void;
  visible: boolean;
  className?: string;
}

export function SpellPanel({ currentSpell, spells, cooldowns, onSpellCast, visible, className }: SpellPanelProps) {
  if (!visible) return null;

  const now = Date.now();

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-1 px-1', className)}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x',
      } as never}>
      {spells.map(spell => {
        const isActive = currentSpell === spell.name;
        const cooldownEnd = cooldowns[spell.name] ?? 0;
        const onCooldown = cooldownEnd > now;
        const cooldownProgress = onCooldown ? (cooldownEnd - now) / 2500 : 0;
        const circumference = 2 * Math.PI * 20;

        return (
          <div
            key={spell.name}
            className="relative flex-shrink-0 cursor-pointer select-none rounded-xl"
            onClick={() => !onCooldown && onSpellCast(spell.name)}
            style={{
              padding: '10px',
              background: isActive
                ? `linear-gradient(135deg, ${spell.color}30, ${spell.color}15)`
                : 'rgba(0,0,0,0.45)',
              border: `1px solid ${isActive ? spell.color : spell.color + '40'}`,
              boxShadow: isActive ? `0 0 20px ${spell.color}40` : 'none',
              opacity: onCooldown && !isActive ? 0.6 : 1,
              transition: 'all 0.25s ease',
              minWidth: 72,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px) scale(1.03)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${spell.color}50`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = isActive ? `0 0 20px ${spell.color}40` : 'none';
            }}
          >
            {/* Cooldown ring */}
            {onCooldown && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke={spell.color}
                  strokeWidth="1.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - cooldownProgress)}
                  opacity="0.4"
                  style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}/>
              </svg>
            )}

            <div className="flex flex-col items-center gap-1.5">
              {/* SVG spell glyph */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isActive ? spell.color : `${spell.color}40`,
                  color: isActive ? '#000' : spell.color,
                }}>
                {SPELL_GLYPHS[spell.name] || <span className="text-xs">{spell.icon}</span>}
              </div>

              <div className="text-center">
                <div className="font-cinzel font-semibold leading-tight"
                  style={{ fontSize: '9px', color: isActive ? spell.color : 'rgba(212,175,55,0.75)', whiteSpace: 'nowrap', maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {spell.name}
                </div>
                {spell.description && (
                  <div className="font-fell italic" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                    {spell.description}
                  </div>
                )}
              </div>
            </div>

            {isActive && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{ background: spell.color, boxShadow: `0 0 6px ${spell.color}`, animation: 'spell-flash 0.8s ease-in-out infinite' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
