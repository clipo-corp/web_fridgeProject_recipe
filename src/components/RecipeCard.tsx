import { Clock, Eye, Heart } from "lucide-react";
import { labelFor, recipeInitial } from "../lib/recipeLabels";
import type { Recipe } from "../lib/recipeTypes";

type RecipeCardProps = {
  readonly recipe: Recipe;
  readonly index: number;
  readonly onOpen: (recipe: Recipe) => void;
};

export function RecipeCard({ recipe, index, onOpen }: RecipeCardProps): JSX.Element {
  const colorIndex = index % 6;

  return (
    <article className="recipe-card">
      <button type="button" onClick={() => onOpen(recipe)}>
        {recipe.imageUrl === null ? (
          <div className={`recipe-visual recipe-visual-${colorIndex}`}>
            <span>{recipeInitial(recipe.title)}</span>
          </div>
        ) : (
          <img className="recipe-photo" src={recipe.imageUrl} alt="" loading="lazy" />
        )}
        <div className="recipe-card-body">
          <div className="badge-row">
            <span>{labelFor(recipe.category)}</span>
            <span>{recipe.country}</span>
          </div>
          <h3>{recipe.title}</h3>
          <p>{recipe.description}</p>
          <div className="recipe-meta">
            <span>
              <Clock size={15} aria-hidden="true" />
              {recipe.cookingTime}
            </span>
            <span>{labelFor(recipe.difficulty)}</span>
            <span>
              <Heart size={15} aria-hidden="true" />
              {recipe.likes}
            </span>
            <span>
              <Eye size={15} aria-hidden="true" />
              {recipe.views}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
