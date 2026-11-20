import { describe, expect, it } from "vitest";
import {
  formatIngredientAmount,
  formatIngredientIntakeBadge,
} from "./recipeIngredientAmount";
import { toPublicRecipeRecord } from "./recipeServerAdapter";
import {
  normalizeStepIngredientMasterIds,
  recipeStepIngredientChips,
} from "./recipeStepIngredients";
import type { RecipeIngredient } from "./recipeCatalogTypes";
import type { ServerRecipeInfo } from "./recipeServerTypes";

const ingredients: readonly RecipeIngredient[] = [
  {
    masterId: 3508,
    name: "White Rice",
    quantity: 200,
    unit: "g",
    description: "Dummy ingredient White Rice",
    processingForm: null,
    isMasterName: false,
  },
  {
    masterId: 7509,
    name: "Cabbage Kimchi",
    quantity: 100,
    unit: "g",
    description: "Dummy ingredient Cabbage Kimchi",
    processingForm: "MINCED",
    isMasterName: true,
  },
];

describe("normalizeStepIngredientMasterIds", () => {
  it("keeps parseable ids once in first-seen order", () => {
    expect(normalizeStepIngredientMasterIds([3508, "7509", "bad", 3508, "7509"])).toEqual([
      3508,
      7509,
    ]);
  });

  it("returns null when the server does not provide step ingredient ids", () => {
    expect(normalizeStepIngredientMasterIds(null)).toBeNull();
    expect(normalizeStepIngredientMasterIds(undefined)).toBeNull();
    expect(normalizeStepIngredientMasterIds([])).toBeNull();
  });
});

describe("recipeStepIngredientChips", () => {
  it("joins step ids to recipe ingredients and ignores missing ids", () => {
    expect(recipeStepIngredientChips(ingredients, [7509, 9999, 3508])).toEqual([
      {
        masterId: 7509,
        name: "Cabbage Kimchi",
        quantity: 100,
        unit: "g",
        description: "Dummy ingredient Cabbage Kimchi",
        processingForm: "MINCED",
        isMasterName: true,
      },
      {
        masterId: 3508,
        name: "White Rice",
        quantity: 200,
        unit: "g",
        description: "Dummy ingredient White Rice",
        processingForm: null,
        isMasterName: false,
      },
    ]);
  });

  it("keeps legacy steps without chips when ids are absent", () => {
    expect(recipeStepIngredientChips(ingredients, null)).toEqual([]);
  });
});

describe("app11 chip pickDisplayFields after GET mapper", () => {
  it("copies role, consumedQuantity, group and alternative UUID without inventing CQ", () => {
    const record = toPublicRecipeRecord({
      recipeId: 1,
      title: "봄볼로니",
      steps: [{ stepNumber: 1, way: "채웁니다.", ingredientMasterIds: [3, 4, 1, 9] }],
      ingredients: [
        {
          masterId: 3,
          name: "잼",
          quantity: 200,
          unit: "g",
          alternativeGroup: "filling",
          alternativeOf: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        },
        { masterId: 4, name: "커스터드", quantity: 200, unit: "g", alternativeGroup: "filling" },
        { masterId: 1, name: "물", quantity: 100, unit: "g", role: "preparation", consumedQuantity: 25 },
        { masterId: 9, name: "소금", quantity: 2, unit: "g" },
      ],
    } as ServerRecipeInfo);
    const chips = recipeStepIngredientChips(record.ingredients, [3, 4, 1, 9]);
    expect(chips.map((chip) => chip.name)).toEqual(["잼", "커스터드", "물", "소금"]);
    expect(chips[0]).toMatchObject({
      alternativeGroup: "filling",
      alternativeOf: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      quantity: 200,
    });
    expect(chips[2]).toMatchObject({ role: "preparation", consumedQuantity: 25 });
    expect(chips[3]).not.toHaveProperty("consumedQuantity");
    expect(chips[3]).not.toHaveProperty("role");
    expect(formatIngredientAmount(chips[2]!, "ko", "적당량").primary).toBe("100 g");
    expect(formatIngredientIntakeBadge(chips[2]!, "ko", "적당량")).toBe("섭취 25 g");
    expect(formatIngredientIntakeBadge(chips[3]!, "ko", "적당량")).toBeNull();
  });
});
