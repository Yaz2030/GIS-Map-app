// =============================================================
// Shared state for the confirm dialog (a window.confirm replacement) + a
// confirm() function callable from any component that returns Promise<boolean>
// — same pattern as pushToast in ../store/toast.js (one app-wide singleton state).
// =============================================================

import { reactive } from "vue";
import { t } from "../i18n";

export const confirmState = reactive({
  visible: false,
  title: "",
  message: "",
  confirmText: "",
  cancelText: "",
  isDangerous: false,
});

let activeResolve = null;

export function confirm({ title = "", message = "", confirmText = "", cancelText = "", isDangerous = false } = {}) {
  // If a confirmation is already pending, cancel it before opening a new one
  if (activeResolve) resolveConfirm(false);

  confirmState.visible = true;
  confirmState.title = title;
  confirmState.message = message;
  confirmState.confirmText = confirmText || t("common.ok");
  confirmState.cancelText = cancelText || t("common.cancel");
  confirmState.isDangerous = isDangerous;

  return new Promise((resolve) => {
    activeResolve = resolve;
  });
}

export function resolveConfirm(result) {
  confirmState.visible = false;
  if (activeResolve) {
    activeResolve(result);
    activeResolve = null;
  }
}
