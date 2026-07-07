import { useState } from "react";
import { ArrowRight, Leaf, Search, X } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { RecipeSearchScope } from "../lib/recipeCatalogTypes";
import type { SearchSuggestion } from "../lib/recipeSearchSuggestions";
import { SearchSuggestionList } from "./SearchSuggestionList";
import { SearchScopeSelect } from "./SearchScopeSelect";

type ResultsSearchBarProps = {
  readonly query: string;
  readonly searchScope: RecipeSearchScope;
  readonly suggestions: readonly SearchSuggestion[];
  readonly onQueryChange: (query: string) => void;
  readonly onSearchScopeChange: (searchScope: RecipeSearchScope) => void;
  readonly onSearchSubmit: () => void;
  readonly onSuggestionSelect: (suggestion: SearchSuggestion) => void;
};

export function ResultsSearchBar({
  query,
  searchScope,
  suggestions,
  onQueryChange,
  onSearchScopeChange,
  onSearchSubmit,
  onSuggestionSelect,
}: ResultsSearchBarProps): JSX.Element {
  const { t } = useI18n();
  const [scopeSelectActive, setScopeSelectActive] = useState(false);
  const searchWrapClassName = scopeSelectActive
    ? "results-search-wrap search-wrap--scope-active"
    : "results-search-wrap";

  return (
    <div className="results-search-shell">
      <div className="results-search-top">
        <a className="results-search-logo" href="/recipe-catalog" aria-label="Keep Cook">
          <Leaf size={24} aria-hidden="true" />
          <span>Keep Cook</span>
        </a>
        <div className={searchWrapClassName}>
          <form
            className="results-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit();
            }}
          >
            <SearchScopeSelect
              value={searchScope}
              className="results-search__scope"
              onChange={onSearchScopeChange}
              onActiveChange={setScopeSelectActive}
            />
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label={t("hero.searchAria")}
              placeholder={t("hero.searchPlaceholder")}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
            {query.trim().length > 0 ? (
              <button
                type="button"
                className="results-search__clear"
                aria-label={t("hero.clearSearch")}
                onClick={() => onQueryChange("")}
              >
                <X size={20} aria-hidden="true" />
              </button>
            ) : null}
            <span className="results-search__divider" aria-hidden="true" />
            <button type="submit" className="results-search__submit" aria-label={t("hero.searchSubmit")}>
              <Search size={22} aria-hidden="true" />
            </button>
          </form>
          <SearchSuggestionList
            label={t("hero.suggestions")}
            suggestions={suggestions}
            onSuggestionSelect={onSuggestionSelect}
          />
        </div>
        <a className="results-search-install" href="/install">
          {t("header.install")}
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
