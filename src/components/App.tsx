import { LEGAL_PAGES_PUBLIC } from "../lib/legalPublication";
import { appRouteForPath } from "../lib/routes";
import { ThemeProvider } from "../lib/theme";
import { PrelaunchPage } from "./PrelaunchPage";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage";
import { TermsPage } from "./TermsPage";

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      <CurrentPage />
    </ThemeProvider>
  );
}

function CurrentPage(): JSX.Element {
  // 스위치가 꺼져 있으면 빌드 때 이 분기가 통째로 빠져 처리방침·약관 문구가 번들에 남지 않는다.
  if (!LEGAL_PAGES_PUBLIC) {
    return <PrelaunchPage />;
  }

  const route = appRouteForPath(window.location.pathname);
  switch (route.kind) {
    case "privacy":
      return <PrivacyPolicyPage />;
    case "terms":
      return <TermsPage />;
    case "prelaunch":
      return <PrelaunchPage />;
  }
}
