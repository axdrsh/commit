import { Socket, Server } from "socket.io";
import prisma from "../utils/prisma";

export const setupChatHandlers = (io: Server, socket: Socket) => {
  const user = socket.data.user;

  const joinUserMatchRooms = async () => {
    try {
      const userMatches = await prisma.match.findMany({
        where: {
          OR: [{ userAId: user.id }, { userBId: user.id }],
        },
      });

      userMatches.forEach((match) => {
        socket.join(match.id);
        console.log(`User ${user.name} joined room for match ${match.id}`);
      });

      console.log(`User ${user.name} joined ${userMatches.length} chat rooms`);
    } catch (error) {
      console.error("Error joining rooms:", error);
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    try {
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          OR: [{ userAId: user.id }, { userBId: user.id }],
        },
      });

      if (match) {
        socket.join(matchId);
        console.log(`User ${user.name} joined match room ${matchId}`);
        socket.emit("joinedMatch", { matchId });
      } else {
        socket.emit("error", "You are not part of this match");
      }
    } catch (error) {
      console.error("Error joining match room:", error);
      socket.emit("error", "Failed to join match room");
    }
  };

  const handleSendMessage = async (data: {
    matchId: string;
    content: string;
  }) => {
    try {
      const { matchId, content } = data;

      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          OR: [{ userAId: user.id }, { userBId: user.id }],
        },
      });

      if (!match) {
        socket.emit("error", "You are not part of this match");
        return;
      }

      const message = await prisma.message.create({
        data: {
          content,
          senderId: user.id,
          matchId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      io.to(matchId).emit("newMessage", {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
        matchId: message.matchId,
      });

      console.log(`Message sent in match ${matchId} by ${user.name}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Failed to send message");
    }
  };

  socket.on("joinMatch", handleJoinMatch);
  socket.on("sendMessage", handleSendMessage);
  joinUserMatchRooms();

  socket.on("disconnect", () => {
    console.log(`User ${user.name} disconnected from chat`);
  });
};
