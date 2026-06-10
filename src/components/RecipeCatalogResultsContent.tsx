import { Sparkles, X } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeCatalogFilters, PublicRecipeRecord } from "../lib/recipeCatalogTypes";
import { InstallBand } from "./AppInstallCta";
import { FilterBar, type FilterOptions } from "./FilterBar";
import { RecipeCard } from "./RecipeCard";
import {
  describeFilters,
  type ActiveChip,
} from "./RecipeCatalogFilters";
import { SearchProgress } from "./SearchProgress";

type RecipeCatalogResultsContentProps = {
  readonly recipes: readonly PublicRecipeRecord[];
  readonly searching: boolean;
  readonly filters: PublicRecipeCatalogFilters;
  readonly filterOptions: FilterOptions;
  readonly activeChips: readonly ActiveChip[];
  readonly onResetFilters: () => void;
  readonly onFilterChange: (patch: Partial<PublicRecipeCatalogFilters>) => void;
  readonly onClearActiveChip: (clear: Partial<PublicRecipeCatalogFilters>) => void;
};

export function RecipeCatalogResultsContent({
  recipes,
  searching,
  filters,
  filterOptions,
  activeChips,
  onResetFilters,
  onFilterChange,
  onClearActiveChip,
}: RecipeCatalogResultsContentProps): JSX.Element {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();

  return (
    <div className="page">
      {searching ? (
        <SearchProgress />
      ) : (
        <div className="results-content">
          <div className="results-head">
            <div>
              <span className="eyebrow">{t("results.eyebrow")}</span>
              <h2>{describeFilters(filters, { t, labelFor, countryLabel, timeLabel })}</h2>
              <p className="results-count">{t("results.count", { count: recipes.length })}</p>
            </div>
            <button type="button" className="btn btn--ghost" onClick={onResetFilters}>
              <X size={16} aria-hidden="true" />
              {t("results.reset")}
            </button>
          </div>

          <FilterBar filters={filters} options={filterOptions} onChange={onFilterChange} />

          {activeChips.length > 0 ? (
            <div className="active-filters">
              {activeChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className="active-filter"
                  aria-label={t("filters.clearOne")}
                  onClick={() => onClearActiveChip(chip.clear)}
                >
                  {chip.emoji.length > 0 ? <span aria-hidden="true">{chip.emoji}</span> : null}
                  {chip.text}
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}

          {recipes.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={28} aria-hidden="true" />
              <strong>{t("empty.title")}</strong>
              <p>{t("empty.body")}</p>
              <button type="button" className="btn btn--primary" onClick={onResetFilters}>
                {t("empty.cta")}
              </button>
            </div>
          ) : (
            <div className="grid grid--feed">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.recipeId} recipe={recipe} />
              ))}
            </div>
          )}

          <InstallBand />
        </div>
      )}
    </div>
  );
}
