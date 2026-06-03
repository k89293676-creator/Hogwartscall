import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  dataChannel: RTCDataChannel | null;
  connectionStatus: ConnectionStatus;
  initiateCall: (targetSocketId: string) => void;
  setLocalStream: (stream: MediaStream) => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function useWebRTC(socket: Socket, roomId: string): UseWebRTCReturn {
  const [localStream, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const setLocalStream = useCallback((stream: MediaStream) => {
    setLocalStreamState(stream);
    localStreamRef.current = stream;
    
    if (peerConnection.current) {
      stream.getTracks().forEach(track => {
        if (!peerConnection.current?.getSenders().find(s => s.track === track)) {
          peerConnection.current?.addTrack(track, stream);
        }
      });
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    if (peerConnection.current) return peerConnection.current;
    
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current = pc;
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate });
      }
    };
    
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    
    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case 'new':
        case 'connecting':
          setConnectionStatus('connecting');
          break;
        case 'connected':
          setConnectionStatus('connected');
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          setConnectionStatus('disconnected');
          break;
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
  }, [socket, roomId]);

  const initiateCall = useCallback(async (targetSocketId: string) => {
    const pc = createPeerConnection();
    setConnectionStatus('connecting');
    
    const dc = pc.createDataChannel('drawing');
    setDataChannel(dc);
    
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { roomId, offer, target: targetSocketId });
    } catch (err) {
      console.error('Error creating offer', err);
    }
  }, [createPeerConnection, socket, roomId]);

  useEffect(() => {
    socket.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
      initiateCall(userId);
    });
    
    socket.on('offer', async ({ offer, sender }: { offer: RTCSessionDescriptionInit, sender: string }) => {
      console.log('Received offer from:', sender);
      const pc = createPeerConnection();
      setConnectionStatus('connecting');
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer, target: sender });
      } catch (err) {
        console.error('Error handling offer', err);
      }
    });
    
    socket.on('answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log('Received answer');
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description from answer', err);
        }
      }
    });
    
    socket.on('ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate', err);
        }
      }
    });
    
    socket.on('user-disconnected', () => {
      console.log('User disconnected');
      setRemoteStream(null);
      setConnectionStatus('disconnected');
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    });
    
    return () => {
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
    };
  }, [socket, roomId, createPeerConnection, initiateCall]);

  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, []);

  return { localStream, remoteStream, dataChannel, connectionStatus, initiateCall, setLocalStream };
}
