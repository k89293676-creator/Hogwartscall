import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export type BackgroundQuality = 'cinematic' | 'balanced' | 'performance';

export interface Settings {
  backgroundQuality: BackgroundQuality;
  wandCursorEnabled: boolean;
  spellSoundsEnabled: boolean;
  spellPanelVisible: boolean;
  videoBlur: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  backgroundQuality: 'cinematic',
  wandCursorEnabled: true,
  spellSoundsEnabled: true,
  spellPanelVisible: true,
  videoBlur: false,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem('hogwarts-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(s: Settings) {
  localStorage.setItem('hogwarts-settings', JSON.stringify(s));
  window.dispatchEvent(new CustomEvent('hogwarts-settings-change'));
}

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsChange: (settings: Settings) => void;
  onShowGestureTutorial?: () => void;
}

export function SettingsPanel({ open, onOpenChange, onSettingsChange, onShowGestureTutorial }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const onSettingsChangeRef = useRef(onSettingsChange);
  onSettingsChangeRef.current = onSettingsChange;

  useEffect(() => {
    saveSettings(settings);
    onSettingsChangeRef.current(settings);
  }, [settings]);

  const update = (patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  const qualityOptions: { value: BackgroundQuality; label: string; desc: string }[] = [
    { value: 'cinematic', label: 'Cinematic', desc: 'Full Three.js with all effects' },
    { value: 'balanced', label: 'Balanced', desc: 'Three.js, reduced particles' },
    { value: 'performance', label: 'Performance', desc: 'CSS fallback only' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="parchment border-primary/30 max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <ellipse cx="14" cy="17" rx="8" ry="7" fill="#D4AF37" opacity="0.7"/>
              <circle cx="14" cy="11" r="6" fill="#D4AF37" opacity="0.8"/>
              <circle cx="12" cy="10" r="2" fill="#0a0a14"/>
              <circle cx="16" cy="10" r="2" fill="#0a0a14"/>
              <circle cx="12.5" cy="9.5" r="0.7" fill="white"/>
              <circle cx="16.5" cy="9.5" r="0.7" fill="white"/>
              <path d="M8 10 Q4 7 3 3 Q8 8 8 10Z" fill="#D4AF37" opacity="0.7"/>
              <path d="M20 10 Q24 7 25 3 Q20 8 20 10Z" fill="#D4AF37" opacity="0.7"/>
              <path d="M12 13 L14 15 L16 13" stroke="#8B6914" strokeWidth="1.2" fill="none"/>
            </svg>
            <DialogTitle className="font-harry text-primary text-xl glow-gold-text">Magical Settings</DialogTitle>
          </div>
          {/* Decorative golden ruled underline */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), rgba(212,175,55,0.9), rgba(212,175,55,0.6), transparent)',
            marginTop: 8,
          }} />
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Background Quality */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div style={{ width: 12, height: 12, background: 'rgba(212,175,55,0.7)', transform: 'rotate(45deg)' }} />
              <Label className="font-cinzel text-primary/80 text-sm">Background Quality</Label>
            </div>
            <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)', marginBottom: 8 }} />
            <div className="space-y-2">
              {qualityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update({ backgroundQuality: opt.value })}
                  className="w-full text-left px-3 py-2 rounded-lg border transition-all"
                  style={{
                    background: settings.backgroundQuality === opt.value ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.3)',
                    borderColor: settings.backgroundQuality === opt.value ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.2)',
                    boxShadow: settings.backgroundQuality === opt.value ? '0 0 8px rgba(212,175,55,0.2)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: settings.backgroundQuality === opt.value ? '#D4AF37' : 'rgba(212,175,55,0.3)',
                      boxShadow: settings.backgroundQuality === opt.value ? '0 0 6px #D4AF37' : 'none',
                    }} />
                    <span className="font-cinzel text-sm text-primary">{opt.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.2)' }} />
            <span style={{ color: 'rgba(212,175,55,0.6)', fontSize: 10 }}>◆</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.2)' }} />
          </div>

          {[
            { key: 'wandCursorEnabled', label: 'Wand Cursor', desc: 'Custom wand cursor with trail' },
            { key: 'spellSoundsEnabled', label: 'Spell Sound Effects', desc: 'Magical chime on spell cast' },
            { key: 'spellPanelVisible', label: 'Show Spell Panel', desc: 'Display spell tray at bottom' },
            { key: 'videoBlur', label: 'Remote Video Blur', desc: 'Apply blur to remote video feed' },
          ].map((item, idx) => (
            <div key={item.key}>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-cinzel text-sm text-primary/90">{item.label}</Label>
                  <p className="text-xs text-muted-foreground font-fell italic">{item.desc}</p>
                </div>
                <Switch
                  checked={settings[item.key as keyof Settings] as boolean}
                  onCheckedChange={val => update({ [item.key]: val })}
                />
              </div>
              {idx < 3 && (
                <div className="flex items-center gap-2 mt-4">
                  <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.15)' }} />
                  <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: 8 }}>◆</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.15)' }} />
                </div>
              )}
            </div>
          ))}

          {onShowGestureTutorial && (
            <Button
              variant="outline"
              className="w-full font-cinzel text-sm border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => { onOpenChange(false); onShowGestureTutorial(); }}
            >
              🪄 Show Gesture Guide
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
