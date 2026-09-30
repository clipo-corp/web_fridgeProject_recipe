import type { IngredientProcessingForm } from "./ingredientProcessingForm";

export type RecipeSearchSort = "latest" | "popular" | "hot_month";
export type RecipeSearchScope = "all" | "recipe" | "ingredient";
export type RecipeWrittenLang = "all" | "ko" | "en";
export type LocalDataMode = "all" | "local" | "original";
export type RecipeVisibility = "private" | "shared" | "public";
export type RecipeSource = "ai" | "user";
export type TranslationStatus = "original" | "translated" | "unavailable";
export type RecipeCreatorSourceType = "manual" | "web" | "blog" | "website" | "url" | "youtube" | "tiktok";

export type RecipeCreatorSource = {
  readonly sourceType: RecipeCreatorSourceType;
  readonly sourceUrl: string | null;
  readonly sourceAccount: string | null;
  readonly creatorName: string | null;
  readonly sourceId: string | null;
};

/**
 * Detail-only amount fields from the server. All optional: list responses and mock
 * data omit them, and the amount formatter falls back to `quantity`/`unit`.
 */
export type RecipeIngredientDisplayFields = {
  /** The amount as the recipe wrote it, e.g. `1` for "밥 1 공기". */
  readonly displayQuantity?: number | null;
  /** Unit as written ("공기", "줌") or a lowercase unit enum ("ml", "count"). */
  readonly displayUnitLabel?: string | null;
  readonly sourceText?: string | null;
  readonly convertedGrams?: number | null;
  readonly conversionMethod?: string | null;
  readonly conversionReviewRequired?: boolean | null;
};

export type RecipeIngredient = RecipeIngredientDisplayFields & {
  readonly masterId: number | null;
  readonly name: string;
  readonly quantity: number | null;
  readonly unit: string | null;
  readonly description: string;
  /** Processing-form axis (축 B) code from the server; null = unknown. */
  readonly processingForm: IngredientProcessingForm | null;
  /** True when `name` is a master-catalog display name rather than the raw recipe text. */
  readonly isMasterName: boolean;
};

export type RecipeStepIngredientChip = RecipeIngredientDisplayFields & {
  readonly masterId: number | null;
  readonly name: string;
  readonly quantity: number | null;
  readonly unit: string | null;
  readonly description: string;
  readonly processingForm: IngredientProcessingForm | null;
  readonly isMasterName: boolean;
};

export type RecipeStep = {
  readonly stepNumber: number;
  readonly way: string;
  readonly cookingTip: string | null;
  readonly imageUrl: string | null;
  readonly ingredientMasterIds: readonly number[] | null;
  readonly ingredientChips: readonly RecipeStepIngredientChip[];
  /** Canonical section key this step belongs to. Defaults to `MAIN`. */
  readonly section: string;
  /** Only populated when the recipe is `SEEKABLE`; otherwise null. */
  readonly startSeconds: number | null;
  readonly endSeconds: number | null;
};

/** Where the recipe originally came from. Mirrors the server enum. */
export type RecipeSourcePlatform = "YOUTUBE" | "INSTAGRAM" | "TIKTOK" | "OWNED";

/** What kind of media backs the recipe. Mirrors the server enum. */
export type RecipeSourceMediaType = "VIDEO" | "PHOTO" | "CAROUSEL";

/**
 * How far the source media can be navigated.
 * `SEEKABLE` is the only value that permits per-step timestamps.
 */
export type RecipeTimelineCapability = "NONE" | "PLAYABLE_ONLY" | "SEEKABLE";

export type RecipeSection = {
  readonly section: string;
  /** Display title. Null means "use the localized default label for this key". */
  readonly title: string | null;
  readonly startSeconds: number | null;
  readonly endSeconds: number | null;
};

export type RecipeTool = {
  readonly code: string;
  readonly labelKo: string | null;
  readonly labelEn: string | null;
  readonly basic: boolean;
  readonly stepNumbers: readonly number[];
  readonly optional: boolean;
  readonly altGroup: string | null;
};

