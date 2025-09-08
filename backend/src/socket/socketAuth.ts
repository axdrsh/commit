import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { Socket } from "socket.io";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-default-secret"
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};
