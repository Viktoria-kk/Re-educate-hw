import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { initializeSockets } from "./sockets/socket.js";

const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
initializeSockets(io);

try {
  await connectDatabase();
  server.listen(port, () =>
    console.log(`Server running at http://localhost:${port}`),
  );
} catch (error) {
  console.error("Unable to start server:", error.message);
  process.exit(1);
}
