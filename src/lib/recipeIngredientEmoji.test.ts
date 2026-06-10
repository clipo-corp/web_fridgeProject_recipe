import { describe, expect, it } from "vitest";
import { recipeIngredientEmoji } from "./recipeIngredientEmoji";
import type { RecipeIngredient } from "./recipeCatalogTypes";

function ingredient(patch: Partial<RecipeIngredient>): RecipeIngredient {
  return {
    masterId: null,
    name: "ingredient",
    quantity: null,
    unit: null,
    description: "",
    ...patch,
  };
}

describe("recipeIngredientEmoji", () => {
  it("uses chicken emoji when the ingredient is poultry", () => {
    expect(recipeIngredientEmoji(ingredient({ name: "닭다리살" }))).toBe("🍗");
    expect(recipeIngredientEmoji(ingredient({ name: "chicken breast" }))).toBe("🍗");
  });

  it("uses meat emoji when the ingredient is pork or beef", () => {
    expect(recipeIngredientEmoji(ingredient({ name: "돼지고기" }))).toBe("🥩");
    expect(recipeIngredientEmoji(ingredient({ name: "beef brisket" }))).toBe("🥩");
  });

  it("uses processed meat emoji when the ingredient is bacon, ham, or sausage", () => {
    expect(recipeIngredientEmoji(ingredient({ name: "베이컨" }))).toBe("🥓");
    expect(recipeIngredientEmoji(ingredient({ name: "ham" }))).toBe("🥓");
    expect(recipeIngredientEmoji(ingredient({ name: "sausage" }))).toBe("🥓");
  });

  it("uses seafood emoji before generic fish matching", () => {
    expect(recipeIngredientEmoji(ingredient({ name: "shrimp", description: "seafood" }))).toBe("🦐");
  });
});
