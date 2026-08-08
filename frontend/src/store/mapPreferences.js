import { reactive, watch } from "vue";
import { settingsState } from "./settings";

const STORAGE_KEY = "mapapp.baseLayer";

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "osm" || raw === "dark" || raw === "satellite") return raw;
  } catch (err) {
    console.error("Failed to read base layer preference:", err);
  }
  return settingsState.theme === "dark" ? "dark" : "osm";
}

export const mapPreferencesState = reactive({
  baseLayer: loadInitial(),
});

watch(
  () => mapPreferencesState.baseLayer,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
      console.error("Failed to persist base layer preference:", err);
    }
  }
);

// When the app theme changes (light/dark), the base layer automatically
// switches to the matching layer. Any later manual choice from the layers
// panel stays in effect until the next theme change. The relationship is
// one-directional (theme -> layer) and nothing writes back to the theme, so there's no update loop.
watch(
  () => settingsState.theme,
  (theme) => {
    mapPreferencesState.baseLayer = theme === "dark" ? "dark" : "osm";
  }
);

export function setBaseLayer(name) {
  mapPreferencesState.baseLayer = name;
}
