// =============================================================
// حالة موحّدة لصندوق التأكيد (بديل window.confirm) + دالة confirm()
// التي تُستدعى من أي مكوّن وتُرجع Promise<boolean> — نفس أسلوب
// pushToast في ../store/toast.js (حالة singleton واحدة على مستوى التطبيق).
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
  // إذا كان هناك تأكيد معلّق بالفعل، نلغيه قبل فتح واحد جديد
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
