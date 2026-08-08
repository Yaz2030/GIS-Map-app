// يشتق تصنيف مبسط للمكان من حقول Nominatim (class/type) لاختيار الأيقونة المناسبة
const TYPE_RULES = [
  { category: "religious", types: ["place_of_worship", "mosque", "church", "temple", "synagogue"] },
  { category: "education", types: ["school", "university", "college", "kindergarten", "library"] },
  { category: "health", types: ["hospital", "clinic", "doctors", "pharmacy", "dentist"] },
  { category: "food", types: ["restaurant", "cafe", "fast_food", "bar", "pub", "food_court"] },
  { category: "fuel", types: ["fuel", "charging_station"] },
  { category: "shop", types: ["mall", "marketplace", "supermarket", "department_store"] },
  { category: "office", types: ["office", "company", "commercial", "coworking_space"] },
  { category: "residential", types: ["house", "residential", "apartments", "dormitory"] },
];

const CLASS_RULES = [
  { category: "shop", classes: ["shop"] },
  { category: "office", classes: ["office"] },
  { category: "health", classes: ["healthcare"] },
];

export function getCategory(item) {
  if (!item) return "generic";

  const type = (item.type || "").toLowerCase();
  const cls = (item.class || item.category || "").toLowerCase();

  for (const rule of TYPE_RULES) {
    if (rule.types.includes(type)) return rule.category;
  }

  for (const rule of CLASS_RULES) {
    if (rule.classes.includes(cls)) return rule.category;
  }

  return "generic";
}

const CATEGORY_ICONS = {
  religious: "category-religious",
  office: "category-office",
  education: "category-education",
  health: "category-health",
  food: "category-food",
  fuel: "category-fuel",
  shop: "category-shop",
  residential: "category-residential",
  generic: "map-pin",
};

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.generic;
}

// المجموعة القابلة للاختيار يدويًا بنموذج حفظ الموقع — يجب أن تطابق تمامًا
// القيم المسموحة بالباك اند (Location.category @Pattern)، وإلا يرفض الحفظ
// بخطأ validation.location.category.invalid
export const SELECTABLE_CATEGORIES = [
  "generic",
  "religious",
  "education",
  "health",
  "food",
  "fuel",
  "shop",
  "office",
  "residential",
];

export function getCategoryLabelKey(category) {
  return `categories.${category in CATEGORY_ICONS ? category : "generic"}`;
}
