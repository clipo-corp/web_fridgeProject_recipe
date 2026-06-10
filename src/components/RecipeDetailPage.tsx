import { ArrowLeft, Clock, Download, Flame, Heart, Languages, MapPin, Play, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { RecipeCreatorSource } from "./RecipeCreatorSource";
import { RecipeVisual } from "./RecipeVisual";
import { loadPublicRecipeDetail } from "../lib/recipeApi";
import { videoCreatorSummary } from "../lib/recipeCreatorSource";
import { recipeIngredientEmoji } from "../lib/recipeIngredientEmoji";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type RecipeDetailPageProps = {
  readonly recipeId: string;
};

export function RecipeDetailPage({ recipeId }: RecipeDetailPageProps): JSX.Element {
  const { t, displayLang, labelFor, countryLabel, timeLabel } = useI18n();
  const [recipe, setRecipe] = useState<PublicRecipeRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    void loadPublicRecipeDetail(recipeId, displayLang).then((nextRecipe) => {
      if (!cancelled) {
        setRecipe(nextRecipe);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [displayLang, recipeId]);

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

  const videoSummary = videoCreatorSummary(recipe.creatorSource);

  return (
    <main className="page detail-page">
      <a className="btn btn--ghost detail-page__back" href="/recipe-catalog">
        <ArrowLeft size={17} aria-hidden="true" />
        {t("detail.back")}
      </a>

      <article className="detail-page__layout">
        <div className="detail-page__summary">
          <span className="brand-badge">
            {labelFor(recipe.cuisineRegion)} · {labelFor(recipe.category)}
          </span>
          <h1>{recipe.title}</h1>
          <p>{recipe.description}</p>
          <RecipeCreatorSource recipe={recipe} variant="detail" showPreview={false} />

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
            <span>
              <MapPin size={16} aria-hidden="true" />
              {formatRegion(recipe, countryLabel)}
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
        </div>
      </article>

      <article className="detail-page__content">
        {videoSummary?.previewImageUrl !== null && videoSummary?.previewImageUrl !== undefined ? (
          <a
            className="detail-source-preview"
            href={videoSummary.url ?? undefined}
            target={videoSummary.url === null ? undefined : "_blank"}
            rel={videoSummary.url === null ? undefined : "noreferrer"}
          >
            <img src={videoSummary.previewImageUrl} alt={`${videoSummary.name} 영상 미리보기`} loading="lazy" />
            <span className="detail-source-preview__play" aria-hidden="true">
              <Play size={24} fill="currentColor" />
            </span>
          </a>
        ) : null}

        <section className="detail-media-card" aria-label={recipe.title}>
          <RecipeVisual recipe={recipe} size="detail" />
        </section>

        <section className="detail-section detail-card">
          <h2>{t("detail.ingredients")}</h2>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={`${ingredient.name}-${index}`}>
                <span className="ingredient-list__emoji" aria-hidden="true">
                  {recipeIngredientEmoji(ingredient)}
                </span>
                <span className="ingredient-list__copy">
                  <span className="ingredient-list__name">{ingredient.name}</span>
                  {ingredient.description.length > 0 ? (
                    <small>{ingredient.description}</small>
                  ) : null}
                </span>
                <span className="ingredient-list__amount">
                  {formatAmount(ingredient.quantity, ingredient.unit, t("detail.toTaste"))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-section detail-card">
          <h2>{t("detail.steps")}</h2>
          <ol className="step-list">
            {recipe.steps.map((step) => (
              <li
                key={step.stepNumber}
                className={step.imageUrl === null ? "step-list__item" : "step-list__item step-list__item--media"}
              >
                <span className="step-list__num">{step.stepNumber}</span>
                {step.imageUrl !== null ? (
                  <img className="step-list__image" src={step.imageUrl} alt="" loading="lazy" />
                ) : null}
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
      </article>
    </main>
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
  const country = recipe.canonicalCountry ?? recipe.country;
  const city = recipe.canonicalCity ?? recipe.city;
  const district = recipe.canonicalDistrict ?? recipe.district;
  const parts = [countryLabel(country), city, district].filter(
    (value): value is string => value !== null && value.length > 0,
  );
  return parts.join(" · ");
}
