// =============================================================
// عميل axios مركزي لكل الطلبات الموجهة لخادمنا (Spring Boot لاحقًا).
// يضيف رأس Accept-Language تلقائيًا اعتمادًا على تفضيل اللغة
// الحالي المخزّن في settingsState (راجع ../store/settings.js).
// =============================================================

import axios from "axios";
import { settingsState } from "../store/settings";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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
  return config;
});

export default httpClient;
