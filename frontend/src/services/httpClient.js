// =============================================================
// Central axios client for all requests to our server (Spring Boot).
// Automatically adds the Accept-Language header based on the current
// language preference stored in settingsState (see ../store/settings.js).
// =============================================================

import axios from "axios";
import { settingsState } from "../store/settings";
import { getToken, logout } from "../store/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Paths that should not have the token attached (no token exists before login)
const AUTH_EXEMPT_PATHS = ["/api/users/login", "/api/users/register"];

const httpClient = axios.create({
  baseURL: BASE_URL,
});

// The backend expects exactly 'ar' or 'en', without suffixes like ar-SA or en-US
function normalizeLanguage(language) {
  const short = String(language || "").toLowerCase().split(/[-_]/)[0];
  return short === "en" ? "en" : "ar";
}

httpClient.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["Accept-Language"] = normalizeLanguage(settingsState.language);

  const isAuthExempt = AUTH_EXEMPT_PATHS.some((path) => (config.url || "").includes(path));
  if (!isAuthExempt) {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default httpClient;
