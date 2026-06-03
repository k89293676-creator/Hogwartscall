import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const HOUSES = [
  { id: 'gryffindor', name: 'Gryffindor', animal: '🦁', colors: { primary: '#C41E3A', secondary: '#D4AF37' }, traits: 'Bravery & Courage' },
  { id: 'slytherin',  name: 'Slytherin',  animal: '🐍', colors: { primary: '#1A472A', secondary: '#AAAAAA' }, traits: 'Cunning & Ambition' },
  { id: 'ravenclaw',  name: 'Ravenclaw',  animal: '🦅', colors: { primary: '#0E1A40', secondary: '#946B2D' }, traits: 'Wisdom & Wit' },
  { id: 'hufflepuff', name: 'Hufflepuff', animal: '🦡', colors: { primary: '#F0C75E', secondary: '#372E29' }, traits: 'Loyalty & Patience' },
];

function FloatingParticle({ delay, duration, x }: { delay: number; duration: number; x: number }) {
  return (
    <motion.div
      className="absolute bottom-0 pointer-events-none"
      style={{ left: `${x}%`, width: 3, height: 3, borderRadius: '50%', background: 'rgba(212,175,55,0.6)', boxShadow: '0 0 6px rgba(212,175,55,0.4)' }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: '-100vh', opacity: [0, 0.8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

function HogwartsCrest({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 80 92" className="drop-shadow-lg">
      <path d="M40 4 L76 18 L76 56 Q76 84 40 92 Q4 84 4 56 L4 18 Z" fill="rgba(10,8,20,0.9)" stroke="#D4AF37" strokeWidth="2"/>
      <line x1="4" y1="18" x2="76" y2="18" stroke="#D4AF37" strokeWidth="1.2" opacity="0.7"/>
      <line x1="40" y1="4" x2="40" y2="92" stroke="#D4AF37" strokeWidth="1.2" opacity="0.7"/>
      <text x="20" y="52" textAnchor="middle" fontFamily="'Cinzel Decorative', cursive" fontSize="18" fill="#C41E3A" opacity="0.85">G</text>
      <text x="60" y="52" textAnchor="middle" fontFamily="'Cinzel Decorative', cursive" fontSize="18" fill="#1A472A" opacity="0.85">S</text>
      <text x="20" y="78" textAnchor="middle" fontFamily="'Cinzel Decorative', cursive" fontSize="18" fill="#0E1A40" opacity="0.85">R</text>
      <text x="60" y="78" textAnchor="middle" fontFamily="'Cinzel Decorative', cursive" fontSize="18" fill="#F0C75E" opacity="0.85">H</text>
      <circle cx="40" cy="50" r="8" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [wizardName, setWizardName] = useState(() => sessionStorage.getItem('wizardName') || '');
  const [selectedHouse, setSelectedHouse] = useState(() => sessionStorage.getItem('house') || '');
  const [roomInput, setRoomInput] = useState('');
  const [step, setStep] = useState<'identity' | 'house' | 'join'>(
    sessionStorage.getItem('wizardName') ? 'join' : 'identity'
  );
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (i * 37 + 13) % 100,
      delay: (i * 0.7) % 4,
      duration: 4 + (i % 3),
    }))
  );

  // BUG 2 FIX: persist wizardName/house to sessionStorage on change
  useEffect(() => {
    if (wizardName) sessionStorage.setItem('wizardName', wizardName);
  }, [wizardName]);
  useEffect(() => {
    if (selectedHouse) sessionStorage.setItem('house', selectedHouse);
  }, [selectedHouse]);

  const handleNameSubmit = () => {
    if (!wizardName.trim()) {
      toast({ title: 'Enter your wizard name', variant: 'destructive' });
      return;
    }
    sessionStorage.setItem('wizardName', wizardName.trim());
    setStep('house');
  };

  const handleHouseSelect = (houseId: string) => {
    setSelectedHouse(houseId);
    sessionStorage.setItem('house', houseId);
    setStep('join');
  };

  const generateRoomId = () => {
    const adj = ['Ancient', 'Mystic', 'Golden', 'Silver', 'Dark', 'Bright', 'Floo', 'Enchanted'];
    const noun = ['Phoenix', 'Gryphon', 'Serpent', 'Badger', 'Raven', 'Wand', 'Cauldron', 'Spell'];
    const num = Math.floor(Math.random() * 999) + 1;
    return `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${num}`;
  };

  const navigateToRoom = (roomId: string) => {
    // BUG 4 FIX: pass wizardName + house as URL params so Room.tsx can send them on join
    const params = new URLSearchParams({ name: wizardName.trim(), house: selectedHouse });
    setLocation(`/room/${encodeURIComponent(roomId)}?${params}`);
  };

  const createRoom = () => {
    const newRoom = generateRoomId();
    navigateToRoom(newRoom);
  };

  const joinRoom = () => {
    const id = roomInput.trim();
    if (!id) {
      toast({ title: 'Enter a room code', variant: 'destructive' });
      return;
    }
    navigateToRoom(id);
  };

  const selectedHouseData = HOUSES.find(h => h.id === selectedHouse);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#05040f]">
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => <FloatingParticle key={p.id} {...p} />)}
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle 1px at 20% 20%, rgba(255,255,255,0.6) 1px, transparent 0), radial-gradient(circle 1px at 80% 15%, rgba(255,255,255,0.5) 1px, transparent 0), radial-gradient(circle 1px at 50% 80%, rgba(255,255,255,0.4) 1px, transparent 0), radial-gradient(circle 1px at 30% 60%, rgba(255,255,255,0.3) 1px, transparent 0), radial-gradient(circle 1px at 70% 70%, rgba(255,255,255,0.5) 1px, transparent 0)' }} />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <HogwartsCrest size={72} />
          <div className="text-center">
            <h1 className="font-harry text-5xl md:text-6xl glow-gold-text tracking-wide leading-none">
              Floo Network
            </h1>
            <p className="font-cinzel text-xs text-primary/60 uppercase tracking-[0.3em] mt-2">
              Magical Video Calling
            </p>
          </div>
        </motion.div>

        {/* Step cards */}
        <AnimatePresence mode="wait">

          {/* Step 1: Identity */}
          {step === 'identity' && (
            <motion.div key="identity"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full parchment rounded-2xl p-6 magic-border space-y-5"
            >
              <div className="text-center space-y-1">
                <h2 className="font-cinzel text-primary text-lg">Enter the Registry</h2>
                <p className="font-fell italic text-muted-foreground text-sm">What shall we call you, young witch or wizard?</p>
              </div>
              <div className="space-y-3">
                <Input
                  value={wizardName}
                  onChange={e => setWizardName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                  placeholder="Your wizard name..."
                  className="font-cinzel bg-black/30 border-primary/30 focus:border-primary/60 placeholder:text-muted-foreground/40 text-foreground"
                  maxLength={30}
                  autoFocus
                />
                <Button
                  onClick={handleNameSubmit}
                  disabled={!wizardName.trim()}
                  className="w-full font-cinzel bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary hover:text-primary"
                  variant="ghost"
                >
                  ✨ Enter the Wizarding World
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: House selection */}
          {step === 'house' && (
            <motion.div key="house"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-4"
            >
              <div className="parchment rounded-2xl p-4 magic-border text-center space-y-1">
                <p className="font-cinzel text-primary text-sm">Welcome, <span className="glow-gold-text">{wizardName}</span></p>
                <p className="font-fell italic text-muted-foreground text-sm">Choose your house to continue</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {HOUSES.map(house => (
                  <motion.button
                    key={house.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleHouseSelect(house.id)}
                    className="parchment rounded-xl p-4 text-left transition-all magic-border relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${house.colors.primary}22, rgba(10,8,20,0.95))`,
                      borderColor: house.colors.secondary + '60',
                      boxShadow: `0 0 20px ${house.colors.primary}18`,
                    }}
                  >
                    <div className="text-2xl mb-1">{house.animal}</div>
                    <div className="font-cinzel text-sm font-semibold" style={{ color: house.colors.secondary }}>{house.name}</div>
                    <div className="font-fell italic text-xs mt-0.5" style={{ color: house.colors.secondary + 'aa' }}>{house.traits}</div>
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setStep('identity')} className="w-full text-center font-cinzel text-xs text-muted-foreground hover:text-primary transition-colors py-2">
                ← Back
              </button>
            </motion.div>
          )}

          {/* Step 3: Join or Create */}
          {step === 'join' && (
            <motion.div key="join"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-4"
            >
              {/* Identity badge */}
              <div className="parchment rounded-xl p-3 magic-border flex items-center gap-3"
                style={{ background: selectedHouseData ? `linear-gradient(135deg, ${selectedHouseData.colors.primary}22, rgba(10,8,20,0.95))` : undefined }}>
                <div className="text-2xl">{selectedHouseData?.animal ?? '🧙'}</div>
                <div>
                  <div className="font-cinzel text-sm" style={{ color: selectedHouseData?.colors.secondary ?? '#D4AF37' }}>{wizardName}</div>
                  <div className="font-fell italic text-xs text-muted-foreground">{selectedHouseData?.name ?? ''}</div>
                </div>
                <button className="ml-auto font-cinzel text-xs text-muted-foreground hover:text-primary transition-colors" onClick={() => setStep('identity')}>✎ Edit</button>
              </div>

              {/* Create room */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createRoom}
                className="w-full parchment rounded-xl p-5 magic-border text-center group relative overflow-hidden transition-all"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(10,8,20,0.95))' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
                <div className="relative z-10 space-y-1">
                  <div className="text-3xl">🔥</div>
                  <div className="font-cinzel text-primary text-base font-semibold">Open the Floo</div>
                  <div className="font-fell italic text-muted-foreground text-sm">Create a new private room</div>
                </div>
              </motion.button>

              {/* Join existing */}
              <div className="parchment rounded-xl p-4 magic-border space-y-3" style={{ background: 'rgba(10,8,20,0.85)' }}>
                <div className="text-center space-y-0.5">
                  <div className="font-cinzel text-primary text-sm">Join a Chamber</div>
                  <div className="font-fell italic text-muted-foreground text-xs">Enter a room code to join</div>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={roomInput}
                    onChange={e => setRoomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && joinRoom()}
                    placeholder="Room code..."
                    className="font-cinzel bg-black/30 border-primary/30 focus:border-primary/60 placeholder:text-muted-foreground/40 text-foreground text-sm"
                  />
                  <Button
                    onClick={joinRoom}
                    disabled={!roomInput.trim()}
                    variant="ghost"
                    className="font-cinzel border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 flex-shrink-0"
                  >
                    ✨ Join
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="font-fell italic text-muted-foreground/40 text-xs text-center"
        >
          "Words are, in my not-so-humble opinion, our most inexhaustible source of magic." — A. Dumbledore
        </motion.p>
      </div>
    </div>
  );
}
