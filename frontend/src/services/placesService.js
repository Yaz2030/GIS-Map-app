// =============================================================
// بحث الأماكن: Foursquare (عبر الباك اند GET /api/places/search) أولاً لأنه
// أدق للأماكن التجارية (فنادق، محلات، مطاعم...)، مع رجوع تلقائي لـ Nominatim
// كمصدر احتياطي عندما ترجع نتائج Foursquare فاضية أو قليلة جدًا — خصوصًا
// للمدن والمناطق الجغرافية الواسعة التي لا يغطيها Foursquare أصلاً (مخصص
// للأماكن التجارية لا الكيانات الجغرافية). عكس الترميز الجغرافي وتفاصيل
// العنوان بالبوب-أب يبقيان على Nominatim بلا تغيير (./nominatimService.js).
// =============================================================

import httpClient from "./httpClient";
import { searchPlaces as searchNominatim, normalizePlace as normalizeNominatimResult } from "./nominatimService";
import { currentLanguage } from "../i18n";

// أقل عدد نتائج من Foursquare يُعتبر "كافيًا" لتفادي استدعاء Nominatim
// الإضافي غير الضروري (تبطيء بلا داعٍ لو كانت نتائج Foursquare أصلاً كافية)
const MIN_RESULTS_BEFORE_FALLBACK = 2;

// يحوّل PlaceSearchResult من الباك اند (name/address/latitude/longitude) إلى
// نفس الشكل الذي تتوقعه واجهة نتائج البحث والخريطة (lat/lng/name/address/category).
// لا يوجد تصنيف (category) من هذا المصدر، فتُترك "generic" — يعرضها
// getCategoryIcon تلقائيًا بأيقونة الدبوس العامة، بنفس آلية الرجوع الافتراضية
// المستخدمة أصلاً بباقي التطبيق عند غياب التصنيف
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

// يضيف نتائج Nominatim دون تكرار ما هو موجود أصلاً من Foursquare لنفس
// الموقع تقريبًا (المصدران يستخدمان دقة/نقطة مرجعية مختلفة لنفس المكان
// أحيانًا، لذا التقريب هنا أخف من مقارنة الإحداثيات داخل مصدر واحد)
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
    if (foursquareFailed) throw err; // كلا المصدرين فشلا: نترك الخطأ يظهر بالواجهة
    console.error("Nominatim fallback search failed:", err);
    return foursquareResults; // Foursquare نجح (بنتائج قليلة فقط)، نعرضها كما هي
  }
}
