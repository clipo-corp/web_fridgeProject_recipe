import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Refrigerator, Sparkles, X } from "lucide-react";
import { InstallBand, MobileInstallCta } from "./AppInstallCta";
import { CategoryRail } from "./CategoryRail";
import { FilterBar, type FilterOptions } from "./FilterBar";
import { RecipeCard } from "./RecipeCard";
import {
  buildActiveChips,
  describeFilters,
  isBrowsingFilters,
} from "./RecipeCatalogFilters";
import { RecipeDetail } from "./RecipeDetail";
import { SearchHero } from "./SearchHero";
import {
  collectOptions,
  filterRecipes,
  loadMockRecipes,
  popularRecipes,
  quickRecipes,
  topIngredients,
} from "../lib/recipeMockData";
import { useI18n } from "../lib/i18n";
import { emojiFor } from "../lib/recipeFilterMeta";
import type { Recipe, RecipeFilters } from "../lib/recipeTypes";

const initialFilters: RecipeFilters = {
  query: "",
  category: "all",
  country: "all",
  region: "all",
  time: "all",
  difficulty: "all",
  recipeType: "all",
  ingredient: "all",
  sort: "recommended",
};

export function RecipeCatalogPage(): JSX.Element {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();
  const [recipes, setRecipes] = useState<readonly Recipe[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    void loadMockRecipes().then(setRecipes);
  }, []);

  const categories = useMemo(() => collectOptions(recipes, "category"), [recipes]);
  const filterOptions = useMemo<FilterOptions>(
    () => ({
      region: collectOptions(recipes, "cuisineRegion"),
      country: collectOptions(recipes, "country"),
      time: collectOptions(recipes, "cookingTime"),
      difficulty: collectOptions(recipes, "difficulty"),
      recipeType: collectOptions(recipes, "recipeType"),
      category: collectOptions(recipes, "category"),
      ingredient: collectOptions(recipes, "primaryIngredient"),
    }),
    [recipes],
  );
  const visibleRecipes = useMemo(() => filterRecipes(recipes, filters), [recipes, filters]);

  const featured = useMemo(() => popularRecipes(recipes).slice(0, 6), [recipes]);
  const quick = useMemo(() => quickRecipes(recipes).slice(0, 10), [recipes]);
  const popular = useMemo(() => popularRecipes(recipes).slice(0, 8), [recipes]);
  const ingredients = useMemo(() => topIngredients(recipes, 9), [recipes]);

  const isBrowsing = isBrowsingFilters(filters);

  const patchFilters = (patch: Partial<RecipeFilters>): void =>
    setFilters((current) => ({ ...current, ...patch }));
  const resetFilters = (): void => setFilters(initialFilters);

  const activeChips = buildActiveChips(filters, { labelFor, countryLabel, timeLabel });

  return (
    <>
      <main>
        <SearchHero
          query={filters.query}
          recipeCount={recipes.length}
          onQueryChange={(query) => patchFilters({ query })}
        />
        <CategoryRail
          categories={categories}
          selectedCategory={filters.category}
          onSelectCategory={(category) => patchFilters({ category })}
        />

        {isBrowsing ? (
          <div className="page">
            <Section eyebrow={t("section.featured.eyebrow")} title={t("section.featured.title")}>
              <div className="grid grid--spotlight">
                {featured.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onOpen={setSelectedRecipe} />
                ))}
              </div>
            </Section>

            <Section eyebrow={t("section.quick.eyebrow")} title={t("section.quick.title")}>
              <div className="rail">
                {quick.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onOpen={setSelectedRecipe}
                    variant="rail"
                  />
                ))}
              </div>
            </Section>

            <Section eyebrow={t("section.country.eyebrow")} title={t("section.country.title")}>
              <div className="country-chips">
                {filterOptions.country.map((country) => (
                  <button
                    key={country}
                    type="button"
                    className="chip chip--country"
                    onClick={() => setFilters({ ...initialFilters, country })}
                  >
                    {emojiFor(country)} {countryLabel(country)}
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </Section>

            <InstallBand />

            <Section
              eyebrow={t("section.ingredient.eyebrow")}
              title={t("section.ingredient.title")}
              note={t("section.ingredient.note")}
            >
              <div className="ingredient-chips">
                {ingredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    type="button"
                    className="chip chip--ingredient"
                    onClick={() => setFilters({ ...initialFilters, ingredient })}
                  >
                    <Refrigerator size={15} aria-hidden="true" />
                    {labelFor(ingredient)}
                  </button>
                ))}
              </div>
            </Section>

            <Section eyebrow={t("section.popular.eyebrow")} title={t("section.popular.title")}>
              <div className="grid grid--feed">
                {popular.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onOpen={setSelectedRecipe} />
                ))}
              </div>
            </Section>
          </div>
        ) : (
          <div className="page">
            <div className="results-head">
              <div>
                <span className="eyebrow">{t("results.eyebrow")}</span>
                <h2>{describeFilters(filters, { t, labelFor, countryLabel, timeLabel })}</h2>
                <p className="results-count">
                  {t("results.count", { count: visibleRecipes.length })}
                </p>
              </div>
              <button type="button" className="btn btn--ghost" onClick={resetFilters}>
                <X size={16} aria-hidden="true" />
                {t("results.reset")}
              </button>
            </div>

            {activeChips.length > 0 ? (
              <div className="active-filters">
                {activeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="active-filter"
                    aria-label={t("filters.clearOne")}
                    onClick={() => patchFilters(chip.clear)}
                  >
                    {chip.emoji.length > 0 ? <span aria-hidden="true">{chip.emoji}</span> : null}
                    {chip.text}
                    <X size={13} aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : null}

            <FilterBar filters={filters} options={filterOptions} onChange={patchFilters} />

            {visibleRecipes.length === 0 ? (
              <div className="empty-state">
                <Sparkles size={28} aria-hidden="true" />
                <strong>{t("empty.title")}</strong>
                <p>{t("empty.body")}</p>
                <button type="button" className="btn btn--primary" onClick={resetFilters}>
                  {t("empty.cta")}
                </button>
              </div>
            ) : (
              <div className="grid grid--feed">
                {visibleRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onOpen={setSelectedRecipe} />
                ))}
              </div>
            )}

            <InstallBand />
          </div>
        )}
      </main>

      <MobileInstallCta />
      <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </>
  );
}

type SectionProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly note?: string;
  readonly children: ReactNode;
};

function Section({ eyebrow, title, note, children }: SectionProps): JSX.Element {
  return (
    <section className="section">
      <div className="section__head">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {note !== undefined ? <p className="section__note">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}
