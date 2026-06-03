import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

// BUG 13 FIX: Track RTT and quality via getStats
export interface ConnectionQuality { quality: 'good' | 'fair' | 'poor'; rtt: number; }

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  dataChannel: RTCDataChannel | null;
  connectionStatus: ConnectionStatus;
  connectionQuality: ConnectionQuality;
  setLocalStream: (stream: MediaStream) => void;
  replaceTrack: (kind: 'audio' | 'video', track: MediaStreamTrack) => Promise<void>;
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    ...(
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TURN_URL)
        ? [{
            urls: (import.meta as any).env.VITE_TURN_URL as string,
            username: (import.meta as any).env.VITE_TURN_USER || 'openrelayproject',
            credential: (import.meta as any).env.VITE_TURN_CRED || 'openrelayproject',
          }]
        : [{
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          }]
    ),
  ],
};

export function useWebRTC(socket: Socket, roomId: string): UseWebRTCReturn {
  const [localStream, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>({ quality: 'good', rtt: 0 });

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerSocketId = useRef<string | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // BUG 6.2 FIX: stable function refs avoid re-registering socket listeners each render
  const closePeerRef = useRef<() => void>(() => {});
  const buildPeerConnectionRef = useRef<(targetId: string) => RTCPeerConnection>(() => { throw new Error('not ready'); });
  const initiateCallRef = useRef<(targetId: string) => Promise<void>>(async () => {});

  const startStatsPolling = useCallback((pc: RTCPeerConnection) => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    statsIntervalRef.current = setInterval(async () => {
      if (!pc || pc.connectionState !== 'connected') return;
      try {
        const stats = await pc.getStats();
        stats.forEach(report => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            const rtt = Math.round((report.currentRoundTripTime ?? 0) * 1000);
            const quality: 'good' | 'fair' | 'poor' =
              rtt < 150 ? 'good' : rtt < 350 ? 'fair' : 'poor';
            setConnectionQuality({ quality, rtt });
          }
        });
      } catch { /* ignore */ }
    }, 3000);
  }, []);

  const setLocalStream = useCallback((stream: MediaStream) => {
    setLocalStreamState(stream);
    localStreamRef.current = stream;
    // If already connected, replace tracks rather than adding duplicates
    if (peerConnection.current) {
      const senders = peerConnection.current.getSenders();
      stream.getTracks().forEach(track => {
        const sender = senders.find(s => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch(console.error);
        } else {
          peerConnection.current?.addTrack(track, stream);
        }
      });
    }
  }, []);

  // BUG 12 FIX: explicit replaceTrack for screen-share renegotiation
  const replaceTrack = useCallback(async (kind: 'audio' | 'video', track: MediaStreamTrack) => {
    const pc = peerConnection.current;
    if (!pc) return;
    const sender = pc.getSenders().find(s => s.track?.kind === kind);
    if (sender) {
      await sender.replaceTrack(track);
      // Renegotiate if needed
      if (pc.signalingState !== 'stable') return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (peerSocketId.current) {
        socket.emit('offer', { to: peerSocketId.current, offer });
      }
    }
  }, [socket]);

  // Kept as a single useEffect with no dep array — intentional (stable ref pattern)
  useEffect(() => {
    closePeerRef.current = () => {
      if (statsIntervalRef.current) { clearInterval(statsIntervalRef.current); statsIntervalRef.current = null; }
      if (peerConnection.current) { peerConnection.current.close(); peerConnection.current = null; }
      peerSocketId.current = null;
    };

    buildPeerConnectionRef.current = (targetId: string): RTCPeerConnection => {
      closePeerRef.current();
      peerSocketId.current = targetId;
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnection.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate && peerSocketId.current) {
          socket.emit('ice-candidate', { to: peerSocketId.current, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        setRemoteStream(stream);
      };

      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case 'connecting': setConnectionStatus('connecting'); break;
          case 'connected':
            setConnectionStatus('connected');
            startStatsPolling(pc);
            break;
          case 'disconnected':
          case 'failed':
          case 'closed':
            setConnectionStatus('disconnected');
            if (statsIntervalRef.current) { clearInterval(statsIntervalRef.current); statsIntervalRef.current = null; }
            break;
        }
      };

      // BUG 9 FIX: callee also sets dataChannel via ondatachannel
      pc.ondatachannel = (event) => { setDataChannel(event.channel); };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      return pc;
    };

    initiateCallRef.current = async (targetId: string) => {
      const pc = buildPeerConnectionRef.current(targetId);
      setConnectionStatus('connecting');
      const dc = pc.createDataChannel('drawing');
      setDataChannel(dc);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { to: targetId, offer });
      } catch (err) {
        console.error('Error creating offer:', err);
        setConnectionStatus('disconnected');
      }
    };
  }); // intentionally no dep array — stable ref pattern

  useEffect(() => {
    const onRoomJoined = (users: string[]) => {
      const others = users.filter(id => id !== socket.id);
      if (others.length > 0) initiateCallRef.current(others[0]);
    };

    // BUG 4 FIX: handle peer-joined (new event from signaling.ts)
    const onPeerJoined = ({ socketId }: { socketId: string }) => {
      peerSocketId.current = socketId;
    };

    const onUserJoined = (userId: string) => {
      peerSocketId.current = userId;
    };

    const onOffer = async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      const pc = buildPeerConnectionRef.current(from);
      setConnectionStatus('connecting');
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { to: from, answer });
      } catch (err) {
        console.error('Error handling offer:', err);
        setConnectionStatus('disconnected');
      }
    };

    const onAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current && peerConnection.current.signalingState !== 'closed') {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      }
    };

    const onIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current && peerConnection.current.signalingState !== 'closed') {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    };

    // BUG 5 FIX: user-disconnected may now carry metadata object or plain string
    const onUserDisconnected = (payload: string | { socketId: string }) => {
      const disconnectedId = typeof payload === 'string' ? payload : payload?.socketId;
      if (!disconnectedId || disconnectedId === peerSocketId.current) {
        setRemoteStream(null);
        setConnectionStatus('disconnected');
        closePeerRef.current();
      }
    };

    socket.on('room-joined', onRoomJoined);
    socket.on('peer-joined', onPeerJoined);
    socket.on('user-joined', onUserJoined);
    socket.on('offer', onOffer);
    socket.on('answer', onAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('user-disconnected', onUserDisconnected);

    return () => {
      socket.off('room-joined', onRoomJoined);
      socket.off('peer-joined', onPeerJoined);
      socket.off('user-joined', onUserJoined);
      socket.off('offer', onOffer);
      socket.off('answer', onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('user-disconnected', onUserDisconnected);
    };
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { closePeerRef.current(); };
  }, []);

  return { localStream, remoteStream, dataChannel, connectionStatus, connectionQuality, setLocalStream, replaceTrack, peerConnectionRef: peerConnection };
}
