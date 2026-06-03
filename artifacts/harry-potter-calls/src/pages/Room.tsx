import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useGesture } from '@/hooks/useGesture';
import { useSpells } from '@/hooks/useSpells';
import { SPELLS } from '@/utils/spells';
import { QRCodeSVG } from 'qrcode.react';

import { VideoTile } from '@/components/VideoTile';
import { SpellOverlay } from '@/components/SpellOverlay';
import { DrawingBoard } from '@/components/DrawingBoard';
import { SpellPanel } from '@/components/SpellPanel';
import { SettingsPanel, loadSettings } from '@/components/SettingsPanel';
import { ChatDrawer, ChatMessage } from '@/components/ChatDrawer';
import { GestureTutorial } from '@/components/GestureTutorial';
import type { Settings } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import {
  LuMic, LuMicOff, LuVideo, LuVideoOff, LuPenTool,
  LuDoorOpen, LuChevronLeft, LuChevronRight, LuCopy, LuSettings,
  LuMonitor, LuSmile, LuVolume2, LuVolumeX, LuWand, LuMessageSquare,
  LuShare2, LuLink, LuX,
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

type ConnectionQuality = 'good' | 'fair' | 'poor' | null;

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

function ConnectionRune({ quality, rtt }: { quality: ConnectionQuality; rtt: number | null }) {
  if (!quality) return null;
  const rune = quality === 'good' ? 'ᛟ' : quality === 'fair' ? 'ᚷ' : 'ᚱ';
  const color = quality === 'good' ? '#4ade80' : quality === 'fair' ? '#facc15' : '#f87171';
  return (
    <span
      title={rtt ? `RTT: ${Math.round(rtt * 1000)}ms` : 'Connection quality'}
      className="font-cinzel text-sm cursor-help ml-1"
      style={{ color, textShadow: `0 0 8px ${color}`, transition: 'color 0.5s' }}
    >
      {rune}
    </span>
  );
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const socket = useSocket();
  const { toast } = useToast();

  const params = new URLSearchParams(search);
  const wizardName = params.get('name') || sessionStorage.getItem('wizardName') || 'Wizard';
  const house = (params.get('house') || sessionStorage.getItem('house') || '') as string;

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [drawingMode, setDrawingMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [reactionPopoverOpen, setReactionPopoverOpen] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [spellHistory, setSpellHistory] = useState<SpellHistoryEntry[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(settings.spellSoundsEnabled);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(null);
  const [connectionRtt, setConnectionRtt] = useState<number | null>(null);
  const [showGestureTutorial, setShowGestureTutorial] = useState(false);
  const [mobileSpellOpen, setMobileSpellOpen] = useState(false);
  const [mediaError, setMediaError] = useState<{ message: string; canRetry: boolean } | null>(null);
  const [mediaRetryKey, setMediaRetryKey] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const reactionIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chatIdRef = useRef(0);

  const { localStream, remoteStream, dataChannel, connectionStatus, setLocalStream, peerConnectionRef } = useWebRTC(socket, roomId!);
  const { landmarks, currentGesture } = useGesture(localStream);
  const { currentSpell, cooldowns, castSpell } = useSpells(currentGesture);

  // Reactive isMobile — updates on resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Show gesture tutorial on first visit
  useEffect(() => {
    if (!localStorage.getItem('gesture-tutorial-seen')) {
      const t = setTimeout(() => setShowGestureTutorial(true), 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  // Apply house class
  useEffect(() => {
    if (house) document.body.classList.add(`house-${house}`);
    return () => { if (house) document.body.classList.remove(`house-${house}`); };
  }, [house]);

  // Init media — robust cross-browser/device version with progressive fallbacks
  useEffect(() => {
    let mounted = true;

    // Resolve getUserMedia across modern and legacy browsers
    const tryGetUserMedia = (constraints: MediaStreamConstraints): Promise<MediaStream> => {
      // Standard modern API
      if (navigator.mediaDevices?.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
      }
      // Legacy prefixed API (old Safari / Firefox / Chrome)
      const legacyGUM =
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia;
      if (legacyGUM) {
        return new Promise<MediaStream>((resolve, reject) =>
          legacyGUM.call(navigator, constraints, resolve, reject)
        );
      }
      return Promise.reject(new TypeError('getUserMedia_unsupported'));
    };

    const initMedia = async () => {
      // Guard: API completely absent (plain HTTP on non-localhost, very old browser)
      const hasGUM =
        navigator.mediaDevices?.getUserMedia ||
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia;
      if (!hasGUM) {
        setMediaError({
          message:
            'Camera access is not available. This page must be opened over HTTPS, or your browser is too old. Please try Chrome or Firefox.',
          canRetry: false,
        });
        return;
      }

      setMediaError(null);

      // Progressive constraint ladder — stop at first success
      const constraintLadder: MediaStreamConstraints[] = [
        // 1. Ideal HD, front-facing on mobile
        { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true },
        // 2. Front-facing, no size preference
        { video: { facingMode: 'user' }, audio: true },
        // 3. Any video + audio
        { video: true, audio: true },
        // 4. Audio-only (camera unavailable / denied)
        { video: false, audio: true },
      ];

      let stream: MediaStream | null = null;
      let lastErr: unknown;

      for (const constraints of constraintLadder) {
        try {
          stream = await tryGetUserMedia(constraints);
          break;
        } catch (err) {
          lastErr = err;
          const name = (err as DOMException)?.name;
          // Permission denied — no point trying softer constraints
          if (name === 'NotAllowedError' || name === 'PermissionDeniedError') break;
          // API unsupported — bail immediately
          if (err instanceof TypeError) break;
          // Device busy — softer constraints won't help
          if (name === 'NotReadableError' || name === 'TrackStartError') break;
          // NotFoundError / OverconstrainedError — try next (simpler) constraints
        }
      }

      if (!mounted) { stream?.getTracks().forEach(t => t.stop()); return; }

      if (!stream) {
        const err = lastErr as DOMException | TypeError | undefined;
        const name = (err as DOMException)?.name ?? '';
        let message: string;
        let canRetry = true;

        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          message =
            'Camera or microphone access was denied. Click the 🔒 lock icon in your browser\'s address bar, allow camera & microphone, then tap "Try Again".';
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          message =
            'No camera or microphone was found. Please connect a device and tap "Try Again".';
        } else if (name === 'NotReadableError' || name === 'TrackStartError') {
          message =
            'Your camera or microphone is already in use by another app. Close that app and tap "Try Again".';
        } else if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
          message =
            'Your camera does not support the required settings. Please try a different browser or device.';
          canRetry = false;
        } else if (err instanceof TypeError || (err as DOMException)?.message === 'getUserMedia_unsupported') {
          message =
            'Your browser does not support camera access. Please use an up-to-date version of Chrome, Firefox, or Safari over HTTPS.';
          canRetry = false;
        } else {
          message = `Could not access camera or microphone: ${(err as DOMException)?.message || 'Unknown error'}. Please check your browser permissions and tap "Try Again".`;
        }

        console.error('[media]', name, err);
        setMediaError({ message, canRetry });
        return;
      }

      setLocalStream(stream);
      socket.emit('join-room', roomId);
    };

    initMedia();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, socket, setLocalStream, mediaRetryKey]);

  useEffect(() => {
    return () => { if (localStream) localStream.getTracks().forEach(t => t.stop()); };
  }, [localStream]);

  // Connection quality polling every 5s
  useEffect(() => {
    if (connectionStatus !== 'connected') return;
    const interval = setInterval(async () => {
      if (!peerConnectionRef.current) return;
      try {
        const stats = await peerConnectionRef.current.getStats();
        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.currentRoundTripTime !== undefined) {
            const rtt: number = report.currentRoundTripTime;
            setConnectionRtt(rtt);
            if (rtt < 0.08) setConnectionQuality('good');
            else if (rtt < 0.2) setConnectionQuality('fair');
            else setConnectionQuality('poor');
          }
        });
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [connectionStatus, peerConnectionRef]);

  // Track spell history
  useEffect(() => {
    if (!currentSpell) return;
    const spell = SPELLS.find(s => s.name === currentSpell);
    if (!spell) return;
    setSpellHistory(prev => {
      const entry: SpellHistoryEntry = { name: spell.name, color: spell.color, icon: spell.icon, timestamp: Date.now() };
      return [entry, ...prev].slice(0, 5);
    });
    if (soundEnabled) playMagicalChime(spell.color);
  }, [currentSpell, soundEnabled]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 10000;
      setSpellHistory(prev => prev.filter(e => e.timestamp > cutoff));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // DataChannel messages (reactions + chat)
  useEffect(() => {
    if (!dataChannel) return;
    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'reaction') spawnReaction(data.emoji);
        if (data.type === 'chat') {
          setChatMessages(prev => [...prev, {
            id: String(chatIdRef.current++),
            sender: data.sender || 'Remote Wizard',
            text: data.text,
            timestamp: data.timestamp || Date.now(),
            house: data.house || '',
            isLocal: false,
          }]);
          if (!chatOpen) setUnreadCount(c => c + 1);
        }
      } catch {}
    };
    dataChannel.addEventListener('message', handler);
    return () => dataChannel.removeEventListener('message', handler);
  }, [dataChannel, chatOpen]);

  const castSpellManually = useCallback((spellName: string) => {
    castSpell(spellName);
    setMobileSpellOpen(false);
  }, [castSpell]);

  const sendChatMessage = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: String(chatIdRef.current++),
      sender: wizardName,
      text,
      timestamp: Date.now(),
      house,
      isLocal: true,
    };
    setChatMessages(prev => [...prev, msg]);
    if (dataChannel?.readyState === 'open') {
      dataChannel.send(JSON.stringify({ type: 'chat', sender: wizardName, text, house, timestamp: msg.timestamp }));
    }
  }, [wizardName, house, dataChannel]);

  const playMagicalChime = (color: string) => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
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
      } catch {}
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

  // Build a clean shareable join link (no personal name/house params)
  const shareUrl = `${window.location.origin}/room/${roomId}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({ title: '✨ Link copied!', description: 'Share it with any wizard to join.' });
    });
  };

  const shareRoom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my Floo Network room: ${roomId}`,
          text: `Join me in the Floo Network! Room: ${roomId}`,
          url: shareUrl,
        });
        return;
      } catch { /* user cancelled */ }
    }
    // Fallback: open sheet
    setShareOpen(true);
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
          <motion.div key={r.id} className="fixed pointer-events-none z-50 text-4xl"
            initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -160, scale: 1.5 }}
            exit={{ opacity: 0 }} transition={{ duration: 2, ease: 'easeOut' }}
            style={{ left: `${r.x}%`, bottom: '120px' }}>
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Gesture Tutorial */}
      <GestureTutorial open={showGestureTutorial} onClose={() => setShowGestureTutorial(false)} />

      {/* ─── HEADER ──────────────────────────────────────────── */}
      <header className="h-16 px-4 flex items-center justify-between z-20 relative"
        style={{
          background: `repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px),
            linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.6))`,
          borderBottom: `1px solid ${houseColors?.primary || 'rgba(212,175,55,0.3)'}`,
        }}>
        <div className="flex items-center gap-3">
          <HogwartsCrest size={32} />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{
              background: getStatusColor(),
              boxShadow: connectionStatus === 'connected' ? `0 0 6px ${getStatusColor()}` : 'none',
              animation: connectionStatus === 'connected' ? 'connectedPulse 2s ease-in-out infinite' : undefined,
            }} />
            <span className="font-cinzel text-xs text-muted-foreground">
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Waiting...'}
            </span>
            <ConnectionRune quality={connectionQuality} rtt={connectionRtt} />
          </div>
        </div>

        {/* Room ID — always visible, truncated on mobile */}
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all group"
          title="Share room"
        >
          <span className="font-cinzel text-xs gold-shimmer-text tracking-wide max-w-[90px] md:max-w-[200px] truncate">
            {roomId}
          </span>
          <LuShare2 className="w-3 h-3 text-primary/60 group-hover:text-primary flex-shrink-0 transition-colors" />
        </button>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={shareRoom}
            className="text-primary hover:text-primary hover:bg-primary/20" title="Share room link">
            <LuShare2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}
            className="text-primary hover:text-primary hover:bg-primary/20 hidden md:flex">
            <LuSettings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={leaveRoom}
            className="text-destructive hover:text-destructive hover:bg-destructive/20 font-cinzel text-sm">
            <LuDoorOpen className="w-4 h-4 mr-1.5" />
            <span className="hidden md:inline">Leave</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* ─── LEFT SIDEBAR ──────────────────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="w-72 flex-shrink-0 parchment border-r border-primary/20 flex flex-col gap-4 p-4 z-10 overflow-y-auto"
              style={{ background: 'rgba(10,8,20,0.95)', backdropFilter: 'blur(12px)' }}>
              <div className="space-y-2">
                <h3 className="font-cinzel text-primary text-xs uppercase tracking-widest">Room Info</h3>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                  <span className="font-cinzel text-sm text-foreground flex-1">{roomId}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-primary/60 hover:text-primary" onClick={copyRoomId}>
                    <LuCopy className="w-3 h-3" />
                  </Button>
                </div>
                {/* QR Code */}
                <div className="flex flex-col items-center gap-1 bg-black/20 rounded-xl p-3 mt-2">
                  <QRCodeSVG value={shareUrl} size={120} bgColor="transparent" fgColor="#D4AF37" />
                  <span className="font-cinzel text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Scan to join</span>
                </div>
              </div>

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
                        <div className={`w-2 h-2 rounded-full ${p.audioOn ? 'bg-green-400' : 'bg-red-500'}`} />
                        <div className={`w-2 h-2 rounded-full ${p.videoOn ? 'bg-green-400' : 'bg-red-500'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <h3 className="font-cinzel text-primary text-xs uppercase tracking-widest">Recent Spells</h3>
                <AnimatePresence>
                  {spellHistory.length === 0 && (
                    <p className="text-xs text-muted-foreground font-cinzel italic">No spells cast yet...</p>
                  )}
                  {spellHistory.map((entry, i) => (
                    <motion.div key={`${entry.name}-${entry.timestamp}`}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-cinzel"
                      style={{ background: `${entry.color}18`, border: `1px solid ${entry.color}40`, color: entry.color, opacity: 1 - i * 0.15 }}>
                      <span>{entry.icon}</span><span>{entry.name}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar toggle — visible on all screen sizes */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 parchment rounded-r-lg p-1.5 border-r border-y border-primary/30 shadow-lg"
          style={{ left: sidebarOpen ? '288px' : '0px', transition: 'left 0.3s' }}>
          {sidebarOpen ? <LuChevronLeft className="w-4 h-4 text-primary" /> : <LuChevronRight className="w-4 h-4 text-primary" />}
        </button>

        {/* ─── MAIN VIDEO AREA ───────────────────────────────── */}
        {/* On mobile the bottom bar is ~68px; we give each video flex-1 so they share the remaining height equally */}
        <main className={`flex-1 p-2 md:p-4 flex flex-col md:flex-row gap-2 md:gap-4 relative z-0 overflow-hidden ${isMobile ? 'pb-[68px]' : ''}`}>
          {/* Local video */}
          <div className="relative flex-1 min-h-0">
            {!localStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
                {mediaError ? (
                  <div className="space-y-3 max-w-xs">
                    <div className="text-4xl">🔒</div>
                    <p className="font-cinzel text-xs leading-relaxed" style={{ color: '#f87171' }}>
                      {mediaError.message}
                    </p>
                    {mediaError.canRetry && (
                      <button
                        onClick={() => setMediaRetryKey(k => k + 1)}
                        className="font-cinzel text-xs px-4 py-2 rounded-full border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
                      >
                        🪄 Try Again
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <LuWand className="w-8 h-8 text-primary mb-2" style={{ animation: 'spin 2s linear infinite' }} />
                    <p className="font-cinzel text-sm text-muted-foreground">Summoning your magical presence...</p>
                  </>
                )}
              </div>
            )}
            <VideoTile stream={localStream} muted={true} label="You" wizardName={wizardName} house={house}
              className="w-full h-full" isSpellActive={!!currentSpell} spellColor={currentSpellData?.color} isAudioActive={isAudioEnabled && !!localStream} />
            {localStream && (
              <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <SpellOverlay landmarks={landmarks} currentSpell={currentSpell} />
              </div>
            )}
            {currentGesture && !currentSpell && (() => {
              const spell = SPELLS.find(s => s.gesture === currentGesture);
              return spell ? (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-cinzel tracking-wide z-30 pointer-events-none"
                  style={{ color: spell.color, background: `${spell.color}18`, border: `1px solid ${spell.color}55`, animation: 'gesturePulse 1s ease-in-out infinite' }}>
                  <span>{spell.icon}</span><span>{spell.name}</span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Remote video */}
          <div className="relative flex-1 min-h-0">
            <VideoTile stream={remoteStream} label="Remote Wizard" house=""
              className="w-full h-full"
              style={settings.videoBlur && remoteStream ? { filter: 'blur(4px)' } : undefined} />
          </div>
        </main>

        {/* Chat drawer */}
        <ChatDrawer
          open={chatOpen}
          onClose={() => { setChatOpen(false); setUnreadCount(0); }}
          messages={chatMessages}
          onSend={sendChatMessage}
          wizardName={wizardName}
        />
      </div>

      {/* ─── FLOATING CONTROLS ─────────────────────────────── */}
      {isMobile ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-3 pt-2"
          style={{
            background: 'rgba(5,4,15,0.96)',
            borderTop: '1px solid rgba(212,175,55,0.2)',
            backdropFilter: 'blur(16px)',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          <Button variant={isAudioEnabled ? 'ghost' : 'destructive'} size="icon"
            onClick={toggleAudio} className={`rounded-full h-10 w-10 ${isAudioEnabled ? 'text-primary hover:bg-primary/20' : ''}`}>
            {isAudioEnabled ? <LuMic className="w-4 h-4" /> : <LuMicOff className="w-4 h-4" />}
          </Button>
          <Button variant={isVideoEnabled ? 'ghost' : 'destructive'} size="icon"
            onClick={toggleVideo} className={`rounded-full h-10 w-10 ${isVideoEnabled ? 'text-primary hover:bg-primary/20' : ''}`}>
            {isVideoEnabled ? <LuVideo className="w-4 h-4" /> : <LuVideoOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={shareRoom}
            className="rounded-full h-10 w-10 text-primary hover:bg-primary/20" title="Share room">
            <LuShare2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setChatOpen(!chatOpen); setUnreadCount(0); }}
            className="rounded-full h-10 w-10 text-primary hover:bg-primary/20 relative">
            <LuMessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">{unreadCount}</span>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}
            className="rounded-full h-10 w-10 text-primary hover:bg-primary/20">
            <LuSettings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={leaveRoom}
            className="text-destructive hover:bg-destructive/20 rounded-full h-10 w-10 p-0 flex items-center justify-center">
            <LuDoorOpen className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 parchment px-4 py-2.5 rounded-full magic-border shadow-2xl">
            <Button variant={isAudioEnabled ? 'ghost' : 'destructive'} size="icon" onClick={toggleAudio}
              className={`rounded-full h-10 w-10 ${isAudioEnabled ? 'text-primary hover:bg-primary/20' : ''}`}>
              {isAudioEnabled ? <LuMic className="w-4 h-4" /> : <LuMicOff className="w-4 h-4" />}
            </Button>
            <Button variant={isVideoEnabled ? 'ghost' : 'destructive'} size="icon" onClick={toggleVideo}
              className={`rounded-full h-10 w-10 ${isVideoEnabled ? 'text-primary hover:bg-primary/20' : ''}`}>
              {isVideoEnabled ? <LuVideo className="w-4 h-4" /> : <LuVideoOff className="w-4 h-4" />}
            </Button>
            <div className="w-px h-6 bg-primary/20 mx-1" />
            <Button variant={isScreenSharing ? 'default' : 'ghost'} size="icon" onClick={toggleScreenShare}
              disabled={connectionStatus !== 'connected'}
              className={`rounded-full h-10 w-10 ${isScreenSharing ? 'bg-primary text-black' : 'text-primary hover:bg-primary/20'}`}>
              <LuMonitor className="w-4 h-4" />
            </Button>
            <Button variant={drawingMode ? 'default' : 'ghost'} size="icon" onClick={() => setDrawingMode(!drawingMode)}
              disabled={connectionStatus !== 'connected'}
              className={`rounded-full h-10 w-10 ${drawingMode ? 'bg-primary text-black glow-gold' : 'text-primary hover:bg-primary/20'}`}>
              <LuPenTool className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-primary/20 mx-1" />
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setReactionPopoverOpen(!reactionPopoverOpen)}
                className="rounded-full h-10 w-10 text-primary hover:bg-primary/20">
                <LuSmile className="w-4 h-4" />
              </Button>
              <AnimatePresence>
                {reactionPopoverOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }} transition={{ duration: 0.15 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 parchment p-2 rounded-2xl magic-border shadow-2xl flex gap-1 flex-wrap justify-center"
                    style={{ width: '180px' }}>
                    {REACTION_EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => sendReaction(emoji)} className="text-2xl p-1 rounded-lg hover:bg-primary/20 transition-colors">{emoji}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Chat toggle */}
            <Button variant="ghost" size="icon" onClick={() => { setChatOpen(!chatOpen); setUnreadCount(0); }}
              className="rounded-full h-10 w-10 text-primary hover:bg-primary/20 relative" title="Chat">
              <LuMessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}
              className={`rounded-full h-10 w-10 ${soundEnabled ? 'text-primary hover:bg-primary/20' : 'text-muted-foreground hover:bg-primary/10'}`}>
              {soundEnabled ? <LuVolume2 className="w-4 h-4" /> : <LuVolumeX className="w-4 h-4" />}
            </Button>
          </div>

          {settings.spellPanelVisible && (
            <div className="overflow-x-auto max-w-[calc(100vw-2rem)]">
              <SpellPanel currentSpell={currentSpell} spells={SPELLS} cooldowns={cooldowns}
                onSpellCast={castSpellManually} visible={settings.spellPanelVisible} />
            </div>
          )}
        </div>
      )}

      {/* Mobile spell bottom sheet */}
      <AnimatePresence>
        {mobileSpellOpen && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 24 }}
            className="fixed inset-x-0 bottom-0 z-40 parchment rounded-t-2xl magic-border shadow-2xl"
            style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="font-harry text-primary">Cast a Spell</span>
              <button onClick={() => setMobileSpellOpen(false)} className="text-muted-foreground text-lg">✕</button>
            </div>
            <div className="overflow-x-auto px-2 pb-4">
              <SpellPanel currentSpell={currentSpell} spells={SPELLS} cooldowns={cooldowns}
                onSpellCast={castSpellManually} visible={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DrawingBoard dataChannel={dataChannel} isVisible={drawingMode} onClose={() => setDrawingMode(false)} />

      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSettingsChange={s => { setSettings(s); setSoundEnabled(s.spellSoundsEnabled); }}
        onShowGestureTutorial={() => setShowGestureTutorial(true)}
      />

      {/* ─── SHARE SHEET ────────────────────────────────────── */}
      <AnimatePresence>
        {shareOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShareOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="fixed z-50 inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 parchment rounded-2xl magic-border shadow-2xl p-6 flex flex-col gap-4"
              style={{ background: 'rgba(10,8,20,0.97)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-harry text-primary text-lg">Invite a Wizard</h2>
                <button onClick={() => setShareOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              {/* Room code pill */}
              <div className="space-y-1">
                <p className="font-cinzel text-xs text-muted-foreground uppercase tracking-widest">Room Code</p>
                <div className="flex items-center gap-2 bg-black/40 rounded-xl px-4 py-3 border border-primary/20">
                  <span className="font-cinzel text-base text-primary tracking-widest flex-1 select-all">{roomId}</span>
                  <button onClick={copyRoomId}
                    className="text-primary/60 hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10">
                    <LuCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* QR code */}
              <div className="flex flex-col items-center gap-2 bg-black/30 rounded-xl p-4">
                <QRCodeSVG value={shareUrl} size={150} bgColor="transparent" fgColor="#D4AF37" />
                <p className="font-cinzel text-[10px] text-muted-foreground uppercase tracking-widest">Scan to join</p>
              </div>

              {/* Join link */}
              <div className="space-y-1">
                <p className="font-cinzel text-xs text-muted-foreground uppercase tracking-widest">Join Link</p>
                <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2 border border-primary/20">
                  <LuLink className="w-3.5 h-3.5 text-primary/40 flex-shrink-0" />
                  <span className="font-cinzel text-xs text-muted-foreground flex-1 truncate select-all">{shareUrl}</span>
                  <button onClick={copyShareLink}
                    className="text-primary/60 hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10 flex-shrink-0">
                    <LuCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 font-cinzel text-sm border border-primary/30 hover:bg-primary/10 text-primary"
                  onClick={copyShareLink}>
                  <LuCopy className="w-4 h-4 mr-2" />Copy Link
                </Button>
                {typeof navigator.share === 'function' && (
                  <Button variant="ghost" className="flex-1 font-cinzel text-sm border border-primary/30 hover:bg-primary/10 text-primary"
                    onClick={() => navigator.share({ title: `Join room: ${roomId}`, url: shareUrl }).catch(() => {})}>
                    <LuShare2 className="w-4 h-4 mr-2" />Share
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
