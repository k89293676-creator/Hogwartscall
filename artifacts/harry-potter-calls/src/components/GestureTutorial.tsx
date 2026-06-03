import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface GestureTutorialProps {
  open: boolean;
  onClose: () => void;
}

const GESTURES = [
  { name: 'Lumos', description: 'Open palm — all fingers extended', color: '#FFD700',
    svg: <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
      <circle cx="30" cy="30" r="8" fill="#FFD700" opacity="0.9"/>
      {[0,45,90,135,180,225,270,315].map((a,i) => (
        <line key={i} x1={30+10*Math.cos(a*Math.PI/180)} y1={30+10*Math.sin(a*Math.PI/180)}
          x2={30+20*Math.cos(a*Math.PI/180)} y2={30+20*Math.sin(a*Math.PI/180)}
          stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
    </svg> },
  { name: 'Incendio', description: 'Make a fist — all fingers curled', color: '#FF4500',
    svg: <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
      <rect x="18" y="22" width="24" height="20" rx="6" fill="#FF4500" opacity="0.8"/>
      <rect x="16" y="30" width="8" height="14" rx="4" fill="#FF4500" opacity="0.7"/>
      <path d="M22 22 L38 22 Q40 16 36 12 Q32 16 30 12 Q28 16 26 12 Q22 16 22 22Z" fill="#FF4500" opacity="0.6"/>
      <path d="M30 28 Q28 32 30 34 Q32 32 30 28Z" fill="#FFD700" opacity="0.6"/>
    </svg> },
  { name: 'Expelliarmus', description: 'Point index finger only', color: '#DC143C',
    svg: <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
      <rect x="22" y="30" width="8" height="22" rx="4" fill="#DC143C" opacity="0.8"/>
      <rect x="16" y="36" width="8" height="14" rx="4" fill="#DC143C" opacity="0.5"/>
      <rect x="28" y="36" width="8" height="14" rx="4" fill="#DC143C" opacity="0.5"/>
      <rect x="34" y="36" width="8" height="14" rx="4" fill="#DC143C" opacity="0.5"/>
      <path d="M40 16 L26 30" stroke="#DC143C" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2"/>
      <polygon points="40,16 36,22 42,22" fill="#DC143C" opacity="0.6"/>
    </svg> },
  { name: 'Wingardium Leviosa', description: 'L-shape: thumb + index extended', color: '#32CD32',
    svg: <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
      <rect x="24" y="20" width="8" height="26" rx="4" fill="#32CD32" opacity="0.8"/>
      <rect x="16" y="36" width="8" height="14" rx="4" fill="#32CD32" opacity="0.4"/>
      <rect x="32" y="36" width="8" height="14" rx="4" fill="#32CD32" opacity="0.4"/>
      <rect x="38" y="38" width="8" height="12" rx="4" fill="#32CD32" opacity="0.4"/>
      <rect x="14" y="30" width="14" height="8" rx="4" fill="#32CD32" opacity="0.8" transform="rotate(-30 21 34)"/>
    </svg> },
  { name: 'Protego', description: 'Rock horns: index + pinky', color: '#00BFFF',
    svg: <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
      <rect x="18" y="22" width="8" height="26" rx="4" fill="#00BFFF" opacity="0.8"/>
      <rect x="34" y="22" width="8" height="26" rx="4" fill="#00BFFF" opacity="0.8"/>
      <rect x="26" y="36" width="8" height="14" rx="4" fill="#00BFFF" opacity="0.4"/>
      <rect x="14" y="30" width="32" height="10" rx="5" fill="#00BFFF" opacity="0.3"/>
    </svg> },
  { name: 'Stupefy', description: 'Three fingers: index + middle + ring', color: '#FF1493',
    svg: <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
      <rect x="18" y="18" width="8" height="28" rx="4" fill="#FF1493" opacity="0.8"/>
      <rect x="26" y="16" width="8" height="28" rx="4" fill="#FF1493" opacity="0.9"/>
      <rect x="34" y="18" width="8" height="28" rx="4" fill="#FF1493" opacity="0.8"/>
      <rect x="10" y="38" width="8" height="14" rx="4" fill="#FF1493" opacity="0.4"/>
      <rect x="42" y="38" width="8" height="14" rx="4" fill="#FF1493" opacity="0.4"/>
    </svg> },
  { name: 'Accio', description: 'Shaka / hang-loose: thumb + pinky', color: '#9B59B6',
    svg: <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
      <rect x="36" y="20" width="8" height="26" rx="4" fill="#9B59B6" opacity="0.8"/>
      <rect x="20" y="38" width="8" height="12" rx="4" fill="#9B59B6" opacity="0.4"/>
      <rect x="28" y="38" width="8" height="12" rx="4" fill="#9B59B6" opacity="0.4"/>
      <rect x="16" y="36" width="8" height="12" rx="4" fill="#9B59B6" opacity="0.4"/>
      <rect x="12" y="28" width="14" height="8" rx="4" fill="#9B59B6" opacity="0.8" transform="rotate(20 19 32)"/>
    </svg> },
  { name: 'Nox', description: 'Pinch: thumb tip close to index tip', color: '#2C3E50',
    svg: <svg viewBox="0 0 60 60" width="60" height="60" fill="none">
      <circle cx="28" cy="24" r="6" fill="#2C3E50" opacity="0.8" stroke="#94a3b8" strokeWidth="1"/>
      <rect x="24" y="30" width="8" height="18" rx="4" fill="#2C3E50" opacity="0.6" stroke="#94a3b8" strokeWidth="0.5"/>
      <rect x="16" y="36" width="8" height="14" rx="4" fill="#2C3E50" opacity="0.5" stroke="#94a3b8" strokeWidth="0.5"/>
      <line x1="24" y1="30" x2="18" y2="24" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg> },
];

export function GestureTutorial({ open, onClose }: GestureTutorialProps) {
  const handleDismiss = () => {
    localStorage.setItem('gesture-tutorial-seen', '1');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="parchment rounded-2xl magic-border shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
          >
            <div className="px-6 pt-6 pb-4 border-b border-primary/20 flex-shrink-0">
              <h2 className="font-harry text-primary text-xl glow-gold-text text-center">🪄 Gesture Spellcasting Guide</h2>
              <p className="font-cinzel text-xs text-muted-foreground text-center mt-1">
                Hold each gesture for a moment to cast — the camera detects your hand movements
              </p>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GESTURES.map(g => (
                  <motion.div
                    key={g.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-primary/20 hover:border-primary/40 transition-colors"
                    style={{ background: `${g.color}10` }}
                  >
                    <div className="relative">
                      {g.svg}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: `${g.color}40`, border: `1px solid ${g.color}60` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: g.color }} />
                      </div>
                    </div>
                    <span className="font-cinzel text-[10px] font-bold text-center leading-tight" style={{ color: g.color }}>
                      {g.name}
                    </span>
                    <span className="font-cinzel text-[8px] text-muted-foreground text-center leading-tight">
                      {g.description}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-primary/20 flex-shrink-0 flex justify-center">
              <Button
                onClick={handleDismiss}
                className="font-cinzel px-8"
                style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37' }}
              >
                ✓ Got it — enter the Floo Network
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
