import {
  LEGAL_PAGES_PUBLIC,
  LEGAL_PRIVACY_PUBLIC,
  LEGAL_TERMS_PUBLIC,
} from "../lib/legalPublication";
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
  // 스위치는 빌드 때 상수로 접힌다. 꺼진 쪽의 페이지는 통째로 빠져 그 문구가 번들에 남지 않는다.
  if (!LEGAL_PAGES_PUBLIC) {
    return <PrelaunchPage />;
  }

  const route = appRouteForPath(window.location.pathname);
  switch (route.kind) {
    case "privacy":
      return LEGAL_PRIVACY_PUBLIC ? <PrivacyPolicyPage /> : <PrelaunchPage />;
    case "terms":
      return LEGAL_TERMS_PUBLIC ? <TermsPage /> : <PrelaunchPage />;
    case "prelaunch":
      return <PrelaunchPage />;
  }
}
