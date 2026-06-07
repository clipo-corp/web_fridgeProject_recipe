import { Download, X } from "lucide-react";
import { labelFor } from "../lib/recipeLabels";
import type { Recipe } from "../lib/recipeTypes";

type RecipeDetailProps = {
  readonly recipe: Recipe | null;
  readonly onClose: () => void;
};

export function RecipeDetail({ recipe, onClose }: RecipeDetailProps): JSX.Element | null {
  if (recipe === null) {
    return null;
  }

  return (
    <div className="detail-backdrop" role="presentation" onClick={onClose}>
      <aside className="detail-panel" role="dialog" aria-modal="true" onClick={stopPropagation}>
        <button className="icon-button" type="button" aria-label="닫기" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
        <span className="eyebrow">{recipe.country} · {labelFor(recipe.cuisineRegion)}</span>
        {recipe.imageUrl === null ? null : <img className="detail-photo" src={recipe.imageUrl} alt="" />}
        <h2>{recipe.title}</h2>
        <p className="detail-description">{recipe.description}</p>
        <div className="detail-tags">
          <span>{labelFor(recipe.category)}</span>
          <span>{recipe.cookingTime}</span>
          <span>{labelFor(recipe.difficulty)}</span>
        </div>
        <section>
          <h3>재료</h3>
          <ul className="ingredient-list">
            {recipe.ingredients.slice(0, 8).map((ingredient) => (
              <li key={`${ingredient.name}-${ingredient.description}`}>
                <span>{ingredient.name}</span>
                <small>{formatAmount(ingredient.quantity, ingredient.unit)}</small>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3>만드는 법</h3>
          <ol className="step-list">
            {recipe.steps.slice(0, 5).map((step) => (
              <li key={step.stepNumber}>{step.way}</li>
            ))}
          </ol>
        </section>
        <a className="detail-install" href="#app-download">
          <Download size={18} aria-hidden="true" />
          앱에서 저장하고 냉장고 재료로 추천받기
        </a>
      </aside>
    </div>
  );
}

function formatAmount(quantity: number | null, unit: string | null): string {
  if (quantity === null && unit === null) {
    return "";
  }

  return `${quantity ?? ""}${unit ?? ""}`;
}

function stopPropagation(event: React.MouseEvent): void {
  event.stopPropagation();
}
