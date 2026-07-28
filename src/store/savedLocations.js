import { reactive } from "vue";

// نموذج البيانات هنا مطابق لما سيُخزَّن لاحقًا عبر Spring Boot:
// { id, name, originalName, address, description, lat, lng, category, icon, createdAt, updatedAt }
const STORAGE_KEY = "mapapp.savedLocations";

// الموقع الافتراضي (شركة واكب) يظهر أول مرة فقط حتى يبقى السلوك
// السابق كما هو؛ إن حذفه المستخدم فلن يُعاد تلقائيًا لاحقًا
const DEFAULT_LOCATIONS = [
  {
    id: "loc_wakeb_default",
    name: "شركة واكب",
    address: "",
    lat: 24.8162,
    lng: 46.645666,
    category: "office",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

// يضمن أن السجلات القديمة (المحفوظة قبل إضافة الوصف/الأيقونة/الاسم الأصلي/
// تاريخ التحديث) تُحمَّل بقيم افتراضية منطقية دون فقدان أي بيانات موجودة
function normalizeItem(raw) {
  const category = raw.category || "generic";
  return {
    id: raw.id,
    name: raw.name || "",
    originalName: raw.originalName || raw.name || "",
    address: raw.address || "",
    description: raw.description || "",
    lat: raw.lat,
    lng: raw.lng,
    category,
    icon: raw.icon || category,
    createdAt: raw.createdAt || new Date(0).toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date(0).toISOString(),
  };
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_LOCATIONS.map(normalizeItem);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(normalizeItem);
  } catch (err) {
    console.error("Failed to read saved locations from storage:", err);
  }
  return [];
}

export const savedLocationsState = reactive({
  items: loadInitial(),
});

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocationsState.items));
  } catch (err) {
    console.error("Failed to persist saved locations:", err);
  }
}

// مقارنة ثابتة باستخدام إحداثيات مقربة لمنع تكرار نفس الموقع تقريبًا
export function coordKey(lat, lng) {
  return `${Number(lat).toFixed(5)}_${Number(lng).toFixed(5)}`;
}

export function findSavedByCoords(lat, lng) {
  const key = coordKey(lat, lng);
  return savedLocationsState.items.find((item) => coordKey(item.lat, item.lng) === key) || null;
}

export function saveLocation(place) {
  const existing = findSavedByCoords(place.lat, place.lng);
  if (existing) {
    return { success: false, duplicate: true, item: existing };
  }

  const now = new Date().toISOString();
  const category = place.category || "generic";
  const item = {
    id: `loc_${coordKey(place.lat, place.lng)}_${Date.now()}`,
    name: place.name,
    originalName: place.originalName || place.name || "",
    address: place.address || "",
    description: place.description || "",
    lat: place.lat,
    lng: place.lng,
    category,
    icon: category,
    createdAt: now,
    updatedAt: now,
  };

  savedLocationsState.items.push(item);
  persist();
  return { success: true, duplicate: false, item };
}

// تعديل موقع محفوظ حالي (الاسم/التصنيف/الوصف فقط) دون تغيير إحداثياته
export function updateLocation(id, patch) {
  const item = savedLocationsState.items.find((entry) => entry.id === id);
  if (!item) return false;

  if (patch.name !== undefined) item.name = patch.name;
  if (patch.description !== undefined) item.description = patch.description;
  if (patch.category !== undefined) {
    item.category = patch.category;
    item.icon = patch.category;
  }
  item.updatedAt = new Date().toISOString();

  persist();
  return true;
}

export function deleteLocation(id) {
  const index = savedLocationsState.items.findIndex((item) => item.id === id);
  if (index !== -1) {
    savedLocationsState.items.splice(index, 1);
    persist();
    return true;
  }
  return false;
}

export function deleteLocationByCoords(lat, lng) {
  const item = findSavedByCoords(lat, lng);
  if (item) return deleteLocation(item.id);
  return false;
}
