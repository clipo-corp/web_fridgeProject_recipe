import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";
import { CategoryRail } from "./CategoryRail";
import { FeaturedRecipeCarousel } from "./FeaturedRecipeCarousel";

type RecipeCatalogBrowsingContentProps = {
  readonly featuredRecipes: readonly PublicRecipeRecord[];
  readonly speedyRecipes: readonly PublicRecipeRecord[];
  readonly categories: readonly string[];
  readonly onCategorySelect: (category: string) => void;
};

export function RecipeCatalogBrowsingContent({
  featuredRecipes,
  speedyRecipes,
  categories,
  onCategorySelect,
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

      <Section eyebrow={t("section.quick.eyebrow")} title={t("section.quick.title")}>
        <FeaturedRecipeCarousel recipes={speedyRecipes} />
      </Section>

      <Section
        className="section--category"
        eyebrow={t("section.category.eyebrow")}
        title={t("section.category.title")}
      >
        <CategoryRail
          categories={categories}
          selectedCategory="all"
          variant="inline"
          onSelectCategory={onCategorySelect}
        />
      </Section>

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
  readonly className?: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly note?: string;
  readonly children: ReactNode;
};

function Section({ className, eyebrow, title, note, children }: SectionProps): JSX.Element {
  return (
    <section className={className === undefined ? "section" : `section ${className}`}>
      <div className="section__head">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {note !== undefined ? <p className="section__note">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}
