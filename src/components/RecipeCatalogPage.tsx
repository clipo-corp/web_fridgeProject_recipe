import { useEffect, useMemo, useState } from "react";
import { AppInstallCta } from "./AppInstallCta";
import { CategoryRail } from "./CategoryRail";
import { FilterBar } from "./FilterBar";
import { RecipeCard } from "./RecipeCard";
import { RecipeDetail } from "./RecipeDetail";
import { SearchHero } from "./SearchHero";
import { collectOptions, filterRecipes, loadMockRecipes } from "../lib/recipeMockData";
import type { Recipe, RecipeFilters } from "../lib/recipeTypes";

const initialFilters: RecipeFilters = {
  query: "",
  category: "all",
  country: "all",
};

export function RecipeCatalogPage(): JSX.Element {
  const [recipes, setRecipes] = useState<readonly Recipe[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    void loadMockRecipes().then(setRecipes);
  }, []);

  const categories = useMemo(() => collectOptions(recipes, "category"), [recipes]);
  const countries = useMemo(() => collectOptions(recipes, "country"), [recipes]);
  const visibleRecipes = useMemo(() => filterRecipes(recipes, filters), [recipes, filters]);
  const spotlight = visibleRecipes.slice(0, 3);
  const feed = visibleRecipes.slice(3);

  return (
    <main>
      <SearchHero
        query={filters.query}
        recipeCount={recipes.length}
        onQueryChange={(query) => setFilters((current) => ({ ...current, query }))}
      />
      <CategoryRail
        categories={categories}
        selectedCategory={filters.category}
        onSelectCategory={(category) => setFilters((current) => ({ ...current, category }))}
      />
      <section className="catalog-shell">
        <div className="catalog-content">
          <div className="section-heading">
            <div>
              <span className="eyebrow">오늘 뭐 먹지?</span>
              <h2>지금 둘러보기 좋은 레시피</h2>
            </div>
            <FilterBar
              countries={countries}
              selectedCountry={filters.country}
              onSelectCountry={(country) => setFilters((current) => ({ ...current, country }))}
            />
          </div>
          <div className="spotlight-grid">
            {spotlight.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} onOpen={setSelectedRecipe} />
            ))}
          </div>
          <div className="feed-heading">
            <h2>전체 레시피</h2>
            <span>{visibleRecipes.length}개 결과</span>
          </div>
          <div className="recipe-grid">
            {feed.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index + 3} onOpen={setSelectedRecipe} />
            ))}
          </div>
        </div>
        <AppInstallCta />
      </section>
      <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </main>
  );
}
