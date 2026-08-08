import { reactive } from "vue";
import httpClient from "../services/httpClient";

// =============================================================
// حالة مصادقة حقيقية متصلة بالباك اند (Spring Boot) عبر JWT.
// التوكن يُخزَّن كنص خام في localStorage (رد /api/users/login هو
// التوكن نفسه، وليس JSON فيه حقل token)، وبيانات المستخدم تُجلب
// بعد ذلك من GET /api/users/me وتُخزَّن بشكل منفصل.
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

// يرمي خطأ axios كما هو عند فشل الدخول (بيانات خاطئة، بريد غير موثّق..)
// حتى تتعامل معه الواجهة (AuthModal) وتعرض الرسالة المناسبة
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

// لا يسجّل الدخول تلقائيًا: الباك اند لا يرجع توكن عند التسجيل،
// فقط ينشئ الحساب ويرسل بريد تفعيل
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
