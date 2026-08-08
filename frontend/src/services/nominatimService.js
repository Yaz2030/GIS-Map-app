// =============================================================
// خدمة معزولة للاتصال بـ Nominatim: عكس الترميز الجغرافي (تفاصيل عنوان نقطة
// على الخريطة، مثل بوب-أب الموقع) + دالة بحث نصي بسيطة تُستخدم فقط كمصدر
// احتياطي من ../services/placesService.js عندما يرجّع Foursquare نتائج
// فاضية/قليلة جدًا (مفيد خصوصًا للمدن/المناطق الجغرافية الواسعة التي لا
// يغطيها Foursquare أصلاً، المخصص للأماكن التجارية). Foursquare عبر الباك
// اند يبقى المصدر الأساسي للبحث لأن بيانات Nominatim محدودة، خصوصًا للفنادق
// والمحلات.
//
// ملاحظة: لا يمكن ضبط رأس User-Agent من fetch داخل المتصفح لأنه
// من الرؤوس المحجوزة (forbidden header) والمتصفحات تتجاهله أو
// تمنعه، لذلك لا نحاول تعيينه هنا.
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

// بحث بسيط بطلب واحد (بلا إعادة محاولات أو ترتيب نتائج) — يكفي دور الاحتياط
// الذي تستخدمه به placesService.js
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

// عنوان كامل من حقول addressdetails الخاصة بـ Nominatim: الحي، الشارع،
// المدينة، الدولة (اسم المكان نفسه يُعرض بشكل منفصل كعنوان بارز بالبوب-أب،
// فلا يُكرَّر هنا). ملاحظة: neighbourhood/suburb ليست مضمونة التوفر دائمًا
// من الـ API — نعتمد على ما هو متاح فعليًا فقط دون افتراض قيم ثابتة
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
