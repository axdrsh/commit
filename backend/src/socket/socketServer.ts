import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { socketAuthMiddleware } from "./socketAuth";
import { setupChatHandlers } from "./chatHandlers";

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`User ${user.name} (${user.id}) connected to chat`);
    setupChatHandlers(io, socket);
  });

  return io;
};
