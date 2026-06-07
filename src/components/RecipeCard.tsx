import { Clock, Flame, Heart } from "lucide-react";
import { RecipeVisual } from "./RecipeVisual";
import { useI18n } from "../lib/i18n";
import type { Recipe } from "../lib/recipeTypes";

type RecipeCardProps = {
  readonly recipe: Recipe;
  readonly onOpen: (recipe: Recipe) => void;
  readonly variant?: "grid" | "rail";
};

export function RecipeCard({ recipe, onOpen, variant = "grid" }: RecipeCardProps): JSX.Element {
  const { labelFor, countryLabel, timeLabel } = useI18n();
  const ingredientPreview = recipe.ingredients
    .slice(0, 3)
    .map((ingredient) => ingredient.name)
    .filter(Boolean);

  return (
    <article className={`recipe-card recipe-card--${variant}`}>
      <button type="button" onClick={() => onOpen(recipe)}>
        <RecipeVisual recipe={recipe} size={variant === "rail" ? "card" : "card"} />
        <div className="recipe-card__body">
          <div className="recipe-card__badges">
            <span className="badge badge--brand">{labelFor(recipe.category)}</span>
            <span className="badge badge--muted">{countryLabel(recipe.country)}</span>
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
              <Heart size={15} aria-hidden="true" />
              {recipe.likes}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
