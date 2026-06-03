import { useState, useEffect, useRef } from 'react';
import { SPELLS } from '@/utils/spells';

export function useSpells(currentGesture: string | null) {
  const [currentSpell, setCurrentSpell] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const spellTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!currentGesture) return;
    
    const spell = SPELLS.find(s => s.gesture === currentGesture);
    if (!spell) return;
    
    const now = Date.now();
    const cooldownEnd = cooldowns[spell.name] || 0;
    
    if (now < cooldownEnd) return; // On cooldown
    
    // Cast spell
    setCurrentSpell(spell.name);
    setCooldowns(prev => ({ ...prev, [spell.name]: now + 2000 }));
    
    // Play sound
    try {
      const audio = new Audio(spell.soundFile);
      audio.play().catch(e => console.log('Audio play blocked', e));
    } catch (e) {
      // ignore
    }
    
    if (spellTimeoutRef.current) {
      clearTimeout(spellTimeoutRef.current);
    }
    
    spellTimeoutRef.current = setTimeout(() => {
      setCurrentSpell(null);
    }, 1500);
    
  }, [currentGesture]);
  
  return { currentSpell, cooldowns };
}
