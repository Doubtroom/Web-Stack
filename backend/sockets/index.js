import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { parse } from "cookie";
import User from "../models/User.js";

let io = null;

// Socket.IO has no per-request middleware like Express, so authentication
// happens once, at the connection handshake. Same cookie contract as the REST
// API: prefer the short-lived access token, fall back to the refresh token
// (verified against the bcrypt-hashed copy stored on the user, exactly like
// authMiddleware does).
const authenticateSocket = async (socket, next) => {
  try {
    const cookies = parse(socket.handshake.headers.cookie || "");
    const { accessToken, refreshToken } = cookies;

    let userId = null;

    if (accessToken) {
      try {
        userId = jwt.verify(accessToken, process.env.JWT_SECRET).id;
      } catch {
        // Expired/invalid access token — fall through to the refresh token.
      }
    }

    if (!userId && refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      const candidate = await User.findById(decoded.id);
      if (!candidate || !candidate.refreshToken) {
        return next(new Error("Authentication required"));
      }
      const matches = await bcrypt.compare(
        refreshToken,
        candidate.refreshToken,
      );
      if (!matches) {
        return next(new Error("Authentication required"));
      }
      userId = String(candidate._id);
    }

    if (!userId) {
      return next(new Error("Authentication required"));
    }

    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return next(new Error("Authentication required"));
    }

    socket.userId = String(user._id);
    next();
  } catch {
    next(new Error("Authentication required"));
  }
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        "https://localhost:3001",
        "http://localhost:3001",
        "http://localhost:5173",
      ],
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    // Every socket joins a room named after its user id. Delivering to a user
    // is then just io.to(userId).emit(...) — multiple tabs/devices all get it,
    // and offline users simply have an empty room.
    socket.join(socket.userId);
  });

  return io;
};

// Null when no socket server is attached (e.g. in HTTP-only tests);
// callers must treat emitting as optional.
export const getIO = () => io;
