import { Server } from "socket.io";

export let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 New socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
}
