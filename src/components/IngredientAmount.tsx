import { useI18n } from "../lib/i18n";
import {
  formatIngredientAmount,
  type IngredientAmountSource,
} from "../lib/recipeIngredientAmount";

type IngredientAmountProps = {
  readonly ingredient: IngredientAmountSource;
  readonly className: string;
  readonly amountFallback: string;
};

/**
 * The recipe's own amount ("1 공기") with the converted weight ("(약 210g)") as a
 * quieter second line when it adds information.
 */
export function IngredientAmount({
  ingredient,
  className,
  amountFallback,
}: IngredientAmountProps): JSX.Element {
  const { lang } = useI18n();
  const { primary, approxGrams } = formatIngredientAmount(ingredient, lang, amountFallback);

  return (
    <span className={className}>
      <span>{primary}</span>
      {approxGrams !== null ? (
        <span className="ingredient-amount__grams">{approxGrams}</span>
      ) : null}
    </span>
  );
}
