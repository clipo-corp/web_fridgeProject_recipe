const labels: Record<string, string> = {
  beginner: "초보",
  easy: "쉬움",
  intermediate: "보통",
  advanced: "어려움",
  master: "고급",
  dessert: "디저트",
  "main-dish": "메인",
  "side-dish": "반찬",
  "soup-stew": "국물",
  soup: "수프",
  drink: "음료",
  "rice-porridge": "밥/죽",
  "noodle-dumpling": "면/만두",
  salad: "샐러드",
  bread: "빵",
  chinese: "중식",
  korean: "한식",
  japanese: "일식",
  french: "프렌치",
  italian: "이탈리안",
  indian: "인도",
  global: "글로벌",
};

export function labelFor(value: string): string {
  return labels[value] ?? value;
}

export function recipeInitial(title: string): string {
  return title.trim().slice(0, 1) || "F";
}
