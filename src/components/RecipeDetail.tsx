import { useEffect } from "react";
import { Clock, Download, Flame, Heart, X } from "lucide-react";
import { RecipeVisual } from "./RecipeVisual";
import { useI18n } from "../lib/i18n";
import type { Recipe } from "../lib/recipeTypes";

type RecipeDetailProps = {
  readonly recipe: Recipe | null;
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
        <button className="icon-button" type="button" aria-label={t("detail.close")} onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>

        <div className="detail-header">
          <RecipeVisual recipe={recipe} size="detail" />
        </div>

        <div className="detail-body">
          <span className="brand-badge">
            {countryLabel(recipe.country)} · {labelFor(recipe.cuisineRegion)}
          </span>
          <h2>{recipe.title}</h2>
          <p className="detail-description">{recipe.description}</p>

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
              <Heart size={16} aria-hidden="true" />
              {recipe.likes}
            </span>
            <span className="badge badge--brand">{labelFor(recipe.category)}</span>
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
                    <span className="ingredient-list__check" aria-hidden="true" />
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
