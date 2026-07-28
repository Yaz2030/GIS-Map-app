import { settingsState } from "../store/settings";
import { translate } from "./translations";

// دالة ترجمة واحدة تُستخدم في كل المكونات، تعتمد على لغة الإعدادات الحالية
export function t(path) {
  return translate(settingsState.language, path);
}

export function currentLanguage() {
  return settingsState.language;
}
