import { io, Socket } from 'socket.io-client';

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });
  }
  return _socket;
}

export function useSocket(): Socket {
  return getSocket();
}
