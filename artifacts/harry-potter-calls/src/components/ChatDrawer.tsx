import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuSend } from 'react-icons/lu';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  house: string;
  isLocal: boolean;
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  wizardName: string;
}

const HOUSE_COLORS: Record<string, string> = {
  gryffindor: '#D4AF37',
  slytherin: '#AAAAAA',
  ravenclaw: '#946B2D',
  hufflepuff: '#372E29',
};

export function ChatDrawer({ open, onClose, messages, onSend, wizardName }: ChatDrawerProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-72 flex flex-col z-20 parchment border-l border-primary/20"
          style={{ background: 'rgba(10,8,20,0.97)', backdropFilter: 'blur(12px)' }}
        >
          {/* Header */}
          <div className="h-12 px-4 flex items-center justify-between border-b border-primary/20 flex-shrink-0">
            <span className="font-cinzel text-sm text-primary">📜 Owl Post</span>
            <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
              <LuX className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <p className="font-cinzel text-xs text-muted-foreground italic text-center mt-8">
                No messages yet... send an owl!
              </p>
            )}
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}
              >
                <span className="font-cinzel text-[9px] text-muted-foreground mb-1 px-1">
                  {msg.sender} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-2xl font-cinzel text-xs leading-relaxed"
                  style={{
                    background: msg.isLocal ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${msg.isLocal ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    color: msg.isLocal ? '#D4AF37' : '#e8d5b7',
                    borderRadius: msg.isLocal ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Parchment scroll input */}
          <div className="flex-shrink-0 p-3 border-t border-primary/20">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <div className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(90,60,20,0.3), rgba(40,25,5,0.4))', border: '1px solid rgba(212,175,55,0.25)' }} />
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Write your message..."
                  rows={2}
                  className="relative w-full bg-transparent px-3 py-2 font-cinzel text-xs text-foreground resize-none outline-none placeholder:text-muted-foreground/50"
                  style={{ lineHeight: '1.5' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: input.trim() ? 'rgba(212,175,55,0.25)' : 'rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                <LuSend className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
