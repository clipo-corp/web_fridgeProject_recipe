import type { TranslationKey } from "./translations";

/**
 * Processing-form axis (축 B) codes shared with the server
 * (`IngredientsDTO.processingForm`) and core final recipe slots
 * (`processingFormHint`). Null/absent means unknown.
 */
export const ingredientProcessingForms = [
  "MINCED",
  "GRATED",
  "SLICED",
  "POWDER",
  "CRUSHED",
  "JULIENNE",
  "WHOLE",
  "CANNED",
  "DRIED",
  "FROZEN",
  "SMOKED",
  "SALTED",
  "COARSE",
  "FINE",
  "PASTE",
  "SOAKED",
] as const;

export type IngredientProcessingForm = (typeof ingredientProcessingForms)[number];

export type IngredientProcessingFormSource = {
  readonly processingForm?: unknown;
  readonly processing_form?: unknown;
  readonly processingFormHint?: unknown;
  readonly processing_form_hint?: unknown;
};

export function normalizeIngredientProcessingForm(value: unknown): IngredientProcessingForm | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return isIngredientProcessingForm(normalized) ? normalized : null;
}

export function readIngredientProcessingForm(
  source: IngredientProcessingFormSource,
): IngredientProcessingForm | null {
  const candidates = [
    source.processingForm,
    source.processing_form,
    source.processingFormHint,
    source.processing_form_hint,
  ];

  for (const candidate of candidates) {
    const form = normalizeIngredientProcessingForm(candidate);
    if (form !== null) {
      return form;
    }
  }

  return null;
}

/**
 * Translation key for the localized form label of an ingredient line, or null
 * when no label should be rendered. The label is only shown when the displayed
 * name is a master-catalog name — a raw name (e.g. "다진 마늘") already carries
 * the modifier, so labeling it again would duplicate it.
 */
export function ingredientProcessingFormHintKey(ingredient: {
  readonly processingForm: IngredientProcessingForm | null;
  readonly isMasterName: boolean;
}): TranslationKey | null {
  if (ingredient.processingForm === null || !ingredient.isMasterName) {
    return null;
  }

  return `ingredientForm.${ingredient.processingForm}`;
}

function isIngredientProcessingForm(value: string): value is IngredientProcessingForm {
  return (ingredientProcessingForms as readonly string[]).includes(value);
}
