import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
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
  readonly serverPageNumber?: number;
  readonly serverPageSize?: number;
  readonly hasNextPage?: boolean;
  readonly onPageChange?: (pageNumber: number) => void;
};

const pageSize = 12;

export function RecipeCatalogResultsContent({
  recipes,
  searching,
  filters,
  filterOptions,
  activeChips,
  onResetFilters,
  onFilterChange,
  onClearActiveChip,
  serverPageNumber,
  serverPageSize,
  hasNextPage = false,
  onPageChange,
}: RecipeCatalogResultsContentProps): JSX.Element {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();
  const [pageNumber, setPageNumber] = useState(1);
  const isServerPaginated = onPageChange !== undefined;
  const effectivePageSize = isServerPaginated ? serverPageSize ?? pageSize : pageSize;
  const localTotalPages = Math.max(1, Math.ceil(recipes.length / pageSize));
  const currentServerPageNumber = Math.max(1, serverPageNumber ?? 1);
  const totalPages = isServerPaginated
    ? currentServerPageNumber + (hasNextPage ? 1 : 0)
    : localTotalPages;
  const currentPageNumber = isServerPaginated
    ? currentServerPageNumber
    : Math.min(pageNumber, totalPages);
  const visiblePages = useMemo(
    () => getVisiblePages(currentPageNumber, totalPages),
    [currentPageNumber, totalPages],
  );
  const pageStart = (currentPageNumber - 1) * effectivePageSize;
  const pagedRecipes = useMemo(
    () => isServerPaginated ? recipes : recipes.slice(pageStart, pageStart + pageSize),
    [isServerPaginated, pageStart, recipes],
  );
  const pageRangeStart = recipes.length === 0 ? 0 : pageStart + 1;
  const pageRangeEnd = recipes.length === 0 ? 0 : pageStart + pagedRecipes.length;
  const displayedTotal = isServerPaginated
    ? hasNextPage
      ? `${pageRangeEnd}+`
      : pageRangeEnd
    : recipes.length;
  const showPagination =
    recipes.length > 0 && (totalPages > 1 || currentPageNumber > 1 || hasNextPage);

  useEffect(() => {
    if (!isServerPaginated) {
      setPageNumber(1);
    }
  }, [filters, isServerPaginated, recipes.length]);

  useEffect(() => {
    if (!isServerPaginated) {
      setPageNumber((currentPage) => Math.min(currentPage, totalPages));
    }
  }, [isServerPaginated, totalPages]);

  const changePage = (page: number): void => {
    const nextPage = Math.max(1, Math.min(totalPages, page));
    if (onPageChange !== undefined) {
      onPageChange(nextPage);
      return;
    }

    setPageNumber(nextPage);
  };

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
              <p className="results-count">{t("results.count", { count: displayedTotal })}</p>
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
            <>
              <div className="grid grid--feed">
                {pagedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.recipeId} recipe={recipe} />
                ))}
              </div>

              {showPagination ? (
                <nav className="pagination" aria-label={t("results.pagination")}>
                  <p className="pagination__summary">
                    {t("results.pageRange", {
                      start: pageRangeStart,
                      end: pageRangeEnd,
                      total: displayedTotal,
                    })}
                  </p>
                  <div className="pagination__controls">
                    <button
                      type="button"
                      className="pagination__button pagination__button--step"
                      onClick={() => changePage(currentPageNumber - 1)}
                      disabled={currentPageNumber === 1}
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                      {t("results.prev")}
                    </button>
                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        type="button"
                        className="pagination__button pagination__button--page"
                        aria-current={currentPageNumber === page ? "page" : undefined}
                        aria-label={t("results.pageLabel", { page })}
                        onClick={() => changePage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="pagination__button pagination__button--step"
                      onClick={() => changePage(currentPageNumber + 1)}
                      disabled={currentPageNumber === totalPages}
                    >
                      {t("results.next")}
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </nav>
              ) : null}
            </>
          )}

          <InstallBand />
        </div>
      )}
    </div>
  );
}

function getVisiblePages(currentPage: number, totalPages: number): readonly number[] {
  const maxVisiblePages = 5;
  const firstPage = Math.max(
    1,
    Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages + 1),
  );
  const lastPage = Math.min(totalPages, firstPage + maxVisiblePages - 1);

  return Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);
}
