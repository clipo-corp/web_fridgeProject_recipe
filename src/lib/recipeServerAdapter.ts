import { withCatalogDemoMedia } from "./recipeCatalogDemoMedia";
import {
  normalizeStepIngredientMasterIds,
  recipeStepIngredientChips,
} from "./recipeStepIngredients";
import { toRecipeCreatorSource } from "./recipeCreatorSource";
import type {
  PublicRecipeRecord,
  RecipeIngredient,
  RecipeStep,
  RecipeVisibility,
  TranslationStatus,
} from "./recipeCatalogTypes";
import type {
  ServerRecipeInfo,
  ServerRecipeIngredient,
  ServerRecipeStep,
} from "./recipeServerTypes";

const fallbackDisplayLang = "ko-KR";

export function toPublicRecipeRecord(
  recipe: ServerRecipeInfo,
  requestedDisplayLang = fallbackDisplayLang,
): PublicRecipeRecord {
  const recipeId = idValue(recipe.recipeId ?? recipe.id ?? recipe.recipe_id ?? recipe.recipeID);
  const creatorSource = toRecipeCreatorSource(recipe);
  const ingredients = (recipe.ingredients ?? []).map(toPublicIngredient);

  return withCatalogDemoMedia({
    recipeId,
    title: stringValue(recipe.title, "Untitled recipe"),
    titleImageUrl: nullableString(recipe.titleImageUrl),
    description: stringValue(recipe.description, ""),
    cookingTip: stringValue(recipe.cookingTip, ""),
    writtenLang: parseWrittenLang(recipe.writtenLang),
    requestedDisplayLang: stringValue(recipe.requestedDisplayLang, requestedDisplayLang),
    displayLang: stringValue(recipe.displayLang, requestedDisplayLang),
    availableLangs: recipe.availableLangs ?? [requestedDisplayLang],
    isOriginal: recipe.isOriginal ?? true,
    isTranslated: recipe.isTranslated ?? false,
    translationStatus: parseTranslationStatus(recipe.translationStatus),
    source: parseSource(recipe.source),
    ...(creatorSource === undefined ? {} : { creatorSource }),
    visibility: parseVisibility(recipe.visibility),
    isUseLocalData: recipe.isUseLocalData ?? true,
    likeCount: recipe.likeCount ?? 0,
    viewCount: recipe.viewCount ?? 0,
    createdAt: parseCreatedAt(recipe.createdAt),
    countryCode: stringValue(recipe.countryCode, "GLOBAL"),
    country: stringValue(recipe.country, "Global"),
    city: nullableString(recipe.city),
    district: nullableString(recipe.district),
    canonicalCountry: nullableString(recipe.canonicalCountry),
    canonicalCity: nullableString(recipe.canonicalCity),
    canonicalDistrict: nullableString(recipe.canonicalDistrict),
    cityKey: nullableString(recipe.cityKey),
    districtKey: nullableString(recipe.districtKey),
    recipeType: stringValue(recipe.recipeType, "everyday"),
    cookingMethod: stringValue(recipe.cookingMethod, "unknown"),
    technique: stringValue(recipe.technique, "unknown"),
    dietaryGoal: stringValue(recipe.dietaryGoal, "standard"),
    dietaryRestriction: stringValue(recipe.dietaryRestriction, "none"),
    primaryIngredient: stringValue(recipe.primaryIngredient, "ingredient"),
    category: stringValue(recipe.category, "everyday"),
    occasion: stringValue(recipe.occasion, "everyday"),
    difficulty: stringValue(recipe.difficulty, "beginner"),
    cookingTime: stringValue(recipe.cookingTime, "30min"),
    cuisineRegion: stringValue(recipe.cuisineRegion, "global"),
    servings: stringValue(recipe.servings, "1-2"),
    requiredTool: stringValue(recipe.requiredTool, "basic"),
    ingredients,
    steps: (recipe.steps ?? []).map((step, index) => toPublicStep(step, index, ingredients)),
  });
}

export function isServerRecipeId(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

export function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function toPublicIngredient(ingredient: ServerRecipeIngredient, index: number): RecipeIngredient {
  const masterId = numberValue(ingredient.masterId ?? ingredient.master_id ?? ingredient.id);
  const fallbackName = `Ingredient ${index + 1}`;

  return {
    masterId,
    name: stringValue(
      ingredient.name ?? ingredient.master_name ?? ingredient.masterName ?? ingredient.description,
      fallbackName,
    ),
    quantity: numberValue(ingredient.quantity),
    unit: nullableString(ingredient.unit),
    description: stringValue(ingredient.description, ""),
  };
}

function toPublicStep(
  step: ServerRecipeStep,
  index: number,
  ingredients: readonly RecipeIngredient[],
): RecipeStep {
  const ingredientMasterIds = normalizeStepIngredientMasterIds(step.ingredientMasterIds);

  return {
    stepNumber: step.stepNumber ?? index + 1,
    way: stringValue(step.way, ""),
    cookingTip: nullableString(step.cookingTip),
    imageUrl: nullableString(step.imageUrl),
    ingredientMasterIds,
    ingredientChips: recipeStepIngredientChips(ingredients, ingredientMasterIds),
  };
}

function parseWrittenLang(value: string | null | undefined): PublicRecipeRecord["writtenLang"] {
  return value === "en" || value === "en-US" ? "en" : "ko";
}

function parseSource(value: string | null | undefined): PublicRecipeRecord["source"] {
  return value === "ai" ? "ai" : "user";
}

function parseVisibility(value: string | null | undefined): RecipeVisibility {
  if (value === "private" || value === "shared") {
    return value;
  }
  return "public";
}

function parseTranslationStatus(value: string | null | undefined): TranslationStatus {
  if (value === "translated" || value === "unavailable") {
    return value;
  }
  return "original";
}

function parseCreatedAt(value: string | readonly number[] | null | undefined): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    if (year !== undefined && month !== undefined && day !== undefined) {
      return new Date(year, month - 1, day, hour, minute, second).toISOString();
    }
  }

  return new Date(0).toISOString();
}

function nullableString(value: string | null | undefined): string | null {
  return value === undefined || value === null || value.length === 0 ? null : value;
}

function idValue(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return "";
}

function numberValue(value: number | string | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
