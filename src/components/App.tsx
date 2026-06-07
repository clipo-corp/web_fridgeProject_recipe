import { I18nProvider } from "../lib/i18n";
import { ThemeProvider } from "../lib/theme";
import { RecipeCatalogPage } from "./RecipeCatalogPage";
import { SiteHeader } from "./SiteHeader";

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SiteHeader />
        <RecipeCatalogPage />
      </I18nProvider>
    </ThemeProvider>
  );
}
