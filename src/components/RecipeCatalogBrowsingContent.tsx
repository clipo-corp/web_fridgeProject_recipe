import type { ReactNode } from "react";
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
  const { t } = useI18n();

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
