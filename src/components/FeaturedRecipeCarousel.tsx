import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { RecipeCard } from "./RecipeCard";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type FeaturedRecipeCarouselProps = {
  readonly recipes: readonly PublicRecipeRecord[];
};

const pageSize = 3;

export function FeaturedRecipeCarousel({
  recipes,
}: FeaturedRecipeCarouselProps): JSX.Element {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(recipes.length / pageSize));
  const normalizedPage = Math.min(page, pageCount - 1);
  const visibleRecipes = useMemo(
    () => recipes.slice(normalizedPage * pageSize, normalizedPage * pageSize + pageSize),
    [recipes, normalizedPage],
  );
  const canPage = recipes.length > pageSize;

  const goPrevious = (): void => {
    setPage((current) => (current === 0 ? pageCount - 1 : current - 1));
  };
  const goNext = (): void => {
    setPage((current) => (current + 1 >= pageCount ? 0 : current + 1));
  };

  return (
    <div className="featured-carousel">
      {canPage ? (
        <div className="featured-carousel__controls" aria-label="지금 뜨는 레시피 넘기기">
          <button type="button" className="featured-carousel__arrow" aria-label="이전 레시피" onClick={goPrevious}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <span className="featured-carousel__page">
            {normalizedPage + 1}/{pageCount}
          </span>
          <button type="button" className="featured-carousel__arrow" aria-label="다음 레시피" onClick={goNext}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="grid grid--spotlight">
        {visibleRecipes.map((recipe) => (
          <RecipeCard key={recipe.recipeId} recipe={recipe} variant="spotlight" />
        ))}
      </div>
    </div>
  );
}
