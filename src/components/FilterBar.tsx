import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { emojiFor, orderDifficulty, orderTime } from "../lib/recipeFilterMeta";
import type { RecipeFilters, RecipeSort } from "../lib/recipeTypes";

export type FilterOptions = {
  readonly region: readonly string[];
  readonly country: readonly string[];
  readonly time: readonly string[];
  readonly difficulty: readonly string[];
  readonly recipeType: readonly string[];
  readonly category: readonly string[];
  readonly ingredient: readonly string[];
};

type FilterBarProps = {
  readonly filters: RecipeFilters;
  readonly options: FilterOptions;
  readonly onChange: (patch: Partial<RecipeFilters>) => void;
};

type Option = {
  readonly value: string;
  readonly label: string;
  readonly emoji: string;
};

export function FilterBar({ filters, options, onChange }: FilterBarProps): JSX.Element {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();
  const [open, setOpen] = useState(false);

  const allLabel = t("filters.all");
  const toOptions = (
    values: readonly string[],
    format: (value: string) => string,
  ): readonly Option[] =>
    values.map((value) => ({ value, label: format(value), emoji: emojiFor(value) }));

  const sortOptions: readonly Option[] = [
    { value: "recommended", label: t("sort.recommended"), emoji: "" },
    { value: "popular", label: t("sort.popular"), emoji: "" },
    { value: "latest", label: t("sort.latest"), emoji: "" },
  ];

  return (
    <div className="filter-panel">
      <div className="filter-panel__head">
        <div>
          <span className="eyebrow">{t("filters.title")}</span>
          <p className="filter-panel__subtitle">{t("filters.subtitle")}</p>
        </div>
        <button
          type="button"
          className="filter-panel__toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          {open ? t("filters.less") : t("filters.more")}
        </button>
      </div>

      <div className="filter-cards">
        <SelectorCard
          label={t("filters.sort")}
          value={filters.sort ?? "recommended"}
          options={sortOptions}
          allLabel={allLabel}
          includeAll={false}
          onChange={(value) => onChange({ sort: value as RecipeSort })}
        />
        <SelectorCard
          label={t("filters.region")}
          value={filters.region ?? "all"}
          options={toOptions(options.region, labelFor)}
          allLabel={allLabel}
          onChange={(value) => onChange({ region: value })}
        />
        <SelectorCard
          label={t("filters.country")}
          value={filters.country}
          options={toOptions(options.country, countryLabel)}
          allLabel={allLabel}
          onChange={(value) => onChange({ country: value })}
        />
        <SelectorCard
          label={t("filters.time")}
          value={filters.time ?? "all"}
          options={toOptions(orderTime(options.time), timeLabel)}
          allLabel={allLabel}
          onChange={(value) => onChange({ time: value })}
        />
        <SelectorCard
          label={t("filters.difficulty")}
          value={filters.difficulty ?? "all"}
          options={toOptions(orderDifficulty(options.difficulty), labelFor)}
          allLabel={allLabel}
          onChange={(value) => onChange({ difficulty: value })}
        />
      </div>

      {open ? (
        <div className="filter-cards filter-cards--advanced">
          <SelectorCard
            label={t("filters.recipeType")}
            value={filters.recipeType ?? "all"}
            options={toOptions(options.recipeType, labelFor)}
            allLabel={allLabel}
            onChange={(value) => onChange({ recipeType: value })}
          />
          <SelectorCard
            label={t("filters.category")}
            value={filters.category}
            options={toOptions(options.category, labelFor)}
            allLabel={allLabel}
            onChange={(value) => onChange({ category: value })}
          />
          <SelectorCard
            label={t("filters.ingredient")}
            value={filters.ingredient ?? "all"}
            options={toOptions(options.ingredient, labelFor)}
            allLabel={allLabel}
            onChange={(value) => onChange({ ingredient: value })}
          />
        </div>
      ) : null}
    </div>
  );
}

type SelectorCardProps = {
  readonly label: string;
  readonly value: string;
  readonly options: readonly Option[];
  readonly allLabel: string;
  readonly includeAll?: boolean;
  readonly onChange: (value: string) => void;
};

function SelectorCard({
  label,
  value,
  options,
  allLabel,
  includeAll = true,
  onChange,
}: SelectorCardProps): JSX.Element {
  return (
    <label className="selector-card">
      <span className="selector-card__label">{label}</span>
      <span className="selector-card__control">
        <select value={value} aria-label={label} onChange={(event) => onChange(event.target.value)}>
          {includeAll ? <option value="all">{allLabel}</option> : null}
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.emoji.length > 0 ? `${option.emoji} ${option.label}` : option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </label>
  );
}
