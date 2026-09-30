import { withCatalogDemoMedia } from "./recipeCatalogDemoMedia";
import { readIngredientProcessingForm } from "./ingredientProcessingForm";
import {
  normalizeStepIngredientMasterIds,
  recipeStepIngredientChips,
} from "./recipeStepIngredients";
import { toRecipeCreatorSource } from "./recipeCreatorSource";
import type {
  PublicRecipeRecord,
  RecipeIngredient,
  RecipeIngredientDisplayFields,
  RecipeSection,
  RecipeSourceMediaType,
  RecipeSourcePlatform,
  RecipeStep,
  RecipeTimelineCapability,
  RecipeTool,
  RecipeVisibility,
  TranslationStatus,
} from "./recipeCatalogTypes";
import type {
  ServerRecipeInfo,
  ServerRecipeIngredient,
  ServerRecipeSection,
  ServerRecipeStep,
  ServerRecipeTool,
} from "./recipeServerTypes";

const fallbackDisplayLang = "ko-KR";

export function toPublicRecipeRecord(
  recipe: ServerRecipeInfo,
  requestedDisplayLang = fallbackDisplayLang,
): PublicRecipeRecord {
  const recipeId = idValue(recipe.recipeId ?? recipe.id ?? recipe.recipe_id ?? recipe.recipeID);
  const creatorSource = toRecipeCreatorSource(recipe);
  const ingredients = (recipe.ingredients ?? []).map(toPublicIngredient);
  const timelineCapability = parseTimelineCapability(recipe);

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
    ...(Array.isArray(recipe.tools)
      ? {
          tools: recipe.tools
            .map(toPublicTool)
            .filter((tool): tool is RecipeTool => tool !== null),
        }
      : {}),
    ingredients,
    steps: (recipe.steps ?? []).map((step, index) =>
      toPublicStep(step, index, ingredients, timelineCapability),
    ),
    sections: (recipe.sections ?? []).map((section) =>
      toPublicSection(section, timelineCapability, requestedDisplayLang),
    ),
    sourcePlatform: parseSourcePlatform(recipe),
    sourceMediaType: parseSourceMediaType(recipe),
    timelineCapability,
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
  const isMasterName =
    (ingredient.name === null || ingredient.name === undefined) &&
    nullableString(ingredient.master_name ?? ingredient.masterName) !== null;

  return {
    masterId,
    name: stringValue(
      ingredient.name ?? ingredient.master_name ?? ingredient.masterName ?? ingredient.description,
      fallbackName,
    ),
    quantity: numberValue(ingredient.quantity),
    unit: nullableString(ingredient.unit),
    description: stringValue(ingredient.description, ""),
    processingForm: readIngredientProcessingForm(ingredient),
    isMasterName,
    ...toIngredientDisplayFields(ingredient),
  };
}

/**
 * Only fields the server actually sent are copied, so records built from list
 * responses (which omit them) stay shape-identical to before.
 */
function toIngredientDisplayFields(
  ingredient: ServerRecipeIngredient,
): RecipeIngredientDisplayFields {
  const displayQuantity = numberValue(ingredient.displayQuantity);
  const displayUnitLabel = nullableString(ingredient.displayUnitLabel?.trim());
  const sourceText = nullableString(ingredient.sourceText?.trim());
  const grams = numberValue(ingredient.convertedGrams);
  const conversionMethod = nullableString(ingredient.conversionMethod?.trim());

  return {
    ...(displayQuantity === null ? {} : { displayQuantity }),
    ...(displayUnitLabel === null ? {} : { displayUnitLabel }),
    ...(sourceText === null ? {} : { sourceText }),
    ...(grams === null || grams <= 0 ? {} : { convertedGrams: grams }),
    ...(conversionMethod === null ? {} : { conversionMethod }),
    ...(typeof ingredient.conversionReviewRequired === "boolean"
      ? { conversionReviewRequired: ingredient.conversionReviewRequired }
      : {}),
  };
}

function toPublicTool(tool: ServerRecipeTool): RecipeTool | null {
  const code = nullableString(tool.code?.trim());
  if (code === null) return null;

  return {
    code,
    labelKo: nullableString(tool.labelKo?.trim()),
    labelEn: nullableString(tool.labelEn?.trim()),
    basic: tool.basic === true,
    stepNumbers: (tool.stepNumbers ?? [])
      .map((value) => numberValue(value))
      .filter((value): value is number => value !== null && Number.isInteger(value)),
    optional: tool.optional === true,
    altGroup: nullableString(tool.altGroup?.trim()),
  };
}

