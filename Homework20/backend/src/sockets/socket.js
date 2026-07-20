import { getLeaderboard } from "../services/leaderboard.service.js";
import jwt from "jsonwebtoken";

const sockets = new Map();
const onlinePayload = () => {
  const unique = new Map();
  for (const user of sockets.values()) unique.set(user.userId, user);
  return { count: unique.size, users: [...unique.values()] };
};

const sendOnlineUsers = (target) => {
  target.emit("online-users:update", onlinePayload());
};

export function initializeSockets(io) {
  io.on("connection", async (socket) => {
    try {
      socket.emit("leaderboard:update", await getLeaderboard());
    } catch (error) {
      console.error("Leaderboard socket error:", error.message);
    }
    socket.on("leaderboard:request", async () => {
      try {
        socket.emit("leaderboard:update", await getLeaderboard());
      } catch (error) {
        console.error(error.message);
      }
    });
    socket.on("user:online", (user) => {
      if (!user?.userId || !user?.username || !user?.token) return;
      try {
        const payload = jwt.verify(user.token, process.env.JWT_SECRET);
        if (String(payload.userId) !== String(user.userId)) return;
      } catch {
        return;
      }
      const onlineUser = {
        userId: String(user.userId),
        username: String(user.username),
      };

      socket.data.onlineUser = onlineUser;
      sockets.set(socket.id, onlineUser);
      sendOnlineUsers(io);
    });

    socket.on("online-users:request", () => {
      sendOnlineUsers(socket);
    });

    socket.on("user:offline", () => {
      socket.data.onlineUser = undefined;
      const wasIdentified = sockets.delete(socket.id);
      if (wasIdentified) sendOnlineUsers(io);
    });

    socket.on("disconnect", () => {
      const wasIdentified = sockets.delete(socket.id);
      if (wasIdentified) sendOnlineUsers(io);
    });

    sendOnlineUsers(socket);
  });
}
