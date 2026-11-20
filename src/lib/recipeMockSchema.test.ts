import { describe, expect, it } from "vitest";
import {
  pickMockIntakeFields,
  seedFileSchema,
} from "./recipeMockSchema";

describe("recipeMockSchema optional intake fields", () => {
  it("preserves the four optional GET intake keys", () => {
    const parsed = seedFileSchema.parse({
      recipes: [
        {
          recipe: {
            title: "mock",
            ingredients: [
              {
                name: "물",
                quantity: 100,
                unit: "g",
                role: "preparation",
                consumedQuantity: 25,
                alternativeGroup: "filling",
                alternativeOf: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
              },
            ],
            steps: [{ stepNumber: 1, way: "끓인다" }],
          },
        },
      ],
    });
    expect(parsed.recipes[0]?.recipe.ingredients[0]).toMatchObject({
      name: "물",
      quantity: 100,
      unit: "g",
      role: "preparation",
      consumedQuantity: 25,
      alternativeGroup: "filling",
      alternativeOf: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    });
    expect(
      pickMockIntakeFields(parsed.recipes[0]!.recipe.ingredients[0]!),
    ).toEqual({
      role: "preparation",
      consumedQuantity: 25,
      alternativeGroup: "filling",
      alternativeOf: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    });
  });

  it("keeps consumedQuantity 0 and does not invent keys on legacy lines", () => {
    const parsed = seedFileSchema.parse({
      recipes: [
        {
          recipe: {
            title: "legacy",
            ingredients: [
              { name: "소금", quantity: 200, unit: "g" },
              { name: "얼음", quantity: 150, unit: "g", role: "discarded", consumedQuantity: 0 },
            ],
            steps: [{ stepNumber: 1, way: "넣는다" }],
          },
        },
      ],
    });
    const [legacy, zero] = parsed.recipes[0]!.recipe.ingredients;
    expect(legacy).not.toHaveProperty("role");
    expect(legacy).not.toHaveProperty("consumedQuantity");
    expect(legacy).not.toHaveProperty("alternativeGroup");
    expect(legacy).not.toHaveProperty("alternativeOf");
    expect(pickMockIntakeFields(legacy!)).toEqual({});
    expect(zero).toMatchObject({ consumedQuantity: 0, role: "discarded" });
    expect(pickMockIntakeFields(zero!)).toEqual({
      role: "discarded",
      consumedQuantity: 0,
    });
  });
});
