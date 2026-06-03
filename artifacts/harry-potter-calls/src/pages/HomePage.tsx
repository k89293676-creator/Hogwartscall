import React, { useState, useRef, useCallback } from 'react';
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
      <circle cx="17" cy="15" r="1.5" fill="#0a0a14"/><circle cx="23" cy="15" r="1.5" fill="#0a0a14"/>
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
      <circle cx="18.5" cy="12" r="1.2" fill="#0a0a14"/><circle cx="21.5" cy="12" r="1.2" fill="#0a0a14"/>
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
      <circle cx="17.5" cy="14" r="1.2" fill="#0a0a14"/><circle cx="22.5" cy="14" r="1.2" fill="#0a0a14"/>
      <path d="M18 17.5 Q20 19 22 17.5" stroke="#0a0a14" strokeWidth="1" fill="none"/>
      <rect x="14" y="32" width="4" height="5" rx="2" fill="currentColor"/>
      <rect x="22" y="32" width="4" height="5" rx="2" fill="currentColor"/>
    </svg>
  );
}

const HOUSES: HouseConfig[] = [
  { id: 'gryffindor', name: 'Gryffindor', primary: '#C41E3A', secondary: '#D4AF37', animal: 'Lion', svgAnimal: <LionSVG /> },
  { id: 'slytherin',  name: 'Slytherin',  primary: '#1A472A', secondary: '#AAAAAA', animal: 'Serpent', svgAnimal: <SerpentSVG /> },
  { id: 'ravenclaw',  name: 'Ravenclaw',  primary: '#0E1A40', secondary: '#946B2D', animal: 'Eagle', svgAnimal: <EagleSVG /> },
  { id: 'hufflepuff', name: 'Hufflepuff', primary: '#F0C75E', secondary: '#372E29', animal: 'Badger', svgAnimal: <BadgerSVG /> },
];

function WaxSeal({ onClick, cracking }: { onClick: () => void; cracking: boolean }) {
  return (
    <motion.div className="relative cursor-pointer select-none" onClick={onClick}
      whileHover={{ scale: cracking ? 1 : 1.05 }} whileTap={{ scale: 0.97 }}
      style={{ width: 80, height: 80 }}>
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r="36" fill="#8B0000" stroke="#5a0000" strokeWidth="2"/>
        <circle cx="40" cy="40" r="32" fill="#A00000" opacity="0.7"/>
        <text x="40" y="50" textAnchor="middle" fontFamily="'Cinzel Decorative', cursive" fontSize="28" fill="#D4AF37" opacity="0.95">H</text>
        {cracking && (<>
          <motion.path d="M40 10 L44 28 L50 20 L46 38 L55 30" stroke="#D4AF37" strokeWidth="1.5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4 }}/>
          <motion.path d="M40 10 L35 30 L28 22 L32 42 L22 35" stroke="#D4AF37" strokeWidth="1.5" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}/>
          <motion.path d="M40 70 L43 52 L50 60 L46 42" stroke="#D4AF37" strokeWidth="1" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }}/>
          <motion.ellipse cx="40" cy="40" rx="36" ry="36" fill="none" stroke="#00FF88" strokeWidth="2" opacity="0.6"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.6, delay: 0.3 }}/>
        </>)}
      </svg>
    </motion.div>
  );
}

interface Particle { id: number; x: number; y: number; color: string; }

