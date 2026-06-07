export type RecipeDifficulty =
  | "easy"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "master";

export type RecipeSort = "recommended" | "popular" | "latest";

export type Recipe = {
  readonly id: string;
  readonly title: string;
  readonly imageUrl: string | null;
  readonly description: string;
  readonly cookingTip: string;
  readonly category: string;
  readonly cuisineRegion: string;
  readonly country: string;
  readonly cookingTime: string;
  readonly difficulty: RecipeDifficulty;
  readonly recipeType: string;
  readonly primaryIngredient: string;
  readonly sourceName: string;
  readonly views: number;
  readonly likes: number;
  readonly ingredients: readonly RecipeIngredient[];
  readonly steps: readonly RecipeStep[];
};

export type RecipeIngredient = {
  readonly name: string;
  readonly quantity: number | null;
  readonly unit: string | null;
  readonly description: string;
};

export type RecipeStep = {
  readonly stepNumber: number;
  readonly way: string;
  readonly cookingTip: string | null;
  readonly imageUrl: string | null;
};

export type RecipeFilters = {
  readonly query: string;
  readonly category: string;
  readonly country: string;
  readonly region?: string;
  readonly time?: string;
  readonly difficulty?: string;
  readonly recipeType?: string;
  readonly ingredient?: string;
  readonly sort?: RecipeSort;
};
