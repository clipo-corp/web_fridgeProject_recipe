import {
  Apple,
  Beef,
  Cookie,
  Croissant,
  CupSoda,
  Egg,
  Fish,
  Leaf,
  Salad,
  Soup,
  UtensilsCrossed,
  Wheat,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { recipeInitial } from "../lib/recipeLabels";
import { useI18n } from "../lib/i18n";
import type { Recipe } from "../lib/recipeTypes";

type RecipeVisualSize = "card" | "spotlight" | "detail" | "thumb";

type RecipeVisualProps = {
  readonly recipe: Recipe;
  readonly size?: RecipeVisualSize;
};

type VisualTheme = {
  readonly tint: string;
};

type RecipeVisualStyle = CSSProperties & {
  readonly "--rv-tint": string;
};

const regionThemes: Record<string, VisualTheme> = {
  korean: { tint: "#9cebaf" },
  chinese: { tint: "#ffa8a8" },
  japanese: { tint: "#ffbde6" },
  french: { tint: "#a3d2ff" },
  italian: { tint: "#d5f29b" },
  indian: { tint: "#ffcfa3" },
  global: { tint: "#c2c2f0" },
};

const categoryIcons: Record<string, LucideIcon> = {
  dessert: Cookie,
  "snack-cookie": Cookie,
  salad: Salad,
  "noodle-dumpling": Soup,
  stew: Soup,
  soup: Soup,
  "soup-stew": Soup,
  "rice-porridge": Soup,
  bread: Croissant,
  "main-dish": UtensilsCrossed,
  "side-dish": Salad,
  "sauce-jam": UtensilsCrossed,
  "kimchi-paste": Salad,
  "drink-alcohol": Wine,
};

const ingredientIcons: Record<string, LucideIcon> = {
  beef: Beef,
  pork: Beef,
  meat: Beef,
  chicken: Beef,
  seafood: Fish,
  "dairy-egg": Egg,
  flour: Wheat,
  grains: Wheat,
  rice: Wheat,
  fruits: Apple,
  vegetable: Salad,
  "bean-nut": Leaf,
  processed: CupSoda,
};

const fallbackTheme: VisualTheme = { tint: "#c2c2f0" };

function pickTheme(recipe: Recipe): VisualTheme {
  return regionThemes[recipe.cuisineRegion] ?? fallbackTheme;
}

function pickIcon(recipe: Recipe): LucideIcon {
  return (
    categoryIcons[recipe.category] ??
    ingredientIcons[recipe.primaryIngredient] ??
    UtensilsCrossed
  );
}

const iconSizes: Record<RecipeVisualSize, number> = {
  thumb: 22,
  card: 36,
  spotlight: 52,
  detail: 64,
};

export function RecipeVisual({ recipe, size = "card" }: RecipeVisualProps): JSX.Element {
  const { countryLabel, labelFor } = useI18n();

  if (recipe.imageUrl !== null) {
    return (
      <div className={`recipe-visual recipe-visual--${size} recipe-visual--photo`}>
        <img src={recipe.imageUrl} alt="" loading="lazy" />
      </div>
    );
  }

  const theme = pickTheme(recipe);
  const Icon = pickIcon(recipe);
  const styleVars: RecipeVisualStyle = {
    "--rv-tint": theme.tint,
  };

  return (
    <div
      className={`recipe-visual recipe-visual--${size} recipe-visual--placeholder`}
      style={styleVars}
      aria-hidden="true"
    >
      <span className="recipe-visual__pattern" />
      <span className="recipe-visual__region">{countryLabel(recipe.country)}</span>
      <span className="recipe-visual__plate">
        <Icon size={iconSizes[size]} strokeWidth={1.6} />
        {size === "thumb" ? null : (
          <span className="recipe-visual__initial">{recipeInitial(recipe.title)}</span>
        )}
      </span>
      <span className="recipe-visual__ingredient">
        <Leaf size={13} aria-hidden="true" />
        {labelFor(recipe.primaryIngredient)}
      </span>
    </div>
  );
}
