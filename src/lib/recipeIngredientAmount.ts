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
 * - metric amounts print as-is after 6-decimal normalization (`0.5`, `1.5`, never `1.50`)
 * - kitchen amounts (spoons, counts, free-text labels) print common fractions
 *   (`1/3 종이컵`, `1 1/2 큰술`), otherwise one decimal
 * - non-Korean pages never show a Korean recipe label: it is translated when known,
 *   otherwise the line falls back to the normalized `quantity`/`unit`
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
  ko: (amount) => `(약 ${amount})`,
  en: (amount) => `(about ${amount})`,
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

// ±0.01, plus a hair of slack so float noise (1.26 - 1 = 0.26000000000000001) still counts.
const FRACTION_TOLERANCE = 0.01 + 1e-9;
const commonFractions: ReadonlyArray<readonly [number, string]> = [
  [1 / 4, "1/4"],
  [1 / 3, "1/3"],
  [1 / 2, "1/2"],
  [2 / 3, "2/3"],
  [3 / 4, "3/4"],
];

/**
 * Kitchen-measure numbers: `0.333` → `1/3`, `1.5` → `1 1/2`, anything that is not
 * within ±0.01 of a common fraction → one decimal (`0.2`, `2`). A tiny non-zero
 * amount that would round to `0` keeps its normalized value instead.
 */
export function formatKitchenQuantity(value: number): string {
  if (!Number.isFinite(value)) return formatQuantityNumber(value);
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const whole = Math.floor(abs + FRACTION_TOLERANCE);
  const fraction = abs - whole;

  if (Math.abs(fraction) > FRACTION_TOLERANCE) {
    const match = commonFractions.find(([target]) => Math.abs(fraction - target) <= FRACTION_TOLERANCE);
    if (match !== undefined) {
      return `${sign}${whole > 0 ? `${whole} ` : ""}${match[1]}`;
    }
  }

  const rounded = Math.round(abs * 10) / 10;
  if (rounded === 0 && abs > 0) return `${sign}${formatQuantityNumber(abs)}`;
  return rounded === 0 ? "0" : `${sign}${formatQuantityNumber(rounded)}`;
}

const hangul = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

/**
 * Korean recipe labels an English page can show. `""` means a bare count
 * (`2`, like the `count` unit); `null` means "to taste". Only labels whose meaning
 * is unambiguous are listed — anything else falls back to quantity/unit.
 */
const koreanLabelInEnglish: Readonly<Record<string, string | null>> = {
  공기: "bowl",
  그릇: "bowl",
  컵: "cup",
  종이컵: "paper cup",
  줌: "handful",
  한줌: "handful",
  꼬집: "pinch",
  큰술: "tbsp",
  숟가락: "tbsp",
  밥숟가락: "tbsp",
  스푼: "spoon",
  작은술: "tsp",
  티스푼: "tsp",
  찻숟가락: "tsp",
  쪽: "clove",
  장: "sheet",
  모: "block",
  방울: "drop",
  조각: "piece",
  토막: "piece",
  줄기: "stalk",
  대: "stalk",
  잎: "leaf",
  송이: "bunch",
  봉지: "pack",
  팩: "pack",
  캔: "can",
  인분: "serving",
  개: "",
  알: "",
  약간: "dash",
  조금: "splash",
  취향껏: null,
  적당량: null,
};

type ForeignLabel = { readonly kind: "label"; readonly label: string } | { readonly kind: "to-taste" };

function englishForKoreanLabel(label: string): ForeignLabel | undefined {
  const key = label.replace(/\s+/g, "");
  if (!Object.prototype.hasOwnProperty.call(koreanLabelInEnglish, key)) return undefined;
  const mapped = koreanLabelInEnglish[key];
  return mapped === null ? { kind: "to-taste" } : { kind: "label", label: mapped ?? "" };
}

function formatWithUnit(quantity: number, unit: KnownUnit, lang: Lang): string {
  if (unit === "count") {
    const suffix = countSuffix[lang];
    return suffix.length > 0 ? `${formatKitchenQuantity(quantity)} ${suffix}` : formatKitchenQuantity(quantity);
  }
  if (unit === "amount") return formatKitchenQuantity(quantity);
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

  const number = isMetric(displayUnit) ? formatQuantityNumber(displayQuantity) : formatKitchenQuantity(displayQuantity);
  return `${number} ${unitLabels[lang][displayUnit] ?? displayUnit}`;
}

