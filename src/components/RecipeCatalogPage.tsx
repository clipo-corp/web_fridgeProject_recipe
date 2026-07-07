import { useEffect, useMemo, useRef, useState } from "react";
import { MobileInstallCta } from "./AppInstallCta";
import type { FilterOptions } from "./FilterBar";
import { buildActiveChips, isBrowsingFilters } from "./RecipeCatalogFilters";
import { RecipeCatalogBrowsingContent } from "./RecipeCatalogBrowsingContent";
import { RecipeCatalogResultsContent } from "./RecipeCatalogResultsContent";
import { SearchHero } from "./SearchHero";
import { ResultsSearchBar } from "./ResultsSearchBar";
import {
  initialCatalogFilters,
} from "../lib/recipeCatalogMock";
import {
  loadCatalogRecipePage,
  loadCatalogRecipes,
} from "../lib/recipeApi";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
} from "../lib/recipeCatalogUrlSync";
import { useI18n } from "../lib/i18n";
import {
  buildRecipeSearchSuggestions,
  fallbackRecipeSearchSuggestions,
  filterRecipeSearchSuggestions,
  type SearchSuggestion,
} from "../lib/recipeSearchSuggestions";
import type {
  PublicRecipeCatalogFilters,
  PublicRecipeRecord,
  RecipeSearchScope,
} from "../lib/recipeCatalogTypes";

type RecipeCatalogPageProps = {
  readonly filterOptions: FilterOptions;
};

const homepageRecipeLimit = 5;
const homepageRecipePageLimit = 1;
const searchResultRecipePageSize = 5;
const querySuggestionRecipePageLimit = 1;

