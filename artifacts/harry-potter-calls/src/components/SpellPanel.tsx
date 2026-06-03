import { Spell } from '@/utils/spells';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SpellPanelProps {
  currentSpell: string | null;
  spells: Spell[];
  cooldowns: Record<string, number>;
  onSpellCast?: (spellName: string) => void;
  visible?: boolean;
}

const HOUSE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  gryffindor: { label: 'Gryffindor', icon: '⚡', color: '#C41E3A' },
  slytherin:  { label: 'Slytherin',  icon: '🐍', color: '#1A5C35' },
  ravenclaw:  { label: 'Ravenclaw',  icon: '🦅', color: '#1A3A7A' },
  hufflepuff: { label: 'Hufflepuff', icon: '🦡', color: '#C8A840' },
};

function SpellGlyph({ spellName, color }: { spellName: string; color: string }) {
  const s = color;
  switch (spellName) {
    case 'Lumos':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <circle cx="12" cy="12" r="4" fill={s} opacity="0.9"/>
          {[0,45,90,135,180,225,270,315].map((a,i) => (
            <line key={i} x1={12 + 5*Math.cos(a*Math.PI/180)} y1={12 + 5*Math.sin(a*Math.PI/180)}
              x2={12 + 9*Math.cos(a*Math.PI/180)} y2={12 + 9*Math.sin(a*Math.PI/180)}
              stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
          ))}
        </svg>
      );
    case 'Incendio':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 2 Q8 8 10 12 Q6 10 7 16 Q9 22 12 22 Q15 22 17 16 Q18 10 14 12 Q16 8 12 2Z" fill={s} opacity="0.9"/>
          <path d="M12 14 Q11 17 12 18 Q13 17 12 14Z" fill="white" opacity="0.5"/>
        </svg>
      );
    case 'Expelliarmus':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M4 20 L20 4" stroke={s} strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M4 4 L11 11" stroke={s} strokeWidth="2" strokeLinecap="round"/>
          <path d="M13 13 L20 20" stroke={s} strokeWidth="2" strokeLinecap="round"/>
          <polygon points="20,4 16,8 18,10" fill={s} opacity="0.8"/>
        </svg>
      );
    case 'Wingardium Leviosa':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 20 Q10 16 11 12 Q10 8 12 4 Q14 8 13 12 Q14 16 12 20Z" stroke={s} strokeWidth="1.5" fill="none"/>
          <path d="M8 8 Q10 6 12 4 Q14 6 16 8" stroke={s} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <line x1="12" y1="4" x2="12" y2="2" stroke={s} strokeWidth="2" strokeLinecap="round"/>
          <line x1="10" y1="3" x2="8" y2="1" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="14" y1="3" x2="16" y2="1" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'Patronus':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 18 Q8 16 6 12 Q8 8 12 6 Q16 8 18 12 Q16 16 12 18Z" fill={s} opacity="0.3"/>
          <path d="M9 14 Q7 12 8 10 Q10 9 12 10 L14 8 Q16 9 17 12 Q15 15 12 16 Q10 15 9 14Z" fill={s} opacity="0.7"/>
          <line x1="12" y1="16" x2="12" y2="20" stroke={s} strokeWidth="1.5"/>
          <line x1="10" y1="19" x2="14" y2="19" stroke={s} strokeWidth="1.5"/>
          <line x1="8" y1="18" x2="9" y2="20" stroke={s} strokeWidth="1"/>
          <line x1="16" y1="18" x2="15" y2="20" stroke={s} strokeWidth="1"/>
        </svg>
      );
    case 'Accio':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <line x1="4" y1="12" x2="20" y2="12" stroke={s} strokeWidth="2" strokeLinecap="round"/>
          <polyline points="12,6 20,12 12,18" fill="none" stroke={s} strokeWidth="2" strokeLinejoin="round"/>
          <circle cx="5" cy="12" r="2.5" fill={s} opacity="0.7"/>
        </svg>
      );
    case 'Stupefy':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => (
            <line key={i} x1="12" y1="12"
              x2={12 + 9*Math.cos(a*Math.PI/180)} y2={12 + 9*Math.sin(a*Math.PI/180)}
              stroke={s} strokeWidth={i%2===0?"1.5":"1"} strokeLinecap="round" opacity={i%2===0?1:0.5}/>
          ))}
          <circle cx="12" cy="12" r="3" fill={s}/>
        </svg>
      );
    case 'Protego':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 3 L20 7 L20 13 Q20 19 12 22 Q4 19 4 13 L4 7 Z" stroke={s} strokeWidth="1.5" fill={s} fillOpacity="0.2"/>
          <path d="M9 12 L11 14 L15 10" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'Nox':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M20 12 A8 8 0 1 1 12 4 A6 6 0 0 0 20 12Z" fill={s} opacity="0.9"/>
          <circle cx="17" cy="7" r="1" fill={s} opacity="0.5"/>
          <circle cx="19" cy="10" r="0.7" fill={s} opacity="0.4"/>
        </svg>
      );
    case 'Alohomora':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <circle cx="10" cy="9" r="5" stroke={s} strokeWidth="1.5" fill="none"/>
          <circle cx="10" cy="9" r="2" fill={s} opacity="0.6"/>
          <line x1="15" y1="9" x2="20" y2="9" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="20" y1="9" x2="20" y2="15" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="20" y1="15" x2="18" y2="15" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="20" y1="12" x2="22" y2="12" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'Riddikulus':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <circle cx="12" cy="10" r="6" stroke={s} strokeWidth="1.5" fill={s} fillOpacity="0.15"/>
          <path d="M6 7 Q9 4 12 6 Q15 4 18 7" stroke={s} strokeWidth="1.5" fill={s} fillOpacity="0.3"/>
          <circle cx="9.5" cy="9.5" r="1.2" fill={s}/>
          <circle cx="14.5" cy="9.5" r="1.2" fill={s}/>
          <path d="M9 13 Q12 16 15 13" stroke={s} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <line x1="12" y1="3" x2="12" y2="1" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="9" y1="4" x2="7" y2="2" stroke={s} strokeWidth="1" strokeLinecap="round"/>
          <line x1="15" y1="4" x2="17" y2="2" stroke={s} strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case 'Expecto Patronum':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 20 Q8 17 6 14 Q8 10 12 8 Q16 10 18 14 Q16 17 12 20Z" fill={s} opacity="0.4"/>
          <path d="M9 16 Q7 13 8 11 Q10 9.5 12 11 L14 9 Q16 10 17 13 Q15 16 12 17 Q10 17 9 16Z" fill={s} opacity="0.85"/>
          <line x1="12" y1="17" x2="11" y2="21" stroke={s} strokeWidth="1.2"/>
          <line x1="12" y1="17" x2="13" y2="21" stroke={s} strokeWidth="1.2"/>
          <line x1="10" y1="20" x2="9" y2="22" stroke={s} strokeWidth="1"/>
          <line x1="14" y1="20" x2="15" y2="22" stroke={s} strokeWidth="1"/>
          {[0,60,120,180,240,300].map((a,i) => (
            <line key={i} x1={12+7*Math.cos(a*Math.PI/180)} y1={12+7*Math.sin(a*Math.PI/180)}
              x2={12+9*Math.cos(a*Math.PI/180)} y2={12+9*Math.sin(a*Math.PI/180)}
              stroke={s} strokeWidth="0.8" opacity="0.5"/>
          ))}
        </svg>
      );
    default:
      return <span style={{ color, fontSize: '14px' }}>✦</span>;
  }
}

