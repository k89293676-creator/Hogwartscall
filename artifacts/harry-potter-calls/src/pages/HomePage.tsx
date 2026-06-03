import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      setLocation(`/room/${roomId.trim()}`);
    }
  };

  const generateRoom = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLocation(`/room/${id}`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background z-0" />
        {/* Simple decorative sparkles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${1 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md parchment rounded-3xl p-8 shadow-2xl relative z-10 magic-border"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-harry text-primary mb-2 glow-gold-text tracking-wider">
            The Floo Network
          </h1>
          <p className="font-cinzel text-muted-foreground text-sm tracking-widest">
            Step through the fireplace to cast magical video calls
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <label className="font-cinzel text-primary/80 text-sm pl-2 block">Floo Destination (Room ID)</label>
            <Input 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="e.g. HOGWARTS77"
              className="bg-input/50 border-primary/30 text-center font-cinzel text-lg h-14 rounded-xl focus:ring-primary focus:border-primary placeholder:text-muted-foreground/30 uppercase"
            />
          </div>

          <div className="pt-4 space-y-4">
            <Button 
              type="submit" 
              disabled={!roomId.trim()}
              className="w-full h-14 font-cinzel font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-gold transition-all"
            >
              Enter Fireplace
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-primary/20"></div>
              <span className="flex-shrink-0 mx-4 font-cinzel text-muted-foreground text-xs">OR</span>
              <div className="flex-grow border-t border-primary/20"></div>
            </div>

            <Button 
              type="button" 
              variant="outline"
              onClick={generateRoom}
              className="w-full h-14 font-cinzel text-primary border-primary/50 hover:bg-primary/10 rounded-xl"
            >
              Conjure New Room
            </Button>
          </div>
        </form>
        
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/30 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-primary/30 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-primary/30 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/30 rounded-br" />
      </motion.div>
    </div>
  );
}
