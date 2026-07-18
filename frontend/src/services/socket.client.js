import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/api.config";

// Sockets connect to the server origin, not the /api prefix.
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

let socket = null;

// Singleton: one connection per tab no matter how many components ask for it
// (also keeps React StrictMode's double-mount from opening two sockets).
export const connectSocket = () => {
  if (!socket) {
    // withCredentials sends the auth cookies on the handshake — the server
    // authenticates the socket exactly like a REST request.
    socket = io(SOCKET_URL, { withCredentials: true });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
