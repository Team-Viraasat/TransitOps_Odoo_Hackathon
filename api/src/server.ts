import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { env } from "./config/env";
import { prisma } from "./db/prisma";

const app = express();
const httpServer = createServer(app);

// Socket.IO
const io = new SocketServer(httpServer, {
  cors: { origin: env.CLIENT_ORIGIN, credentials: true },
});

// Middleware
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start
httpServer.listen(env.PORT, () => {
  console.log(`🚀 TransitOps API running on http://localhost:${env.PORT}`);
  console.log(`📡 Socket.IO ready`);
});

export { app, io, httpServer };
