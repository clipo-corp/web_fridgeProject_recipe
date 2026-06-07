import { emojiFor } from "../lib/recipeFilterMeta";
import type { RecipeFilters } from "../lib/recipeTypes";

export type LabelHelpers = {
  readonly labelFor: (value: string) => string;
  readonly countryLabel: (value: string) => string;
  readonly timeLabel: (value: string) => string;
};

export type ActiveChip = {
  readonly id: string;
  readonly text: string;
  readonly emoji: string;
  readonly clear: Partial<RecipeFilters>;
};

export function isActive(value: string | undefined): boolean {
  return value !== undefined && value !== "" && value !== "all";
}

export function isBrowsingFilters(filters: RecipeFilters): boolean {
  return (
    filters.query.trim() === "" &&
    !isActive(filters.category) &&
    !isActive(filters.country) &&
    !isActive(filters.region) &&
    !isActive(filters.time) &&
    !isActive(filters.difficulty) &&
    !isActive(filters.recipeType) &&
    !isActive(filters.ingredient) &&
    (filters.sort === undefined || filters.sort === "recommended")
  );
}

export function buildActiveChips(
  filters: RecipeFilters,
  helpers: LabelHelpers,
): readonly ActiveChip[] {
  const chips: ActiveChip[] = [];

  if (filters.query.trim() !== "") {
    chips.push({ id: "query", text: `"${filters.query.trim()}"`, emoji: "🔍", clear: { query: "" } });
  }
  pushIfActive(chips, "region", filters.region, helpers.labelFor, { region: "all" });
  pushIfActive(chips, "country", filters.country, helpers.countryLabel, { country: "all" });
  pushIfActive(chips, "time", filters.time, helpers.timeLabel, { time: "all" });
  pushIfActive(chips, "difficulty", filters.difficulty, helpers.labelFor, { difficulty: "all" });
  pushIfActive(chips, "recipeType", filters.recipeType, helpers.labelFor, { recipeType: "all" });
  pushIfActive(chips, "category", filters.category, helpers.labelFor, { category: "all" });
  pushIfActive(chips, "ingredient", filters.ingredient, helpers.labelFor, { ingredient: "all" });

  return chips;
}

export function describeFilters(filters: RecipeFilters, helpers: LabelHelpers & {
  readonly t: (key: "results.all") => string;
}): string {
  const parts = [
    filters.query.trim() === "" ? null : `'${filters.query.trim()}'`,
    isActive(filters.region) ? helpers.labelFor(filters.region ?? "") : null,
    isActive(filters.country) ? helpers.countryLabel(filters.country) : null,
    isActive(filters.category) ? helpers.labelFor(filters.category) : null,
    isActive(filters.recipeType) ? helpers.labelFor(filters.recipeType ?? "") : null,
    isActive(filters.difficulty) ? helpers.labelFor(filters.difficulty ?? "") : null,
    isActive(filters.time) ? helpers.timeLabel(filters.time ?? "") : null,
    isActive(filters.ingredient) ? helpers.labelFor(filters.ingredient ?? "") : null,
  ].filter((value): value is string => value !== null);

  return parts.length > 0 ? parts.join(" · ") : helpers.t("results.all");
}

function pushIfActive(
  chips: ActiveChip[],
  id: string,
  value: string | undefined,
  labelFor: (value: string) => string,
  clear: Partial<RecipeFilters>,
): void {
  if (!isActive(value)) {
    return;
  }

  const safeValue = value ?? "";
  chips.push({
    id,
    text: labelFor(safeValue),
    emoji: emojiFor(safeValue),
    clear,
  });
}
