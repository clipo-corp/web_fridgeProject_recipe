import { IngredientAmount } from "./IngredientAmount";
import { IngredientFormHint } from "./IngredientFormHint";
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
            <span className="step-ingredient-list__name">
              <IngredientFormHint ingredient={ingredient} />
              {ingredient.name}
            </span>
            <IngredientAmount
              ingredient={ingredient}
              className="step-ingredient-list__amount"
              amountFallback={amountFallback}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
