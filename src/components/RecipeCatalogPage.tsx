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
  collectCatalogOptions,
  filterPublicRecipes,
  initialCatalogFilters,
  loadPublicMockRecipes,
  popularPublicRecipes,
  quickPublicRecipes,
  topPublicIngredients,
} from "../lib/recipeCatalogMock";
import { useI18n } from "../lib/i18n";
import { emojiFor } from "../lib/recipeFilterMeta";
import type { PublicRecipeCatalogFilters, PublicRecipeRecord } from "../lib/recipeCatalogTypes";

export function RecipeCatalogPage(): JSX.Element {
  const { t, labelFor, countryLabel, timeLabel } = useI18n();
  const [recipes, setRecipes] = useState<readonly PublicRecipeRecord[]>([]);
  const [filters, setFilters] = useState<PublicRecipeCatalogFilters>(initialCatalogFilters);
  const [selectedRecipe, setSelectedRecipe] = useState<PublicRecipeRecord | null>(null);

  useEffect(() => {
    void loadPublicMockRecipes().then(setRecipes);
  }, []);

  const categories = useMemo(() => collectCatalogOptions(recipes).category, [recipes]);
  const filterOptions = useMemo<FilterOptions>(
    () => collectCatalogOptions(recipes),
    [recipes],
  );
  const visibleRecipes = useMemo(() => filterPublicRecipes(recipes, filters), [recipes, filters]);

  const featured = useMemo(() => popularPublicRecipes(recipes).slice(0, 6), [recipes]);
  const quick = useMemo(() => quickPublicRecipes(recipes).slice(0, 10), [recipes]);
  const popular = useMemo(() => popularPublicRecipes(recipes).slice(0, 8), [recipes]);
  const ingredients = useMemo(() => topPublicIngredients(recipes, 9), [recipes]);

  const isBrowsing = isBrowsingFilters(filters);

  const patchFilters = (patch: Partial<PublicRecipeCatalogFilters>): void =>
    setFilters((current) => ({ ...current, ...patch }));
  const resetFilters = (): void => setFilters(initialCatalogFilters);

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
                  <RecipeCard key={recipe.recipeId} recipe={recipe} onOpen={setSelectedRecipe} />
                ))}
              </div>
            </Section>

            <Section eyebrow={t("section.quick.eyebrow")} title={t("section.quick.title")}>
              <div className="rail">
                {quick.map((recipe) => (
                  <RecipeCard
                    key={recipe.recipeId}
                    recipe={recipe}
                    onOpen={setSelectedRecipe}
                    variant="rail"
                  />
                ))}
              </div>
            </Section>

            <Section eyebrow={t("section.country.eyebrow")} title={t("section.country.title")}>
              <div className="country-chips">
                {filterOptions.region.countries.map((country) => (
                  <button
                    key={country.countryCode}
                    type="button"
                    className="chip chip--country"
                    onClick={() =>
                      setFilters({
                        ...initialCatalogFilters,
                        region: {
                          scope: "country",
                          countryCode: country.countryCode,
                          country: country.country,
                        },
                      })
                    }
                  >
                    {emojiFor(country.country)} {countryLabel(country.country)}
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
                    onClick={() => setFilters({ ...initialCatalogFilters, primaryIngredient: ingredient })}
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
                  <RecipeCard key={recipe.recipeId} recipe={recipe} onOpen={setSelectedRecipe} />
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
                  <RecipeCard key={recipe.recipeId} recipe={recipe} onOpen={setSelectedRecipe} />
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
