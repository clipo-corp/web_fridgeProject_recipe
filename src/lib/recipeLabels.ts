import type { Lang } from "./translations";

type LabelMap = Record<string, string>;

const labelsKo: LabelMap = {
  beginner: "초급",
  easy: "쉬움",
  intermediate: "보통",
  advanced: "고급",
  master: "마스터",

  dessert: "디저트",
  salad: "샐러드",
  "snack-cookie": "과자·쿠키",
  "noodle-dumpling": "면·만두",
  stew: "찜·조림",
  bread: "빵",
  "main-dish": "메인요리",
  "rice-porridge": "밥·죽",
  "sauce-jam": "소스·잼",
  soup: "수프",
  "side-dish": "반찬",
  "drink-alcohol": "음료·주류",
  "soup-stew": "국·탕",
  "kimchi-paste": "김치·장",

  chinese: "중식",
  korean: "한식",
  japanese: "일식",
  french: "프렌치",
  italian: "이탈리안",
  indian: "인도",
  global: "글로벌",

  drink: "음료",
  everyday: "일상",
  guest: "손님상",
  healthy: "건강",
  holiday: "명절",
  premium: "프리미엄",
  quick: "간편",
  snack: "간식",
  "side-dish-alcohol": "안주",

  blanch: "데치기",
  boil: "끓이기",
  braise: "조림",
  "deep-fry": "튀기기",
  grill: "굽기",
  mix: "무치기",
  pickled: "절임",
  "pan-fry": "팬프라이",
  raw: "생식",
  simmer: "약불 조리",
  steam: "찜",
  "stir-fry": "볶기",

  baking: "베이킹",
  "no-cook": "불 없이",
  "one-pan": "원팬",

  "high-protein": "고단백",
  light: "가벼운 식사",
  standard: "일반",
  "gluten-free": "글루텐프리",
  "lactose-free": "락토프리",
  none: "제한 없음",
  vegan: "비건(완전 채식)",
  lacto_ovo: "락토오보",
  pescatarian: "페스코",
  halal: "할랄",

  blender: "블렌더",
  bowl: "볼",
  "no-tool": "도구 없음",
  oven: "오븐",
  pan: "팬",
  pot: "냄비",
  "rice-cooker": "밥솥",

  ko: "한국어",
  en: "영어",
  local: "현지명",
  original: "원문",
  hot_month: "이번 달 인기",

  "bean-nut": "콩·견과",
  beef: "소고기",
  chicken: "닭고기",
  "dairy-egg": "유제품·달걀",
  flour: "밀가루",
  fruits: "과일",
  grains: "곡물",
  meat: "육류",
  pork: "돼지고기",
  processed: "가공식품",
  rice: "쌀",
  seafood: "해산물",
  vegetable: "채소",
  ingredient: "재료",
};

