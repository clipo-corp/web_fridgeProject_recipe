import { RecipeCard } from "./RecipeCard";
import { SkeletonCard } from "./SkeletonCard";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type FeaturedRecipeCarouselProps = {
  readonly recipes: readonly PublicRecipeRecord[];
};

const pageSize = 3;

export function FeaturedRecipeCarousel({
  recipes,
}: FeaturedRecipeCarouselProps): JSX.Element {
  const visibleRecipes = recipes.slice(0, pageSize);
  const skeletonCount = pageSize - visibleRecipes.length;

  return (
    <div className="featured-carousel">
      <div className="grid grid--spotlight">
        {visibleRecipes.map((recipe) => (
          <RecipeCard key={recipe.recipeId} recipe={recipe} variant="spotlight" />
        ))}
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonCard key={`featured-skeleton-${i}`} variant="spotlight" />
        ))}
      </div>
    </div>
  );
}
