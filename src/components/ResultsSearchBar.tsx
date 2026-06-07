import { ArrowRight, Search, X } from "lucide-react";
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
      <form
        className="results-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
      >
        <Search size={18} aria-hidden="true" />
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
            <X size={15} aria-hidden="true" />
          </button>
        ) : null}
        <button type="submit" className="results-search__submit">
          {t("hero.searchSubmit")}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
