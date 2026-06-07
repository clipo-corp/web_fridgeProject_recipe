import { ArrowLeft, Clock, Download, Flame, Heart, Languages, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileInstallCta } from "./AppInstallCta";
import { RecipeVisual } from "./RecipeVisual";
import { loadPublicMockRecipes } from "../lib/recipeCatalogMock";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type RecipeDetailPageProps = {
  readonly recipeId: string;
};

export function RecipeDetailPage({ recipeId }: RecipeDetailPageProps): JSX.Element {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();
  const [recipe, setRecipe] = useState<PublicRecipeRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void loadPublicMockRecipes().then((recipes) => {
      setRecipe(recipes.find((item) => item.recipeId === recipeId) ?? null);
      setLoaded(true);
    });
  }, [recipeId]);

  if (!loaded) {
    return <main className="page detail-page detail-page--loading">{t("detail.loading")}</main>;
  }

  if (recipe === null) {
    return (
      <main className="page detail-page detail-page--empty">
        <a className="btn btn--ghost" href="/recipe-catalog">
          <ArrowLeft size={17} aria-hidden="true" />
          {t("detail.back")}
        </a>
        <h1>{t("detail.notFound")}</h1>
      </main>
    );
  }

  return (
    <>
      <main className="page detail-page">
        <a className="btn btn--ghost detail-page__back" href="/recipe-catalog">
          <ArrowLeft size={17} aria-hidden="true" />
          {t("detail.back")}
        </a>

        <article className="detail-page__layout">
          <div className="detail-page__visual">
            <RecipeVisual recipe={recipe} size="detail" />
          </div>

          <div className="detail-page__body">
            <span className="brand-badge">
              {formatRegion(recipe, countryLabel)} · {labelFor(recipe.cuisineRegion)}
            </span>
            <h1>{recipe.title}</h1>
            <p>{recipe.description}</p>

            <div className="detail-meta">
              <span>
                <Clock size={16} aria-hidden="true" />
                {timeLabel(recipe.cookingTime)}
              </span>
              <span>
                <Flame size={16} aria-hidden="true" />
                {labelFor(recipe.difficulty)}
              </span>
              <span>
                <Users size={16} aria-hidden="true" />
                {recipe.servings}
              </span>
              <span>
                <Heart size={16} aria-hidden="true" />
                {recipe.likeCount}
              </span>
              <span>
                <Languages size={16} aria-hidden="true" />
                {recipe.isTranslated ? labelFor(recipe.writtenLang) : labelFor("original")}
              </span>
            </div>

            <div className="detail-chips">
              {[recipe.category, recipe.recipeType, recipe.cookingMethod, recipe.technique, recipe.requiredTool]
                .filter((value) => value.length > 0 && value !== "unknown")
                .map((value) => (
                  <span className="badge badge--muted" key={value}>
                    {labelFor(value)}
                  </span>
                ))}
            </div>

            {recipe.cookingTip.length > 0 ? <p className="detail-tip">{recipe.cookingTip}</p> : null}

            <section className="detail-section">
              <h2>{t("detail.ingredients")}</h2>
              <ul className="ingredient-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={`${ingredient.name}-${index}`}>
                    <span className="ingredient-list__check" aria-hidden="true" />
                    <span className="ingredient-list__name">{ingredient.name}</span>
                    <span className="ingredient-list__amount">
                      {formatAmount(ingredient.quantity, ingredient.unit, t("detail.toTaste"))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="detail-section">
              <h2>{t("detail.steps")}</h2>
              <ol className="step-list">
                {recipe.steps.map((step) => (
                  <li key={step.stepNumber}>
                    <span className="step-list__num">{step.stepNumber}</span>
                    <div>
                      <p>{step.way}</p>
                      {step.cookingTip !== null && step.cookingTip.length > 0 ? <small>{step.cookingTip}</small> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <a className="btn btn--primary detail-install" href="/install">
              <Download size={18} aria-hidden="true" />
              {t("detail.install")}
            </a>
          </div>
        </article>
      </main>
      <MobileInstallCta />
    </>
  );
}

function formatAmount(quantity: number | null, unit: string | null, fallback: string): string {
  if (quantity === null && unit === null) {
    return fallback;
  }

  return `${quantity ?? ""}${unit ?? ""}`.trim();
}

function formatRegion(
  recipe: PublicRecipeRecord,
  countryLabel: (country: string) => string,
): string {
  const parts = [countryLabel(recipe.country), recipe.city, recipe.district].filter(
    (value): value is string => value !== null && value.length > 0,
  );
  return parts.join(" · ");
}
