import { Search } from "lucide-react";
import { useI18n } from "../lib/i18n";

export function SearchProgress(): JSX.Element {
  const { t } = useI18n();

  return (
    <section className="search-progress" aria-live="polite">
      <div className="search-progress__head">
        <div className="search-progress__pulse">
          <Search size={22} aria-hidden="true" />
        </div>
        <div>
          <span className="eyebrow">{t("searchProgress.eyebrow")}</span>
          <h2>{t("searchProgress.title")}</h2>
        </div>
      </div>
      <div className="search-progress__grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="recipe-skeleton-card" key={index}>
            <span className="recipe-skeleton-card__visual" />
            <span className="recipe-skeleton-card__line recipe-skeleton-card__line--short" />
            <span className="recipe-skeleton-card__line" />
            <span className="recipe-skeleton-card__line recipe-skeleton-card__line--muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
