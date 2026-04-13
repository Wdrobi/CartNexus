import { AUTH_TOKEN_KEY } from "../auth/storage.js";
import { resolveApiUrl } from "./apiBase.js";

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function authFetch(path, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(resolveApiUrl(path), { ...options, headers });
}
