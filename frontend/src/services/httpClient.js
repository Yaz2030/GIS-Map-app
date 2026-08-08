// =============================================================
// عميل axios مركزي لكل الطلبات الموجهة لخادمنا (Spring Boot لاحقًا).
// يضيف رأس Accept-Language تلقائيًا اعتمادًا على تفضيل اللغة
// الحالي المخزّن في settingsState (راجع ../store/settings.js).
// =============================================================

import axios from "axios";
import { settingsState } from "../store/settings";
import { getToken, logout } from "../store/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// المسارات التي لا يجب إرفاق التوكن معها (لا يوجد توكن بعد قبل الدخول)
const AUTH_EXEMPT_PATHS = ["/api/users/login", "/api/users/register"];

const httpClient = axios.create({
  baseURL: BASE_URL,
});

// الباك إند يتوقع 'ar' أو 'en' بالضبط، بدون لواحق مثل ar-SA أو en-US
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
