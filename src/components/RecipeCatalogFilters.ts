import { emojiFor } from "../lib/recipeFilterMeta";
import { recipeFilterKeys } from "../lib/recipeCatalogTypes";
import type { PublicRecipeCatalogFilters, RecipeCatalogRegion } from "../lib/recipeCatalogTypes";

export type LabelHelpers = {
  readonly labelFor: (value: string) => string;
  readonly countryLabel: (value: string) => string;
  readonly timeLabel: (value: string) => string;
};

export type ActiveChip = {
  readonly id: string;
  readonly text: string;
  readonly emoji: string;
  readonly clear: Partial<PublicRecipeCatalogFilters>;
};

export function isActive(value: string | undefined): boolean {
  return value !== undefined && value !== "" && value !== "all";
}

export function isBrowsingFilters(filters: PublicRecipeCatalogFilters): boolean {
  return (
    filters.query.trim() === "" &&
    filters.sort === "latest" &&
    filters.writtenLang === "all" &&
    filters.region.scope === "none" &&
    filters.isUseLocalData === "all" &&
    recipeFilterKeys.every((key) => !isActive(filters[key]))
  );
}

export function buildActiveChips(
  filters: PublicRecipeCatalogFilters,
  helpers: LabelHelpers,
): readonly ActiveChip[] {
  const chips: ActiveChip[] = [];

  if (filters.query.trim() !== "") {
    chips.push({ id: "query", text: `"${filters.query.trim()}"`, emoji: "🔍", clear: { query: "" } });
  }
  if (filters.sort !== "latest") {
    chips.push({ id: "sort", text: helpers.labelFor(filters.sort), emoji: "", clear: { sort: "latest" } });
  }
  pushIfActive(chips, "writtenLang", filters.writtenLang, helpers.labelFor, { writtenLang: "all" });
  if (filters.region.scope !== "none") {
    chips.push({
      id: "region",
      text: regionLabel(filters.region, helpers),
      emoji: emojiFor(regionCountry(filters.region)),
      clear: { region: { scope: "none" } },
    });
  }
  pushIfActive(chips, "isUseLocalData", filters.isUseLocalData, helpers.labelFor, {
    isUseLocalData: "all",
  });
  for (const key of recipeFilterKeys) {
    pushIfActive(chips, key, filters[key], labelForFilter(key, helpers), { [key]: "all" });
  }

  return chips;
}

export function describeFilters(filters: PublicRecipeCatalogFilters, helpers: LabelHelpers & {
  readonly t: (key: "results.all") => string;
}): string {
  const parts = [
    filters.query.trim() === "" ? null : `'${filters.query.trim()}'`,
    filters.region.scope === "none" ? null : regionLabel(filters.region, helpers),
    isActive(filters.writtenLang) ? helpers.labelFor(filters.writtenLang) : null,
    isActive(filters.category) ? helpers.labelFor(filters.category) : null,
    isActive(filters.recipeType) ? helpers.labelFor(filters.recipeType) : null,
    isActive(filters.difficulty) ? helpers.labelFor(filters.difficulty) : null,
    isActive(filters.cookingTime) ? helpers.timeLabel(filters.cookingTime) : null,
    isActive(filters.primaryIngredient) ? helpers.labelFor(filters.primaryIngredient) : null,
  ].filter((value): value is string => value !== null);

  return parts.length > 0 ? parts.join(" · ") : helpers.t("results.all");
}

function pushIfActive(
  chips: ActiveChip[],
  id: string,
  value: string | undefined,
  labelFor: (value: string) => string,
  clear: Partial<PublicRecipeCatalogFilters>,
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

function labelForFilter(
  key: (typeof recipeFilterKeys)[number],
  helpers: LabelHelpers,
): (value: string) => string {
  return key === "cookingTime" ? helpers.timeLabel : helpers.labelFor;
}

function regionCountry(region: RecipeCatalogRegion): string {
  if (region.scope === "none") {
    return "";
  }
  return region.country;
}

function regionLabel(region: RecipeCatalogRegion, helpers: LabelHelpers): string {
  if (region.scope === "country") {
    return helpers.countryLabel(region.country);
  }
  if (region.scope === "city") {
    return `${helpers.countryLabel(region.country)} · ${region.city}`;
  }
  if (region.scope === "district") {
    return `${helpers.countryLabel(region.country)} · ${region.city} · ${region.district}`;
  }
  return "";
}