function HouseTextureOverlay({ house }: { house: House }) {
  if (house === 'gryffindor') return (
    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-[0.06]" style={{
      background: `repeating-linear-gradient(-45deg, #C41E3A 0px, #C41E3A 2px, transparent 2px, transparent 8px)`,
    }} />
  );
  if (house === 'slytherin') return (
    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 60 60">
        {[0,1,2,3,4].map(row => [0,1,2,3,4,5].map(col => (
          <path key={`${row}-${col}`}
            d={`M${col*12 + (row%2)*6},${row*10} L${col*12 + (row%2)*6 + 6},${row*10} L${col*12 + (row%2)*6 + 9},${row*10+5} L${col*12 + (row%2)*6 + 6},${row*10+10} L${col*12 + (row%2)*6},${row*10+10} L${col*12 + (row%2)*6 - 3},${row*10+5} Z`}
            fill="none" stroke="#1A472A" strokeWidth="0.6"/>
        )))}
      </svg>
    </div>
  );
  if (house === 'ravenclaw') return (
    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-[0.06]" style={{
      backgroundImage: `
        repeating-linear-gradient(0deg, #0E1A40 0px, #0E1A40 1px, transparent 1px, transparent 10px),
        repeating-linear-gradient(90deg, #0E1A40 0px, #0E1A40 1px, transparent 1px, transparent 10px)
      `,
    }} />
  );
  if (house === 'hufflepuff') return (
    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 60 60">
        {[0,1,2,3,4].map(row => [0,1,2,3,4,5].map(col => (
          <path key={`${row}-${col}`}
            d={`M${col*10 + (row%2)*5 + 5},${row*8.7} L${col*10 + (row%2)*5 + 10},${row*8.7+4.35} L${col*10 + (row%2)*5 + 5},${row*8.7+8.7} L${col*10 + (row%2)*5},${row*8.7+4.35} Z`}
            fill="none" stroke="#F0C75E" strokeWidth="0.6"/>
        )))}
      </svg>
    </div>
  );
  return null;
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [wizardName, setWizardName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [sealCracking, setSealCracking] = useState(false);
  const [nameError, setNameError] = useState('');
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  const generateRoomId = () => {
    const adjectives = ['Ancient', 'Mystic', 'Golden', 'Silver', 'Shadow', 'Ember', 'Frost', 'Storm'];
    const nouns = ['Cauldron', 'Wand', 'Snitch', 'Broom', 'Owl', 'Phoenix', 'Basilisk', 'Thestral'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`;
  };

  const spawnParticles = useCallback((houseConfig: HouseConfig) => {
    const burst: Particle[] = Array.from({ length: 5 }, () => ({
      id: particleIdRef.current++,
      x: 40 + (Math.random() - 0.5) * 60,
      y: 40 + (Math.random() - 0.5) * 40,
      color: houseConfig.primary,
    }));
    setParticles(prev => [...prev, ...burst]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !burst.find(b => b.id === p.id)));
    }, 700);
  }, []);

  const handleEnter = () => {
    if (!wizardName.trim()) { setNameError('Please enter your wizard name!'); return; }
    if (!selectedHouse) { setNameError('Please choose your house!'); return; }
    setNameError('');
    sessionStorage.setItem('wizardName', wizardName.trim());
    sessionStorage.setItem('house', selectedHouse);
    const targetRoom = roomId.trim() || generateRoomId();
    setSealCracking(true);
    setTimeout(() => {
      setIsEntering(true);
      setTimeout(() => {
        setLocation(`/room/${targetRoom}?name=${encodeURIComponent(wizardName.trim())}&house=${selectedHouse}`);
      }, 600);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FlooFireplace />

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.h1 className="font-harry text-5xl gold-shimmer-text"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}>
            Floo Network
          </motion.h1>
          <p className="font-cinzel text-primary/70 text-sm tracking-widest uppercase">Magical Video Calls</p>
        </div>

        {/* Form card */}
        <motion.div className="parchment rounded-2xl magic-border p-6 space-y-5 shadow-2xl parchment-texture"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>

          {/* Wax seal */}
          <div className="flex justify-center -mt-2 mb-2">
            <WaxSeal onClick={() => {}} cracking={sealCracking} />
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="font-cinzel text-primary text-xs uppercase tracking-widest">Your Wizard Name</label>
            <Input value={wizardName} onChange={e => { setWizardName(e.target.value); setNameError(''); }}
              placeholder="Enter your name..." onKeyDown={e => e.key === 'Enter' && handleEnter()}
              className="bg-black/30 border-primary/30 font-cinzel text-sm focus:border-primary/70 placeholder:text-muted-foreground/50"/>
          </div>

          {/* House selection */}
          <div className="space-y-2">
            <label className="font-cinzel text-primary text-xs uppercase tracking-widest">Choose Your House</label>
            <div className="grid grid-cols-2 gap-2">
              {HOUSES.map(h => {
                const isSelected = selectedHouse === h.id;
                return (
                  <motion.button
                    key={h.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedHouse(h.id);
                      spawnParticles(h);
                    }}
                    className={`relative p-3 rounded-xl border transition-all flex items-center gap-2 overflow-hidden ${isSelected ? 'house-selected' : ''}`}
                    style={{
                      background: isSelected ? `${h.primary}30` : 'rgba(0,0,0,0.3)',
                      borderColor: isSelected ? h.primary : 'rgba(212,175,55,0.2)',
                      boxShadow: isSelected ? `0 0 12px ${h.primary}40` : 'none',
                      backgroundImage: isSelected ? `linear-gradient(90deg, ${h.primary}22, ${h.secondary}44, ${h.primary}22)` : undefined,
                      backgroundSize: isSelected ? '200% auto' : undefined,
                      animation: isSelected ? 'houseShimmer 2s linear infinite' : undefined,
                    }}
                  >
                    {/* House texture overlay */}
                    <HouseTextureOverlay house={h.id} />

                    <motion.div
                      style={{ color: h.secondary }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                      className="relative z-10"
                    >
                      {/* Glow ring on hover when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-full pointer-events-none"
                          style={{ boxShadow: `0 0 12px 4px ${h.primary}60`, borderRadius: '50%', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px' }} />
                      )}
                      {h.svgAnimal}
                    </motion.div>

                    <div className="text-left relative z-10">
                      <div className="font-cinzel text-xs font-bold" style={{ color: isSelected ? h.secondary : '#D4AF37' }}>{h.name}</div>
                      <div className="font-cinzel text-[9px] text-muted-foreground">{h.animal}</div>
                    </div>

                    {/* Particle burst overlay */}
                    <AnimatePresence>
                      {particles.filter(p => p.color === h.primary).map(p => (
                        <motion.div key={p.id}
                          className="absolute pointer-events-none rounded-full"
                          style={{
                            left: `${p.x}%`, top: `${p.y}%`,
                            width: 6, height: 6,
                            background: p.color,
                            boxShadow: `0 0 8px ${p.color}`,
                          }}
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{
                            scale: [0, 1.5, 0],
                            opacity: [1, 1, 0],
                            x: (Math.random() - 0.5) * 40,
                            y: (Math.random() - 0.5) * 30,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Room ID */}
          <div className="space-y-2">
            <label className="font-cinzel text-primary text-xs uppercase tracking-widest">Join a Room</label>
            <p className="font-cinzel text-[10px] text-muted-foreground/70 -mt-1">Paste a room code or invite link — or leave blank to start a new room</p>
            <Input value={roomId} onChange={e => {
              const val = e.target.value.trim();
              try {
                const url = new URL(val);
                const match = url.pathname.match(/\/room\/([^/?#]+)/);
                if (match) { setRoomId(match[1]); return; }
              } catch { /* not a URL */ }
              setRoomId(val);
            }} placeholder="Room code or invite link..."
              className="bg-black/30 border-primary/30 font-cinzel text-sm focus:border-primary/70 placeholder:text-muted-foreground/50"/>
          </div>

          {nameError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-cinzel text-xs text-destructive text-center">✦ {nameError}</motion.p>
          )}

          {/* Enter button */}
          <Button onClick={handleEnter} disabled={isEntering}
            className="w-full font-cinzel tracking-widest py-5 text-sm transition-all relative overflow-hidden"
            style={{
              background: isEntering ? 'rgba(0,255,136,0.3)' : selectedHouse
                ? `linear-gradient(135deg, ${HOUSES.find(h => h.id === selectedHouse)?.primary}80, rgba(212,175,55,0.3))`
                : 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(120,80,20,0.3))',
              border: `1px solid ${selectedHouse ? HOUSES.find(h => h.id === selectedHouse)?.primary + '80' : 'rgba(212,175,55,0.4)'}`,
              boxShadow: selectedHouse ? `0 0 20px ${HOUSES.find(h => h.id === selectedHouse)?.primary}30` : 'none',
            }}>
            {isEntering ? (
              <span className="flex items-center justify-center gap-2">
                <span style={{ animation: 'spin 0.5s linear infinite' }}>🔥</span>Entering the Floo...
              </span>
            ) : '🔥 Enter Fireplace'}
          </Button>
        </motion.div>

        <motion.p className="text-center font-cinzel text-[10px] text-muted-foreground/50 tracking-widest"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          Use hand gestures to cast spells during your call
        </motion.p>
      </motion.div>

      {/* Floo transition overlay */}
      <AnimatePresence>
        {isEntering && (
          <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'radial-gradient(ellipse, #00FF88 0%, #003322 50%, #001a0d 100%)', transformOrigin: 'bottom' }}>
            <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.5 }} className="text-7xl">🔥</motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
