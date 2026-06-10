import type { RecipeFilterKey } from "./recipeCatalogTypes";

export type ApiResponse<T> = {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
};

export type LoginResponse = {
  readonly accessToken?: string;
};

export type ServerRecipePageResponse = {
  readonly isAfter?: boolean;
  readonly pageNumber?: number;
  readonly recipes?: readonly ServerRecipeInfo[];
};

export type ServerRecipeFilterOptionsResponse = Record<
  RecipeFilterKey | "writtenLang",
  readonly string[]
>;

export type ServerRecipeRegionCatalogResponse = {
  readonly regions?: readonly ServerRecipeRegionOption[];
};

export type ServerRecipeRegionOption = {
  readonly country?: string | null;
  readonly countryCode?: string | null;
  readonly city?: string | null;
  readonly cityKey?: string | null;
  readonly district?: string | null;
  readonly districtKey?: string | null;
  readonly canonicalCountry?: string | null;
  readonly canonicalCity?: string | null;
  readonly canonicalDistrict?: string | null;
};

export type ServerRecipeInfo = {
  readonly recipeId?: number | string | null;
  readonly id?: number | string | null;
  readonly recipe_id?: number | string | null;
  readonly recipeID?: number | string | null;
  readonly title?: string | null;
  readonly titleImageUrl?: string | null;
  readonly description?: string | null;
  readonly cookingTip?: string | null;
  readonly writtenLang?: string | null;
  readonly requestedDisplayLang?: string | null;
  readonly displayLang?: string | null;
  readonly availableLangs?: readonly string[] | null;
  readonly isOriginal?: boolean | null;
  readonly isTranslated?: boolean | null;
  readonly translationStatus?: string | null;
  readonly source?: string | null;
  readonly sourceType?: string | null;
  readonly externalSourceType?: "youtube" | "blog" | "website" | null;
  readonly sourceUrl?: string | null;
  readonly sourceAccount?: string | null;
  readonly creatorName?: string | null;
  readonly sourceId?: string | null;
  readonly visibility?: string | null;
  readonly isUseLocalData?: boolean | null;
  readonly likeCount?: number | null;
  readonly viewCount?: number | null;
  readonly createdAt?: string | readonly number[] | null;
  readonly countryCode?: string | null;
  readonly country?: string | null;
  readonly city?: string | null;
  readonly district?: string | null;
  readonly canonicalCountry?: string | null;
  readonly canonicalCity?: string | null;
  readonly canonicalDistrict?: string | null;
  readonly cityKey?: string | null;
  readonly districtKey?: string | null;
  readonly recipeType?: string | null;
  readonly cookingMethod?: string | null;
  readonly technique?: string | null;
  readonly dietaryGoal?: string | null;
  readonly dietaryRestriction?: string | null;
  readonly primaryIngredient?: string | null;
  readonly category?: string | null;
  readonly occasion?: string | null;
  readonly difficulty?: string | null;
  readonly cookingTime?: string | null;
  readonly cuisineRegion?: string | null;
  readonly servings?: string | null;
  readonly requiredTool?: string | null;
  readonly ingredients?: readonly ServerRecipeIngredient[] | null;
  readonly steps?: readonly ServerRecipeStep[] | null;
};

export type ServerRecipeIngredient = {
  readonly id?: number | string | null;
  readonly masterId?: number | string | null;
  readonly master_id?: number | string | null;
  readonly name?: string | null;
  readonly masterName?: string | null;
  readonly master_name?: string | null;
  readonly quantity?: number | string | null;
  readonly unit?: string | null;
  readonly description?: string | null;
};

export type ServerRecipeStep = {
  readonly stepNumber?: number | null;
  readonly way?: string | null;
  readonly cookingTip?: string | null;
  readonly imageUrl?: string | null;
};