/**
 * Grams for the "(약 210g)" helper. Whole grams from 10g up, one decimal below that
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
  readonly role?: string | null;
  readonly consumedQuantity?: number | string | null;
  readonly alternativeGroup?: string | null;
  readonly alternativeOf?: string | number | null;
};

export type IngredientAmountText = {
  /** What the recipe says: "1 공기", "2 스푼", or the to-taste fallback. */
  readonly primary: string;
  /** Weight hint ("(약 210g)") or null when it would add nothing. */
  readonly approxGrams: string | null;
};

/**
 * Prefers the recipe's own wording (`displayQuantity` + `displayUnitLabel`) and
 * falls back to the normalized `quantity`/`unit` pair when the server has not sent
 * display fields for this line.
 * Preparation amount only — never `consumedQuantity` (shopping / FP amountLabel).
 */
export function formatIngredientAmount(
  ingredient: IngredientAmountSource,
  lang: Lang,
  toTasteFallback: string,
): IngredientAmountText {
  const { primary, metricUnit } = primaryAmount(ingredient, lang, toTasteFallback);
  return { primary, approxGrams: approxGramsFor(ingredient, metricUnit, lang) };
}

function primaryAmount(
  ingredient: IngredientAmountSource,
  lang: Lang,
  toTasteFallback: string,
): { primary: string; metricUnit: boolean } {
  const displayLabel = ingredient.displayUnitLabel?.trim() ?? "";
  const displayQuantity = ingredient.displayQuantity;

  if (displayLabel.length > 0 && typeof displayQuantity === "number" && Number.isFinite(displayQuantity)) {
    const known = toKnownUnit(displayLabel);
    if (known !== null) {
      return { primary: formatWithUnit(displayQuantity, known, lang), metricUnit: isMetric(known) };
    }
    if (lang === "ko" || !hangul.test(displayLabel)) {
      // Free-text unit as written in the recipe ("공기", "줌", "큰술").
      return { primary: `${formatKitchenQuantity(displayQuantity)} ${displayLabel}`, metricUnit: false };
    }
    const english = englishForKoreanLabel(displayLabel);
    if (english?.kind === "to-taste") {
      return { primary: unitLabels[lang].preference ?? toTasteFallback, metricUnit: false };
    }
    if (english !== undefined) {
      const number = formatKitchenQuantity(displayQuantity);
      return { primary: english.label.length > 0 ? `${number} ${english.label}` : number, metricUnit: false };
    }
    // Unknown Korean label on a non-Korean page: fall through to quantity/unit.
  }

  const unit = toKnownUnit(ingredient.unit);
  if (ingredient.quantity === null) {
    return unit === "preference"
      ? { primary: unitLabels[lang].preference ?? toTasteFallback, metricUnit: false }
      : { primary: toTasteFallback, metricUnit: false };
  }

  if (unit === null && ingredient.unit !== null && ingredient.unit.trim().length > 0) {
    // Unknown server unit: keep it visible rather than silently calling it a count.
    return { primary: `${formatKitchenQuantity(ingredient.quantity)} ${ingredient.unit.trim()}`, metricUnit: false };
  }

  const resolved = unit ?? "count";
  return { primary: formatWithUnit(ingredient.quantity, resolved, lang), metricUnit: isMetric(resolved) };
}

function isMetric(unit: KnownUnit): boolean {
  return unit === "g" || unit === "kg" || unit === "ml" || unit === "L";
}

/**
 * The weight hint is shown whenever there is a converted weight and the line is not
 * already metric (g/kg/ml/L). Portion-standard and review-flagged conversions are
 * shown too — the "약"/"about" prefix already marks the figure as an estimate.
 */
function approxGramsFor(
  ingredient: IngredientAmountSource,
  metricUnit: boolean,
  lang: Lang,
): string | null {
  const grams = ingredient.convertedGrams;
  if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) return null;
  if (metricUnit) return null;
  return formatApproxGrams(grams, lang);
}

export type IngredientAlternativeChoice = "selected" | "unselected" | "candidate";

function readFiniteAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function readIngredientIntakeRole(
  value: unknown,
): "consumed" | "preparation" | "discarded" | "unknown" | null {
  if (typeof value !== "string") return null;
  const role = value.trim().toLowerCase();
  if (role.length === 0) return null;
  if (role === "consumed" || role === "preparation" || role === "discarded" || role === "unknown") {
    return role;
  }
  return "unknown";
}

function formatQuantityUnitPair(
  quantity: number,
  unitRaw: string | null | undefined,
  lang: Lang,
  toTasteFallback: string,
): string {
  const unit = toKnownUnit(unitRaw);
  if (unit === null && unitRaw !== null && unitRaw !== undefined && unitRaw.trim().length > 0) {
    return `${formatKitchenQuantity(quantity)} ${unitRaw.trim()}`;
  }
  const resolved = unit ?? "count";
  if (resolved === "preference") return unitLabels[lang].preference ?? toTasteFallback;
  return formatWithUnit(quantity, resolved, lang);
}

