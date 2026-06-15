import { useEffect, useState } from "react";
import { I18nProvider, useI18n } from "../lib/i18n";
import { loadCatalogFilterOptions } from "../lib/recipeApi";
import type { CatalogFilterOptions } from "../lib/recipeCatalogMock";
import { appRouteForPath, type AppRoute } from "../lib/routes";
import { ThemeProvider } from "../lib/theme";
import { InstallPage } from "./InstallPage";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage";
import { RecipeCatalogPage } from "./RecipeCatalogPage";
import { RecipeDetailPage } from "./RecipeDetailPage";
import { SiteHeader } from "./SiteHeader";

const emptyCatalogFilterOptions: CatalogFilterOptions = {
  region: { countries: [], cities: [], districts: [] },
  writtenLang: [],
  recipeType: [],
  cookingMethod: [],
  technique: [],
  dietaryGoal: [],
  dietaryRestriction: [],
  primaryIngredient: [],
  category: [],
  occasion: [],
  difficulty: [],
  cookingTime: [],
  cuisineRegion: [],
  servings: [],
  requiredTool: [],
};

export function App(): JSX.Element {
  const route = appRouteForPath(window.location.pathname);

  return (
    <ThemeProvider>
      {route.kind === "privacy" ? (
        <PrivacyPolicyPage />
      ) : (
        <I18nProvider>
          <RecipeApp route={route} />
        </I18nProvider>
      )}
    </ThemeProvider>
  );
}

type RecipeAppRoute = Exclude<AppRoute, { readonly kind: "privacy" }>;

function RecipeApp({ route }: { readonly route: RecipeAppRoute }): JSX.Element {
  const { displayLang } = useI18n();
  const [filterOptions, setFilterOptions] =
    useState<CatalogFilterOptions>(emptyCatalogFilterOptions);
  const [selectedCuisineRegion, setSelectedCuisineRegion] = useState("all");

  useEffect(() => {
    let cancelled = false;

    void loadCatalogFilterOptions(displayLang).then((nextFilterOptions) => {
      if (!cancelled) {
        setFilterOptions(nextFilterOptions);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [displayLang]);

  useEffect(() => {
    if (selectedCuisineRegion === "all" || filterOptions.cuisineRegion.length === 0) {
      return;
    }

    if (!filterOptions.cuisineRegion.includes(selectedCuisineRegion)) {
      setSelectedCuisineRegion("all");
    }
  }, [filterOptions.cuisineRegion, selectedCuisineRegion]);

  return (
    <>
      <SiteHeader
        cuisineRegionOptions={filterOptions.cuisineRegion}
        selectedCuisineRegion={selectedCuisineRegion}
        onCuisineRegionChange={setSelectedCuisineRegion}
      />
      {route.kind === "install" ? <InstallPage /> : null}
      {route.kind === "catalog" ? (
        <RecipeCatalogPage
          filterOptions={filterOptions}
          selectedCuisineRegion={selectedCuisineRegion}
          onSelectedCuisineRegionChange={setSelectedCuisineRegion}
        />
      ) : null}
      {route.kind === "recipe-detail" ? <RecipeDetailPage recipeId={route.recipeId} /> : null}
    </>
  );
}
