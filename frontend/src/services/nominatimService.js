// =============================================================
// خدمة معزولة للاتصال بـ Nominatim (بحث + عكس الترميز الجغرافي).
// عند توفر Spring Boot لاحقًا يمكن استبدال هذه الدوال بطلبات
// موجهة إلى الخادم الخاص بنا (proxy) دون تغيير بقية الواجهة.
//
// ملاحظة: لا يمكن ضبط رأس User-Agent من fetch داخل المتصفح لأنه
// من الرؤوس المحجوزة (forbidden header) والمتصفحات تتجاهله أو
// تمنعه، لذلك لا نحاول تعيينه هنا.
// =============================================================

import { getCategory } from "../utils/placeCategory";

const BASE_URL = import.meta.env.VITE_NOMINATIM_API || "https://nominatim.openstreetmap.org";

// نتيجة تُعتبر "ضعيفة" إذا كانت قليلة العدد وبلا أي تطابق ذي أهمية معقولة،
// عندها نوسّع نطاق البحث تلقائيًا بدل الاكتفاء بنتائج غير مفيدة
const WEAK_IMPORTANCE_THRESHOLD = 0.35;
const WEAK_RESULT_COUNT = 3;

export async function reverseGeocode(lat, lng, language = "ar") {
  const url = `${BASE_URL}/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1&accept-language=${encodeURIComponent(language)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Reverse geocoding failed with status ${res.status}`);
  }
  return res.json();
}

// trim + طيّ المسافات المتكررة فقط، دون حذف أي أحرف عربية أو إنجليزية ذات معنى
function normalizeQuery(query) {
  return (query || "").trim().replace(/\s+/g, " ");
}

function isShortQuery(query) {
  return query.length <= 30 && query.split(" ").length <= 4;
}

async function runSearch(query, language, limit, extraParams = {}) {
  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    namedetails: "1",
    extratags: "1",
    dedupe: "1",
    bounded: "0",
    limit: String(limit),
    "accept-language": language,
    q: query,
    ...extraParams,
  });

  const res = await fetch(`${BASE_URL}/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Search failed with status ${res.status}`);
  }
  return res.json();
}

function resultKey(item) {
  if (item.place_id !== undefined && item.place_id !== null) return `pid_${item.place_id}`;
  return `coord_${Number(item.lat).toFixed(5)}_${Number(item.lon).toFixed(5)}`;
}

function mergeResults(map, results) {
  for (const item of results) {
    const key = resultKey(item);
    if (!map.has(key)) map.set(key, item);
  }
}

function isWeak(results) {
  if (!results.length) return true;
  if (results.length >= WEAK_RESULT_COUNT) return false;
  const topImportance = Math.max(...results.map((item) => Number(item.importance) || 0));
  return topImportance < WEAK_IMPORTANCE_THRESHOLD;
}

function scoreResult(item, normalizedQuery) {
  let score = Number(item.importance) || 0;

  // place_rank أصغر = كيان أكثر أهمية/شهرة (دولة/مدينة) مقارنة بمبنى صغير
  if (item.place_rank !== undefined) {
    score += Math.max(0, (30 - Number(item.place_rank)) / 100);
  }

  const primaryName = (item.namedetails?.name || item.name || item.display_name || "").toLowerCase();
  const query = normalizedQuery.toLowerCase();
  if (primaryName === query) score += 0.5;
  else if (primaryName.startsWith(query)) score += 0.25;
  else if (primaryName.includes(query)) score += 0.1;

  if ((item.address?.country_code || "").toLowerCase() === "sa") score += 0.15;

  return score;
}

function rankResults(results, normalizedQuery) {
  return [...results].sort((a, b) => scoreResult(b, normalizedQuery) - scoreResult(a, normalizedQuery));
}

export async function searchPlaces(query, language = "ar", limit = 10) {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const merged = new Map();

  // 1) داخل السعودية أولًا
  const saResults = await runSearch(normalized, language, limit, { countrycodes: "sa" });
  mergeResults(merged, saResults);

  // 2) نتائج ضعيفة أو معدومة => إعادة المحاولة عالميًا تلقائيًا
  if (isWeak(Array.from(merged.values()))) {
    const globalResults = await runSearch(normalized, language, limit);
    mergeResults(merged, globalResults);
  }

  // 3) ما زالت ضعيفة وطلب البحث قصير (يشبه اسم منشأة/عمل) => نحاول مرة واحدة
  //    إضافية بإلحاق اسم السعودية لمساعدة نوميناتيم على تحديد النطاق الجغرافي
  if (isWeak(Array.from(merged.values())) && isShortQuery(normalized)) {
    const regionSuffix = language === "en" ? "Saudi Arabia" : "السعودية";
    const regionResults = await runSearch(`${normalized} ${regionSuffix}`, language, limit);
    mergeResults(merged, regionResults);
  }

  return rankResults(Array.from(merged.values()), normalized);
}

export function buildShortAddress(item) {
  if (!item) return "";
  const addr = item.address || {};

  const parts = [
    addr.road || addr.neighbourhood || addr.suburb,
    addr.city || addr.town || addr.village || addr.county,
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
    address: buildShortAddress(item),
    category: getCategory(item),
    displayName: item.display_name || "",
  };
}
