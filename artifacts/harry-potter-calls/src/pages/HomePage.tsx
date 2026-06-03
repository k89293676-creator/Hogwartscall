import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FlooFireplace } from '@/components/FlooFireplace';

type House = 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff';

interface HouseConfig {
  id: House;
  name: string;
  primary: string;
  secondary: string;
  animal: string;
  svgAnimal: React.ReactNode;
}

function LionSVG() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <ellipse cx="20" cy="24" rx="10" ry="8" fill="currentColor" opacity="0.9"/>
      <circle cx="20" cy="16" r="7" fill="currentColor"/>
      <circle cx="20" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.6"/>
      <circle cx="17" cy="15" r="1.5" fill="#0a0a14"/>
      <circle cx="23" cy="15" r="1.5" fill="#0a0a14"/>
      <path d="M18 19 Q20 21 22 19" stroke="#0a0a14" strokeWidth="1" fill="none"/>
      <rect x="16" y="31" width="3" height="6" rx="1.5" fill="currentColor"/>
      <rect x="21" y="31" width="3" height="6" rx="1.5" fill="currentColor"/>
      <path d="M30 24 Q36 22 34 28" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function SerpentSVG() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <path d="M8 34 Q14 28 20 22 Q26 16 32 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M8 34 Q10 38 14 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <ellipse cx="32" cy="10" rx="5" ry="3.5" fill="currentColor" transform="rotate(-45 32 10)"/>
      <circle cx="30" cy="8" r="1" fill="#0a0a14"/>
      <path d="M34 8 L37 6 M34 10 L37 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

function EagleSVG() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <ellipse cx="20" cy="22" rx="6" ry="9" fill="currentColor"/>
      <path d="M14 18 Q6 12 4 6 Q10 14 14 18Z" fill="currentColor" opacity="0.9"/>
      <path d="M26 18 Q34 12 36 6 Q30 14 26 18Z" fill="currentColor" opacity="0.9"/>
      <circle cx="20" cy="13" r="4" fill="currentColor"/>
      <circle cx="18.5" cy="12" r="1.2" fill="#0a0a14"/>
      <circle cx="21.5" cy="12" r="1.2" fill="#0a0a14"/>
      <path d="M18 15 L20 17 L22 15" stroke="#0a0a14" strokeWidth="1" fill="none"/>
      <path d="M17 30 L15 36 M20 31 L20 37 M23 30 L25 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function BadgerSVG() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <ellipse cx="20" cy="24" rx="13" ry="9" fill="currentColor"/>
      <circle cx="20" cy="15" r="8" fill="currentColor"/>
      <path d="M16 10 Q20 6 24 10" stroke="#0a0a14" strokeWidth="2" fill="none"/>
      <rect x="16" y="11" width="8" height="3" rx="1" fill="#f0f0f0" opacity="0.7"/>
      <circle cx="17.5" cy="14" r="1.2" fill="#0a0a14"/>
      <circle cx="22.5" cy="14" r="1.2" fill="#0a0a14"/>
      <path d="M18 17.5 Q20 19 22 17.5" stroke="#0a0a14" strokeWidth="1" fill="none"/>
      <rect x="14" y="32" width="4" height="5" rx="2" fill="currentColor"/>
      <rect x="22" y="32" width="4" height="5" rx="2" fill="currentColor"/>
    </svg>
  );
}

const HOUSES: HouseConfig[] = [
  {
    id: 'gryffindor',
    name: 'Gryffindor',
    primary: '#C41E3A',
    secondary: '#D4AF37',
    animal: 'Lion',
    svgAnimal: <LionSVG />,
  },
  {
    id: 'slytherin',
    name: 'Slytherin',
    primary: '#1A472A',
    secondary: '#AAAAAA',
    animal: 'Serpent',
    svgAnimal: <SerpentSVG />,
  },
  {
    id: 'ravenclaw',
    name: 'Ravenclaw',
    primary: '#0E1A40',
    secondary: '#946B2D',
    animal: 'Eagle',
    svgAnimal: <EagleSVG />,
  },
  {
    id: 'hufflepuff',
    name: 'Hufflepuff',
    primary: '#F0C75E',
    secondary: '#372E29',
    animal: 'Badger',
    svgAnimal: <BadgerSVG />,
  },
];

