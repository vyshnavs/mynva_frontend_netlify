import { io } from "socket.io-client";

/**
 * SINGLETON SOCKET INSTANCE
 * One socket per logged-in user
 */
let socket = null;

/**
 * Build backend base URL (remove /api)
 */
function getBaseURL() {
  const api = import.meta.env.VITE_API_BASE_URL;
  return api.replace("/api", "");
}

/**
 * Initialize WebSocket connection
 * Automatically attaches JWT token
 */
export function initSocket() {
  if (socket) return socket;

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("WS: No token found, socket not initialized");
    return null;
  }

  socket = io(getBaseURL(), {
    auth: { token },              // 🔐 JWT attached here
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  // ---------- Connection lifecycle ----------
  socket.on("connect", () => {
    console.log("WS connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("WS disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("WS connection error:", err.message);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
  return socket;
}

/**
 * Subscribe to an event
 */
export function on(event, handler) {
  const s = initSocket();
  if (!s || !event || !handler) return;

  s.on(event, handler);
}

/**
 * Unsubscribe from an event
 */
export function off(event, handler) {
  if (!socket || !event) return;

  socket.off(event, handler);
}

/**
 * Emit event to backend
 */
export function emit(event, payload) {
  if (!socket || !event) return;

  socket.emit(event, payload);
}

/**
 * Join a logical room (user/device based)
 */
export function join(room) {
  if (!socket || !room) return;

  socket.emit("join", room);
}

/**
 * Leave a logical room
 */
export function leave(room) {
  if (!socket || !room) return;

  socket.emit("leave", room);
}

/**
 * Disconnect socket manually
 * Use on logout or app shutdown
 */
export function disconnectSocket() {
  if (!socket) return;

  socket.disconnect();
  socket = null;
}
