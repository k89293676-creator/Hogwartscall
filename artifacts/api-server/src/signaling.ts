import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './lib/logger';

const rooms = new Map<string, Set<string>>();
const MAX_ROOM_SIZE = 4;

export function attachSignaling(httpServer: HttpServer): SocketIOServer {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : null;

  const io = new SocketIOServer(httpServer, {
    cors: { origin: allowedOrigins ?? '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    if (allowedOrigins) {
      const origin = socket.handshake.headers.origin ?? '';
      if (!allowedOrigins.includes(origin)) {
        logger.warn({ origin, socketId: socket.id }, 'Rejected connection from disallowed origin');
        return next(new Error('Origin not allowed'));
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Socket connected');

    socket.on('join-room', (roomID: string) => {
      if (typeof roomID !== 'string' || !roomID.trim()) {
        socket.emit('error', { message: 'Invalid room ID' });
        return;
      }
      const trimmedRoom = roomID.trim();
      if (!rooms.has(trimmedRoom)) rooms.set(trimmedRoom, new Set());
      const room = rooms.get(trimmedRoom)!;

      if (room.size >= MAX_ROOM_SIZE) {
        socket.emit('room-full', { roomID: trimmedRoom });
        logger.warn({ roomID: trimmedRoom, socketId: socket.id }, 'Room full, rejecting join');
        return;
      }

      socket.join(trimmedRoom);
      room.add(socket.id);
      const users = Array.from(room);
      socket.to(trimmedRoom).emit('user-joined', socket.id);
      socket.emit('room-joined', users);
      logger.info({ roomID: trimmedRoom, socketId: socket.id, users }, 'User joined room');
    });

    socket.on('offer', ({ to, offer }: { to: string; offer: unknown }) => {
      if (typeof to !== 'string') return;
      io.to(to).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ to, answer }: { to: string; answer: unknown }) => {
      if (typeof to !== 'string') return;
      io.to(to).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ to, candidate }: { to: string; candidate: unknown }) => {
      if (typeof to !== 'string') return;
      io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket disconnected');
      for (const [roomID, sockets] of rooms) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          socket.to(roomID).emit('user-disconnected', socket.id);
          if (sockets.size === 0) rooms.delete(roomID);
        }
      }
    });
  });

  return io;
}
