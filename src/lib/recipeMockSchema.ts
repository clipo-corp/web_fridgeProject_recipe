import { z } from "zod";

const ingredientSchema = z.object({
  masterId: z.number().nullable().optional(),
  masterName: z.string().nullable().optional(),
  master_name: z.string().nullable().optional(),
  name: z.string().optional(),
  quantity: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  processingForm: z.string().nullable().optional(),
  processing_form: z.string().nullable().optional(),
  processingFormHint: z.string().nullable().optional(),
  processing_form_hint: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  consumedQuantity: z.number().nullable().optional(),
  consumed_quantity: z.number().nullable().optional(),
  alternativeGroup: z.string().nullable().optional(),
  alternative_group: z.string().nullable().optional(),
  alternativeOf: z.union([z.string(), z.number()]).nullable().optional(),
  alternative_of: z.union([z.string(), z.number()]).nullable().optional(),
});

const stepSchema = z.object({
  stepNumber: z.number(),
  way: z.string(),
  cookingTip: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  ingredientMasterIds: z.array(z.number()).nullable().optional(),
});

const recipeSchema = z.object({
  title: z.string(),
  titleImageUrl: z.string().nullable().optional(),
  recipeType: z.string().nullable().optional(),
  writtenLang: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  cookingMethod: z.string().nullable().optional(),
  technique: z.string().nullable().optional(),
  dietaryGoal: z.string().nullable().optional(),
  dietaryRestriction: z.string().nullable().optional(),
  cuisineRegion: z.string().nullable().optional(),
  primaryIngredient: z.string().nullable().optional(),
  occasion: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  cookingTime: z.string().nullable().optional(),
  servings: z.string().nullable().optional(),
  requiredTool: z.string().nullable().optional(),
  cookingTip: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  visibility: z.string().nullable().optional(),
  isUseLocalData: z.boolean().nullable().optional(),
  ingredients: z.array(ingredientSchema).default([]),
  steps: z.array(stepSchema).default([]),
});

const seedEntrySchema = z.object({
  importSource: z
    .object({
      sourceType: z.string().nullable().optional(),
      sourceId: z.string().optional(),
      sourceUrl: z.string().nullable().optional(),
      sourceAccount: z.string().nullable().optional(),
      creatorName: z.string().nullable().optional(),
    })
    .optional(),
  recipe: recipeSchema,
  _mockMeta: z
    .object({
      country: z.string().optional(),
      category: z.string().optional(),
      dishSlug: z.string().optional(),
    })
    .optional(),
});

export const seedFileSchema = z.object({
  recipes: z.array(seedEntrySchema),
});

export type SeedEntry = z.infer<typeof seedEntrySchema>;

type MockIntakeSource = {
  readonly role?: string | null;
  readonly consumedQuantity?: number | null;
  readonly consumed_quantity?: number | null;
  readonly alternativeGroup?: string | null;
  readonly alternative_group?: string | null;
  readonly alternativeOf?: string | number | null;
  readonly alternative_of?: string | number | null;
};

/** Copy optional GET intake keys when a mock seed actually sent them. */
export function pickMockIntakeFields(ingredient: MockIntakeSource): {
  readonly role?: string;
  readonly consumedQuantity?: number;
  readonly alternativeGroup?: string;
  readonly alternativeOf?: string;
} {
  const role = ingredient.role?.trim();
  const consumedQuantity = ingredient.consumedQuantity ?? ingredient.consumed_quantity;
  const alternativeGroup = (
    ingredient.alternativeGroup ?? ingredient.alternative_group
  )?.trim();
  const alternativeOfRaw = ingredient.alternativeOf ?? ingredient.alternative_of;
  const alternativeOf =
    typeof alternativeOfRaw === "string"
      ? alternativeOfRaw.trim() || undefined
      : typeof alternativeOfRaw === "number" && Number.isFinite(alternativeOfRaw)
        ? String(alternativeOfRaw)
        : undefined;

  return {
    ...(role ? { role } : {}),
    ...(consumedQuantity !== undefined && consumedQuantity !== null
      ? { consumedQuantity }
      : {}),
    ...(alternativeGroup ? { alternativeGroup } : {}),
    ...(alternativeOf === undefined ? {} : { alternativeOf }),
  };
}
