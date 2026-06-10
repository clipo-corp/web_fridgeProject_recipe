import { Leaf } from "lucide-react";
import type { CSSProperties } from "react";
import { useI18n } from "../lib/i18n";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";
import { recipeHomeEmoji, recipeListEmoji } from "../lib/recipeThumbnail";

type RecipeVisualSize = "card" | "spotlight" | "detail" | "thumb";
type RecipeVisualEmojiMode = "home" | "list";

type RecipeVisualProps = {
  readonly recipe: PublicRecipeRecord;
  readonly size?: RecipeVisualSize;
  readonly emojiMode?: RecipeVisualEmojiMode;
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

const fallbackTheme: VisualTheme = { tint: "#c2c2f0" };

function pickTheme(recipe: PublicRecipeRecord): VisualTheme {
  return regionThemes[recipe.cuisineRegion] ?? fallbackTheme;
}

export function RecipeVisual({
  recipe,
  size = "card",
  emojiMode = "list",
}: RecipeVisualProps): JSX.Element {
  const { labelFor } = useI18n();

  if (recipe.titleImageUrl !== null && recipe.titleImageUrl.trim().length > 0) {
    return (
      <div className={`recipe-visual recipe-visual--${size} recipe-visual--photo`}>
        <img src={recipe.titleImageUrl} alt="" loading="lazy" />
      </div>
    );
  }

  const theme = pickTheme(recipe);
  const emoji = emojiMode === "home" ? recipeHomeEmoji(recipe) : recipeListEmoji(recipe);
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
      <span className="recipe-visual__region">{labelFor(recipe.cuisineRegion)}</span>
      <span className="recipe-visual__plate">
        <span className="recipe-visual__emoji">{emoji}</span>
      </span>
      <span className="recipe-visual__ingredient">
        <Leaf size={13} aria-hidden="true" />
        {labelFor(recipe.primaryIngredient)}
      </span>
    </div>
  );
}
