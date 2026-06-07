import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Sparkles, X } from "lucide-react";
import { InstallBand, MobileInstallCta } from "./AppInstallCta";
import { FilterBar, type FilterOptions } from "./FilterBar";
import { RecipeCard } from "./RecipeCard";
import {
  buildActiveChips,
  describeFilters,
  isBrowsingFilters,
} from "./RecipeCatalogFilters";
import { SearchHero, type SearchSuggestion } from "./SearchHero";
import { SearchProgress } from "./SearchProgress";
import { ResultsSearchBar } from "./ResultsSearchBar";
import {
  collectCatalogOptions,
  filterPublicRecipes,
  initialCatalogFilters,
  loadPublicMockRecipes,
  popularPublicRecipes,
} from "../lib/recipeCatalogMock";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeCatalogFilters, PublicRecipeRecord } from "../lib/recipeCatalogTypes";

export function RecipeCatalogPage(): JSX.Element {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();
  const [recipes, setRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [filters, setFilters] = useState<PublicRecipeCatalogFilters>(initialCatalogFilters);
  const [draftQuery, setDraftQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    void loadPublicMockRecipes().then(setRecipes);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimer.current !== null) {
        window.clearTimeout(searchTimer.current);
      }
    };
  }, []);

  const filterOptions = useMemo<FilterOptions>(
    () => collectCatalogOptions(recipes),
    [recipes],
  );
  const visibleRecipes = useMemo(() => filterPublicRecipes(recipes, filters), [recipes, filters]);

  const featured = useMemo(() => popularPublicRecipes(recipes).slice(0, 6), [recipes]);
  const suggestions = useMemo<readonly SearchSuggestion[]>(
    () => buildSuggestions(recipes, labelFor, countryLabel),
    [recipes, labelFor, countryLabel],
  );

  const isBrowsing = isBrowsingFilters(filters);
  const showBrowsing = isBrowsing && !searching;

  const patchFilters = (patch: Partial<PublicRecipeCatalogFilters>): void =>
    setFilters((current) => ({ ...current, ...patch }));
  const runSearch = (): void => {
    const query = draftQuery.trim();
    if (query.length === 0) {
      resetFilters();
      return;
    }
    startSearch({ ...initialCatalogFilters, query });
  };
  const resetFilters = (): void => {
    stopSearching();
    setDraftQuery("");
    setFilters(initialCatalogFilters);
  };
  const selectSuggestion = (suggestion: SearchSuggestion): void => {
    const nextDraftQuery = suggestion.label;
    const nextFilterQuery =
      "primaryIngredient" in suggestion.patch || "region" in suggestion.patch
        ? ""
        : suggestion.patch.query ?? suggestion.label;

    setDraftQuery(nextDraftQuery);
    startSearch({ ...initialCatalogFilters, ...suggestion.patch, query: nextFilterQuery });
  };
  const clearActiveChip = (clear: Partial<PublicRecipeCatalogFilters>): void => {
    if (clear.query === "") {
      setDraftQuery("");
    }
    patchFilters(clear);
  };
  const startSearch = (nextFilters: PublicRecipeCatalogFilters): void => {
    if (searchTimer.current !== null) {
      window.clearTimeout(searchTimer.current);
    }
    setFilters(nextFilters);
    setSearching(true);
    searchTimer.current = window.setTimeout(() => {
      setSearching(false);
      searchTimer.current = null;
    }, 420);
  };
  const stopSearching = (): void => {
    if (searchTimer.current !== null) {
      window.clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
    setSearching(false);
  };

  const activeChips = buildActiveChips(filters, { labelFor, countryLabel, timeLabel });

  return (
    <>
      <main>
        {showBrowsing ? (
          <SearchHero
            query={draftQuery}
            recipeCount={recipes.length}
            suggestions={suggestions}
            onQueryChange={setDraftQuery}
            onSearchSubmit={runSearch}
            onSuggestionSelect={selectSuggestion}
          />
        ) : (
          <ResultsSearchBar
            query={draftQuery}
            onQueryChange={setDraftQuery}
            onSearchSubmit={runSearch}
          />
        )}

        {showBrowsing ? (
          <div className="page">
            <Section eyebrow={t("section.featured.eyebrow")} title={t("section.trending.title")}>
              <div className="grid grid--spotlight">
                {featured.map((recipe) => (
                  <RecipeCard key={recipe.recipeId} recipe={recipe} />
                ))}
              </div>
            </Section>
          </div>
        ) : (
          <div className="page">
            {searching ? <SearchProgress /> : null}

            <div className={searching ? "results-content results-content--loading" : "results-content"}>
              <div className="results-head">
              <div>
                <span className="eyebrow">{t("results.eyebrow")}</span>
                <h2>{describeFilters(filters, { t, labelFor, countryLabel, timeLabel })}</h2>
                <p className="results-count">
                  {t("results.count", { count: visibleRecipes.length })}
                </p>
              </div>
              <button type="button" className="btn btn--ghost" onClick={resetFilters}>
                <X size={16} aria-hidden="true" />
                {t("results.reset")}
              </button>
              </div>

            {activeChips.length > 0 ? (
              <div className="active-filters">
                {activeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="active-filter"
                    aria-label={t("filters.clearOne")}
                    onClick={() => clearActiveChip(chip.clear)}
                  >
                    {chip.emoji.length > 0 ? <span aria-hidden="true">{chip.emoji}</span> : null}
                    {chip.text}
                    <X size={13} aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : null}

            <FilterBar filters={filters} options={filterOptions} onChange={patchFilters} />

            {visibleRecipes.length === 0 ? (
              <div className="empty-state">
                <Sparkles size={28} aria-hidden="true" />
                <strong>{t("empty.title")}</strong>
                <p>{t("empty.body")}</p>
                <button type="button" className="btn btn--primary" onClick={resetFilters}>
                  {t("empty.cta")}
                </button>
              </div>
            ) : (
              <div className="grid grid--feed">
                {visibleRecipes.map((recipe) => (
                  <RecipeCard key={recipe.recipeId} recipe={recipe} />
                ))}
              </div>
            )}

            <InstallBand />
            </div>
          </div>
        )}
      </main>

      <MobileInstallCta />
    </>
  );
}

type SectionProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly note?: string;
  readonly children: ReactNode;
};

function Section({ eyebrow, title, note, children }: SectionProps): JSX.Element {
  return (
    <section className="section">
      <div className="section__head">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {note !== undefined ? <p className="section__note">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function buildSuggestions(
  recipes: readonly PublicRecipeRecord[],
  labelFor: (value: string) => string,
  countryLabel: (value: string) => string,
): readonly SearchSuggestion[] {
  const primaryIngredients = Array.from(new Set(recipes.map((recipe) => recipe.primaryIngredient)));
  const countries = Array.from(new Map(recipes.map((recipe) => [recipe.countryCode, recipe])).values());
  const ingredientSuggestions = primaryIngredients.slice(0, 3).map((ingredient) => ({
    id: `ingredient-${ingredient}`,
    label: labelFor(ingredient),
    note: "주재료",
    patch: { query: labelFor(ingredient), primaryIngredient: ingredient },
  }));
  const countrySuggestions = countries.slice(0, 2).map((recipe) => ({
    id: `country-${recipe.countryCode}`,
    label: `${countryLabel(recipe.country)} 레시피`,
    note: "지역",
    patch: {
      query: "",
      region: { scope: "country", countryCode: recipe.countryCode, country: recipe.country },
    },
  }));
  const recipeSuggestions = recipes.slice(0, 2).map((recipe) => ({
    id: `recipe-${recipe.recipeId}`,
    label: recipe.title,
    note: countryLabel(recipe.country),
    patch: { query: recipe.title },
  }));

  return [...ingredientSuggestions, ...recipeSuggestions];
}
