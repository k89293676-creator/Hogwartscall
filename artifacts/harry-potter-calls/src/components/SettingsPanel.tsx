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
          <DialogTitle className="font-harry text-primary text-xl glow-gold-text">⚙ Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="font-cinzel text-primary/80 text-sm">Background Quality</Label>
            <div className="space-y-2">
              {qualityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update({ backgroundQuality: opt.value })}
                  className="w-full text-left px-3 py-2 rounded-lg border transition-all"
                  style={{
                    background: settings.backgroundQuality === opt.value ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.3)',
                    borderColor: settings.backgroundQuality === opt.value ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.2)',
                  }}
                >
                  <div className="font-cinzel text-sm text-primary">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'wandCursorEnabled', label: 'Wand Cursor', desc: 'Custom wand cursor with trail' },
            { key: 'spellSoundsEnabled', label: 'Spell Sound Effects', desc: 'Magical chime on spell cast' },
            { key: 'spellPanelVisible', label: 'Show Spell Panel', desc: 'Display spell tray at bottom' },
            { key: 'videoBlur', label: 'Remote Video Blur', desc: 'Apply blur to remote video feed' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <Label className="font-cinzel text-sm text-primary/90">{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={settings[item.key as keyof Settings] as boolean}
                onCheckedChange={val => update({ [item.key]: val })}
              />
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
