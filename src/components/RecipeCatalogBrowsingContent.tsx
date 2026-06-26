import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";
import type { SearchSuggestion } from "../lib/recipeSearchSuggestions";
import { FeaturedRecipeCarousel } from "./FeaturedRecipeCarousel";
import { HomeQuickChips } from "./HomeQuickChips";

type RecipeCatalogBrowsingContentProps = {
  readonly featuredRecipes: readonly PublicRecipeRecord[];
  readonly suggestions: readonly SearchSuggestion[];
  readonly onSuggestionSelect: (suggestion: SearchSuggestion) => void;
};

export function RecipeCatalogBrowsingContent({
  featuredRecipes,
  suggestions,
  onSuggestionSelect,
}: RecipeCatalogBrowsingContentProps): JSX.Element {
  const { t, lang } = useI18n();
  const privacyTitle = lang === "ko" ? "개인정보처리방침" : "Privacy policy";
  const privacyBody =
    lang === "ko"
      ? "서비스 이용과 관련한 개인정보 처리 기준을 확인할 수 있습니다."
      : "Review how personal information is handled for this service.";

  return (
    <div className="page">
      <Section eyebrow={t("section.featured.eyebrow")} title={t("section.trending.title")}>
        <FeaturedRecipeCarousel recipes={featuredRecipes} />
      </Section>

      <HomeQuickChips
        eyebrow={t("section.quickChips.eyebrow")}
        title={t("section.quickChips.title")}
        suggestions={suggestions}
        onSuggestionSelect={onSuggestionSelect}
      />

      <footer className="home-legal" aria-label={privacyTitle}>
        <div className="home-legal__copy">
          <span className="home-legal__icon">
            <ShieldCheck size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>{privacyTitle}</strong>
            <p>{privacyBody}</p>
          </div>
        </div>
        <a className="home-legal__link" href="/privacy-policy" aria-label={privacyTitle}>
          <span>{privacyTitle}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}

type SectionProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly note?: string;
  readonly children: ReactNode;
};

function Section({ eyebrow, title, note, children }: SectionProps): JSX.Element {
  return (
    <section className="section">
      <div className="section__head">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {note !== undefined ? <p className="section__note">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}
