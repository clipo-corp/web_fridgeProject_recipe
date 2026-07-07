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

export type RecipeIngredient = {
  readonly masterId: number | null;
  readonly name: string;
  readonly quantity: number | null;
  readonly unit: string | null;
  readonly description: string;
};

export type RecipeStepIngredientChip = {
  readonly masterId: number | null;
  readonly name: string;
  readonly quantity: number | null;
  readonly unit: string | null;
  readonly description: string;
};

export type RecipeStep = {
  readonly stepNumber: number;
  readonly way: string;
  readonly cookingTip: string | null;
  readonly imageUrl: string | null;
  readonly ingredientMasterIds: readonly number[] | null;
  readonly ingredientChips: readonly RecipeStepIngredientChip[];
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
  readonly ingredients: readonly RecipeIngredient[];
  readonly steps: readonly RecipeStep[];
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
