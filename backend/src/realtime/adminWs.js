import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwtSecret.js";

/** @type {Set<import("ws").WebSocket>} */
const adminClients = new Set();

/**
 * @param {import("http").Server} server
 */
export function attachAdminWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const host = request.headers.host || "localhost";
    let url;
    try {
      url = new URL(request.url || "/", `http://${host}`);
    } catch {
      socket.destroy();
      return;
    }

    if (url.pathname !== "/ws/admin") {
      socket.destroy();
      return;
    }

    const token = url.searchParams.get("token");
    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }

    try {
      const secret = getJwtSecret();
      if (!secret) {
        socket.destroy();
        return;
      }
      const payload = jwt.verify(token, secret);
      if (payload.role !== "admin") {
        socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
        socket.destroy();
        return;
      }
    } catch {
      try {
        socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      } catch {
        /* ignore */
      }
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws) => {
    adminClients.add(ws);
    try {
      ws.send(JSON.stringify({ type: "connected", channel: "admin_dashboard" }));
    } catch {
      /* ignore */
    }
    ws.on("close", () => adminClients.delete(ws));
    ws.on("error", () => adminClients.delete(ws));
  });

  return wss;
}

/**
 * Notify all connected admin dashboards to refetch (e.g. new order).
 * @param {string} [reason]
 */
export function broadcastDashboardRefresh(reason = "update") {
  const payload = JSON.stringify({
    type: "dashboard_refresh",
    reason,
    at: new Date().toISOString(),
  });
  for (const ws of adminClients) {
    if (ws.readyState === 1) {
      try {
        ws.send(payload);
      } catch {
        /* ignore */
      }
    }
  }
}
