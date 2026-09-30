import type { RecipeFilterKey } from "./recipeCatalogTypes";

export type ApiResponse<T> = {
  readonly success: boolean;
  readonly code?: string;
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
  /** Detail-only. Every tool the recipe uses; `requiredTool` stays the representative one. */
  readonly tools?: readonly ServerRecipeTool[] | null;
  readonly ingredients?: readonly ServerRecipeIngredient[] | null;
  readonly steps?: readonly ServerRecipeStep[] | null;
  /**
   * Detail load. Numbered stages `[{ section: 1, title }]` in displayLang (server falls
   * back to writtenLang; `title` may still be null). `[]` when the recipe is unstaged.
   */
  readonly sections?: readonly ServerRecipeSection[] | null;
  readonly sourcePlatform?: string | null;
  readonly source_platform?: string | null;
  readonly sourceMediaType?: string | null;
  readonly source_media_type?: string | null;
  readonly timelineCapability?: string | null;
  readonly timeline_capability?: string | null;
};

export type ServerRecipeTool = {
  readonly code?: string | null;
  readonly labelKo?: string | null;
  readonly labelEn?: string | null;
  /** Everyday kitchen basics (knife, bowl…) that the tools line hides. */
  readonly basic?: boolean | null;
  readonly stepNumbers?: readonly (number | string)[] | null;
  readonly optional?: boolean | null;
  /** Tools sharing an altGroup are interchangeable ("오븐 또는 에어프라이어"). */
  readonly altGroup?: string | null;
};

export type ServerRecipeSection = {
  /**
   * 1-based stage number that `steps[].sectionNumber` points at. Older payloads sent
   * canonical keys (`PREP`/`MAIN`/`FINISH`) or a numeric string here.
   */
  readonly section?: string | number | null;
  readonly step_section?: string | number | null;
  readonly title?: string | null;
  readonly sectionTitle?: string | null;
  readonly section_title?: string | null;
  readonly titleKo?: string | null;
  readonly title_ko?: string | null;
  readonly titleEn?: string | null;
  readonly title_en?: string | null;
  /** Localized titles keyed by display language (`ko-KR`, `en-US`, …). */
  readonly titles?: Readonly<Record<string, string | null | undefined>> | null;
  readonly startSeconds?: number | string | null;
  readonly start_seconds?: number | string | null;
  readonly endSeconds?: number | string | null;
  readonly end_seconds?: number | string | null;
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
  readonly processingForm?: string | null;
  readonly processing_form?: string | null;
  readonly processingFormHint?: string | null;
  readonly processing_form_hint?: string | null;
  /** Detail-only display fields: the amount as the recipe wrote it ("1 공기"). */
  readonly displayQuantity?: number | string | null;
  readonly displayUnitLabel?: string | null;
  readonly sourceText?: string | null;
  /** Nutrition-side weight estimate for the line, in grams. */
  readonly convertedGrams?: number | string | null;
  readonly conversionMethod?: string | null;
  readonly conversionReviewRequired?: boolean | null;
};

export type ServerRecipeStep = {
  readonly stepNumber?: number | null;
  readonly way?: string | null;
  readonly cookingTip?: string | null;
  readonly imageUrl?: string | null;
  readonly ingredientMasterIds?: readonly (number | string)[] | null;
  /** Legacy stage string (displayLang title, or `MAIN` when unstaged). */
  readonly section?: string | number | null;
  readonly step_section?: string | number | null;
  /** 1-based stage number; matches `sections[].section`. */
  readonly sectionNumber?: number | string | null;
  /** 1-based position of the step inside its stage. */
  readonly sectionStepNumber?: number | string | null;
  readonly startSeconds?: number | string | null;
  readonly start_seconds?: number | string | null;
  readonly endSeconds?: number | string | null;
  readonly end_seconds?: number | string | null;
};
