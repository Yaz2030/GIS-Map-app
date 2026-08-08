import { reactive } from "vue";
import httpClient from "../services/httpClient";

// =============================================================
// Real auth state backed by the backend (Spring Boot) via JWT.
// The token is stored as raw text in localStorage (the /api/users/login
// response is the token itself, not JSON with a token field), and user data
// is then fetched from GET /api/users/me and stored separately.
// =============================================================

const STORAGE_KEY = "mapapp.auth.user";
const TOKEN_KEY = "mapapp.auth.token";

function loadInitialUser() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.email) return user;
    }
  } catch (err) {
    console.error("Failed to read auth from storage:", err);
  }
  return null;
}

export const authState = reactive({
  user: loadInitialUser(),
});

function persist() {
  try {
    if (authState.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState.user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error("Failed to persist auth:", err);
  }
}

function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error("Failed to persist auth token:", err);
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (err) {
    console.error("Failed to read auth token:", err);
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken() && !!authState.user;
}

// Rethrows the axios error as-is when login fails (wrong credentials,
// unverified email, etc.) so the UI (AuthModal) can handle it and show the right message
export async function login({ email, password }) {
  const { data: token } = await httpClient.post("/api/users/login", { email, password });
  setToken(token);

  try {
    const { data: user } = await httpClient.get("/api/users/me");
    authState.user = user;
    persist();
  } catch (err) {
    setToken(null);
    authState.user = null;
    persist();
    throw err;
  }

  return authState.user;
}

// Doesn't log in automatically: the backend returns no token on registration,
// it only creates the account and sends a verification email
export async function register({ name, email, password }) {
  const { data } = await httpClient.post("/api/users/register", { name, email, password });
  return data;
}

export function updateUserName(name) {
  if (!authState.user) return;
  authState.user.name = name;
  persist();
}

export function logout() {
  authState.user = null;
  setToken(null);
  persist();
}
