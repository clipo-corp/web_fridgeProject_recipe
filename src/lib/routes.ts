import { LEGAL_PAGES_PUBLIC } from "./legalPublication";

export type AppRoute =
  | { readonly kind: "prelaunch" }
  | { readonly kind: "privacy" }
  | { readonly kind: "terms" };

/**
 * 웹은 아직 공개 전이라 모든 경로가 '준비 중'이다. 처리방침·이용약관만 공개 스위치
 * (`LEGAL_PAGES_PUBLIC`)가 켜졌을 때 열린다.
 */
export function appRouteForPath(pathname: string, legalPagesPublic = LEGAL_PAGES_PUBLIC): AppRoute {
  if (!legalPagesPublic) {
    return { kind: "prelaunch" };
  }

  const path = pathname.replace(/\/+$/, "");
  if (path === "/privacy" || path === "/privacy-policy") {
    return { kind: "privacy" };
  }
  if (path === "/terms") {
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