const labelsEn: LabelMap = {
  beginner: "Beginner",
  easy: "Easy",
  intermediate: "Intermediate",
  advanced: "Advanced",
  master: "Master",

  dessert: "Dessert",
  salad: "Salad",
  "snack-cookie": "Snack/Cookie",
  "noodle-dumpling": "Noodle/Dumpling",
  stew: "Braised",
  bread: "Bread",
  "main-dish": "Main Dish",
  "rice-porridge": "Rice/Porridge",
  "sauce-jam": "Sauce/Jam",
  soup: "Soup",
  "side-dish": "Side Dish",
  "drink-alcohol": "Drink/Alcohol",
  "soup-stew": "Soup/Stew",
  "kimchi-paste": "Kimchi/Paste",

  chinese: "Chinese",
  korean: "Korean",
  japanese: "Japanese",
  french: "French",
  italian: "Italian",
  indian: "Indian",
  global: "Global",

  drink: "Drink",
  everyday: "Everyday",
  guest: "Guests",
  healthy: "Healthy",
  holiday: "Holiday",
  premium: "Premium",
  quick: "Quick",
  snack: "Snack",
  "side-dish-alcohol": "Drinks pairing",

  blanch: "Blanch",
  boil: "Boil",
  braise: "Braise",
  "deep-fry": "Deep-fry",
  grill: "Grill",
  mix: "Mix",
  pickled: "Pickle",
  "pan-fry": "Pan-fry",
  raw: "Raw",
  simmer: "Simmer",
  steam: "Steam",
  "stir-fry": "Stir-fry",

  baking: "Baking",
  "no-cook": "No-cook",
  "one-pan": "One-pan",

  "high-protein": "High protein",
  light: "Light",
  standard: "Standard",
  "gluten-free": "Gluten-free",
  "lactose-free": "Lactose-free",
  none: "None",
  vegan: "Vegan",
  lacto_ovo: "Vegetarian (lacto-ovo)",
  pescatarian: "Pescatarian (plant-based + seafood)",
  halal: "Halal",

  blender: "Blender",
  bowl: "Bowl",
  "no-tool": "No tool",
  oven: "Oven",
  pan: "Pan",
  pot: "Pot",
  "rice-cooker": "Rice cooker",

  ko: "Korean",
  en: "English",
  local: "Local names",
  original: "Original",
  hot_month: "Hot this month",

  "bean-nut": "Bean/Nut",
  beef: "Beef",
  chicken: "Chicken",
  "dairy-egg": "Dairy/Egg",
  flour: "Flour",
  fruits: "Fruits",
  grains: "Grains",
  meat: "Meat",
  pork: "Pork",
  processed: "Processed",
  rice: "Rice",
  seafood: "Seafood",
  vegetable: "Vegetable",
  ingredient: "Ingredient",
};

const countryKo: LabelMap = {
  China: "중국",
  France: "프랑스",
  India: "인도",
  Italy: "이탈리아",
  Japan: "일본",
  Korea: "한국",
  America: "미국",
  USA: "미국",
  "United States": "미국",
  "United States of America": "미국",
  Global: "글로벌",
};

const countryEn: LabelMap = {
  China: "China",
  France: "France",
  India: "India",
  Italy: "Italy",
  Japan: "Japan",
  Korea: "Korea",
  America: "United States",
  USA: "United States",
  "United States": "United States",
  "United States of America": "United States",
  Global: "Global",
};

const timeKo: LabelMap = {
  "5min": "5분",
  "10min": "10분",
  "20min": "20분",
  "30min": "30분",
  "45min": "45분",
  "1h+": "1시간+",
};

const timeEn: LabelMap = {
  "5min": "5 min",
  "10min": "10 min",
  "20min": "20 min",
  "30min": "30 min",
  "45min": "45 min",
  "1h+": "1h+",
};

const labelMaps: Record<Lang, LabelMap> = { ko: labelsKo, en: labelsEn };
const countryMaps: Record<Lang, LabelMap> = { ko: countryKo, en: countryEn };
const timeMaps: Record<Lang, LabelMap> = { ko: timeKo, en: timeEn };
const primaryIngredientValues = [
  "bean-nut",
  "beef",
  "chicken",
  "dairy-egg",
  "flour",
  "fruits",
  "grains",
  "meat",
  "pork",
  "processed",
  "rice",
  "seafood",
  "vegetable",
] as const;

/*
 * `dietaryRestriction` is the recipe author/catalog's own restriction, not the server's
 * verified `dietFilter`. The web has no verified diet filter or diet profile surface.
 * Only the filter state's legacy `vegetarian` is normalized to `vegan`; a recipe's author
 * tag/evidence is never promoted to a verified diet. GF/LF and new codes are not selectable.
 */
const legacyDietaryRestrictionFilterAliases: Record<string, string> = {
  vegetarian: "vegan",
  gluten_free: "gluten-free",
  lactose_free: "lactose-free",
};

/** Author-tag values the web may offer. GF/LF and deprecated/new values stay out. */
const selectableDietaryRestrictionValues = new Set(["vegan", "halal", "none"]);

const deprecatedAuthorDietLabels: Record<Lang, string> = {
  ko: "채식(작성자 태그·미검증)",
  en: "Vegetarian (author tag, unverified)",
};

/** A selected filter value the current web/server cannot execute. Never treated as `all`. */
export class UnsupportedDietFilterError extends Error {
  override readonly name = "UnsupportedDietFilterError";

  constructor(readonly value: string) {
    super(`unsupported dietaryRestriction filter: ${value}`);
  }
}

