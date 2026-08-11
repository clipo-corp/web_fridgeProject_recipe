import { useI18n } from "../lib/i18n";
import {
  ingredientProcessingFormHintKey,
  type IngredientProcessingForm,
} from "../lib/ingredientProcessingForm";

type IngredientFormHintProps = {
  readonly ingredient: {
    readonly processingForm: IngredientProcessingForm | null;
    readonly isMasterName: boolean;
  };
};

/**
 * Localized processing-form label (축 B) for an ingredient line. Rendered only
 * when the displayed name is a master-catalog name, so raw names that already
 * contain the modifier (e.g. "다진 마늘") are never double-labeled.
 */
export function IngredientFormHint({ ingredient }: IngredientFormHintProps): JSX.Element | null {
  const { t } = useI18n();
  const labelKey = ingredientProcessingFormHintKey(ingredient);

  if (labelKey === null) {
    return null;
  }

  return <span className="ingredient-form-hint">{t(labelKey)}</span>;
}
