// =============================================================
// Standalone service for talking to Nominatim: reverse geocoding (address
// details for a map point, e.g. the location popup) + a simple text search
// used only as a fallback from ../services/placesService.js when Foursquare
// returns empty/too few results (useful for cities/large geographic areas
// Foursquare doesn't cover, since it targets businesses). Foursquare via the
// backend stays the primary search source since Nominatim's data is limited,
// especially for hotels and shops.
//
// Note: the User-Agent header can't be set from fetch in the browser since
// it's a forbidden header — browsers ignore or block it, so we don't try to set it here.
// =============================================================

import { getCategory } from "../utils/placeCategory";

const BASE_URL = import.meta.env.VITE_NOMINATIM_API || "https://nominatim.openstreetmap.org";

export async function reverseGeocode(lat, lng, language = "ar") {
  const url = `${BASE_URL}/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1&accept-language=${encodeURIComponent(language)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Reverse geocoding failed with status ${res.status}`);
  }
  return res.json();
}

// Simple single-request search (no retries or result ranking) — enough for
// the fallback role placesService.js uses it for
export async function searchPlaces(query, language = "ar", limit = 8) {
  const trimmed = (query || "").trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    namedetails: "1",
    dedupe: "1",
    limit: String(limit),
    "accept-language": language,
    q: trimmed,
  });

  const res = await fetch(`${BASE_URL}/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Nominatim search failed with status ${res.status}`);
  }
  return res.json();
}

// Full address built from Nominatim's addressdetails fields: neighbourhood,
// street, city, country (the place name itself is shown separately as the
// popup's headline, so it's not repeated here). Note: neighbourhood/suburb
// aren't always present in the API response — we only use what's actually available
export function buildFullAddress(item) {
  if (!item) return "";
  const addr = item.address || {};

  const parts = [
    addr.neighbourhood || addr.suburb,
    addr.road,
    addr.city || addr.town || addr.village || addr.county,
    addr.country,
  ].filter(Boolean);

  if (parts.length) return parts.join(", ");

  if (item.display_name) {
    return item.display_name.split(",").slice(0, 2).join(",").trim();
  }

  return "";
}

export function normalizePlace(item, fallbackLat, fallbackLng) {
  const lat = item.lat !== undefined ? Number(item.lat) : fallbackLat;
  const lng = item.lon !== undefined ? Number(item.lon) : fallbackLng;
  const name = item.name || (item.display_name ? item.display_name.split(",")[0].trim() : "");

  return {
    lat,
    lng,
    name: name || "",
    address: buildFullAddress(item),
    category: getCategory(item),
    displayName: item.display_name || "",
  };
}
