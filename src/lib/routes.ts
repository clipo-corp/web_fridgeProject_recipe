import { LEGAL_PRIVACY_PUBLIC, LEGAL_TERMS_PUBLIC } from "./legalPublication";

export type AppRoute =
  | { readonly kind: "prelaunch" }
  | { readonly kind: "privacy" }
  | { readonly kind: "terms" };

type LegalPublication = { readonly privacy: boolean; readonly terms: boolean };

/**
 * 웹은 아직 공개 전이라 모든 경로가 '준비 중'이다. 처리방침·이용약관만 각자의 공개 스위치가
 * 켜졌을 때 열린다.
 */
export function appRouteForPath(
  pathname: string,
  publication: LegalPublication = { privacy: LEGAL_PRIVACY_PUBLIC, terms: LEGAL_TERMS_PUBLIC },
): AppRoute {
  const path = pathname.replace(/\/+$/, "");
  if (publication.privacy && (path === "/privacy" || path === "/privacy-policy")) {
    return { kind: "privacy" };
  }
  if (publication.terms && path === "/terms") {
    return { kind: "terms" };
  }
  return { kind: "prelaunch" };
}

export function detailPathForRecipe(recipeId: string): string {
  if (recipeId.trim().length === 0) {
    return "/recipe-catalog";
  }

  return `/recipe-catalog/${encodeURIComponent(recipeId)}`;
}
