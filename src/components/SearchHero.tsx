import { Clock3, Search, Sparkles, X } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeCatalogFilters } from "../lib/recipeCatalogTypes";

export type SearchSuggestion = {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly patch: Partial<PublicRecipeCatalogFilters>;
};

type SearchHeroProps = {
  readonly query: string;
  readonly recipeCount: number;
  readonly suggestions: readonly SearchSuggestion[];
  readonly onQueryChange: (query: string) => void;
  readonly onSuggestionSelect: (suggestion: SearchSuggestion) => void;
};

export function SearchHero({
  query,
  recipeCount,
  suggestions,
  onQueryChange,
  onSuggestionSelect,
}: SearchHeroProps): JSX.Element {
  const { t } = useI18n();
  const visibleSuggestions = suggestions.length > 0 ? suggestions : fallbackSuggestions;
  const showSuggestions = visibleSuggestions.length > 0;

  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <span className="brand-badge">{t("hero.badge")}</span>
        <h1>
          {t("hero.title1")}
          <br />
          {t("hero.title2")}
        </h1>
        <p>{t("hero.subtitle", { count: recipeCount })}</p>
        <div className="hero__search-wrap">
          <form className="hero__search" role="search" onSubmit={(event) => event.preventDefault()}>
            <Search size={20} aria-hidden="true" />
            <input
              id="recipe-search"
              type="search"
              aria-label={t("hero.searchAria")}
              placeholder={t("hero.searchPlaceholder")}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
            {query.trim().length > 0 ? (
              <button
                type="button"
                className="hero__search-clear"
                aria-label={t("hero.clearSearch")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onQueryChange("")}
              >
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </form>

          {showSuggestions ? (
            <div className="hero-suggestions" role="listbox" aria-label={t("hero.suggestions")}>
              <span className="hero-suggestions__eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                {t("hero.suggestions")}
              </span>
              {visibleSuggestions.slice(0, 7).map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="hero-suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSuggestionSelect(suggestion)}
                >
                  <Clock3 size={16} aria-hidden="true" />
                  <span>{suggestion.label}</span>
                  <small>{suggestion.note}</small>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="hero__stats">
          <span>{t("hero.stat1")}</span>
          <span>{t("hero.stat2")}</span>
          <span>{t("hero.stat3")}</span>
        </div>
      </div>
    </section>
  );
}

const fallbackSuggestions: readonly SearchSuggestion[] = [
  { id: "fallback-kimchi", label: "김치", note: "검색어", patch: { query: "김치" } },
  { id: "fallback-tofu", label: "두부", note: "검색어", patch: { query: "두부" } },
  { id: "fallback-chicken", label: "닭고기", note: "검색어", patch: { query: "닭고기" } },
];
