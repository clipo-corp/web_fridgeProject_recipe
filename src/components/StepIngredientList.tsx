import { recipeIngredientEmoji } from "../lib/recipeIngredientEmoji";
import type { RecipeStepIngredientChip } from "../lib/recipeCatalogTypes";

type StepIngredientListProps = {
  readonly ingredients: readonly RecipeStepIngredientChip[];
  readonly label: string;
  readonly amountFallback: string;
  readonly className?: string;
};

export function StepIngredientList({
  ingredients,
  label,
  amountFallback,
  className,
}: StepIngredientListProps): JSX.Element | null {
  if (ingredients.length === 0) {
    return null;
  }

  const rootClassName = className === undefined
    ? "step-ingredients"
    : `step-ingredients ${className}`;

  return (
    <div className={rootClassName} aria-label={label}>
      <span className="step-ingredients__label">{label}</span>
      <ul className="step-ingredient-list">
        {ingredients.map((ingredient, index) => (
          <li key={`${ingredient.masterId ?? ingredient.name}-${index}`}>
            <span className="step-ingredient-list__emoji" aria-hidden="true">
              {recipeIngredientEmoji(ingredient)}
            </span>
            <span className="step-ingredient-list__name">{ingredient.name}</span>
            <span className="step-ingredient-list__amount">
              {formatAmount(ingredient.quantity, ingredient.unit, amountFallback)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatAmount(quantity: number | null, unit: string | null, fallback: string): string {
  if (quantity === null && unit === null) {
    return fallback;
  }

  return `${quantity ?? ""}${unit ?? ""}`.trim();
}
