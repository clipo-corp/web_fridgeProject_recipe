import { useState } from "react";
import { ArrowRight, Search, Sparkles, Utensils, X } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { RecipeSearchScope } from "../lib/recipeCatalogTypes";
import type { SearchSuggestion } from "../lib/recipeSearchSuggestions";
import { SearchSuggestionList } from "./SearchSuggestionList";
import { SearchScopeSelect } from "./SearchScopeSelect";

type SearchHeroProps = {
  readonly query: string;
  readonly searchScope: RecipeSearchScope;
  readonly recipeCount: number;
  readonly suggestions: readonly SearchSuggestion[];
  readonly onQueryChange: (query: string) => void;
  readonly onSearchScopeChange: (searchScope: RecipeSearchScope) => void;
  readonly onSearchSubmit: () => void;
  readonly onSuggestionSelect: (suggestion: SearchSuggestion) => void;
};

export function SearchHero({
  query,
  searchScope,
  recipeCount,
  suggestions,
  onQueryChange,
  onSearchScopeChange,
  onSearchSubmit,
  onSuggestionSelect,
}: SearchHeroProps): JSX.Element {
  const { t } = useI18n();
  const [scopeSelectActive, setScopeSelectActive] = useState(false);
  const queryIsBlank = query.trim().length === 0;
  const visibleSuggestions = suggestions.length > 0 || !queryIsBlank ? suggestions : fallbackSuggestions;
  const showSuggestions = visibleSuggestions.length > 0;
  const searchWrapClassName = scopeSelectActive
    ? "hero__search-wrap search-wrap--scope-active"
    : "hero__search-wrap";

  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <div className="hero__headline">
          <span className="brand-badge">{t("hero.badge")}</span>
          <h1>
            <Sparkles size={42} aria-hidden="true" />
            <span>
              {t("hero.title1")}
              <br />
              {t("hero.title2")}
            </span>
          </h1>
          <p>{t("hero.subtitle", { count: recipeCount })}</p>
        </div>
        <div className={searchWrapClassName}>
          <form
            className="hero__search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit();
            }}
          >
            <SearchScopeSelect
              value={searchScope}
              className="hero__search-type"
              onChange={onSearchScopeChange}
              onActiveChange={setScopeSelectActive}
            />
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
            <button type="submit" className="hero__search-submit">
              {t("hero.searchSubmit")}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>
          <SearchSuggestionList
            label={t("hero.suggestions")}
            suggestions={visibleSuggestions}
            onSuggestionSelect={onSuggestionSelect}
          />
        </div>
        {showSuggestions ? (
          <div className="hero-keywords" aria-label={t("hero.suggestions")}>
            <span>{t("hero.popular")}</span>
            {visibleSuggestions.slice(0, 8).map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => onSuggestionSelect(suggestion)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="hero__banner">
          <div>
            <span className="hero__banner-kicker">{t("hero.bannerKicker")}</span>
            <strong>{t("hero.bannerTitle")}</strong>
            <p>{t("hero.bannerBody")}</p>
          </div>
          <div className="hero__banner-art" aria-hidden="true">
            <span className="hero__steam hero__steam--one" />
            <span className="hero__steam hero__steam--two" />
            <span className="hero__steam hero__steam--three" />
            <Utensils size={44} />
          </div>
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
