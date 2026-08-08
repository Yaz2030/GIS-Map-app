import { settingsState } from "../store/settings";
import { translate } from "./translations";

// Single translation function used across all components, based on the current settings language
export function t(path) {
  return translate(settingsState.language, path);
}

export function currentLanguage() {
  return settingsState.language;
}
