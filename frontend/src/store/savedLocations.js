import { reactive } from "vue";
import httpClient from "../services/httpClient";

// =============================================================
// Saved locations tied to the token's user, backed by Spring Boot
// (GET/POST/PUT/DELETE /api/locations). No local storage here —
// every read/write goes through httpClient, and the backend is the source of truth.
//
// The backend model has no address/originalName/createdAt, so we don't keep
// them here. category is an optional (nullable) backend field with nine
// allowed values (religious/education/health/food/fuel/shop/office/residential/generic);
// locations saved before this field existed return null, so we normalize that to "generic" locally.
// (latitude/longitude from the backend map to lat/lng here to avoid renaming
// dozens of references in MapView.vue).
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

// Stable comparison using rounded coordinates to prevent near-duplicate locations
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

// Updates an existing saved location (name/description/category only) without
// changing its coordinates — current lat/lng are always resent since the
// backend replaces all fields on PUT
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
