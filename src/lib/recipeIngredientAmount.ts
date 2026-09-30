import type { Lang } from "./translations";
import type { RecipeIngredientDisplayFields } from "./recipeCatalogTypes";

/**
 * Ingredient amount formatting, ported from the native client
 * (`client/components/food/quantityAmountDisplayUtils.ts` +
 * `formatDisplayUnit` in `client/types/fooditemType.ts`) so web and app print the
 * same string for the same line:
 *
 * - `count` (or no unit) → `2 개`
 * - `amount` → the bare number
 * - `preference` → the label alone (`취향껏`)
 * - everything else → `${quantity} ${label}`, with g ≥ 1000 → kg and ml ≥ 1000 → L
 * - numbers print as-is after 6-decimal normalization (`0.5`, `1.5`, never `1.50`)
 */

type KnownUnit =
  | "g"
  | "kg"
  | "ml"
  | "L"
  | "count"
  | "spoon"
  | "drop"
  | "dash"
  | "splash"
  | "drizzle"
  | "pinch"
  | "preference"
  | "amount";

/** Mirrors the app's `modal.unitSelect.labels` language packs. */
const unitLabels: Record<Lang, Partial<Record<KnownUnit, string>>> = {
  ko: {
    g: "g",
    kg: "kg",
    ml: "ml",
    L: "L",
    spoon: "스푼",
    drop: "방울",
    dash: "약간",
    splash: "조금",
    drizzle: "둘러넣기",
    pinch: "꼬집",
    preference: "취향껏",
  },
  en: {
    g: "g",
    kg: "kg",
    ml: "ml",
    L: "L",
    spoon: "spoon",
    drop: "drop",
    dash: "dash",
    splash: "splash",
    drizzle: "drizzle",
    pinch: "pinch",
    preference: "to taste",
  },
};

/**
 * The app hard-codes `개` as the count suffix in every language. English gets no
 * suffix here instead — "2 개" on an English page is a bug, not parity worth keeping.
 */
const countSuffix: Record<Lang, string> = { ko: "개", en: "" };

const approxLabel: Record<Lang, (amount: string) => string> = {
  ko: (amount) => `약 ${amount}`,
  en: (amount) => `About ${amount}`,
};

const knownUnits = new Set<string>([
  "g",
  "kg",
  "ml",
  "l",
  "count",
  "spoon",
  "drop",
  "dash",
  "splash",
  "drizzle",
  "pinch",
  "preference",
  "amount",
]);

function toKnownUnit(value: string | null | undefined): KnownUnit | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (!knownUnits.has(normalized)) return null;
  return normalized === "l" ? "L" : (normalized as KnownUnit);
}

/** The app's `normalizeScaledQuantity`: trims float noise, never prints `-0`. */
export function formatQuantityNumber(value: number): string {
  const normalized = Number(value.toFixed(6));
  return String(Object.is(normalized, -0) ? 0 : normalized);
}

function formatWithUnit(quantity: number, unit: KnownUnit, lang: Lang): string {
  if (unit === "count") {
    const suffix = countSuffix[lang];
    return suffix.length > 0 ? `${formatQuantityNumber(quantity)} ${suffix}` : formatQuantityNumber(quantity);
  }
  if (unit === "amount") return formatQuantityNumber(quantity);
  if (unit === "preference") return unitLabels[lang].preference ?? "";

  let displayQuantity = quantity;
  let displayUnit: KnownUnit = unit;
  if (unit === "g" && Math.abs(quantity) >= 1000) {
    displayQuantity = quantity / 1000;
    displayUnit = "kg";
  } else if (unit === "ml" && Math.abs(quantity) >= 1000) {
    displayQuantity = quantity / 1000;
    displayUnit = "L";
  }

  return `${formatQuantityNumber(displayQuantity)} ${unitLabels[lang][displayUnit] ?? displayUnit}`;
}

/**
 * Grams for the "약 210g" helper. Whole grams from 10g up, one decimal below that
 * so a pinch of salt does not read as "약 0g", and kg past 1000g like every other
 * weight in the app.
 */
export function formatApproxGrams(grams: number, lang: Lang): string {
  if (grams >= 1000) {
    return approxLabel[lang](`${formatQuantityNumber(Math.round(grams) / 1000)}kg`);
  }
  const rounded = grams >= 10 ? Math.round(grams) : Math.round(grams * 10) / 10;
  return approxLabel[lang](`${formatQuantityNumber(rounded)}g`);
}

export type IngredientAmountSource = RecipeIngredientDisplayFields & {
  readonly quantity: number | null;
  readonly unit: string | null;
};

export type IngredientAmountText = {
  /** What the recipe says: "1 공기", "2 스푼", or the to-taste fallback. */
  readonly primary: string;
  /** Weight hint ("약 210g") or null when it would add nothing. */
  readonly approxGrams: string | null;
};

/**
 * Prefers the recipe's own wording (`displayQuantity` + `displayUnitLabel`) and
 * falls back to the normalized `quantity`/`unit` pair when the server has not sent
 * display fields for this line.
 */
export function formatIngredientAmount(
  ingredient: IngredientAmountSource,
  lang: Lang,
  toTasteFallback: string,
): IngredientAmountText {
  const { primary, weightUnit } = primaryAmount(ingredient, lang, toTasteFallback);
  return { primary, approxGrams: approxGramsFor(ingredient, weightUnit, lang) };
}

function primaryAmount(
  ingredient: IngredientAmountSource,
  lang: Lang,
  toTasteFallback: string,
): { primary: string; weightUnit: boolean } {
  const displayLabel = ingredient.displayUnitLabel?.trim() ?? "";
  const displayQuantity = ingredient.displayQuantity;

  if (displayLabel.length > 0 && typeof displayQuantity === "number" && Number.isFinite(displayQuantity)) {
    const known = toKnownUnit(displayLabel);
    if (known !== null) {
      return { primary: formatWithUnit(displayQuantity, known, lang), weightUnit: isWeight(known) };
    }
    // Free-text unit as written in the recipe ("공기", "줌", "큰술").
    return { primary: `${formatQuantityNumber(displayQuantity)} ${displayLabel}`, weightUnit: false };
  }

  const unit = toKnownUnit(ingredient.unit);
  if (ingredient.quantity === null) {
    return unit === "preference"
      ? { primary: unitLabels[lang].preference ?? toTasteFallback, weightUnit: false }
      : { primary: toTasteFallback, weightUnit: false };
  }

  if (unit === null && ingredient.unit !== null && ingredient.unit.trim().length > 0) {
    // Unknown server unit: keep it visible rather than silently calling it a count.
    return { primary: `${formatQuantityNumber(ingredient.quantity)} ${ingredient.unit.trim()}`, weightUnit: false };
  }

  const resolved = unit ?? "count";
  return { primary: formatWithUnit(ingredient.quantity, resolved, lang), weightUnit: isWeight(resolved) };
}

function isWeight(unit: KnownUnit): boolean {
  return unit === "g" || unit === "kg";
}

/**
 * The weight hint is shown only when it tells the reader something new: there is a
 * converted weight, the line is not already in grams, and the conversion has not
 * been flagged for review (an unreviewed estimate should not look authoritative).
 */
function approxGramsFor(
  ingredient: IngredientAmountSource,
  weightUnit: boolean,
  lang: Lang,
): string | null {
  const grams = ingredient.convertedGrams;
  if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) return null;
  if (weightUnit) return null;
  if (ingredient.conversionReviewRequired === true) return null;
  return formatApproxGrams(grams, lang);
}
