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
  readonly bgStart: string;
  readonly bgEnd: string;
  readonly accent: string;
  readonly deep: string;
};

type RecipeVisualStyle = CSSProperties & {
  readonly "--rv-bg-start": string;
  readonly "--rv-bg-end": string;
  readonly "--rv-accent": string;
  readonly "--rv-deep": string;
};

const regionThemes: Record<string, VisualTheme> = {
  korean: { bgStart: "#f7f1dc", bgEnd: "#bfe1c1", accent: "#de4f3f", deep: "#244b30" },
  chinese: { bgStart: "#ffe0c2", bgEnd: "#f3aaa0", accent: "#c8322a", deep: "#4e1815" },
  japanese: { bgStart: "#f8dfe7", bgEnd: "#d7e9e7", accent: "#cf6f88", deep: "#2f4350" },
  french: { bgStart: "#e7eff6", bgEnd: "#f2dbc3", accent: "#3d6f8d", deep: "#28384e" },
  italian: { bgStart: "#f1e8ca", bgEnd: "#bfd9b3", accent: "#c84635", deep: "#315734" },
  indian: { bgStart: "#ffe1a2", bgEnd: "#f4b45f", accent: "#b64a24", deep: "#512d18" },
  global: { bgStart: "#e5e1f1", bgEnd: "#c5dedc", accent: "#5572a6", deep: "#29314a" },
};

const fallbackTheme: VisualTheme = {
  bgStart: "#efe4d2",
  bgEnd: "#c9ddd5",
  accent: "#5f795f",
  deep: "#26362f",
};

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
    "--rv-bg-start": theme.bgStart,
    "--rv-bg-end": theme.bgEnd,
    "--rv-accent": theme.accent,
    "--rv-deep": theme.deep,
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