const excludedIntakeLabel: Record<Lang, string> = {
  ko: "섭취 제외",
  en: "not eaten",
};

const estimatedIntakeLabel: Record<Lang, string> = {
  ko: "추정 섭취",
  en: "estimated intake",
};

const eatenIntakeLabel: Record<Lang, (amount: string) => string> = {
  ko: (amount) => `섭취 ${amount}`,
  en: (amount) => `eaten ${amount}`,
};

export type IngredientIntakeDisplayKind =
  | "legacy-omit"
  | "stated-consumed"
  | "explicit-zero"
  | "role-only-exclude"
  | "unknown-undetermined";

type IngredientIntakeSource = {
  readonly role?: string | null;
  readonly consumedQuantity?: number | string | null;
};

function hasStatedConsumedQuantity(ingredient: IngredientIntakeSource): boolean {
  return (
    ingredient.consumedQuantity !== undefined &&
    ingredient.consumedQuantity !== null &&
    readFiniteAmount(ingredient.consumedQuantity) !== null
  );
}

/**
 * Display kind in this order so role never overwrites a stated consumedQuantity:
 * stated-consumed → explicit-zero → role-only-exclude → unknown-undetermined →
 * legacy-omit. `preparation` + CQ 25 is stated-consumed, not 섭취 제외.
 */
export function readIngredientIntakeDisplayKind(
  ingredient: IngredientIntakeSource,
): IngredientIntakeDisplayKind {
  const consumed = readFiniteAmount(ingredient.consumedQuantity);
  if (hasStatedConsumedQuantity(ingredient) && consumed !== null) {
    return consumed === 0 ? "explicit-zero" : "stated-consumed";
  }
  const role = readIngredientIntakeRole(ingredient.role);
  if (role === "preparation" || role === "discarded") return "role-only-exclude";
  if (role === "unknown") return "unknown-undetermined";
  return "legacy-omit";
}

/**
 * Separate intake badge. Null when legacy fields are omitted (same as today)
 * or when stated intake equals the preparation amount. Never a "selection
 * complete" mark for unresolved alternative groups. Does not change shopping labels.
 */
export function formatIngredientIntakeBadge(
  ingredient: IngredientAmountSource,
  lang: Lang,
  toTasteFallback: string,
): string | null {
  const kind = readIngredientIntakeDisplayKind(ingredient);
  if (kind === "legacy-omit") return null;
  if (kind === "explicit-zero" || kind === "role-only-exclude") return excludedIntakeLabel[lang];
  if (kind === "unknown-undetermined") return estimatedIntakeLabel[lang];

  const consumed = readFiniteAmount(ingredient.consumedQuantity);
  const quantity = readFiniteAmount(ingredient.quantity);
  if (consumed == null) return null;
  if (quantity != null && consumed === quantity) return null;
  return eatenIntakeLabel[lang](formatQuantityUnitPair(consumed, ingredient.unit, lang, toTasteFallback));
}

type AlternativeChoiceLine = {
  readonly alternativeGroup?: string | null;
  readonly role?: string | null;
  readonly consumedQuantity?: number | string | null;
};

/**
 * Unresolved XOR groups stay `candidate` on every line, including the first.
 * A line is `selected` only when the group has exactly one consumed/intake
 * line and the rest are explicit preparation/discarded.
 */
export function resolveAlternativeChoices(
  lines: readonly AlternativeChoiceLine[],
): readonly (IngredientAlternativeChoice | null)[] {
  const byGroup = new Map<string, number[]>();
  lines.forEach((line, index) => {
    const group = line.alternativeGroup?.trim() ?? "";
    if (!group) return;
    const list = byGroup.get(group) ?? [];
    list.push(index);
    byGroup.set(group, list);
  });

  const out: (IngredientAlternativeChoice | null)[] = lines.map((line) =>
    line.alternativeGroup?.trim() ? "candidate" : null,
  );

  for (const indexes of byGroup.values()) {
    const consumed = indexes.filter((index) => {
      const line = lines[index];
      if (!line) return false;
      return (
        readIngredientIntakeDisplayKind(line) === "stated-consumed" ||
        readIngredientIntakeRole(line.role) === "consumed"
      );
    });
    const excluded = indexes.filter((index) => {
      const line = lines[index];
      if (!line) return false;
      const kind = readIngredientIntakeDisplayKind(line);
      return kind === "role-only-exclude" || kind === "explicit-zero";
    });
    if (consumed.length === 1 && excluded.length === indexes.length - 1) {
      for (const index of indexes) {
        out[index] = index === consumed[0] ? "selected" : "unselected";
      }
    }
  }

  return out;
}
