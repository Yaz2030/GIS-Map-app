// =============================================================
// يتحقق من رابط تفعيل البريد (/verify-email?token=...) في الخلفية
// دون أي واجهة مرئية منفصلة — الخريطة تبقى ظاهرة دائمًا وفورًا. عند
// اكتمال الطلب (نجاحًا أو فشلًا) يُنظَّف الرابط فورًا عبر
// history.replaceState حتى لا يعيد المحاولة عند تحديث الصفحة.
// =============================================================

import httpClient from "../services/httpClient";
import { pushToast } from "../store/toast";
import { t } from "../i18n";

export async function checkEmailVerification({ onVerified } = {}) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (window.location.pathname !== "/verify-email" || !token) return;

  try {
    await httpClient.post("/api/users/verify-email", { token });
    window.history.replaceState({}, "", "/");
    pushToast(t("verifyEmail.success"), "success");
    if (onVerified) onVerified();
  } catch (err) {
    window.history.replaceState({}, "", "/");
    pushToast(t("verifyEmail.error"), "error");
  }
}
