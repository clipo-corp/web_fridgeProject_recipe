import { ArrowRight, Leaf, Search, X } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { SearchSuggestion } from "../lib/recipeSearchSuggestions";
import { SearchSuggestionList } from "./SearchSuggestionList";

type ResultsSearchBarProps = {
  readonly query: string;
  readonly suggestions: readonly SearchSuggestion[];
  readonly onQueryChange: (query: string) => void;
  readonly onSearchSubmit: () => void;
  readonly onSuggestionSelect: (suggestion: SearchSuggestion) => void;
};

export function ResultsSearchBar({
  query,
  suggestions,
  onQueryChange,
  onSearchSubmit,
  onSuggestionSelect,
}: ResultsSearchBarProps): JSX.Element {
  const { t } = useI18n();

  return (
    <div className="results-search-shell">
      <div className="results-search-top">
        <a className="results-search-logo" href="/recipe-catalog" aria-label="Keep Cook">
          <Leaf size={24} aria-hidden="true" />
          <span>Keep Cook</span>
        </a>
        <div className="results-search-wrap">
          <form
            className="results-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit();
            }}
          >
            <input
              type="search"
              aria-label={t("hero.searchAria")}
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
