export const filterEmoji: Record<string, string> = {
  /* cuisine region */
  korean: "🇰🇷",
  japanese: "🇯🇵",
  chinese: "🇨🇳",
  french: "🇫🇷",
  italian: "🇮🇹",
  indian: "🇮🇳",
  global: "🌍",

  /* country */
  Korea: "🇰🇷",
  Japan: "🇯🇵",
  China: "🇨🇳",
  France: "🇫🇷",
  Italy: "🇮🇹",
  India: "🇮🇳",
  Global: "🌍",

  /* cooking time */
  "5min": "⚡",
  "10min": "🕐",
  "20min": "🕑",
  "30min": "🕒",
  "45min": "🕓",
  "1h+": "⏰",

  /* difficulty */
  easy: "😊",
  beginner: "🌱",
  intermediate: "⭐",
  advanced: "🔥",
  master: "👑",

  /* recipe type */
  everyday: "🍽️",
  quick: "⚡",
  healthy: "🥗",
  premium: "✨",
  snack: "🍿",
  drink: "🥤",

  /* category */
  "snack-cookie": "🍪",
  "soup-stew": "🍲",
  "kimchi-paste": "🌶️",
  dessert: "🍰",
  "main-dish": "🍽️",
  "noodle-dumpling": "🍜",
  "side-dish": "🥘",
  "rice-porridge": "🍚",
  bread: "🍞",
  salad: "🥗",
  soup: "🍜",
  "sauce-jam": "🫙",
  stew: "🍲",
  "drink-alcohol": "🍺",

  /* primary ingredient */
  processed: "🏭",
  grains: "🌾",
  fruits: "🍎",
  "dairy-egg": "🥚",
  chicken: "🍗",
  pork: "🥩",
  flour: "🌾",
  beef: "🥩",
  rice: "🍚",
  meat: "🥩",
  vegetable: "🥦",
  "bean-nut": "🫘",
  seafood: "🦐",
};

const timeOrder = ["5min", "10min", "20min", "30min", "45min", "1h+"];
const difficultyOrder = ["beginner", "easy", "intermediate", "advanced", "master"];

export function emojiFor(value: string): string {
  return filterEmoji[value] ?? "";
}

export function orderTime(values: readonly string[]): readonly string[] {
  return [...values].sort((a, b) => rank(timeOrder, a) - rank(timeOrder, b));
}

export function orderDifficulty(values: readonly string[]): readonly string[] {
  return [...values].sort((a, b) => rank(difficultyOrder, a) - rank(difficultyOrder, b));
}

function rank(order: readonly string[], value: string): number {
  const index = order.indexOf(value);
  return index === -1 ? order.length : index;
}
