import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './lib/logger';

interface WizardMeta { wizardName: string; house: string; }

const rooms = new Map<string, Set<string>>();
const wizardMeta = new Map<string, WizardMeta>();
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

    // BUG 4 FIX: join-room now accepts { roomID, wizardName, house }
    socket.on('join-room', (payload: string | { roomID: string; wizardName?: string; house?: string }) => {
      let roomID: string;
      let wizardName = 'Wizard';
      let house = '';

      if (typeof payload === 'string') {
        roomID = payload;
      } else {
        roomID = payload.roomID;
        wizardName = payload.wizardName || 'Wizard';
        house = payload.house || '';
      }

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

      // Store wizard metadata
      wizardMeta.set(socket.id, { wizardName, house });

      socket.join(trimmedRoom);
      room.add(socket.id);

      // Collect existing participants' info
      const existingPeers: Array<{ socketId: string; wizardName: string; house: string }> = [];
      room.forEach(id => {
        if (id !== socket.id) {
          const meta = wizardMeta.get(id);
          existingPeers.push({ socketId: id, wizardName: meta?.wizardName || 'Wizard', house: meta?.house || '' });
        }
      });

      // Send existing participants to the joiner
      socket.emit('peer-info', existingPeers);

      // Notify existing participants about new joiner
      socket.to(trimmedRoom).emit('peer-joined', { socketId: socket.id, wizardName, house });

      // Also send legacy events
      socket.to(trimmedRoom).emit('user-joined', socket.id);
      const users = Array.from(room);
      socket.emit('room-joined', users);

      logger.info({ roomID: trimmedRoom, socketId: socket.id, wizardName, house, users }, 'User joined room');
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

    // BUG 3 FIX: relay spell events to all others in the room
    socket.on('spell', ({ roomID, spellName, color }: { roomID: string; spellName: string; color: string }) => {
      const meta = wizardMeta.get(socket.id);
      socket.to(roomID).emit('spell', {
        from: socket.id,
        spellName,
        color,
        wizardName: meta?.wizardName || 'Wizard',
      });
    });

    // Feature 2.5: relay reaction events as fallback
    socket.on('reaction', ({ roomID, emoji }: { roomID: string; emoji: string }) => {
      socket.to(roomID).emit('reaction', { from: socket.id, emoji });
    });

    // BUG 5 FIX: emit wizard info with user-disconnected
    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket disconnected');
      const meta = wizardMeta.get(socket.id);
      wizardMeta.delete(socket.id);
      for (const [roomID, sockets] of rooms) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          socket.to(roomID).emit('user-disconnected', {
            socketId: socket.id,
            wizardName: meta?.wizardName || 'Wizard',
            house: meta?.house || '',
          });
          if (sockets.size === 0) rooms.delete(roomID);
        }
      }
    });
  });

  return io;
}

// Export for health check
export function getRoomStats() {
  let connections = 0;
  rooms.forEach(r => { connections += r.size; });
  return { rooms: rooms.size, connections };
}
