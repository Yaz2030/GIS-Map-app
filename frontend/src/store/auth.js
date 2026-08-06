import { reactive } from "vue";

// =============================================================
// تسجيل دخول وهمي (Mock) على جهة العميل فقط.
// لا يوجد أي اتصال بخادم ولا كلمة مرور حقيقية تُخزّن هنا.
// عند ربط Spring Boot لاحقًا، يجب استبدال هذا الملف بالكامل
// بطلبات حقيقية إلى /api/auth/login و /api/auth/register
// والاعتماد على توكن (JWT) بدلاً من هذا الكائن المحلي.
// =============================================================

const STORAGE_KEY = "mapapp.auth.user";

function loadInitial() {
  try {
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
  user: loadInitial(),
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

export function isLoggedIn() {
  return !!authState.user;
}

// محاكاة تسجيل دخول ناجح دائمًا محليًا (لا يوجد تحقق حقيقي من كلمة المرور)
export function mockLogin({ email }) {
  authState.user = {
    email,
    name: email.split("@")[0],
  };
  persist();
  return authState.user;
}

export function mockRegister({ name, email }) {
  authState.user = { email, name };
  persist();
  return authState.user;
}

export function updateUserName(name) {
  if (!authState.user) return;
  authState.user.name = name;
  persist();
}

export function logout() {
  authState.user = null;
  persist();
}
