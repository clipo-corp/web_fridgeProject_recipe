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
} from "../lib/recipeCatalogTypes";

type RecipeCatalogPageProps = {
  readonly filterOptions: FilterOptions;
  readonly selectedCuisineRegion: string;
  readonly onSelectedCuisineRegionChange: (cuisineRegion: string) => void;
};

const homepageRecipeLimit = 5;
const homepageRecipePageLimit = 1;
const searchResultRecipeLimit = 100;

export function RecipeCatalogPage({
  filterOptions,
  selectedCuisineRegion,
  onSelectedCuisineRegionChange,
}: RecipeCatalogPageProps): JSX.Element {
  const { displayLang, labelFor, countryLabel, timeLabel } = useI18n();
  const [recipes, setRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [suggestionRecipes, setSuggestionRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [querySuggestionRecipes, setQuerySuggestionRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [filters, setFilters] = useState<PublicRecipeCatalogFilters>(() =>
    filtersFromSearchParams(window.location.search),
  );
  const [draftQuery, setDraftQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") ?? "";
  });
  const [searching, setSearching] = useState(() =>
    !isBrowsingWithSelectedCuisineRegion(filtersFromSearchParams(window.location.search), selectedCuisineRegion)
  );
  const initializedSuggestionRecipes = useRef(false);

  useEffect(() => {
    initializedSuggestionRecipes.current = false;
  }, [displayLang, selectedCuisineRegion]);

  useEffect(() => {
    setFilters((current) =>
      current.cuisineRegion === selectedCuisineRegion
        ? current
        : { ...current, cuisineRegion: selectedCuisineRegion },
    );
  }, [selectedCuisineRegion]);

  useEffect(() => {
    let cancelled = false;
    const isHomepageBrowsing = isBrowsingWithSelectedCuisineRegion(filters, selectedCuisineRegion);
    const recipeLimit = isHomepageBrowsing ? homepageRecipeLimit : searchResultRecipeLimit;
    const options = isHomepageBrowsing ? { maxPages: homepageRecipePageLimit } : undefined;

    if (!isHomepageBrowsing) {
      setSearching(true);
    }

    void loadCatalogRecipes(filters, displayLang, recipeLimit, options)
      .then((nextRecipes) => {
        if (cancelled) {
          return;
        }

        setRecipes(nextRecipes);
        if (
          !initializedSuggestionRecipes.current &&
          isHomepageBrowsing
        ) {
          setSuggestionRecipes(nextRecipes);
          initializedSuggestionRecipes.current = true;
        }

        setSearching(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setRecipes([]);
        setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [displayLang, filters, selectedCuisineRegion]);

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

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void loadCatalogRecipes(
        { ...initialCatalogFilters, cuisineRegion: selectedCuisineRegion, query, sort: "popular" },
        displayLang,
        20,
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
  }, [draftQuery, displayLang, selectedCuisineRegion]);

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
      );

      return recipeSuggestions.length > 0
        ? recipeSuggestions
        : filterRecipeSearchSuggestions(fallbackRecipeSearchSuggestions, draftQuery);
    },
    [suggestionPool, labelFor, countryLabel, draftQuery],
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

  const isBrowsing = isBrowsingWithSelectedCuisineRegion(filters, selectedCuisineRegion);
  const showBrowsing = isBrowsing && !searching;

  useEffect(() => {
    document.body.classList.toggle("is-results-mode", !showBrowsing);

    return () => {
      document.body.classList.remove("is-results-mode");
    };
  }, [showBrowsing]);

  const baseFilters = (): PublicRecipeCatalogFilters => ({
    ...initialCatalogFilters,
    cuisineRegion: selectedCuisineRegion,
  });
  const patchFilters = (patch: Partial<PublicRecipeCatalogFilters>): void => {
    const nextCuisineRegion = patch.cuisineRegion ?? selectedCuisineRegion;
    const nextFilters = { ...filters, ...patch };
    if (patch.cuisineRegion !== undefined) {
      onSelectedCuisineRegionChange(patch.cuisineRegion);
    }
    setSearching(!isBrowsingWithSelectedCuisineRegion(nextFilters, nextCuisineRegion));
    setFilters(nextFilters);
  };
  const runSearch = (): void => {
    const query = draftQuery.trim();
    if (query.length === 0) {
      stopSearching();
      setFilters(baseFilters());
      return;
    }
    startSearch({ ...baseFilters(), query });
  };
  const resetFilters = (): void => {
    stopSearching();
    setDraftQuery("");
    onSelectedCuisineRegionChange("all");
    setFilters(initialCatalogFilters);
  };
  const selectSuggestion = (suggestion: SearchSuggestion): void => {
    const nextDraftQuery = suggestion.label;
    const nextFilterQuery =
      "primaryIngredient" in suggestion.patch || "region" in suggestion.patch
        ? ""
        : suggestion.patch.query ?? suggestion.label;

    setDraftQuery(nextDraftQuery);
    if (suggestion.patch.cuisineRegion !== undefined) {
      onSelectedCuisineRegionChange(suggestion.patch.cuisineRegion);
    }
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
    if (clear.cuisineRegion !== undefined) {
      onSelectedCuisineRegionChange(clear.cuisineRegion);
    }
    patchFilters(clear);
  };
  const startSearch = (nextFilters: PublicRecipeCatalogFilters): void => {
    setSearching(!isBrowsingWithSelectedCuisineRegion(nextFilters, selectedCuisineRegion));
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
            recipeCount={suggestionRecipes.length}
            suggestions={suggestions}
            onQueryChange={setDraftQuery}
            onSearchSubmit={runSearch}
            onSuggestionSelect={selectSuggestion}
          />
        ) : (
          <ResultsSearchBar
            query={draftQuery}
            suggestions={suggestions}
            onQueryChange={setDraftQuery}
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
          />
        )}
      </main>

      <MobileInstallCta />
    </>
  );
}

function isBrowsingWithSelectedCuisineRegion(
  filters: PublicRecipeCatalogFilters,
  selectedCuisineRegion: string,
): boolean {
  if (isBrowsingFilters(filters)) {
    return true;
  }

  if (filters.cuisineRegion !== selectedCuisineRegion) {
    return false;
  }

  return isBrowsingFilters({ ...filters, cuisineRegion: "all" });
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
