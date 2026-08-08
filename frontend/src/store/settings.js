import { reactive, watch } from "vue";

// App preferences are stored locally for now, until wired up to Spring Boot
const STORAGE_KEY = "mapapp.settings";

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme === "dark" ? "dark" : "light",
        language: parsed.language === "en" ? "en" : "ar",
        autoLocation: !!parsed.autoLocation,
      };
    }
  } catch (err) {
    console.error("Failed to read settings from storage:", err);
  }
  return { theme: "light", language: "en", autoLocation: false };
}

export const settingsState = reactive(loadInitial());

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsState));
  } catch (err) {
    console.error("Failed to persist settings:", err);
  }
}

function applyDocumentAttributes() {
  const root = document.documentElement;
  root.setAttribute("lang", settingsState.language === "en" ? "en" : "ar");
  root.setAttribute("dir", settingsState.language === "en" ? "ltr" : "rtl");
  root.setAttribute("data-theme", settingsState.theme);
}

export function initSettings() {
  applyDocumentAttributes();
}

export function setTheme(theme) {
  settingsState.theme = theme === "dark" ? "dark" : "light";
}

export function toggleTheme() {
  setTheme(settingsState.theme === "dark" ? "light" : "dark");
}

export function setLanguage(language) {
  settingsState.language = language === "en" ? "en" : "ar";
}

export function setAutoLocation(value) {
  settingsState.autoLocation = !!value;
}

watch(
  settingsState,
  () => {
    applyDocumentAttributes();
    persist();
  },
  { deep: true }
);
