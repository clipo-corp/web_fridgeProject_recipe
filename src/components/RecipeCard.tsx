import { Clock, Flame, Heart, Languages, Users } from "lucide-react";
import { RecipeVisual } from "./RecipeVisual";
import { useI18n } from "../lib/i18n";
import { detailPathForRecipe } from "../lib/routes";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type RecipeCardProps = {
  readonly recipe: PublicRecipeRecord;
  readonly variant?: "grid" | "rail" | "spotlight";
};

export function RecipeCard({ recipe, variant = "grid" }: RecipeCardProps): JSX.Element {
  const { labelFor, countryLabel, timeLabel } = useI18n();
  const ingredientPreview = recipe.ingredients
    .slice(0, 3)
    .map((ingredient) => ingredient.name)
    .filter(Boolean);

  return (
    <article className={`recipe-card recipe-card--${variant}`}>
      <a className="recipe-card__link" href={detailPathForRecipe(recipe.recipeId)}>
        <RecipeVisual recipe={recipe} size={variant === "spotlight" ? "spotlight" : "card"} />
        <div className="recipe-card__body">
          <div className="recipe-card__badges">
            <span className="badge badge--brand">{labelFor(recipe.category)}</span>
            <span className="badge badge--muted">{countryLabel(recipe.country)}</span>
            {recipe.isTranslated ? (
              <span className="badge badge--muted">
                <Languages size={12} aria-hidden="true" />
                {labelFor(recipe.writtenLang)}
              </span>
            ) : null}
          </div>
          <h3>{recipe.title}</h3>
          <p>{recipe.description}</p>
          {ingredientPreview.length > 0 ? (
            <div className="recipe-card__ingredients">
              {ingredientPreview.map((name) => (
                <span key={name}>{name}</span>
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