interface SparkPos { id: number; tx: string; ty: string; }

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [roomId, setRoomId] = useState('');
  const [wizardName, setWizardName] = useState('');
  const [step, setStep] = useState<'identity' | 'sorting'>('identity');
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [selectedHouseAnim, setSelectedHouseAnim] = useState<House | null>(null);
  const [flashGreen, setFlashGreen] = useState(false);
  const [sparks, setSparks] = useState<SparkPos[]>([]);
  const sparkIdRef = useRef(0);

  const proceedToSorting = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && wizardName.trim()) {
      setStep('sorting');
    }
  };

  const selectHouse = (house: House) => {
    setSelectedHouse(house);
    setSelectedHouseAnim(house);
    sessionStorage.setItem('wizardName', wizardName.trim());
    sessionStorage.setItem('house', house);
  };

  const handleJoin = () => {
    if (!selectedHouse) return;
    setFlashGreen(true);
    setTimeout(() => {
      const params = new URLSearchParams({ name: wizardName.trim(), house: selectedHouse });
      setLocation(`/room/${roomId.trim()}?${params.toString()}`);
    }, 500);
  };

  const generateRoom = (e: React.MouseEvent) => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    triggerSparks(e);
    if (wizardName.trim() && selectedHouse) {
      const params = new URLSearchParams({ name: wizardName.trim(), house: selectedHouse });
      setLocation(`/room/${id}?${params.toString()}`);
    } else {
      setRoomId(id);
      if (step === 'identity') {
        setStep('identity');
      }
    }
  };

  const triggerSparks = (e: React.MouseEvent) => {
    const newSparks: SparkPos[] = Array.from({ length: 4 }).map(() => ({
      id: sparkIdRef.current++,
      tx: `${(Math.random() - 0.5) * 60}px`,
      ty: `${-(Math.random() * 50 + 20)}px`,
    }));
    setSparks(prev => [...prev, ...newSparks]);
    setTimeout(() => setSparks(prev => prev.filter(s => !newSparks.find(n => n.id === s.id))), 700);
    void e;
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4 ${selectedHouse ? `house-${selectedHouse}` : ''}`}>

      {/* Floo Fireplace behind card */}
      <FlooFireplace />

      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/80 via-background/60 to-background/90 z-0" />

      {/* Green flash overlay */}
      <AnimatePresence>
        {flashGreen && (
          <motion.div
            className="absolute inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.5, times: [0, 0.4, 1] }}
            style={{ background: 'rgba(0,255,136,0.35)' }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md parchment rounded-3xl p-8 shadow-2xl relative z-10 magic-border"
        style={{ position: 'relative' }}
      >
        {/* Wax seal top center */}
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-20"
          style={{
            background: 'radial-gradient(circle at 40% 35%, #C41E3A, #8B0000)',
            boxShadow: '0 0 12px rgba(196,30,58,0.7), 0 2px 8px rgba(0,0,0,0.5)',
            border: '2px solid rgba(212,175,55,0.4)',
          }}
        >
          <span className="font-harry text-primary text-lg font-bold" style={{ textShadow: '0 0 6px rgba(212,175,55,0.8)' }}>H</span>
        </div>

        {/* SVG ink-written title */}
        <div className="text-center mb-6 mt-4">
          <svg viewBox="0 0 340 56" width="100%" height="56" className="mb-1">
            <text
              x="170" y="44"
              textAnchor="middle"
              fontFamily="'Cinzel Decorative', cursive"
              fontSize="30"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.8"
              style={{
                strokeDasharray: 600,
                strokeDashoffset: 0,
                animation: 'inkWrite 2s ease forwards',
                filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.6))',
              }}
            >
              The Floo Network
            </text>
            <text
              x="170" y="44"
              textAnchor="middle"
              fontFamily="'Cinzel Decorative', cursive"
              fontSize="30"
              fill="#D4AF37"
              opacity="0.15"
            >
              The Floo Network
            </text>
          </svg>
          <p className="font-cinzel text-muted-foreground text-xs tracking-widest">
            Step through the fireplace to cast magical video calls
          </p>
        </div>

        {/* Step 1: Identity */}
        <AnimatePresence mode="wait">
          {step === 'identity' && (
            <motion.form
              key="identity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              onSubmit={proceedToSorting}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="font-cinzel text-primary/80 text-sm pl-2 block">Your Wizard Name</label>
                <Input
                  value={wizardName}
                  onChange={e => setWizardName(e.target.value)}
                  placeholder="e.g. Harry Potter"
                  className="bg-input/50 border-primary/30 text-center font-cinzel text-base h-12 rounded-xl focus:ring-primary focus:border-primary placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <label className="font-cinzel text-primary/80 text-sm pl-2 block">Floo Destination (Room ID)</label>
                <Input
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  placeholder="e.g. HOGWARTS77"
                  className="bg-input/50 border-primary/30 text-center font-cinzel text-base h-12 rounded-xl focus:ring-primary focus:border-primary placeholder:text-muted-foreground/30 uppercase"
                />
              </div>
              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  disabled={!roomId.trim() || !wizardName.trim()}
                  className="wand-btn w-full h-12 font-cinzel font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-gold transition-all relative overflow-hidden"
                >
                  Choose Your House →
                </Button>
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-primary/20" />
                  <span className="flex-shrink-0 mx-3 font-cinzel text-muted-foreground text-xs">OR</span>
                  <div className="flex-grow border-t border-primary/20" />
                </div>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRoom}
                    className="wand-btn w-full h-12 font-cinzel text-primary border-primary/50 hover:bg-primary/10 rounded-xl relative overflow-hidden"
                  >
                    Conjure New Room
                  </Button>
                  {sparks.map(s => (
                    <div
                      key={s.id}
                      className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary pointer-events-none"
                      style={{
                        '--tx': s.tx,
                        '--ty': s.ty,
                        animation: 'sparkBurst 0.6s ease forwards',
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>
            </motion.form>
          )}

          {/* Step 2: House Sorting */}
          {step === 'sorting' && (
            <motion.div
              key="sorting"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div className="text-center mb-2">
                <p className="font-cinzel text-primary text-sm tracking-widest">Choose Your House, {wizardName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {HOUSES.map(house => (
                  <button
                    key={house.id}
                    onClick={() => selectHouse(house.id)}
                    className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedHouseAnim === house.id ? 'house-selected' : ''
                    }`}
                    style={{
                      borderColor: selectedHouse === house.id ? house.primary : `${house.primary}55`,
                      background: selectedHouse === house.id
                        ? `linear-gradient(135deg, ${house.primary}30, ${house.secondary}20)`
                        : `linear-gradient(135deg, ${house.primary}15, ${house.secondary}08)`,
                      boxShadow: selectedHouse === house.id
                        ? `0 0 20px ${house.primary}50, inset 0 0 10px ${house.primary}15`
                        : 'none',
                    }}
                  >
                    {/* SVG Shield */}
                    <svg viewBox="0 0 60 70" width="56" height="64" className="mb-2">
                      <path
                        d="M30 4 L56 14 L56 36 Q56 58 30 68 Q4 58 4 36 L4 14 Z"
                        fill={`${house.primary}CC`}
                        stroke={house.secondary}
                        strokeWidth="2"
                      />
                      {/* Diagonal quarters */}
                      <line x1="4" y1="14" x2="56" y2="14" stroke={house.secondary} strokeWidth="1" opacity="0.5"/>
                      <line x1="30" y1="4" x2="30" y2="68" stroke={house.secondary} strokeWidth="1" opacity="0.5"/>
                      {/* Animal icon */}
                      <foreignObject x="12" y="18" width="36" height="36">
                        <div
                          xmlns="http://www.w3.org/1999/xhtml"
                          style={{ color: house.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                        >
                          {house.svgAnimal}
                        </div>
                      </foreignObject>
                    </svg>
                    <span
                      className="font-cinzel text-xs font-bold tracking-wider"
                      style={{ color: house.secondary }}
                    >
                      {house.name}
                    </span>
                    {selectedHouse === house.id && (
                      <div
                        className="absolute top-2 right-2 w-3 h-3 rounded-full"
                        style={{ background: house.secondary, boxShadow: `0 0 6px ${house.secondary}` }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  onClick={handleJoin}
                  disabled={!selectedHouse}
                  className="wand-btn w-full h-12 font-cinzel font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-gold relative overflow-hidden"
                >
                  Enter Fireplace ✨
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep('identity')}
                  className="w-full h-10 font-cinzel text-muted-foreground hover:text-primary text-sm"
                >
                  ← Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/30 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-primary/30 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-primary/30 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/30 rounded-br" />
        {/* Crinkle pseudo shadows at corners */}
        <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none" style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)', borderRadius: '0 0 4px 0' }} />
        <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none" style={{ boxShadow: 'inset -2px 2px 4px rgba(0,0,0,0.3)', borderRadius: '0 0 0 4px' }} />
        <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none" style={{ boxShadow: 'inset 2px -2px 4px rgba(0,0,0,0.3)', borderRadius: '0 4px 0 0' }} />
        <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none" style={{ boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3)', borderRadius: '4px 0 0 0' }} />
      </motion.div>
    </div>
  );
}
