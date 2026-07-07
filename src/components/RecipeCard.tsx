import { Clock, Flame, Globe2, Heart, Languages, Users } from "lucide-react";
import { RecipeCreatorSource } from "./RecipeCreatorSource";
import { RecipeVisual } from "./RecipeVisual";
import { useI18n } from "../lib/i18n";
import { detailPathForRecipe } from "../lib/routes";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type RecipeCardProps = {
  readonly recipe: PublicRecipeRecord;
  readonly variant?: "grid" | "rail" | "spotlight";
  readonly rank?: number;
};

export function RecipeCard({ recipe, variant = "grid", rank }: RecipeCardProps): JSX.Element {
  const { labelFor, timeLabel } = useI18n();
  const metaPreview = [
    recipe.category,
    recipe.recipeType,
    recipe.cookingMethod,
    recipe.technique,
    recipe.requiredTool,
  ].filter((value) => value.length > 0 && value !== "unknown");

  return (
    <article className={`recipe-card recipe-card--${variant}`}>
      <a className="recipe-card__link" href={detailPathForRecipe(recipe.recipeId)}>
        <RecipeVisual
          recipe={recipe}
          size={variant === "spotlight" ? "spotlight" : "card"}
          emojiMode="home"
        />
        {rank !== undefined ? <span className="recipe-card__rank">{rank}</span> : null}
        <div className="recipe-card__body">
          <div className="recipe-card__badges">
            <span className="badge badge--brand">{labelFor(recipe.category)}</span>
            <span className="badge badge--muted">{labelFor(recipe.cuisineRegion)}</span>
            {recipe.isTranslated ? (
              <span className="badge badge--muted">
                <Languages size={12} aria-hidden="true" />
                {labelFor(recipe.writtenLang)}
              </span>
            ) : null}
          </div>
          <RecipeCreatorSource recipe={recipe} variant="card" />
          <h3>
            <Globe2 className="recipe-card__title-icon" size={18} aria-hidden="true" />
            <span>{recipe.title}</span>
          </h3>
          <p>{recipe.description}</p>
          {metaPreview.length > 0 ? (
            <div className="recipe-card__ingredients">
              {metaPreview.map((value) => (
                <span key={value}>{labelFor(value)}</span>
              ))}
            </div>
          ) : null}
          <div className="recipe-card__meta">
            <span>
              <Clock size={15} aria-hidden="true" />
              {timeLabel(recipe.cookingTime)}
            </span>
            <span>
              <Flame size={15} aria-hidden="true" />
              {labelFor(recipe.difficulty)}
            </span>
            <span>
              <Users size={15} aria-hidden="true" />
              {recipe.servings}
            </span>
            <span>
              <Heart size={15} aria-hidden="true" />
              {recipe.likeCount}
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}
