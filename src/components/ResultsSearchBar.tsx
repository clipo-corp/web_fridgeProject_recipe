import { ArrowRight, ChefHat, Images, Leaf, ListFilter, Search, Sparkles, X } from "lucide-react";
import { useI18n } from "../lib/i18n";

type ResultsSearchBarProps = {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly onSearchSubmit: () => void;
};

export function ResultsSearchBar({
  query,
  onQueryChange,
  onSearchSubmit,
}: ResultsSearchBarProps): JSX.Element {
  const { t } = useI18n();

  return (
    <div className="results-search-shell">
      <div className="results-search-top">
        <a className="results-search-logo" href="/recipe-catalog" aria-label="FreshKeeper">
          <Leaf size={24} aria-hidden="true" />
          <span>FreshKeeper</span>
        </a>
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
        <a className="results-search-install" href="/install">
          {t("header.install")}
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
      <nav className="results-tabs" aria-label={t("results.tabs")}>
        <button type="button" className="results-tab results-tab--active">
          <Sparkles size={16} aria-hidden="true" />
          {t("results.tabAll")}
        </button>
        <button type="button" className="results-tab">
          <ChefHat size={16} aria-hidden="true" />
          {t("results.tabRecipes")}
        </button>
        <button type="button" className="results-tab">
          <Images size={16} aria-hidden="true" />
          {t("results.tabImages")}
        </button>
        <button type="button" className="results-tab">
          <ListFilter size={16} aria-hidden="true" />
          {t("results.tabFilters")}
        </button>
      </nav>
    </div>
  );
}
