import type { RecipeIngredient } from "./recipeCatalogTypes";

export function recipeIngredientEmoji(ingredient: RecipeIngredient): string {
  const searchable = normalizeIngredientText(ingredient);

  if (matches(searchable, /pear|배/iu)) {
    return "🍐";
  }
  if (matches(searchable, /ginger|생강/iu)) {
    return "🫚";
  }
  if (matches(searchable, /water|물/iu)) {
    return "💧";
  }
  if (matches(searchable, /honey|꿀/iu)) {
    return "🍯";
  }
  if (matches(searchable, /kimchi|김치/iu)) {
    return "🥬";
  }
  if (matches(searchable, /rice|쌀|밥/iu)) {
    return "🍚";
  }
  if (matches(searchable, /egg|계란|달걀/iu)) {
    return "🥚";
  }
  if (matches(searchable, /milk|dairy|우유/iu)) {
    return "🥛";
  }
  if (matches(searchable, /chicken|poultry|닭|치킨/iu)) {
    return "🍗";
  }
  if (matches(searchable, /processed_meat|bacon|ham|sausage|베이컨|햄|소시지/iu)) {
    return "🥓";
  }
  if (matches(searchable, /shrimp|prawn|seafood|새우|해산/iu)) {
    return "🦐";
  }
  if (matches(searchable, /fish|생선/iu)) {
    return "🐟";
  }
  if (matches(searchable, /meat|beef|pork|고기|소고기|쇠고기|돼지/iu)) {
    return "🥩";
  }
  if (matches(searchable, /sauce|paste|장|소스/iu)) {
    return "🥄";
  }
  if (matches(searchable, /salt|sodium|소금|저염/iu)) {
    return "🧂";
  }
  if (matches(searchable, /fruit|과일/iu)) {
    return "🍎";
  }
  if (matches(searchable, /vegetable|채소|야채/iu)) {
    return "🥦";
  }

  return "🥣";
}

function normalizeIngredientText(ingredient: RecipeIngredient): string {
  return `${ingredient.name} ${ingredient.description}`.trim().toLocaleLowerCase("ko-KR");
}

function matches(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}
