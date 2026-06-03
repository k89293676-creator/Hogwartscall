import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// BUG 6 FIX: Socket singleton is now scoped per roomId + server URL.
// Module-level singleton leaked across React StrictMode unmounts and navigation.
// We keep ONE socket per (url, roomId) pair and destroy it when last consumer unmounts.

const socketRegistry = new Map<string, { socket: Socket; refs: number }>();

function getRegistryKey(url: string, roomId: string) {
  return `${url}::${roomId}`;
}

export function getSocket(roomId = ''): Socket {
  // BUG 7 FIX: use VITE_SOCKET_URL env var so it works on Render deployments.
  const url =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SOCKET_URL) ||
    window.location.origin;

  const key = getRegistryKey(url, roomId);
  if (!socketRegistry.has(key)) {
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRegistry.set(key, { socket, refs: 0 });
  }
  return socketRegistry.get(key)!.socket;
}

/**
 * Returns a stable socket that connects to the signaling server.
 * Pass roomId so each room gets its own socket lifecycle.
 */
export function useSocket(roomId = ''): Socket {
  const socketRef = useRef<Socket | null>(null);

  const url =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SOCKET_URL) ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  const key = getRegistryKey(url, roomId);

  if (!socketRef.current) {
    socketRef.current = getSocket(roomId);
    const entry = socketRegistry.get(key);
    if (entry) entry.refs++;
  }

  useEffect(() => {
    return () => {
      const entry = socketRegistry.get(key);
      if (entry) {
        entry.refs--;
        if (entry.refs <= 0) {
          entry.socket.disconnect();
          socketRegistry.delete(key);
        }
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return socketRef.current!;
}
