export type AppRoute = { readonly kind: "prelaunch" };

export function appRouteForPath(_pathname: string): AppRoute {
  return { kind: "prelaunch" };
}

export function detailPathForRecipe(recipeId: string): string {
  if (recipeId.trim().length === 0) {
    return "/recipe-catalog";
  }

  return `/recipe-catalog/${encodeURIComponent(recipeId)}`;
}
