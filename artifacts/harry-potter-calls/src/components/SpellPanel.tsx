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

export function SpellPanel({ currentSpell, spells, cooldowns, onSpellCast, visible = true }: SpellPanelProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts 1–8 (up to 12 for new spells)
  useEffect(() => {
    if (!onSpellCast) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < spells.length) {
        const spell = spells[idx];
        const now = Date.now();
        if (now >= (cooldowns[spell.name] || 0)) {
          onSpellCast(spell.name);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [spells, cooldowns, onSpellCast]);

  if (!visible) return null;

  // Group by house
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
            {/* House divider label */}
            <div className="flex items-center gap-1 px-1">
              <span className="text-[10px]">{houseInfo.icon}</span>
              <span
                className="font-cinzel text-[9px] uppercase tracking-widest font-bold"
                style={{ color: houseInfo.color }}
              >
                {houseInfo.label}
              </span>
              <div className="flex-1 h-px" style={{ background: `${houseInfo.color}40` }} />
            </div>
            <div className="flex gap-2">
              {houseSpells.map((spell, sIdx) => {
                // Find global index for keyboard shortcut badge
                const globalIdx = spells.indexOf(spell);
                const isActive = currentSpell === spell.name;
                const now = Date.now();
                const cooldownEnd = cooldowns[spell.name] || 0;
                const isOnCooldown = now < cooldownEnd;
                const cooldownPercent = isOnCooldown ? Math.max(0, (cooldownEnd - now) / 2500) : 0;
                const cooldownSecsLeft = isOnCooldown ? Math.ceil((cooldownEnd - now) / 1000) : 0;

                return (
                  <div
                    key={spell.name}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-xl min-w-[100px] transition-all duration-300 relative',
                      isActive ? 'border-2' : 'bg-black/40 border border-primary/20',
                      'hover:border-primary/50',
                      isActive ? 'cursor-pointer' : ''
                    )}
                    style={{
                      background: isActive ? `${spell.color}30` : 'rgba(0,0,0,0.4)',
                      boxShadow: isActive ? `0 0 20px ${spell.color}40` : 'none',
                      borderColor: isActive ? spell.color : '',
                      animation: isActive ? 'magicShake 0.4s ease' : undefined,
                    }}
                    onClick={() => onSpellCast?.(spell.name)}
                    title={`${spell.name} (key: ${globalIdx + 1})`}
                  >
                    {/* Keyboard shortcut badge */}
                    {globalIdx < 8 && (
                      <span
                        className="absolute top-1 right-1 text-[9px] font-mono px-1 rounded"
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'rgba(255,255,255,0.5)',
                          lineHeight: '1.4',
                        }}
                      >
                        {globalIdx + 1}
                      </span>
                    )}

                    {/* Cooldown Ring */}
                    <div className="relative w-10 h-10 mb-2 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                        <circle
                          cx="22" cy="22" r="20"
                          fill="none"
                          stroke={spell.color}
                          strokeWidth="2"
                          strokeDasharray="126"
                          strokeDashoffset={126 * cooldownPercent}
                          className="transition-all duration-100 ease-linear origin-center -rotate-90"
                        />
                      </svg>
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center transition-all text-xs',
                          isActive ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''
                        )}
                        style={{ backgroundColor: isActive ? spell.color : `${spell.color}40` }}
                      >
                        {isOnCooldown && (
                          <span className="font-cinzel font-bold text-[11px]" style={{ color: spell.color }}>
                            {cooldownSecsLeft}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-cinzel text-[11px] text-foreground font-bold text-center leading-tight mb-1 max-w-[88px]">
                      {spell.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider text-center">
                      {spell.description}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Divider between house groups */}
            {hIdx < houses.length - 1 && (
              <div className="w-px self-stretch bg-primary/10 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
