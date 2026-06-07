import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().optional(),
  quantity: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

const stepSchema = z.object({
  stepNumber: z.number(),
  way: z.string(),
  cookingTip: z.string().nullable().optional(),
});

const recipeSchema = z.object({
  title: z.string(),
  titleImageUrl: z.string().nullable().optional(),
  recipeType: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  cuisineRegion: z.string().nullable().optional(),
  primaryIngredient: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  cookingTime: z.string().nullable().optional(),
  cookingTip: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  ingredients: z.array(ingredientSchema).default([]),
  steps: z.array(stepSchema).default([]),
});

const seedEntrySchema = z.object({
  importSource: z
    .object({
      sourceId: z.string().optional(),
      sourceUrl: z.string().nullable().optional(),
    })
    .optional(),
  recipe: recipeSchema,
  _mockMeta: z
    .object({
      country: z.string().optional(),
      category: z.string().optional(),
    })
    .optional(),
});

export const seedFileSchema = z.object({
  recipes: z.array(seedEntrySchema),
});

export type SeedEntry = z.infer<typeof seedEntrySchema>;
