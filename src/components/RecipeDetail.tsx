import { useEffect, useRef, useState } from "react";
import { Clock, Download, Flag, Flame, Heart, Languages, MapPin, Users, X } from "lucide-react";
import { IngredientAmount } from "./IngredientAmount";
import { IngredientFormHint } from "./IngredientFormHint";
import { RecipeCreatorSource } from "./RecipeCreatorSource";
import { RecipeReportDialog } from "./RecipeReportDialog";
import { RecipeVisual } from "./RecipeVisual";
import { StepIngredientList } from "./StepIngredientList";
import { recipeIngredientEmoji } from "../lib/recipeIngredientEmoji";
import { youtubeVideoId } from "../lib/recipeCreatorSource";
import {
  formatTimestamp,
  groupRecipeSteps,
  isSeekableVideoRecipe,
  isValidYoutubeVideoId,
  sectionLabel,
  shouldRenderSectionHeadings,
  youtubeEmbedUrl,
} from "../lib/recipeStepSections";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeRecord, RecipeStep } from "../lib/recipeCatalogTypes";

type RecipeDetailProps = {
  readonly recipe: PublicRecipeRecord | null;
  readonly onClose: () => void;
};

export function RecipeDetail({ recipe, onClose }: RecipeDetailProps): JSX.Element | null {
  const { t, lang, labelFor, countryLabel, timeLabel } = useI18n();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [seek, setSeek] = useState<{ seconds: number; nonce: number } | null>(null);
  const videoRef = useRef<HTMLDivElement | null>(null);

  // Reopening the panel on a different recipe must not carry the old seek target.
  useEffect(() => {
    setSeek(null);
  }, [recipe?.recipeId]);

  useEffect(() => {
    if (recipe === null) {
      return;
    }

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [recipe, onClose]);

  if (recipe === null) {
    return null;
  }

  const ingredientsLabel = t("detail.ingredients");
  const amountFallback = t("detail.toTaste");
  const hasStepIngredientChips = recipe.steps.some((step) => step.ingredientChips.length > 0);

  const stepGroups = groupRecipeSteps(recipe.steps, recipe.sections);
  const showSectionHeadings = shouldRenderSectionHeadings(stepGroups);
  const candidateVideoId = isSeekableVideoRecipe(recipe)
    ? youtubeVideoId(recipe.creatorSource?.sourceId ?? null, recipe.creatorSource?.sourceUrl ?? null)
    : null;
  const videoId = isValidYoutubeVideoId(candidateVideoId) ? candidateVideoId : null;

  const renderStep = (step: RecipeStep): JSX.Element => (
    <li key={step.stepNumber} className="step-list__item">
      <span className="step-list__num">{step.stepNumber}</span>
      <div className="step-list__content">
        <p>{step.way}</p>
        {videoId !== null && step.startSeconds !== null ? (
          <button
            className="step-list__seek"
            type="button"
            onClick={() => {
              setSeek((current) => ({
                seconds: step.startSeconds as number,
                nonce: (current?.nonce ?? 0) + 1,
              }));
              videoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            aria-label={t("detail.watchFrom", { time: formatTimestamp(step.startSeconds) })}
          >
            {formatTimestamp(step.startSeconds)}
          </button>
        ) : null}
        {step.cookingTip !== null && step.cookingTip.length > 0 ? (
          <small>{step.cookingTip}</small>
        ) : null}
        <StepIngredientList
          ingredients={step.ingredientChips}
          label={ingredientsLabel}
          amountFallback={amountFallback}
        />
      </div>
    </li>
  );

  return (
    <div className="detail-backdrop" role="presentation" onClick={onClose}>
      <aside className="detail-panel" role="dialog" aria-modal="true" aria-label={recipe.title} onClick={stopPropagation}>
        <div className="detail-close-bar">
          <button
            className="icon-button recipe-report-button"
            type="button"
            aria-label="레시피 신고"
            onClick={() => setIsReportDialogOpen(true)}
          >
            <Flag size={18} aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" aria-label={t("detail.close")} onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="detail-header">
          <RecipeVisual recipe={recipe} size="detail" />
        </div>

        <div className="detail-body">
          <span className="brand-badge">
            {labelFor(recipe.cuisineRegion)} · {labelFor(recipe.category)}
          </span>
          <h2>{recipe.title}</h2>
          <p className="detail-description">{recipe.description}</p>
          <RecipeCreatorSource recipe={recipe} variant="detail" />

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
            <span className="badge badge--brand">{labelFor(recipe.category)}</span>
          </div>

          <div className="detail-chips">
            {[recipe.recipeType, recipe.cookingMethod, recipe.technique, recipe.dietaryGoal, recipe.requiredTool]
              .filter((value) => value.length > 0 && value !== "unknown")
              .map((value) => (
                <span className="badge badge--muted" key={value}>
                  {labelFor(value)}
                </span>
              ))}
          </div>

          {recipe.cookingTip.length > 0 ? (
            <p className="detail-tip">💡 {recipe.cookingTip}</p>
          ) : null}

          {recipe.ingredients.length > 0 ? (
            <section className="detail-section">
              <h3>{ingredientsLabel}</h3>
              <ul className="ingredient-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={`${ingredient.name}-${index}`}>
                    <span className="ingredient-list__emoji" aria-hidden="true">
                      {recipeIngredientEmoji(ingredient)}
                    </span>
                    <span className="ingredient-list__name">
                      <IngredientFormHint ingredient={ingredient} />
                      {ingredient.name}
                    </span>
                    <IngredientAmount
                      ingredient={ingredient}
                      className="ingredient-list__amount"
                      amountFallback={amountFallback}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {videoId !== null ? (
            <section className="detail-section">
              <h3>{t("detail.videoSection")}</h3>
              <div className="recipe-video" ref={videoRef}>
                <iframe
                  key={seek?.nonce ?? "start"}
                  src={youtubeEmbedUrl(videoId, seek?.seconds ?? null)}
                  title={recipe.title}
                  loading={seek === null ? "lazy" : "eager"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          ) : null}

          {recipe.steps.length > 0 ? (
            <section className="detail-section">
              <h3>{t("detail.steps")}</h3>
              {showSectionHeadings ? (
                stepGroups.map((group, index) => {
                  const heading = sectionLabel(group.section, group.title, lang);
                  return (
                    <div className="step-group" key={`${group.section}-${index}`}>
                      {heading !== null ? <h4 className="step-group__title">{heading}</h4> : null}
                      <ol className="step-list">{group.steps.map(renderStep)}</ol>
                    </div>
                  );
                })
              ) : (
                <ol className="step-list">{recipe.steps.map(renderStep)}</ol>
              )}
              {!hasStepIngredientChips && recipe.ingredients.length > 0 ? (
                <StepIngredientList
                  ingredients={recipe.ingredients}
                  label={ingredientsLabel}
                  amountFallback={amountFallback}
                  className="step-ingredients--summary"
                />
              ) : null}
            </section>
          ) : null}

          <a className="btn btn--primary detail-install" href="#app-download">
            <Download size={18} aria-hidden="true" />
            {t("detail.install")}
          </a>
        </div>
      </aside>
      {isReportDialogOpen ? (
        <RecipeReportDialog recipe={recipe} onClose={() => setIsReportDialogOpen(false)} />
      ) : null}
    </div>
  );
}

function stopPropagation(event: React.MouseEvent): void {
  event.stopPropagation();
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
