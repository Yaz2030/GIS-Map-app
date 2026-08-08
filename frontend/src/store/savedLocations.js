import { reactive } from "vue";
import httpClient from "../services/httpClient";

// =============================================================
// مواقع محفوظة حقيقية مرتبطة بالمستخدم صاحب التوكن، عبر Spring Boot
// (GET/POST/PUT/DELETE /api/locations). لا يوجد أي تخزين محلي هنا —
// كل قراءة/كتابة تمر عبر httpClient، والباك اند هو مصدر الحقيقة الوحيد.
//
// نموذج الباك اند لا يحتوي على address/originalName/createdAt، لذا لا نحتفظ
// بها هنا. category حقل اختياري (nullable) بالباك اند بتسع قيم مسموحة فقط
// (religious/education/health/food/fuel/shop/office/residential/generic)؛
// المواقع القديمة قبل إضافته تُرجعه null، فنطبّعه محليًا إلى "generic".
// (latitude/longitude من الباك اند تُطابق lat/lng هنا لتفادي إعادة تسمية
// عشرات المراجع بـ MapView.vue).
// =============================================================

export const savedLocationsState = reactive({
  items: [],
  loading: false,
  loaded: false,
});

function mapFromApi(loc) {
  return {
    id: loc.id,
    name: loc.name,
    lat: loc.latitude,
    lng: loc.longitude,
    description: loc.description || "",
    category: loc.category || "generic",
  };
}

// مقارنة ثابتة باستخدام إحداثيات مقربة لمنع تكرار نفس الموقع تقريبًا
export function coordKey(lat, lng) {
  return `${Number(lat).toFixed(5)}_${Number(lng).toFixed(5)}`;
}

export function findSavedByCoords(lat, lng) {
  const key = coordKey(lat, lng);
  return savedLocationsState.items.find((item) => coordKey(item.lat, item.lng) === key) || null;
}

export async function fetchSavedLocations() {
  savedLocationsState.loading = true;
  try {
    const { data } = await httpClient.get("/api/locations");
    savedLocationsState.items = (data || []).map(mapFromApi);
  } finally {
    savedLocationsState.loading = false;
    savedLocationsState.loaded = true;
  }
}

export function clearSavedLocations() {
  savedLocationsState.items = [];
  savedLocationsState.loaded = false;
}

export async function saveLocation({ name, lat, lng, description, category }) {
  const existing = findSavedByCoords(lat, lng);
  if (existing) {
    return { success: false, duplicate: true, item: existing };
  }

  const { data } = await httpClient.post("/api/locations", {
    name,
    latitude: lat,
    longitude: lng,
    description: description || "",
    category: category || "generic",
  });

  const item = mapFromApi(data);
  savedLocationsState.items.push(item);
  return { success: true, duplicate: false, item };
}

// تعديل موقع محفوظ حالي (الاسم/الوصف/التصنيف فقط) دون تغيير إحداثياته — يُعاد
// إرسال lat/lng الحاليين دائمًا لأن الباك اند يستبدل الحقول بالكامل عند PUT
export async function updateLocation(id, patch) {
  const item = savedLocationsState.items.find((entry) => entry.id === id);
  if (!item) return false;

  const { data } = await httpClient.put(`/api/locations/${id}`, {
    name: patch.name !== undefined ? patch.name : item.name,
    latitude: item.lat,
    longitude: item.lng,
    description: patch.description !== undefined ? patch.description : item.description,
    category: patch.category !== undefined ? patch.category : item.category,
  });

  Object.assign(item, mapFromApi(data));
  return true;
}

export async function deleteLocation(id) {
  const index = savedLocationsState.items.findIndex((item) => item.id === id);
  if (index === -1) return false;

  await httpClient.delete(`/api/locations/${id}`);
  savedLocationsState.items.splice(index, 1);
  return true;
}

export async function deleteLocationByCoords(lat, lng) {
  const item = findSavedByCoords(lat, lng);
  if (!item) return false;
  return deleteLocation(item.id);
}
