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

// عند تغيير مظهر التطبيق (فاتح/داكن) تتبدّل الطبقة الأساسية تلقائيًا للطبقة
// المناسبة لها. أي اختيار يدوي لاحق من لوحة الطبقات يبقى ساريًا حتى تغيير
// المظهر التالي فقط. العلاقة أحادية الاتجاه (المظهر -> الطبقة) ولا شيء يعيد
// كتابة المظهر، لذلك لا توجد حلقة تحديث.
watch(
  () => settingsState.theme,
  (theme) => {
    mapPreferencesState.baseLayer = theme === "dark" ? "dark" : "osm";
  }
);

export function setBaseLayer(name) {
  mapPreferencesState.baseLayer = name;
}
