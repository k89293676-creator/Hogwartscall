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
    { urls: 'stun:stun2.l.google.com:19302' },
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

  const closePeer = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    peerSocketId.current = null;
  }, []);

  const buildPeerConnection = useCallback((targetId: string): RTCPeerConnection => {
    closePeer();
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

    pc.ondatachannel = (event) => {
      setDataChannel(event.channel);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [socket, closePeer]);

  const initiateCall = useCallback(async (targetId: string) => {
    const pc = buildPeerConnection(targetId);
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
  }, [buildPeerConnection, socket]);

  useEffect(() => {
    socket.on('room-joined', (users: string[]) => {
      const others = users.filter(id => id !== socket.id);
      if (others.length > 0) {
        initiateCall(others[0]);
      }
    });

    socket.on('user-joined', (userId: string) => {
      peerSocketId.current = userId;
    });

    socket.on('offer', async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      const pc = buildPeerConnection(from);
      setConnectionStatus('connecting');

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { to: from, answer });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socket.on('answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description:', err);
        }
      }
    });

    socket.on('ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    socket.on('user-disconnected', () => {
      setRemoteStream(null);
      setConnectionStatus('disconnected');
      closePeer();
    });

    return () => {
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
    };
  }, [socket, roomId, initiateCall, buildPeerConnection, closePeer]);

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
