import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useGesture } from '@/hooks/useGesture';
import { useSpells } from '@/hooks/useSpells';
import { SPELLS } from '@/utils/spells';

import { VideoTile } from '@/components/VideoTile';
import { SpellOverlay } from '@/components/SpellOverlay';
import { DrawingBoard } from '@/components/DrawingBoard';
import { SpellPanel } from '@/components/SpellPanel';
import { SettingsPanel, loadSettings } from '@/components/SettingsPanel';
import type { Settings } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LuMic, LuMicOff, LuVideo, LuVideoOff, LuPenTool,
  LuDoorOpen, LuChevronLeft, LuChevronRight, LuCopy, LuSettings,
  LuMonitor, LuSmile, LuVolume2, LuVolumeX, LuWand2,
} from 'react-icons/lu';
import { useToast } from '@/hooks/use-toast';

const HOUSE_COLORS: Record<string, { primary: string; secondary: string }> = {
  gryffindor: { primary: '#C41E3A', secondary: '#D4AF37' },
  slytherin:  { primary: '#1A472A', secondary: '#AAAAAA' },
  ravenclaw:  { primary: '#0E1A40', secondary: '#946B2D' },
  hufflepuff: { primary: '#F0C75E', secondary: '#372E29' },
};

const REACTION_EMOJIS = ['🧙', '⚡', '🦉', '🏆', '👻', '🐍', '🦁', '✨'];

interface FloatingReaction { id: number; emoji: string; x: number; }
interface SpellHistoryEntry { name: string; color: string; icon: string; timestamp: number; }

