export type AppRoute =
  | { readonly kind: "catalog" }
  | { readonly kind: "install" }
  | { readonly kind: "privacy" }
  | { readonly kind: "recipe-detail"; readonly recipeId: string };

const catalogPrefix = "/recipe-catalog/";

export function appRouteForPath(pathname: string): AppRoute {
  if (pathname === "/privacy" || pathname === "/privacy-policy") {
    return { kind: "privacy" };
  }

  if (pathname === "/install" || pathname === "/app-download") {
    return { kind: "install" };
  }

  if (pathname.startsWith(catalogPrefix)) {
    const recipeId = pathname.slice(catalogPrefix.length);
    if (recipeId.length === 0) {
      return { kind: "catalog" };
    }

    return {
      kind: "recipe-detail",
      recipeId: decodeURIComponent(recipeId),
    };
  }

  return { kind: "catalog" };
}

export function detailPathForRecipe(recipeId: string): string {
  if (recipeId.trim().length === 0) {
    return "/recipe-catalog";
  }

  return `/recipe-catalog/${encodeURIComponent(recipeId)}`;
}