export type RecipeCatalogRegion =
  | { readonly scope: "none" }
  | { readonly scope: "country"; readonly countryCode: string; readonly country: string }
  | {
      readonly scope: "city";
      readonly countryCode: string;
      readonly country: string;
      readonly city: string;
      readonly cityKey: string;
    }
  | {
      readonly scope: "district";
      readonly countryCode: string;
      readonly country: string;
      readonly city: string;
      readonly cityKey: string;
      readonly district: string;
      readonly districtKey: string;
    };

export type RecipeFilterKey =
  | "recipeType"
  | "cookingMethod"
  | "technique"
  | "dietaryGoal"
  | "dietaryRestriction"
  | "primaryIngredient"
  | "category"
  | "occasion"
  | "difficulty"
  | "cookingTime"
  | "cuisineRegion"
  | "servings"
  | "requiredTool";

export const recipeFilterKeys: readonly RecipeFilterKey[] = [
  "recipeType",
  "cookingMethod",
  "technique",
  "dietaryGoal",
  "dietaryRestriction",
  "primaryIngredient",
  "category",
  "occasion",
  "difficulty",
  "cookingTime",
  "cuisineRegion",
  "servings",
  "requiredTool",
] as const;

export type PublicRecipeCatalogFilters = Record<RecipeFilterKey, string> & {
  readonly query: string;
  readonly searchScope: RecipeSearchScope;
  readonly sort: RecipeSearchSort;
  readonly writtenLang: RecipeWrittenLang;
  readonly region: RecipeCatalogRegion;
  readonly isUseLocalData: LocalDataMode;
};

export type PublicRecipeRecord = {
  readonly recipeId: string;
  readonly title: string;
  readonly titleImageUrl: string | null;
  readonly description: string;
  readonly cookingTip: string;
  readonly writtenLang: "ko" | "en";
  readonly requestedDisplayLang: string;
  readonly displayLang: string;
  readonly availableLangs: readonly string[];
  readonly isOriginal: boolean;
  readonly isTranslated: boolean;
  readonly translationStatus: TranslationStatus;
  readonly source: RecipeSource;
  readonly creatorSource?: RecipeCreatorSource;
  readonly visibility: RecipeVisibility;
  readonly isUseLocalData: boolean;
  readonly likeCount: number;
  readonly viewCount: number;
  readonly createdAt: string;
  readonly countryCode: string;
  readonly country: string;
  readonly city: string | null;
  readonly district: string | null;
  readonly canonicalCountry?: string | null;
  readonly canonicalCity?: string | null;
  readonly canonicalDistrict?: string | null;
  readonly cityKey: string | null;
  readonly districtKey: string | null;
  readonly recipeType: string;
  readonly cookingMethod: string;
  readonly technique: string;
  readonly dietaryGoal: string;
  readonly dietaryRestriction: string;
  readonly primaryIngredient: string;
  readonly category: string;
  readonly occasion: string;
  readonly difficulty: string;
  readonly cookingTime: string;
  readonly cuisineRegion: string;
  readonly servings: string;
  readonly requiredTool: string;
  /** Detail-only full tool list. Absent on list responses and mock data. */
  readonly tools?: readonly RecipeTool[];
  readonly ingredients: readonly RecipeIngredient[];
  readonly steps: readonly RecipeStep[];
  /** Ordered section runs. Empty when the recipe has no section metadata. */
  readonly sections: readonly RecipeSection[];
  readonly sourcePlatform: RecipeSourcePlatform;
  readonly sourceMediaType: RecipeSourceMediaType;
  readonly timelineCapability: RecipeTimelineCapability;
};

export type PublicRecipeSearchRequest = {
  readonly ingredients: readonly RecipeIngredient[];
  readonly searchValue: string | null;
  readonly pageNumber: number;
  readonly displayLang: string;
  readonly writtenLang: string | null;
  readonly sort: RecipeSearchSort;
  readonly regionScope: "country" | "city" | "district" | null;
  readonly countryCode: string | null;
  readonly country: string | null;
  readonly city: string | null;
  readonly district: string | null;
  readonly cityKey: string | null;
  readonly districtKey: string | null;
  readonly recipeVisibility: "public";
  readonly isUseLocalData: boolean | null;
} & Record<RecipeFilterKey, string | null>;