function HogwartsCrest({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 46">
      <path d="M20 2 L38 9 L38 28 Q38 42 20 46 Q2 42 2 28 L2 9 Z" fill="#0a0a18" stroke="#D4AF37" strokeWidth="1.5"/>
      <line x1="2" y1="9" x2="38" y2="9" stroke="#D4AF37" strokeWidth="0.8" opacity="0.7"/>
      <line x1="20" y1="2" x2="20" y2="46" stroke="#D4AF37" strokeWidth="0.8" opacity="0.7"/>
      <text x="20" y="30" textAnchor="middle" fontFamily="'Cinzel Decorative', cursive" fontSize="13" fill="#D4AF37" opacity="0.9">H</text>
    </svg>
  );
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const socket = useSocket();
  const { toast } = useToast();

  // Parse query params
  const params = new URLSearchParams(search);
  const wizardName = params.get('name') || sessionStorage.getItem('wizardName') || 'Wizard';
  const house = (params.get('house') || sessionStorage.getItem('house') || '') as string;

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [drawingMode, setDrawingMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [reactionPopoverOpen, setReactionPopoverOpen] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [spellHistory, setSpellHistory] = useState<SpellHistoryEntry[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(settings.spellSoundsEnabled);
  const reactionIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { localStream, remoteStream, dataChannel, connectionStatus, setLocalStream, peerConnectionRef } = useWebRTC(socket, roomId!);
  const { landmarks, currentGesture } = useGesture(localStream);
  const { currentSpell, cooldowns } = useSpells(currentGesture);

  // Apply house class to body
  useEffect(() => {
    if (house) {
      document.body.classList.add(`house-${house}`);
    }
    return () => {
      document.body.classList.remove(`house-${house}`);
    };
  }, [house]);

  // Init media
  useEffect(() => {
    let mounted = true;
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        setLocalStream(stream);
        socket.emit('join-room', roomId);
      } catch (err) {
        console.error('Failed to get media devices', err);
        alert('Please allow camera and microphone access to use the Floo Network.');
      }
    };
    initMedia();
    return () => { mounted = false; };
  }, [roomId, socket, setLocalStream]);

  useEffect(() => {
    return () => { if (localStream) localStream.getTracks().forEach(t => t.stop()); };
  }, [localStream]);

  // Track spell history
  useEffect(() => {
    if (!currentSpell) return;
    const spell = SPELLS.find(s => s.name === currentSpell);
    if (!spell) return;
    setSpellHistory(prev => {
      const entry: SpellHistoryEntry = { name: spell.name, color: spell.color, icon: spell.icon, timestamp: Date.now() };
      return [entry, ...prev].slice(0, 5);
    });

    // Play Web Audio chime if sound enabled
    if (soundEnabled) {
      playMagicalChime(spell.color);
    }
  }, [currentSpell, soundEnabled]);

  // Prune spell history after 10s
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 10000;
      setSpellHistory(prev => prev.filter(e => e.timestamp > cutoff));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle incoming datachannel reactions
  useEffect(() => {
    if (!dataChannel) return;
    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'reaction') {
          spawnReaction(data.emoji);
        }
      } catch {}
    };
    dataChannel.addEventListener('message', handler);
    return () => dataChannel.removeEventListener('message', handler);
  }, [dataChannel]);

  const playMagicalChime = (color: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      void color;
    } catch {}
  };

  const spawnReaction = (emoji: string) => {
    const id = reactionIdRef.current++;
    const x = 20 + Math.random() * 60;
    setFloatingReactions(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2000);
  };

  const sendReaction = (emoji: string) => {
    spawnReaction(emoji);
    setReactionPopoverOpen(false);
    if (dataChannel?.readyState === 'open') {
      dataChannel.send(JSON.stringify({ type: 'reaction', emoji }));
    }
  };

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = !isAudioEnabled; });
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [localStream, isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = !isVideoEnabled; });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [localStream, isVideoEnabled]);

  const toggleScreenShare = useCallback(async () => {
    if (!peerConnectionRef?.current) return;
    if (isScreenSharing) {
      // Revert to camera
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) await sender.replaceTrack(videoTrack);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const displayTrack = displayStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(displayTrack);
        displayTrack.onended = () => setIsScreenSharing(false);
        setIsScreenSharing(true);
      } catch {
        // user cancelled
      }
    }
  }, [isScreenSharing, localStream, peerConnectionRef]);

  const leaveRoom = () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    document.body.classList.remove(`house-${house}`);
    setLocation('/');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || '').then(() => {
      toast({ title: 'Room ID copied!', description: roomId });
    });
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4ade80';
      case 'connecting': return '#facc15';
      default: return '#94a3b8';
    }
  };

  const houseColors = house ? HOUSE_COLORS[house] : null;

  const currentSpellData = currentSpell ? SPELLS.find(s => s.name === currentSpell) : null;

  if (!roomId) return null;

  return (
    <div className="w-full h-[100dvh] flex flex-col relative overflow-hidden bg-transparent">

      {/* Floating emoji reactions */}
      <AnimatePresence>
        {floatingReactions.map(r => (
          <motion.div
            key={r.id}
            className="fixed pointer-events-none z-50 text-4xl"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -160, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{ left: `${r.x}%`, bottom: '120px' }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ─── GREAT HALL HEADER ─────────────────────────────────── */}
      <header
        className="h-16 px-4 flex items-center justify-between z-20 relative"
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px,
              transparent 1px, transparent 40px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px,
              transparent 1px, transparent 40px
            ),
            linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.6))
          `,
          borderBottom: `1px solid ${houseColors?.primary || 'rgba(212,175,55,0.3)'}`,
        }}
      >
        {/* Left: Hogwarts crest */}
        <div className="flex items-center gap-3">
          <HogwartsCrest size={32} />
          <div className="flex items-center gap-2">
            {/* Connection status dot */}
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: getStatusColor(),
                boxShadow: connectionStatus === 'connected' ? `0 0 6px ${getStatusColor()}` : 'none',
                animation: connectionStatus === 'connected' ? 'connectedPulse 2s ease-in-out infinite' : undefined,
              }}
            />
            <span className="font-cinzel text-xs text-muted-foreground">
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting...'}
            </span>
          </div>
        </div>

        {/* Center: Room name with gold shimmer */}
        <h1 className="font-harry text-xl gold-shimmer-text tracking-wider hidden md:block">
          Room: {roomId}
        </h1>

        {/* Right: Settings + Leave */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="text-primary hover:text-primary hover:bg-primary/20"
          >
            <LuSettings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={leaveRoom}
            className="text-destructive hover:text-destructive hover:bg-destructive/20 font-cinzel text-sm"
          >
            <LuDoorOpen className="w-4 h-4 mr-1.5" />
            <span className="hidden md:inline">Leave</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* ─── LEFT SIDEBAR ──────────────────────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="w-72 flex-shrink-0 parchment border-r border-primary/20 flex flex-col gap-4 p-4 z-10 overflow-y-auto"
              style={{
                background: 'rgba(10,8,20,0.95)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Room info */}
              <div className="space-y-2">
                <h3 className="font-cinzel text-primary text-xs uppercase tracking-widest">Room Info</h3>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                  <span className="font-cinzel text-sm text-foreground flex-1">{roomId}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-primary/60 hover:text-primary" onClick={copyRoomId}>
                    <LuCopy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <h3 className="font-cinzel text-primary text-xs uppercase tracking-widest">Participants</h3>
                {[
                  { name: wizardName, house, isLocal: true, audioOn: isAudioEnabled, videoOn: isVideoEnabled },
                  ...(remoteStream ? [{ name: 'Remote Wizard', house: '', isLocal: false, audioOn: true, videoOn: true }] : []),
                ].map((p, i) => {
                  const pColors = p.house ? HOUSE_COLORS[p.house] : null;
                  return (
                    <div key={i} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                      {p.house && (
                        <svg viewBox="0 0 20 24" width="16" height="18">
                          <path d="M10 1 L19 4.5 L19 14 Q19 21 10 23 Q1 21 1 14 L1 4.5 Z"
                            fill={pColors?.primary || '#D4AF37'} stroke={pColors?.secondary || '#D4AF37'} strokeWidth="1"/>
                        </svg>
                      )}
                      <span className="font-cinzel text-xs flex-1" style={{ color: pColors?.secondary || '#D4AF37' }}>{p.name}</span>
                      <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full ${p.audioOn ? 'bg-green-400' : 'bg-red-500'}`} title={p.audioOn ? 'Mic on' : 'Mic off'} />
                        <div className={`w-2 h-2 rounded-full ${p.videoOn ? 'bg-green-400' : 'bg-red-500'}`} title={p.videoOn ? 'Cam on' : 'Cam off'} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Spell History */}
              <div className="space-y-2">
                <h3 className="font-cinzel text-primary text-xs uppercase tracking-widest">Recent Spells</h3>
                <AnimatePresence>
                  {spellHistory.length === 0 && (
                    <p className="text-xs text-muted-foreground font-cinzel italic">No spells cast yet...</p>
                  )}
                  {spellHistory.map((entry, i) => (
                    <motion.div
                      key={`${entry.name}-${entry.timestamp}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-cinzel"
                      style={{
                        background: `${entry.color}18`,
                        border: `1px solid ${entry.color}40`,
                        color: entry.color,
                        opacity: 1 - i * 0.15,
                      }}
                    >
                      <span>{entry.icon}</span>
                      <span>{entry.name}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 parchment rounded-r-lg p-1.5 border-r border-y border-primary/30 shadow-lg"
          style={{ left: sidebarOpen ? '288px' : '0px', transition: 'left 0.3s' }}
        >
          {sidebarOpen ? <LuChevronLeft className="w-4 h-4 text-primary" /> : <LuChevronRight className="w-4 h-4 text-primary" />}
        </button>

        {/* ─── MAIN VIDEO AREA ───────────────────────────────────── */}
        <main className="flex-1 p-3 md:p-4 flex flex-col md:flex-row gap-4 relative z-0 overflow-hidden">
          {/* Local video tile */}
          <div className="flex-1 relative h-full min-h-[200px] md:min-h-0">
            {!localStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <LuWand2 className="w-8 h-8 text-primary mb-2" style={{ animation: 'spin 2s linear infinite' }} />
                <p className="font-cinzel text-sm text-muted-foreground">Summoning your magical presence...</p>
              </div>
            )}
            <VideoTile
              stream={localStream}
              muted={true}
              label="You"
              wizardName={wizardName}
              house={house}
              className="w-full h-full"
              isSpellActive={!!currentSpell}
              spellColor={currentSpellData?.color}
              isAudioActive={isAudioEnabled && !!localStream}
            />
            {localStream && (
              <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <SpellOverlay landmarks={landmarks} currentSpell={currentSpell} />
              </div>
            )}
            {currentGesture && !currentSpell && (() => {
              const spell = SPELLS.find(s => s.gesture === currentGesture);
              return spell ? (
                <div
                  className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wide z-30 pointer-events-none"
                  style={{
                    color: spell.color,
                    background: `${spell.color}18`,
                    border: `1px solid ${spell.color}55`,
                    animation: 'gesturePulse 1s ease-in-out infinite',
                  }}
                >
                  <span>{spell.icon}</span>
                  <span>{spell.name}</span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Remote video tile */}
          <div className="flex-1 relative h-full min-h-[200px] md:min-h-0">
            <VideoTile
              stream={remoteStream}
              label="Remote Wizard"
              house=""
              className="w-full h-full"
              style={settings.videoBlur && remoteStream ? { filter: 'blur(4px)' } : undefined}
            />
          </div>
        </main>
      </div>

      {/* ─── FLOATING CONTROLS PILL ────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 parchment px-4 py-2.5 rounded-full magic-border shadow-2xl">
          {/* Audio */}
          <Button
            variant={isAudioEnabled ? 'ghost' : 'destructive'}
            size="icon"
            onClick={toggleAudio}
            className={`rounded-full h-10 w-10 ${isAudioEnabled ? 'text-primary hover:bg-primary/20' : ''}`}
          >
            {isAudioEnabled ? <LuMic className="w-4 h-4" /> : <LuMicOff className="w-4 h-4" />}
          </Button>

          {/* Video */}
          <Button
            variant={isVideoEnabled ? 'ghost' : 'destructive'}
            size="icon"
            onClick={toggleVideo}
            className={`rounded-full h-10 w-10 ${isVideoEnabled ? 'text-primary hover:bg-primary/20' : ''}`}
          >
            {isVideoEnabled ? <LuVideo className="w-4 h-4" /> : <LuVideoOff className="w-4 h-4" />}
          </Button>

          <div className="w-px h-6 bg-primary/20 mx-1" />

          {/* Screen share */}
          <Button
            variant={isScreenSharing ? 'default' : 'ghost'}
            size="icon"
            onClick={toggleScreenShare}
            disabled={connectionStatus !== 'connected'}
            className={`rounded-full h-10 w-10 ${isScreenSharing ? 'bg-primary text-black' : 'text-primary hover:bg-primary/20'}`}
            title="Share screen"
          >
            <LuMonitor className="w-4 h-4" />
          </Button>

          {/* Drawing board */}
          <Button
            variant={drawingMode ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setDrawingMode(!drawingMode)}
            disabled={connectionStatus !== 'connected'}
            className={`rounded-full h-10 w-10 ${drawingMode ? 'bg-primary text-black glow-gold' : 'text-primary hover:bg-primary/20'}`}
            title="Magical Drawing"
          >
            <LuPenTool className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-primary/20 mx-1" />

          {/* Emoji reactions */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReactionPopoverOpen(!reactionPopoverOpen)}
              className="rounded-full h-10 w-10 text-primary hover:bg-primary/20"
              title="Reactions"
            >
              <LuSmile className="w-4 h-4" />
            </Button>
            <AnimatePresence>
              {reactionPopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 parchment p-2 rounded-2xl magic-border shadow-2xl flex gap-1 flex-wrap justify-center"
                  style={{ width: '180px' }}
                >
                  {REACTION_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-2xl p-1 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sound effects */}
          <Button
            variant={soundEnabled ? 'ghost' : 'ghost'}
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`rounded-full h-10 w-10 ${soundEnabled ? 'text-primary hover:bg-primary/20' : 'text-muted-foreground hover:bg-primary/10'}`}
            title={soundEnabled ? 'Disable spell sounds' : 'Enable spell sounds'}
          >
            {soundEnabled ? <LuVolume2 className="w-4 h-4" /> : <LuVolumeX className="w-4 h-4" />}
          </Button>
        </div>

        {/* Spell panel */}
        {settings.spellPanelVisible && (
          <div className="overflow-x-auto max-w-[calc(100vw-2rem)]">
            <SpellPanel
              currentSpell={currentSpell}
              spells={SPELLS}
              cooldowns={cooldowns}
              onSpellCast={() => {}}
              visible={settings.spellPanelVisible}
            />
          </div>
        )}
      </div>

      {/* Drawing board overlay */}
      <DrawingBoard dataChannel={dataChannel} isVisible={drawingMode} onClose={() => setDrawingMode(false)} />

      {/* Settings modal */}
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSettingsChange={s => { setSettings(s); setSoundEnabled(s.spellSoundsEnabled); }}
      />
    </div>
  );
}
