import { describe, expect, it } from "vitest";
import {
  ingredientProcessingFormHintKey,
  ingredientProcessingForms,
  normalizeIngredientProcessingForm,
  readIngredientProcessingForm,
} from "./ingredientProcessingForm";
import { toPublicRecipeRecord } from "./recipeServerAdapter";
import { translate } from "./translations";

describe("normalizeIngredientProcessingForm", () => {
  it("accepts every whitelisted code", () => {
    for (const form of ingredientProcessingForms) {
      expect(normalizeIngredientProcessingForm(form)).toBe(form);
    }
  });

  it("normalizes case and surrounding whitespace", () => {
    expect(normalizeIngredientProcessingForm(" minced ")).toBe("MINCED");
    expect(normalizeIngredientProcessingForm("Paste")).toBe("PASTE");
  });

  it("returns null for unknown codes and non-string values", () => {
    expect(normalizeIngredientProcessingForm("CHOPPED")).toBeNull();
    expect(normalizeIngredientProcessingForm("")).toBeNull();
    expect(normalizeIngredientProcessingForm(null)).toBeNull();
    expect(normalizeIngredientProcessingForm(undefined)).toBeNull();
    expect(normalizeIngredientProcessingForm(42)).toBeNull();
    expect(normalizeIngredientProcessingForm({ code: "MINCED" })).toBeNull();
  });
});

describe("readIngredientProcessingForm", () => {
  it("reads camelCase, snake_case, and hint key variants", () => {
    expect(readIngredientProcessingForm({ processingForm: "MINCED" })).toBe("MINCED");
    expect(readIngredientProcessingForm({ processing_form: "grated" })).toBe("GRATED");
    expect(readIngredientProcessingForm({ processingFormHint: "PASTE" })).toBe("PASTE");
    expect(readIngredientProcessingForm({ processing_form_hint: "whole" })).toBe("WHOLE");
  });

  it("falls through invalid variants to the next valid one", () => {
    expect(
      readIngredientProcessingForm({ processingForm: "CHOPPED", processing_form_hint: "DRIED" }),
    ).toBe("DRIED");
  });

  it("returns null when no variant is present or valid", () => {
    expect(readIngredientProcessingForm({})).toBeNull();
    expect(readIngredientProcessingForm({ processingForm: "unknown-code" })).toBeNull();
  });
});

describe("ingredientProcessingFormHintKey", () => {
  it("labels master-named ingredients with a known form", () => {
    const key = ingredientProcessingFormHintKey({ processingForm: "MINCED", isMasterName: true });
    expect(key).toBe("ingredientForm.MINCED");
  });

  it("skips raw names that already carry the modifier", () => {
    expect(
      ingredientProcessingFormHintKey({ processingForm: "MINCED", isMasterName: false }),
    ).toBeNull();
  });

  it("skips unknown forms", () => {
    expect(ingredientProcessingFormHintKey({ processingForm: null, isMasterName: true })).toBeNull();
  });

  it("has a ko and en label for every code", () => {
    for (const form of ingredientProcessingForms) {
      const key = ingredientProcessingFormHintKey({ processingForm: form, isMasterName: true });
      expect(key).not.toBeNull();
      if (key !== null) {
        expect(translate("ko", key).length).toBeGreaterThan(0);
        expect(translate("en", key).length).toBeGreaterThan(0);
      }
    }
  });

  it("maps the pilot codes to the expected Korean labels", () => {
    expect(translate("ko", "ingredientForm.MINCED")).toBe("다진");
    expect(translate("ko", "ingredientForm.GRATED")).toBe("간");
    expect(translate("ko", "ingredientForm.PASTE")).toBe("페이스트");
  });
});

describe("server ingredient adaptation", () => {
  it("normalizes processing form variants and flags master-based names", () => {
    const recipe = toPublicRecipeRecord({
      recipeId: 1,
      ingredients: [
        { masterId: 4940, master_name: "마늘", processing_form: "minced" },
        { masterId: 4940, name: "다진 마늘", processingForm: "MINCED" },
        { masterId: 4995, name: "설탕", processingForm: "CHOPPED" },
      ],
    });

    expect(recipe.ingredients[0]).toMatchObject({
      name: "마늘",
      processingForm: "MINCED",
      isMasterName: true,
    });
    expect(recipe.ingredients[1]).toMatchObject({
      name: "다진 마늘",
      processingForm: "MINCED",
      isMasterName: false,
    });
    expect(recipe.ingredients[2]).toMatchObject({
      name: "설탕",
      processingForm: null,
      isMasterName: false,
    });
  });
});