/** Read only own keys; inherited names such as __proto__ must never become a label/filter. */
function ownLabelValue(map: LabelMap, key: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
}

/** Normalize only the filter/URL legacy value; never a recipe's author tag. */
export function normalizeDietaryRestrictionFilterValue(value: string): string {
  return ownLabelValue(legacyDietaryRestrictionFilterAliases, value) ?? value;
}

/** Whether the selected filter can be executed (legacy `vegetarian` counts as `vegan`). */
export function isSupportedDietaryRestrictionValue(value: string): boolean {
  if (value === "all") {
    return true;
  }
  return selectableDietaryRestrictionValues.has(normalizeDietaryRestrictionFilterValue(value));
}

/**
 * The value to send as `dietaryRestriction`.
 * `all`/absent means no filter (`null`); anything else must be executable or this throws,
 * so HTTP/mock paths never fall back to an unfiltered run.
 */
export function normalizeDietaryRestrictionRequestValue(value: string | null): string | null {
  if (value === null || value.length === 0 || value === "all") {
    return null;
  }
  const normalized = normalizeDietaryRestrictionFilterValue(value);
  if (selectableDietaryRestrictionValues.has(normalized)) {
    return normalized;
  }
  throw new UnsupportedDietFilterError(value);
}

/** The chip value to show. Unsupported values are preserved, never rewritten to `all`. */
export function selectedDietaryRestrictionValue(value: string): string {
  return value === "all" ? "all" : normalizeDietaryRestrictionFilterValue(value);
}

/** The selectable options; the selected value never adds a hidden GF/LF/author value back. */
export function selectableDietaryRestrictionOptions(values: readonly string[]): readonly string[] {
  const options: string[] = [];
  for (const value of values) {
    if (value.length === 0 || options.includes(value)) {
      continue;
    }
    if (selectableDietaryRestrictionValues.has(value)) {
      options.push(value);
    }
  }
  return options;
}

export function labelFor(value: string, lang: Lang): string {
  if (value === "vegetarian") {
    return deprecatedAuthorDietLabels[lang];
  }
  const normalized = value === "gluten_free"
    ? "gluten-free"
    : value === "lactose_free"
      ? "lactose-free"
      : value;
  return ownLabelValue(labelMaps[lang], normalized) ?? normalized;
}

export function countryLabel(value: string, lang: Lang): string {
  return ownLabelValue(countryMaps[lang], value) ?? value;
}

export function timeLabel(value: string, lang: Lang): string {
  return ownLabelValue(timeMaps[lang], value) ?? value;
}

export function primaryIngredientValueForSearchText(input: string): string | null {
  const normalizedInput = normalizeLabel(input);
  if (normalizedInput.length === 0) {
    return null;
  }

  for (const value of primaryIngredientValues) {
    const candidates = [
      value,
      labelsKo[value],
      labelsEn[value],
      ...primaryIngredientAliases[value],
    ];
    if (candidates.some((candidate) => normalizeLabel(candidate) === normalizedInput)) {
      return value;
    }
  }

  return null;
}

export function recipeInitial(title: string): string {
  return title.trim().slice(0, 1) || "F";
}

const primaryIngredientAliases: Record<(typeof primaryIngredientValues)[number], readonly string[]> = {
  "bean-nut": ["콩", "견과", "콩류", "bean", "nut"],
  beef: ["소고기", "쇠고기", "beef"],
  chicken: ["닭", "닭고기", "치킨", "chicken", "poultry"],
  "dairy-egg": ["달걀", "계란", "유제품", "egg", "dairy"],
  flour: ["밀가루", "flour"],
  fruits: ["과일", "fruit", "fruits"],
  grains: ["곡물", "grain", "grains"],
  meat: ["고기", "육류", "meat"],
  pork: ["돼지고기", "pork"],
  processed: ["가공식품", "가공", "processed"],
  rice: ["밥", "쌀", "rice"],
  seafood: ["해산물", "seafood"],
  vegetable: ["채소", "야채", "vegetable", "vegetables"],
};

function normalizeLabel(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, "").toLocaleLowerCase("ko-KR");
}
