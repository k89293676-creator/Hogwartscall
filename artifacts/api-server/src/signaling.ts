import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { logger } from "./lib/logger";

const rooms = new Map<string, Set<string>>();

export function attachSignaling(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket connected");

    socket.on("join-room", (roomID: string) => {
      socket.join(roomID);
      if (!rooms.has(roomID)) rooms.set(roomID, new Set());
      rooms.get(roomID)!.add(socket.id);
      const users = Array.from(rooms.get(roomID)!);
      socket.to(roomID).emit("user-joined", socket.id);
      socket.emit("room-joined", users);
      logger.info({ roomID, socketId: socket.id, users }, "User joined room");
    });

    socket.on("offer", ({ to, offer }: { to: string; offer: unknown }) => {
      io.to(to).emit("offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ to, answer }: { to: string; answer: unknown }) => {
      io.to(to).emit("answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ to, candidate }: { to: string; candidate: unknown }) => {
      io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket disconnected");
      for (const [roomID, sockets] of rooms) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          socket.to(roomID).emit("user-disconnected", socket.id);
          if (sockets.size === 0) rooms.delete(roomID);
        }
      }
    });
  });

  return io;
}
