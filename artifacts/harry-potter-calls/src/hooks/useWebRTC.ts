import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  dataChannel: RTCDataChannel | null;
  connectionStatus: ConnectionStatus;
  setLocalStream: (stream: MediaStream) => void;
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TURN_URL) || 'turn:openrelay.metered.ca:80',
      username: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TURN_USER) || 'openrelayproject',
      credential: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TURN_CRED) || 'openrelayproject',
    },
  ]
};

export function useWebRTC(socket: Socket, roomId: string): UseWebRTCReturn {
  const [localStream, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerSocketId = useRef<string | null>(null);

  // Stable function refs to avoid re-registering socket listeners
  const closePeerRef = useRef<() => void>(() => {});
  const buildPeerConnectionRef = useRef<(targetId: string) => RTCPeerConnection>(() => { throw new Error(); });
  const initiateCallRef = useRef<(targetId: string) => Promise<void>>(async () => {});

  const setLocalStream = useCallback((stream: MediaStream) => {
    setLocalStreamState(stream);
    localStreamRef.current = stream;
    if (peerConnection.current) {
      const senders = peerConnection.current.getSenders();
      stream.getTracks().forEach(track => {
        if (!senders.find(s => s.track === track)) {
          peerConnection.current?.addTrack(track, stream);
        }
      });
    }
  }, []);

  // Keep refs up to date without re-creating effects
  useEffect(() => {
    closePeerRef.current = () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
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
          case 'connected': setConnectionStatus('connected'); break;
          case 'disconnected':
          case 'failed':
          case 'closed': setConnectionStatus('disconnected'); break;
        }
      };

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
      }
    };
  });

  useEffect(() => {
    const onRoomJoined = (users: string[]) => {
      const others = users.filter(id => id !== socket.id);
      if (others.length > 0) initiateCallRef.current(others[0]);
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
      }
    };

    const onAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      }
    };

    const onIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    };

    const onUserDisconnected = () => {
      setRemoteStream(null);
      setConnectionStatus('disconnected');
      closePeerRef.current();
    };

    socket.on('room-joined', onRoomJoined);
    socket.on('user-joined', onUserJoined);
    socket.on('offer', onOffer);
    socket.on('answer', onAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('user-disconnected', onUserDisconnected);

    return () => {
      socket.off('room-joined', onRoomJoined);
      socket.off('user-joined', onUserJoined);
      socket.off('offer', onOffer);
      socket.off('answer', onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('user-disconnected', onUserDisconnected);
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, []);

  return { localStream, remoteStream, dataChannel, connectionStatus, setLocalStream, peerConnectionRef: peerConnection };
}
