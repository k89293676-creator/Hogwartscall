import { useState, useEffect, useRef } from 'react';
import { SPELLS } from '@/utils/spells';

export function useSpells(currentGesture: string | null) {
  const [currentSpell, setCurrentSpell] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  const cooldownsRef = useRef<Record<string, number>>({});
  const spellTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!currentGesture) return;

    const spell = SPELLS.find(s => s.gesture === currentGesture);
    if (!spell) return;

    const now = Date.now();
    const cooldownEnd = cooldownsRef.current[spell.name] ?? 0;
    if (now < cooldownEnd) return;

    cooldownsRef.current[spell.name] = now + 2500;
    setCooldowns({ ...cooldownsRef.current });

    setCurrentSpell(spell.name);

    try {
      const audio = new Audio(spell.soundFile);
      audio.play().catch(() => {});
    } catch {
      // no audio file, ignore
    }

    if (spellTimeoutRef.current) clearTimeout(spellTimeoutRef.current);
    spellTimeoutRef.current = setTimeout(() => {
      setCurrentSpell(null);
    }, 1800);
  }, [currentGesture]);

  return { currentSpell, cooldowns };
}
