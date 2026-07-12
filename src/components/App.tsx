import { ThemeProvider } from "../lib/theme";
import { PrelaunchPage } from "./PrelaunchPage";

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      <PrelaunchPage />
    </ThemeProvider>
  );
}
