import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Sparkles, X } from "lucide-react";
import { InstallBand, MobileInstallCta } from "./AppInstallCta";
import { FeaturedRecipeCarousel } from "./FeaturedRecipeCarousel";
import { FilterBar, type FilterOptions } from "./FilterBar";
import { RecipeCard } from "./RecipeCard";
import {
  buildActiveChips,
  describeFilters,
  isBrowsingFilters,
} from "./RecipeCatalogFilters";
import { SearchHero } from "./SearchHero";
import { SearchProgress } from "./SearchProgress";
import { ResultsSearchBar } from "./ResultsSearchBar";
import {
  initialCatalogFilters,
} from "../lib/recipeCatalogMock";
import {
  loadCatalogFilterOptions,
  loadCatalogRecipes,
  loadFeaturedRecipes,
} from "../lib/recipeApi";
import { useI18n } from "../lib/i18n";
import {
  buildRecipeSearchSuggestions,
  type SearchSuggestion,
} from "../lib/recipeSearchSuggestions";
import type { PublicRecipeCatalogFilters, PublicRecipeRecord } from "../lib/recipeCatalogTypes";

export function RecipeCatalogPage(): JSX.Element {
  const { t, displayLang, labelFor, countryLabel, timeLabel } = useI18n();
  const [recipes, setRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [suggestionRecipes, setSuggestionRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [featured, setFeatured] = useState<readonly PublicRecipeRecord[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    region: { countries: [], cities: [], districts: [] },
    writtenLang: [],
    recipeType: [],
    cookingMethod: [],
    technique: [],
    dietaryGoal: [],
    dietaryRestriction: [],
    primaryIngredient: [],
    category: [],
    occasion: [],
    difficulty: [],
    cookingTime: [],
    cuisineRegion: [],
    servings: [],
    requiredTool: [],
  });
  const [filters, setFilters] = useState<PublicRecipeCatalogFilters>(initialCatalogFilters);
  const [draftQuery, setDraftQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<number | null>(null);
  const initializedSuggestionRecipes = useRef(false);

  useEffect(() => {
    let cancelled = false;
    initializedSuggestionRecipes.current = false;

    void loadFeaturedRecipes(displayLang).then((nextFeatured) => {
      if (!cancelled) {
        setFeatured(nextFeatured);
      }
    });
    void loadCatalogFilterOptions(displayLang).then((nextFilterOptions) => {
      if (!cancelled) {
        setFilterOptions(nextFilterOptions);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [displayLang]);

  useEffect(() => {
    let cancelled = false;

    void loadCatalogRecipes(filters, displayLang).then((nextRecipes) => {
      if (!cancelled) {
        setRecipes(nextRecipes);
        if (!initializedSuggestionRecipes.current && isBrowsingFilters(filters)) {
          setSuggestionRecipes(nextRecipes);
          initializedSuggestionRecipes.current = true;
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [displayLang, filters]);

  useEffect(() => {
    return () => {
      if (searchTimer.current !== null) {
        window.clearTimeout(searchTimer.current);
      }
    };
  }, []);

  const suggestions = useMemo<readonly SearchSuggestion[]>(
    () => buildRecipeSearchSuggestions(suggestionRecipes, labelFor, countryLabel),
    [suggestionRecipes, labelFor, countryLabel],
  );
  const homepageFeatured = featured.length > 0 ? featured : suggestionRecipes;

  const isBrowsing = isBrowsingFilters(filters);
  const showBrowsing = isBrowsing && !searching;

  useEffect(() => {
    document.body.classList.toggle("is-results-mode", !showBrowsing);

    return () => {
      document.body.classList.remove("is-results-mode");
    };
  }, [showBrowsing]);

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
            recipeCount={suggestionRecipes.length}
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
              <FeaturedRecipeCarousel recipes={homepageFeatured} />
            </Section>

            {suggestionRecipes.length > 0 ? (
              <Section eyebrow={t("section.featured.eyebrow")} title={t("section.featured.title")}>
                <div className="grid grid--feed">
                  {suggestionRecipes.map((recipe) => (
                    <RecipeCard key={recipe.recipeId} recipe={recipe} />
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        ) : (
          <div className="page">
            {searching ? (
              <SearchProgress />
            ) : (
              <div className="results-content">
                <div className="results-head">
                  <div>
                    <span className="eyebrow">{t("results.eyebrow")}</span>
                    <h2>{describeFilters(filters, { t, labelFor, countryLabel, timeLabel })}</h2>
                    <p className="results-count">
                      {t("results.count", { count: recipes.length })}
                    </p>
                  </div>
                  <button type="button" className="btn btn--ghost" onClick={resetFilters}>
                    <X size={16} aria-hidden="true" />
                    {t("results.reset")}
                  </button>
                </div>

                <FilterBar filters={filters} options={filterOptions} onChange={patchFilters} />

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

                {recipes.length === 0 ? (
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
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe.recipeId} recipe={recipe} />
                    ))}
                  </div>
                )}

                <InstallBand />
              </div>
            )}
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
