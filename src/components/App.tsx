import { I18nProvider } from "../lib/i18n";
import { appRouteForPath } from "../lib/routes";
import { ThemeProvider } from "../lib/theme";
import { InstallPage } from "./InstallPage";
import { RecipeCatalogPage } from "./RecipeCatalogPage";
import { RecipeDetailPage } from "./RecipeDetailPage";
import { SiteHeader } from "./SiteHeader";

export function App(): JSX.Element {
  const route = appRouteForPath(window.location.pathname);

  return (
    <ThemeProvider>
      <I18nProvider>
        <SiteHeader />
        {route.kind === "install" ? <InstallPage /> : null}
        {route.kind === "catalog" ? <RecipeCatalogPage /> : null}
        {route.kind === "recipe-detail" ? <RecipeDetailPage recipeId={route.recipeId} /> : null}
      </I18nProvider>
    </ThemeProvider>
  );
}
