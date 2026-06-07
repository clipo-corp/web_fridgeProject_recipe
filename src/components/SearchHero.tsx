import { Search } from "lucide-react";
import { useI18n } from "../lib/i18n";

type SearchHeroProps = {
  readonly query: string;
  readonly recipeCount: number;
  readonly onQueryChange: (query: string) => void;
};

export function SearchHero({ query, recipeCount, onQueryChange }: SearchHeroProps): JSX.Element {
  const { t } = useI18n();

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
        </form>
        <div className="hero__stats">
          <span>{t("hero.stat1")}</span>
          <span>{t("hero.stat2")}</span>
          <span>{t("hero.stat3")}</span>
        </div>
      </div>
    </section>
  );
}
