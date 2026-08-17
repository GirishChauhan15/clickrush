import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./middleware/rateLimiters.middleware.js";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.route.js";
import gameRoutes from "./routes/game.route.js";
import leaderboardRoutes from "./routes/leaderboard.route.js";
import http from "http";
import mongoose from "mongoose";

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
    origin: allowedOrigin,
    credentials:true,
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use("/api", apiLimiter);


const io = new Server(server, {
  cors: { origin: allowedOrigin, credentials: true },
  transports: ["websocket", "polling"]
});
app.set("io", io);

io.on("connection", (socket) => {
  // console.log(JSON.stringify({ event: "socket_connected", socketId: socket.id }));
  socket.on("disconnect", (reason) => {
    // console.log(JSON.stringify({ event: "socket_disconnected", socketId: socket.id, reason }));
  });
});


app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ClickRush API" });
});



app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/leaderboards", leaderboardRoutes);



app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, _next) => {
  // console.error(
  //   JSON.stringify({
  //     level: "error",
  //     requestId: req.id,
  //     message: err.message,
  //     stack:
  //       process.env.NODE_ENV === "production"
  //         ? undefined
  //         : err.stack,
  //   })
  // );

  if (res.headersSent) return;

  res.status(err.statusCode || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal}: graceful shutdown started`);
  io.close();
  server.close(async () => {
    await mongoose.connection.close(false);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
// process.on("unhandledRejection", (reason) => console.error("unhandledRejection", reason));
process.on("uncaughtException", (error) => {
  // console.error("uncaughtException", error);
  shutdown("uncaughtException");
});

const port = Number(process.env.PORT || 5000);

connectDB()
  .then(() => {
    server.listen(port, () => {
      // console.log(`Server is listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // console.log("Error while connecting to DB ", err);
    process.exit(1);
  });