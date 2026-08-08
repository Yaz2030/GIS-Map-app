// =============================================================
// Verifies the email confirmation link (/verify-email?token=...) in the
// background with no separate visible UI — the map stays visible at all
// times. Once the request completes (success or failure), the URL is
// cleaned up immediately via history.replaceState so it doesn't retry on page refresh.
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
