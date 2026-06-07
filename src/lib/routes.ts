export type AppRoute =
  | { readonly kind: "catalog" }
  | { readonly kind: "install" }
  | { readonly kind: "recipe-detail"; readonly recipeId: string };

const catalogPrefix = "/recipe-catalog/";

export function appRouteForPath(pathname: string): AppRoute {
  if (pathname === "/install" || pathname === "/app-download") {
    return { kind: "install" };
  }

  if (pathname.startsWith(catalogPrefix)) {
    return {
      kind: "recipe-detail",
      recipeId: decodeURIComponent(pathname.slice(catalogPrefix.length)),
    };
  }

  return { kind: "catalog" };
}

export function detailPathForRecipe(recipeId: string): string {
  return `/recipe-catalog/${encodeURIComponent(recipeId)}`;
}
