import type { PublicRecipeRecord } from "./recipeCatalogTypes";

const cannoliRecipeId = "seed_italy_dessert_cannoli_classic_cannoli";

const ingredientDescriptions = [
  "껍질 반죽의 뼈대가 되는 기본 가루입니다.",
  "",
  "시칠리아식 바삭한 식감을 내는 지방 재료입니다.",
  "반죽에 향과 산뜻한 풍미를 더합니다.",
  "",
  "반죽을 더 얇고 바삭하게 돕습니다.",
] as const;

const stepTips = [
  "리코타 물기를 충분히 빼야 크림이 묽어지지 않습니다.",
  null,
  "얇을수록 튀긴 뒤 더 경쾌하게 부서집니다.",
  null,
  "껍질이 완전히 식은 뒤 채워야 눅눅해지지 않습니다.",
  null,
] as const;

export function withCatalogDemoMedia(recipe: PublicRecipeRecord): PublicRecipeRecord {
  if (recipe.recipeId !== cannoliRecipeId) {
    return recipe;
  }

  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient, index) => ({
      ...ingredient,
      description: ingredientDescriptions[index] ?? ingredient.description,
    })),
    steps: recipe.steps.map((step, index) => ({
      ...step,
      cookingTip: stepTips[index] ?? step.cookingTip,
      imageUrl: step.imageUrl ?? demoStepImage(index),
    })),
  };
}

function demoStepImage(index: number): string | null {
  if (index !== 0 && index !== 2 && index !== 4) {
    return null;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#ECFDF5"/><stop offset="1" stop-color="#FDF2F8"/></linearGradient><pattern id="p" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill="#0D8F61" opacity=".14"/></pattern></defs><rect width="640" height="420" rx="34" fill="url(#g)"/><rect width="640" height="420" rx="34" fill="url(#p)"/><circle cx="320" cy="210" r="96" fill="#25262F"/><path d="M286 220c36 34 82 20 92-26M285 186c45-30 84-10 94 24" fill="none" stroke="#7DEBB5" stroke-width="13" stroke-linecap="round"/><text x="320" y="354" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#25262F">Step ${index + 1}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
