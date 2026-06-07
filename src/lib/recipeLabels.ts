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
  healthy: "건강",
  premium: "프리미엄",
  quick: "간편",
  snack: "간식",

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
  healthy: "Healthy",
  premium: "Premium",
  quick: "Quick",
  snack: "Snack",

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
  Global: "글로벌",
};

const countryEn: LabelMap = {
  China: "China",
  France: "France",
  India: "India",
  Italy: "Italy",
  Japan: "Japan",
  Korea: "Korea",
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

export function labelFor(value: string, lang: Lang): string {
  return labelMaps[lang][value] ?? value;
}

export function countryLabel(value: string, lang: Lang): string {
  return countryMaps[lang][value] ?? value;
}

export function timeLabel(value: string, lang: Lang): string {
  return timeMaps[lang][value] ?? value;
}

export function recipeInitial(title: string): string {
  return title.trim().slice(0, 1) || "F";
}
