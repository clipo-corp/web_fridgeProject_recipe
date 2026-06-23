import { useEffect } from "react";
import { Clock, Download, Flame, Heart, Languages, MapPin, Users, X } from "lucide-react";
import { RecipeCreatorSource } from "./RecipeCreatorSource";
import { RecipeVisual } from "./RecipeVisual";
import { recipeIngredientEmoji } from "../lib/recipeIngredientEmoji";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type RecipeDetailProps = {
  readonly recipe: PublicRecipeRecord | null;
  readonly onClose: () => void;
};

export function RecipeDetail({ recipe, onClose }: RecipeDetailProps): JSX.Element | null {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();

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

  return (
    <div className="detail-backdrop" role="presentation" onClick={onClose}>
      <aside className="detail-panel" role="dialog" aria-modal="true" aria-label={recipe.title} onClick={stopPropagation}>
        <div className="detail-close-bar">
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
              <h3>{t("detail.ingredients")}</h3>
              <ul className="ingredient-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={`${ingredient.name}-${index}`}>
                    <span className="ingredient-list__emoji" aria-hidden="true">
                      {recipeIngredientEmoji(ingredient)}
                    </span>
                    <span className="ingredient-list__name">{ingredient.name}</span>
                    <span className="ingredient-list__amount">
                      {formatAmount(ingredient.quantity, ingredient.unit, t("detail.toTaste"))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {recipe.steps.length > 0 ? (
            <section className="detail-section">
              <h3>{t("detail.steps")}</h3>
              <ol className="step-list">
                {recipe.steps.map((step) => (
                  <li key={step.stepNumber}>
                    <span className="step-list__num">{step.stepNumber}</span>
                    <div>
                      <p>{step.way}</p>
                      {step.cookingTip !== null && step.cookingTip.length > 0 ? (
                        <small>{step.cookingTip}</small>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <a className="btn btn--primary detail-install" href="#app-download">
            <Download size={18} aria-hidden="true" />
            {t("detail.install")}
          </a>
        </div>
      </aside>
    </div>
  );
}

function formatAmount(quantity: number | null, unit: string | null, fallback: string): string {
  if (quantity === null && unit === null) {
    return fallback;
  }

  return `${quantity ?? ""}${unit ?? ""}`.trim();
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