export function RecipeCatalogPage({
  filterOptions,
}: RecipeCatalogPageProps): JSX.Element {
  const { displayLang, labelFor, countryLabel, timeLabel } = useI18n();
  const [recipes, setRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [suggestionRecipes, setSuggestionRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [querySuggestionRecipes, setQuerySuggestionRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [resultPageNumber, setResultPageNumber] = useState(0);
  const [hasNextResultPage, setHasNextResultPage] = useState(false);
  const [filters, setFilters] = useState<PublicRecipeCatalogFilters>(() =>
    filtersFromSearchParams(window.location.search),
  );
  const [draftQuery, setDraftQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") ?? "";
  });
  const [searching, setSearching] = useState(() =>
    !isBrowsingFilters(filtersFromSearchParams(window.location.search))
  );
  const initializedSuggestionRecipes = useRef(false);

  useEffect(() => {
    initializedSuggestionRecipes.current = false;
  }, [displayLang]);

  useEffect(() => {
    let cancelled = false;
    const isHomepageBrowsing = isBrowsingFilters(filters);

    if (!isHomepageBrowsing) {
      setSearching(true);
    }

    const request = isHomepageBrowsing
      ? loadCatalogRecipes(filters, displayLang, homepageRecipeLimit, { maxPages: homepageRecipePageLimit })
          .then((nextRecipes) => ({
            recipes: nextRecipes,
            isAfter: false,
          }))
      : loadCatalogRecipePage(filters, displayLang, resultPageNumber);

    void request
      .then((result) => {
        if (cancelled) {
          return;
        }

        setRecipes(result.recipes);
        setHasNextResultPage(result.isAfter);
        if (
          !initializedSuggestionRecipes.current &&
          isHomepageBrowsing
        ) {
          setSuggestionRecipes(result.recipes);
          initializedSuggestionRecipes.current = true;
        }

        setSearching(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setRecipes([]);
        setHasNextResultPage(false);
        setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [displayLang, filters, resultPageNumber]);

  useEffect(() => {
    const params = filtersToSearchParams(filters);
    const search = params.toString();
    const newUrl = search.length > 0
      ? `${window.location.pathname}?${search}`
      : window.location.pathname;
    history.replaceState(null, "", newUrl);
  }, [filters]);

  useEffect(() => {
    const query = draftQuery.trim();
    if (query.length === 0) {
      setQuerySuggestionRecipes([]);
      return;
    }

    const isResultQuery =
      !isBrowsingFilters(filters) &&
      query === filters.query.trim();
    if (isResultQuery) {
      setQuerySuggestionRecipes(recipes.slice(0, 20));
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void loadCatalogRecipes(
        {
          ...initialCatalogFilters,
          query,
          searchScope: filters.searchScope,
          sort: "popular",
        },
        displayLang,
        20,
        { maxPages: querySuggestionRecipePageLimit },
      ).then((nextRecipes) => {
        if (!cancelled) {
          setQuerySuggestionRecipes(nextRecipes.slice(0, 20));
        }
      });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [draftQuery, displayLang, filters, recipes]);

  const suggestionPool = useMemo<readonly PublicRecipeRecord[]>(
    () => {
      if (draftQuery.trim().length === 0) {
        return suggestionRecipes;
      }

      const merged = new Map<string, PublicRecipeRecord>();
      for (const recipe of querySuggestionRecipes) {
        merged.set(recipe.recipeId, recipe);
      }
      for (const recipe of suggestionRecipes) {
        if (!merged.has(recipe.recipeId)) {
          merged.set(recipe.recipeId, recipe);
        }
      }
      return Array.from(merged.values());
    },
    [draftQuery, suggestionRecipes, querySuggestionRecipes],
  );

  const suggestions = useMemo<readonly SearchSuggestion[]>(
    () => {
      const recipeSuggestions = buildRecipeSearchSuggestions(
        suggestionPool,
        labelFor,
        countryLabel,
        draftQuery,
        filters.searchScope,
      );

      if (recipeSuggestions.length > 0) {
        return recipeSuggestions;
      }

      return filters.searchScope === "recipe"
        ? []
        : filterRecipeSearchSuggestions(fallbackRecipeSearchSuggestions, draftQuery);
    },
    [suggestionPool, labelFor, countryLabel, draftQuery, filters.searchScope],
  );
  const homepageFeatured = useMemo(
    () => suggestionRecipes.slice(0, 3),
    [suggestionRecipes],
  );
  const speedyRecipes = useMemo(
    () => sortByCookingTimeAsc(suggestionRecipes)
      .filter((recipe) => cookingTimeMinutes(recipe.cookingTime) >= 10)
      .slice(0, 3),
    [suggestionRecipes],
  );

  const isBrowsing = isBrowsingFilters(filters);
  const showBrowsing = isBrowsing && !searching;

  useEffect(() => {
    document.body.classList.toggle("is-results-mode", !showBrowsing);

    return () => {
      document.body.classList.remove("is-results-mode");
    };
  }, [showBrowsing]);

  const baseFilters = (): PublicRecipeCatalogFilters => ({
    ...initialCatalogFilters,
    searchScope: filters.searchScope,
  });
  const changeSearchScope = (searchScope: RecipeSearchScope): void => {
    setResultPageNumber(0);
    setFilters((current) =>
      current.searchScope === searchScope ? current : { ...current, searchScope },
    );
  };
  const patchFilters = (patch: Partial<PublicRecipeCatalogFilters>): void => {
    const nextFilters = { ...filters, ...patch };
    setResultPageNumber(0);
    setSearching(!isBrowsingFilters(nextFilters));
    setFilters(nextFilters);
  };
  const runSearch = (): void => {
    const query = draftQuery.trim();
    if (query.length === 0) {
      stopSearching();
      setResultPageNumber(0);
      setFilters(baseFilters());
      return;
    }
    startSearch({ ...baseFilters(), query });
  };
  const resetFilters = (): void => {
    stopSearching();
    setDraftQuery("");
    setResultPageNumber(0);
    setFilters(initialCatalogFilters);
  };
  const selectSuggestion = (suggestion: SearchSuggestion): void => {
    const nextDraftQuery = suggestion.label;
    const nextFilterQuery =
      "primaryIngredient" in suggestion.patch || "region" in suggestion.patch
        ? ""
        : suggestion.patch.query ?? suggestion.label;

    setDraftQuery(nextDraftQuery);
    startSearch({ ...baseFilters(), ...suggestion.patch, query: nextFilterQuery });
  };
  const selectCategory = (category: string): void => {
    setDraftQuery("");
    startSearch({ ...baseFilters(), category });
  };
  const clearActiveChip = (clear: Partial<PublicRecipeCatalogFilters>): void => {
    if (clear.query === "") {
      setDraftQuery("");
    }
    patchFilters(clear);
  };
  const startSearch = (nextFilters: PublicRecipeCatalogFilters): void => {
    setResultPageNumber(0);
    setSearching(!isBrowsingFilters(nextFilters));
    setFilters(nextFilters);
  };
  const stopSearching = (): void => {
    setSearching(false);
  };

  const activeChips = buildActiveChips(filters, { labelFor, countryLabel, timeLabel });

  return (
    <>
      <main>
        {showBrowsing ? (
          <SearchHero
            query={draftQuery}
            searchScope={filters.searchScope}
            recipeCount={suggestionRecipes.length}
            suggestions={suggestions}
            onQueryChange={setDraftQuery}
            onSearchScopeChange={changeSearchScope}
            onSearchSubmit={runSearch}
            onSuggestionSelect={selectSuggestion}
          />
        ) : (
          <ResultsSearchBar
            query={draftQuery}
            searchScope={filters.searchScope}
            suggestions={suggestions}
            onQueryChange={setDraftQuery}
            onSearchScopeChange={changeSearchScope}
            onSearchSubmit={runSearch}
            onSuggestionSelect={selectSuggestion}
          />
        )}

        {showBrowsing ? (
          <RecipeCatalogBrowsingContent
            featuredRecipes={homepageFeatured}
            speedyRecipes={speedyRecipes}
            categories={filterOptions.category}
            onCategorySelect={selectCategory}
          />
        ) : (
          <RecipeCatalogResultsContent
            recipes={recipes}
            searching={searching}
            filters={filters}
            filterOptions={filterOptions}
            activeChips={activeChips}
            onResetFilters={resetFilters}
            onFilterChange={patchFilters}
            onClearActiveChip={clearActiveChip}
            serverPageNumber={resultPageNumber + 1}
            serverPageSize={searchResultRecipePageSize}
            hasNextPage={hasNextResultPage}
            onPageChange={(pageNumber) => {
              setResultPageNumber(Math.max(0, pageNumber - 1));
              setSearching(true);
            }}
          />
        )}
      </main>

      <MobileInstallCta />
    </>
  );
}

function uniqueRecipes(recipes: readonly PublicRecipeRecord[]): readonly PublicRecipeRecord[] {
  return Array.from(new Map(recipes.map((recipe) => [recipe.recipeId, recipe])).values());
}

function sortByCookingTimeAsc(recipes: readonly PublicRecipeRecord[]): readonly PublicRecipeRecord[] {
  return [...uniqueRecipes(recipes)].sort((a, b) => {
    const timeGap = cookingTimeMinutes(a.cookingTime) - cookingTimeMinutes(b.cookingTime);
    if (timeGap !== 0) {
      return timeGap;
    }
    return b.likeCount - a.likeCount;
  });
}

function cookingTimeMinutes(cookingTime: string): number {
  if (cookingTime === "1h+") {
    return 60;
  }

  const match = /^(\d+)min$/.exec(cookingTime);
  return match === null ? Number.POSITIVE_INFINITY : Number(match[1]);
}