export function SpellPanel({ currentSpell, spells, cooldowns, onSpellCast, visible = true }: SpellPanelProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!onSpellCast) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < spells.length) {
        const spell = spells[idx];
        const now = Date.now();
        if (now >= (cooldowns[spell.name] || 0)) onSpellCast(spell.name);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [spells, cooldowns, onSpellCast]);

  if (!visible) return null;

  const houses = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];
  const grouped: Record<string, Spell[]> = {};
  houses.forEach(h => { grouped[h] = spells.filter(s => s.house === h); });

  return (
    <div className="flex gap-4 p-4 parchment rounded-2xl magic-border overflow-x-auto max-w-full">
      {houses.map((house, hIdx) => {
        const houseSpells = grouped[house];
        if (!houseSpells || houseSpells.length === 0) return null;
        const houseInfo = HOUSE_LABELS[house];
        return (
          <div key={house} className="flex flex-col gap-2">
            <div className="flex items-center gap-1 px-1">
              <span className="text-[10px]">{houseInfo.icon}</span>
              <span className="font-cinzel text-[9px] uppercase tracking-widest font-bold" style={{ color: houseInfo.color }}>
                {houseInfo.label}
              </span>
              <div className="flex-1 h-px" style={{ background: `${houseInfo.color}40` }} />
            </div>
            <div className="flex gap-2">
              {houseSpells.map((spell) => {
                const globalIdx = spells.indexOf(spell);
                const isActive = currentSpell === spell.name;
                const now = Date.now();
                const cooldownEnd = cooldowns[spell.name] || 0;
                const isOnCooldown = now < cooldownEnd;
                const cooldownPercent = isOnCooldown ? Math.max(0, (cooldownEnd - now) / 2500) : 0;
                const cooldownSecsLeft = isOnCooldown ? Math.ceil((cooldownEnd - now) / 1000) : 0;

                return (
                  <div key={spell.name}
                    className={cn('flex flex-col items-center justify-center p-3 rounded-xl min-w-[100px] transition-all duration-300 relative cursor-pointer',
                      isActive ? 'border-2' : 'bg-black/40 border border-primary/20',
                      'hover:border-primary/50')}
                    style={{
                      background: isActive ? `${spell.color}30` : 'rgba(0,0,0,0.4)',
                      boxShadow: isActive ? `0 0 20px ${spell.color}40` : 'none',
                      borderColor: isActive ? spell.color : '',
                      animation: isActive ? 'magicShake 0.4s ease' : undefined,
                    }}
                    onClick={() => onSpellCast?.(spell.name)}
                    title={`${spell.name} (key: ${globalIdx + 1})`}>
                    {globalIdx < 8 && (
                      <span className="absolute top-1 right-1 text-[9px] font-mono px-1 rounded"
                        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
                        {globalIdx + 1}
                      </span>
                    )}
                    <div className="relative w-10 h-10 mb-2 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                        <circle cx="22" cy="22" r="20" fill="none" stroke={spell.color} strokeWidth="2"
                          strokeDasharray="126" strokeDashoffset={126 * cooldownPercent}
                          className="transition-all duration-100 ease-linear origin-center -rotate-90"/>
                      </svg>
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-all', isActive ? 'animate-[pulse_1s_ease-in-out_infinite]' : '')}
                        style={{ backgroundColor: isActive ? spell.color : `${spell.color}40` }}>
                        {isOnCooldown
                          ? <span className="font-cinzel font-bold text-[11px]" style={{ color: spell.color }}>{cooldownSecsLeft}</span>
                          : <SpellGlyph spellName={spell.name} color={isActive ? '#fff' : spell.color} />
                        }
                      </div>
                    </div>
                    <span className="font-cinzel text-[11px] text-foreground font-bold text-center leading-tight mb-1 max-w-[88px]">{spell.name}</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider text-center">{spell.description}</span>
                  </div>
                );
              })}
            </div>
            {hIdx < houses.length - 1 && <div className="w-px self-stretch bg-primary/10 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}
