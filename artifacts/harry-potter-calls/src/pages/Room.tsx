import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useGesture } from '@/hooks/useGesture';
import { useSpells } from '@/hooks/useSpells';
import { SPELLS } from '@/utils/spells';

import { VideoTile } from '@/components/VideoTile';
import { SpellOverlay } from '@/components/SpellOverlay';
import { DrawingBoard } from '@/components/DrawingBoard';
import { SpellPanel } from '@/components/SpellPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LuMic, LuMicOff, LuVideo, LuVideoOff, LuPenTool, LuDoorOpen } from 'react-icons/lu';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const [, setLocation] = useLocation();
  const socket = useSocket();
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);

  const { localStream, remoteStream, dataChannel, connectionStatus, initiateCall, setLocalStream } = useWebRTC(socket, roomId!);
  const { landmarks, currentGesture } = useGesture(localStream);
  const { currentSpell, cooldowns } = useSpells(currentGesture);

  // Initialize media and socket room
  useEffect(() => {
    let mounted = true;
    
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        setLocalStream(stream);
        
        socket.emit('join-room', roomId);
        setIsInRoom(true);
        
      } catch (err) {
        console.error('Failed to get media devices', err);
        alert('Please allow camera and microphone access to use the Floo Network.');
      }
    };
    
    initMedia();
    
    return () => {
      mounted = false;
    };
  }, [roomId, socket, setLocalStream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => {
        t.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [localStream, isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => {
        t.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [localStream, isVideoEnabled]);

  const leaveRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    setLocation('/');
  };

  const getStatusBadge = () => {
    switch(connectionStatus) {
      case 'idle': return <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30 font-cinzel">Waiting...</Badge>;
      case 'connecting': return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 font-cinzel">Connecting...</Badge>;
      case 'connected': return <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30 font-cinzel">Connected</Badge>;
      case 'disconnected': return <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30 font-cinzel">Peer Left</Badge>;
    }
  };

  if (!roomId) return null;

  return (
    <div className="w-full h-[100dvh] flex flex-col relative overflow-hidden bg-transparent">
      
      {/* Top Bar */}
      <header className="h-16 px-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <h1 className="font-harry text-2xl text-primary glow-gold-text">Room: {roomId}</h1>
          {getStatusBadge()}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={leaveRoom}
          className="text-destructive hover:text-destructive hover:bg-destructive/20 font-cinzel"
        >
          <LuDoorOpen className="w-4 h-4 mr-2" />
          Leave Network
        </Button>
      </header>

      {/* Main Video Area */}
      <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 relative z-0">
        <div className="flex-1 relative h-full min-h-[300px]">
          <VideoTile 
            stream={localStream} 
            muted={true} 
            label="You" 
            className="w-full h-full"
          />
          {/* AR Spell Overlay on top of local video */}
          {localStream && (
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <SpellOverlay 
                landmarks={landmarks} 
                currentSpell={currentSpell} 
              />
            </div>
          )}
        </div>

        <div className="flex-1 relative h-full min-h-[300px]">
          <VideoTile 
            stream={remoteStream} 
            label="Remote Wizard" 
            className="w-full h-full"
          />
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-30 bg-gradient-to-t from-black/80 to-transparent">
        
        {/* Controls */}
        <div className="flex items-center gap-4 parchment p-2 rounded-2xl magic-border shadow-2xl">
          <Button 
            variant={isAudioEnabled ? "ghost" : "destructive"} 
            size="icon" 
            onClick={toggleAudio}
            className={isAudioEnabled ? "text-primary hover:text-primary hover:bg-primary/20" : ""}
          >
            {isAudioEnabled ? <LuMic className="w-5 h-5" /> : <LuMicOff className="w-5 h-5" />}
          </Button>
          
          <Button 
            variant={isVideoEnabled ? "ghost" : "destructive"} 
            size="icon" 
            onClick={toggleVideo}
            className={isVideoEnabled ? "text-primary hover:text-primary hover:bg-primary/20" : ""}
          >
            {isVideoEnabled ? <LuVideo className="w-5 h-5" /> : <LuVideoOff className="w-5 h-5" />}
          </Button>

          <div className="w-px h-8 bg-primary/20 mx-2" />

          <Button 
            variant={drawingMode ? "default" : "ghost"} 
            size="icon" 
            onClick={() => setDrawingMode(!drawingMode)}
            className={drawingMode ? "bg-primary text-black glow-gold hover:bg-primary/90" : "text-primary hover:text-primary hover:bg-primary/20"}
            title="Magical Drawing"
            disabled={connectionStatus !== 'connected'}
          >
            <LuPenTool className="w-5 h-5" />
          </Button>
        </div>

        {/* Spells */}
        <div className="flex-1 flex justify-end overflow-hidden">
          <SpellPanel 
            currentSpell={currentSpell} 
            spells={SPELLS} 
            cooldowns={cooldowns} 
          />
        </div>
      </footer>

      {/* Full screen drawing board overlay */}
      <DrawingBoard 
        dataChannel={dataChannel} 
        isVisible={drawingMode} 
        onClose={() => setDrawingMode(false)} 
      />

    </div>
  );
}
