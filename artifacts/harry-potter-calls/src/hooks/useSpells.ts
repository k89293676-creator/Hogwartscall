import { useState, useEffect, useRef, useCallback } from 'react';
import { SPELLS } from '@/utils/spells';

// BUG 19 FIX: Replace new Audio(soundFile) with Web Audio API synthesis.
// The project has no /sounds/ directory so .mp3 files return 404.
// Each spell gets a unique synthesised chime based on frequency + waveform.

const SPELL_SOUNDS: Record<string, { freq: number; type: OscillatorType; harmonics?: number[] }> = {
  'Lumos':             { freq: 880,  type: 'sine',     harmonics: [1, 0.5, 0.25] },
  'Nox':               { freq: 220,  type: 'sine',     harmonics: [1, 0.3] },
  'Incendio':          { freq: 440,  type: 'sawtooth', harmonics: [1, 0.6, 0.3] },
  'Expelliarmus':      { freq: 660,  type: 'square',   harmonics: [1, 0.4] },
  'Wingardium Leviosa':{ freq: 528,  type: 'sine',     harmonics: [1, 0.7, 0.4] },
  'Patronus':          { freq: 740,  type: 'sine',     harmonics: [1, 0.5, 0.25, 0.1] },
  'Accio':             { freq: 330,  type: 'sine',     harmonics: [1, 0.8, 0.6] },
  'Stupefy':           { freq: 200,  type: 'sawtooth', harmonics: [1, 0.5] },
  'Protego':           { freq: 600,  type: 'triangle', harmonics: [1, 0.4, 0.2] },
  'Alohomora':         { freq: 480,  type: 'sine',     harmonics: [1, 0.6, 0.3] },
  'Riddikulus':        { freq: 400,  type: 'square',   harmonics: [1, 0.3] },
  'Expecto Patronum':  { freq: 784,  type: 'sine',     harmonics: [1, 0.6, 0.3, 0.1] },
};

let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!_audioCtx || _audioCtx.state === 'closed') {
      _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return _audioCtx;
  } catch { return null; }
}

function synthesizeSpellSound(spellName: string): void {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const config = SPELL_SOUNDS[spellName] ?? { freq: 440, type: 'sine' as OscillatorType, harmonics: [1] };
  const harmonics = config.harmonics ?? [1];
  const now = ctx.currentTime;
  const duration = 0.45;

  harmonics.forEach((gain, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = config.type;
    osc.frequency.setValueAtTime(config.freq * (i + 1), now);
    osc.frequency.exponentialRampToValueAtTime(config.freq * (i + 1) * 1.08, now + duration * 0.6);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain * 0.18, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  });
}

export function useSpells(currentGesture: string | null) {
  const [currentSpell, setCurrentSpell] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  const cooldownsRef = useRef<Record<string, number>>({});
  const spellTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundEnabledRef = useRef(true);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled;
  }, []);

  const castSpell = useCallback((spellName: string) => {
    const spell = SPELLS.find(s => s.name === spellName);
    if (!spell) return;
    const now = Date.now();
    const cooldownEnd = cooldownsRef.current[spell.name] ?? 0;
    if (now < cooldownEnd) return;

    cooldownsRef.current[spell.name] = now + 2500;
    setCooldowns({ ...cooldownsRef.current });
    setCurrentSpell(spell.name);

    // BUG 19 FIX: use Web Audio API instead of new Audio(soundFile)
    if (soundEnabledRef.current) {
      synthesizeSpellSound(spell.name);
    }

    if (spellTimeoutRef.current) clearTimeout(spellTimeoutRef.current);
    spellTimeoutRef.current = setTimeout(() => { setCurrentSpell(null); }, 1800);
  }, []);

  useEffect(() => {
    if (!currentGesture) return;
    const spell = SPELLS.find(s => s.gesture === currentGesture);
    if (!spell) return;
    castSpell(spell.name);
  }, [currentGesture, castSpell]);

  return { currentSpell, cooldowns, castSpell, setSoundEnabled };
}
