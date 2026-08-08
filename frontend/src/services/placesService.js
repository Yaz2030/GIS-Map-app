// =============================================================
// Place search: Foursquare (via backend GET /api/places/search) first since
// it's more accurate for businesses (hotels, shops, restaurants...), with
// automatic fallback to Nominatim when Foursquare returns empty or too few
// results — especially for cities and large geographic areas that Foursquare
// doesn't cover (it targets businesses, not geographic entities). Reverse
// geocoding and popup address details stay on Nominatim (./nominatimService.js).
// =============================================================

import httpClient from "./httpClient";
import { searchPlaces as searchNominatim, normalizePlace as normalizeNominatimResult } from "./nominatimService";
import { currentLanguage } from "../i18n";

// Minimum number of Foursquare results considered "enough" to skip the
// extra Nominatim call (avoids unnecessary latency when Foursquare already suffices)
const MIN_RESULTS_BEFORE_FALLBACK = 2;

// Converts a backend PlaceSearchResult (name/address/latitude/longitude) into
// the shape expected by the search results and map UI (lat/lng/name/address/category).
// This source has no category, so it's left as "generic" — getCategoryIcon
// automatically shows the generic pin icon, the same fallback used elsewhere
// in the app when a category is missing
export function normalizePlaceResult(item) {
  return {
    lat: item.latitude,
    lng: item.longitude,
    name: item.name || "",
    address: item.address || "",
    category: "generic",
    displayName: item.address ? `${item.name}, ${item.address}` : item.name || "",
  };
}

async function searchFoursquare(query, { lat, lon } = {}) {
  const params = { query };
  if (lat !== undefined && lat !== null) params.lat = lat;
  if (lon !== undefined && lon !== null) params.lon = lon;

  const { data } = await httpClient.get("/api/places/search", { params });
  return (data || []).map(normalizePlaceResult);
}

async function searchFallback(query) {
  const data = await searchNominatim(query, currentLanguage());
  return data.map((item) => normalizeNominatimResult(item));
}

function coordKey(lat, lng) {
  return `${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}`;
}

// Adds Nominatim results without duplicating what's already present from
// Foursquare at roughly the same location (the two sources sometimes use
// different precision/reference points for the same place, so this rounding
// is looser than coordinate comparisons within a single source)
function mergeUnique(primary, extra) {
  const seen = new Set(primary.map((item) => coordKey(item.lat, item.lng)));
  return [...primary, ...extra.filter((item) => !seen.has(coordKey(item.lat, item.lng)))];
}

export async function searchPlaces(query, { lat, lon } = {}) {
  let foursquareResults = [];
  let foursquareFailed = false;

  try {
    foursquareResults = await searchFoursquare(query, { lat, lon });
  } catch (err) {
    console.error("Foursquare search failed, falling back to Nominatim:", err);
    foursquareFailed = true;
  }

  if (!foursquareFailed && foursquareResults.length >= MIN_RESULTS_BEFORE_FALLBACK) {
    return foursquareResults;
  }

  try {
    const fallbackResults = await searchFallback(query);
    return mergeUnique(foursquareResults, fallbackResults);
  } catch (err) {
    if (foursquareFailed) throw err; // Both sources failed: let the error surface to the UI
    console.error("Nominatim fallback search failed:", err);
    return foursquareResults; // Foursquare succeeded (just with few results), show as-is
  }
}
