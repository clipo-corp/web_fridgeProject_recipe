import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { makeRegionOptions, parseRegion } from "./FilterRegionOptions";
import type { Option } from "./FilterOption";
import { useI18n } from "../lib/i18n";
import { emojiFor, orderDifficulty, orderTime } from "../lib/recipeFilterMeta";
import { regionToSelectValue } from "../lib/recipeCatalogRegion";
import type {
  CatalogFilterOptions,
} from "../lib/recipeCatalogMock";
import type {
  PublicRecipeCatalogFilters,
  RecipeSearchSort,
} from "../lib/recipeCatalogTypes";

export type FilterOptions = CatalogFilterOptions;

type FilterBarProps = {
  readonly filters: PublicRecipeCatalogFilters;
  readonly options: FilterOptions;
  readonly onChange: (patch: Partial<PublicRecipeCatalogFilters>) => void;
};

export function FilterBar({ filters, options, onChange }: FilterBarProps): JSX.Element {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const allLabel = t("filters.all");
  const toOptions = (
    values: readonly string[],
    format: (value: string) => string,
  ): readonly Option[] =>
    values.map((value) => ({ value, label: format(value), emoji: emojiFor(value) }));

  const sortOptions: readonly Option[] = [
    { value: "latest", label: t("sort.latest"), emoji: "" },
    { value: "popular", label: t("sort.popular"), emoji: "" },
    { value: "hot_month", label: t("sort.hotMonth"), emoji: "" },
  ];
  const langOptions: readonly Option[] = [
    { value: "ko", label: t("filters.langKo"), emoji: "" },
    { value: "en", label: t("filters.langEn"), emoji: "" },
  ];
  const localDataOptions: readonly Option[] = [
    { value: "local", label: t("filters.localData"), emoji: "" },
    { value: "original", label: t("filters.originalData"), emoji: "" },
  ];
  const regionOptions = makeRegionOptions(options, countryLabel);

  return (
    <div className={mobileOpen ? "filter-panel filter-panel--mobile-open" : "filter-panel"}>
      <div className="filter-panel__head">
        <div>
          <span className="eyebrow">{t("filters.title")}</span>
          <p className="filter-panel__subtitle">{t("filters.subtitle")}</p>
        </div>
        <button
          type="button"
          className="filter-panel__mobile-toggle"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          {mobileOpen ? t("filters.mobileClose") : t("filters.mobileOpen")}
        </button>
        <button
          type="button"
          className="filter-panel__toggle filter-panel__toggle--advanced"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          {open ? t("filters.less") : t("filters.more")}
        </button>
      </div>

      <div className="filter-panel__body">
        <div className="filter-chip-groups">
          <ChipGroup
            label={t("filters.sort")}
            value={filters.sort}
            options={sortOptions}
            allLabel={allLabel}
            includeAll={false}
            onChange={(value) => onChange({ sort: parseSort(value) })}
          />
          <ChipGroup
            label={t("filters.location")}
            value={regionToSelectValue(filters.region)}
            options={regionOptions}
            allLabel={allLabel}
            onChange={(value) => onChange({ region: parseRegion(value, options) })}
          />
          <ChipGroup
            label={t("filters.writtenLang")}
            value={filters.writtenLang}
            options={langOptions}
            allLabel={allLabel}
            onChange={(value) => onChange({ writtenLang: value === "en" ? "en" : value === "ko" ? "ko" : "all" })}
          />
          <ChipGroup
            label={t("filters.localMode")}
            value={filters.isUseLocalData}
            options={localDataOptions}
            allLabel={allLabel}
            onChange={(value) =>
              onChange({ isUseLocalData: value === "local" ? "local" : value === "original" ? "original" : "all" })
            }
          />
          <ChipGroup
            label={t("filters.time")}
            value={filters.cookingTime}
            options={toOptions(orderTime(options.cookingTime), timeLabel)}
            allLabel={allLabel}
            onChange={(value) => onChange({ cookingTime: value })}
          />
          <ChipGroup
            label={t("filters.difficulty")}
            value={filters.difficulty}
            options={toOptions(orderDifficulty(options.difficulty), labelFor)}
            allLabel={allLabel}
            onChange={(value) => onChange({ difficulty: value })}
          />
        </div>

        {open ? (
          <div className="filter-chip-groups filter-chip-groups--advanced">
            <ChipGroup
              label={t("filters.recipeType")}
              value={filters.recipeType}
              options={toOptions(options.recipeType, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ recipeType: value })}
            />
            <ChipGroup
              label={t("filters.category")}
              value={filters.category}
              options={toOptions(options.category, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ category: value })}
            />
            <ChipGroup
              label={t("filters.ingredient")}
              value={filters.primaryIngredient}
              options={toOptions(options.primaryIngredient, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ primaryIngredient: value })}
            />
            <ChipGroup
              label={t("filters.cookingMethod")}
              value={filters.cookingMethod}
              options={toOptions(options.cookingMethod, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ cookingMethod: value })}
            />
            <ChipGroup
              label={t("filters.technique")}
              value={filters.technique}
              options={toOptions(options.technique, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ technique: value })}
            />
            <ChipGroup
              label={t("filters.dietaryGoal")}
              value={filters.dietaryGoal}
              options={toOptions(options.dietaryGoal, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ dietaryGoal: value })}
            />
            <ChipGroup
              label={t("filters.dietaryRestriction")}
              value={filters.dietaryRestriction}
              options={toOptions(options.dietaryRestriction, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ dietaryRestriction: value })}
            />
            <ChipGroup
              label={t("filters.occasion")}
              value={filters.occasion}
              options={toOptions(options.occasion, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ occasion: value })}
            />
            <ChipGroup
              label={t("filters.servings")}
              value={filters.servings}
              options={toOptions(options.servings, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ servings: value })}
            />
            <ChipGroup
              label={t("filters.requiredTool")}
              value={filters.requiredTool}
              options={toOptions(options.requiredTool, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ requiredTool: value })}
            />
            <ChipGroup
              label={t("filters.cuisineRegion")}
              value={filters.cuisineRegion}
              options={toOptions(options.cuisineRegion, labelFor)}
              allLabel={allLabel}
              onChange={(value) => onChange({ cuisineRegion: value })}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ChipGroupProps = {
  readonly label: string;
  readonly value: string;
  readonly options: readonly Option[];
  readonly allLabel: string;
  readonly includeAll?: boolean;
  readonly onChange: (value: string) => void;
};

function ChipGroup({
  label,
  value,
  options,
  allLabel,
  includeAll = true,
  onChange,
}: ChipGroupProps): JSX.Element {
  const chipOptions = includeAll
    ? [{ value: "all", label: allLabel, emoji: "" }, ...options]
    : options;

  return (
    <section className="filter-chip-group" aria-label={label}>
      <span className="filter-chip-group__label">{label}</span>
      <div className="filter-chip-group__rail">
        {chipOptions.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              className={selected ? "filter-chip filter-chip--selected" : "filter-chip"}
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
            >
              {option.emoji.length > 0 ? <span aria-hidden="true">{option.emoji}</span> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function parseSort(value: string): RecipeSearchSort {
  if (value === "popular" || value === "hot_month") {
    return value;
  }
  return "latest";
}
