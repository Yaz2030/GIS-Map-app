// يحوّل خطوة توجيه من OSRM (maneuver.type/modifier/bearing/exit) إلى نص إرشادي
// مقروء بالعربية أو الإنجليزية، دون الاعتماد على نظام الترجمة العام (t()) لأن
// النصوص هنا مركّبة ديناميكيًا (اتجاه البوصلة، اسم الشارع، رقم مخرج الدوار...).

const COMPASS_AR = [
  "الشمال",
  "الشمال الشرقي",
  "الشرق",
  "الجنوب الشرقي",
  "الجنوب",
  "الجنوب الغربي",
  "الغرب",
  "الشمال الغربي",
];

const COMPASS_EN = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];

function compassDirection(bearing, isAr) {
  if (bearing === null || bearing === undefined) return "";
  const index = Math.round(bearing / 45) % 8;
  return isAr ? COMPASS_AR[index] : COMPASS_EN[index];
}

const MODIFIER_AR = {
  left: "يسارًا",
  right: "يمينًا",
  "slight left": "يسارًا بشكل طفيف",
  "slight right": "يمينًا بشكل طفيف",
  "sharp left": "يسارًا بحدة",
  "sharp right": "يمينًا بحدة",
  straight: "للأمام",
  uturn: "بشكل دائري",
};

const MODIFIER_EN = {
  left: "left",
  right: "right",
  "slight left": "slightly left",
  "slight right": "slightly right",
  "sharp left": "sharply left",
  "sharp right": "sharply right",
  straight: "straight ahead",
  uturn: "around (U-turn)",
};

export function describeStep(step, language = "ar") {
  const isAr = language !== "en";
  const modifierText = step.modifier ? (isAr ? MODIFIER_AR : MODIFIER_EN)[step.modifier] || step.modifier : "";

  switch (step.type) {
    case "depart": {
      const dir = compassDirection(step.bearing, isAr);
      if (!dir) return isAr ? "انطلق" : "Head out";
      return isAr ? `انطلق باتجاه ${dir}` : `Head ${dir}`;
    }

    case "arrive":
      return isAr ? "تم الوصول إلى الوجهة" : "Destination reached";

    case "roundabout":
    case "rotary":
      return step.exit
        ? isAr
          ? `ادخل الدوار واخرج من المخرج ${step.exit}`
          : `Enter the roundabout and take exit ${step.exit}`
        : isAr
          ? "ادخل الدوار"
          : "Enter the roundabout";

    case "off ramp":
    case "exit":
      return isAr ? "اسلك المخرج" : "Take the exit";

    case "turn":
    case "end of road":
    case "fork":
    case "merge":
    case "ramp":
    case "on ramp":
      if (step.modifier === "uturn") return isAr ? "قم بالاستدارة" : "Make a U-turn";
      return isAr ? `انعطف ${modifierText}` : `Turn ${modifierText}`;

    case "continue":
    case "new name":
      return isAr
        ? step.name
          ? `تابع السير على ${step.name}`
          : "تابع السير"
        : step.name
          ? `Continue on ${step.name}`
          : "Continue";

    default:
      return isAr ? "تابع السير" : "Continue";
  }
}

// يختار أيقونة مناسبة (من نظام الأيقونات الحالي AppIcon/iconPaths) لكل نوع مناورة
export function getStepIcon(step) {
  if (step.type === "depart") return "navigation";
  if (step.type === "arrive") return "check-circle";
  if (step.type === "roundabout" || step.type === "rotary") return "refresh";
  if (step.modifier === "uturn") return "arrow-u-turn";
  if (step.modifier === "left" || step.modifier === "slight left" || step.modifier === "sharp left") return "arrow-left";
  if (step.modifier === "right" || step.modifier === "slight right" || step.modifier === "sharp right") return "arrow-right";
  return "arrow-up";
}