function toPublicStep(
  step: ServerRecipeStep,
  index: number,
  ingredients: readonly RecipeIngredient[],
  timelineCapability: RecipeTimelineCapability,
): RecipeStep {
  const ingredientMasterIds = normalizeStepIngredientMasterIds(step.ingredientMasterIds);
  const { startSeconds, endSeconds } = toTimestamps(
    step.startSeconds ?? step.start_seconds,
    step.endSeconds ?? step.end_seconds,
    timelineCapability,
  );

  return {
    stepNumber: step.stepNumber ?? index + 1,
    way: stringValue(step.way, ""),
    cookingTip: nullableString(step.cookingTip),
    imageUrl: nullableString(step.imageUrl),
    ingredientMasterIds,
    ingredientChips: recipeStepIngredientChips(ingredients, ingredientMasterIds),
    section: sectionKey(step.section ?? step.step_section),
    sectionNumber: positiveIntegerValue(step.sectionNumber),
    sectionStepNumber: positiveIntegerValue(step.sectionStepNumber),
    startSeconds,
    endSeconds,
  };
}

function toPublicSection(
  section: ServerRecipeSection,
  timelineCapability: RecipeTimelineCapability,
  displayLang: string,
): RecipeSection {
  const { startSeconds, endSeconds } = toTimestamps(
    section.startSeconds ?? section.start_seconds,
    section.endSeconds ?? section.end_seconds,
    timelineCapability,
  );

  return {
    section: sectionKey(section.section ?? section.step_section),
    title: localizedSectionTitle(section, displayLang),
    startSeconds,
    endSeconds,
  };
}

/**
 * Korean pages prefer the ko-KR title; other languages prefer their own localized
 * title. Both then fall back to the untyped `title`, which is written in the
 * recipe's source language.
 */
function localizedSectionTitle(section: ServerRecipeSection, displayLang: string): string | null {
  const titles = section.titles ?? {};
  const baseLang = displayLang.split("-")[0] ?? displayLang;
  const localized = displayLang.startsWith("ko")
    ? [titles["ko-KR"], titles["ko"], section.titleKo, section.title_ko]
    : [
        titles[displayLang],
        titles[baseLang],
        ...(baseLang === "en" ? [section.titleEn, section.title_en] : []),
      ];

  const candidates = [...localized, section.title, section.sectionTitle, section.section_title];
  for (const candidate of candidates) {
    const trimmed = typeof candidate === "string" ? candidate.trim() : "";
    if (trimmed.length > 0) return trimmed;
  }
  return null;
}

/**
 * Uppercases and trims a section key. A numeric stage (`1`, `"2"`) is kept as its
 * integer string. Anything missing collapses to `MAIN`.
 */
function sectionKey(value: string | number | null | undefined): string {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? String(value) : "MAIN";
  }
  const trimmed = typeof value === "string" ? value.trim().toUpperCase() : "";
  return trimmed.length > 0 ? trimmed : "MAIN";
}

/**
 * Timestamps are only meaningful on a SEEKABLE recipe, and only when the pair is
 * internally consistent. Anything else is dropped rather than rendered as a broken
 * seek target.
 */
function toTimestamps(
  rawStart: number | string | null | undefined,
  rawEnd: number | string | null | undefined,
  timelineCapability: RecipeTimelineCapability,
): { startSeconds: number | null; endSeconds: number | null } {
  const empty = { startSeconds: null, endSeconds: null };
  if (timelineCapability !== "SEEKABLE") return empty;

  const startSeconds = wholeSecondsValue(rawStart);
  const endSeconds = wholeSecondsValue(rawEnd);
  if (startSeconds === null) return empty;
  if (endSeconds !== null && endSeconds < startSeconds) {
    return { startSeconds, endSeconds: null };
  }

  return { startSeconds, endSeconds };
}

/** Positive integer (stage numbers are 1-based) or null. */
function positiveIntegerValue(value: number | string | null | undefined): number | null {
  const parsed = numberValue(value);
  return parsed !== null && Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function wholeSecondsValue(value: number | string | null | undefined): number | null {
  const parsed = numberValue(value);
  if (parsed === null || !Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

function parseSourcePlatform(recipe: ServerRecipeInfo): RecipeSourcePlatform {
  const value = (recipe.sourcePlatform ?? recipe.source_platform ?? "").toUpperCase();
  return value === "YOUTUBE" || value === "INSTAGRAM" || value === "TIKTOK" ? value : "OWNED";
}

function parseSourceMediaType(recipe: ServerRecipeInfo): RecipeSourceMediaType {
  const value = (recipe.sourceMediaType ?? recipe.source_media_type ?? "").toUpperCase();
  return value === "VIDEO" || value === "CAROUSEL" ? value : "PHOTO";
}

function parseTimelineCapability(recipe: ServerRecipeInfo): RecipeTimelineCapability {
  const value = (recipe.timelineCapability ?? recipe.timeline_capability ?? "").toUpperCase();
  return value === "SEEKABLE" || value === "PLAYABLE_ONLY" ? value : "NONE";
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
