import { Spell } from '@/utils/spells';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SpellPanelProps {
  currentSpell: string | null;
  spells: Spell[];
  cooldowns: Record<string, number>;
}

export function SpellPanel({ currentSpell, spells, cooldowns }: SpellPanelProps) {
  const [, setTick] = useState(0);

  // Force re-render to update cooldown rings
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 p-4 parchment rounded-2xl magic-border overflow-x-auto max-w-full">
      {spells.map(spell => {
        const isActive = currentSpell === spell.name;
        const now = Date.now();
        const cooldownEnd = cooldowns[spell.name] || 0;
        const isOnCooldown = now < cooldownEnd;
        const cooldownPercent = isOnCooldown ? Math.max(0, (cooldownEnd - now) / 2000) : 0;
        
        return (
          <div 
            key={spell.name}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl min-w-[120px] transition-all duration-300 relative",
              isActive ? "bg-primary/20 border-primary" : "bg-black/40 border-primary/20",
              "border hover:border-primary/50"
            )}
            style={{ 
              boxShadow: isActive ? `0 0 20px ${spell.color}40` : 'none',
              borderColor: isActive ? spell.color : ''
            }}
          >
            {/* Cooldown Ring */}
            <div className="relative w-12 h-12 mb-2 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 44 44">
                <circle
                  cx="22" cy="22" r="20"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
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
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isActive ? "animate-[pulse_1s_ease-in-out_infinite]" : ""
                )}
                style={{ backgroundColor: isActive ? spell.color : `${spell.color}40` }}
              />
            </div>
            
            <span className="font-cinzel text-sm text-foreground font-bold text-center leading-tight mb-1">
              {spell.name}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">
              {spell.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}
