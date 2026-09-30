import type { Lang } from "./translations";
import type { RecipeTool } from "./recipeCatalogTypes";

export type RecipeToolGroup = {
  /** Stable React key: the altGroup, or the tool code when it stands alone. */
  readonly key: string;
  /** Localized labels of the interchangeable tools, in server order. */
  readonly labels: readonly string[];
  /** True only when every tool in the group is optional. */
  readonly optional: boolean;
};

function toolLabel(tool: RecipeTool, lang: Lang, fallbackLabel: (code: string) => string): string {
  const preferred = lang === "ko" ? [tool.labelKo, tool.labelEn] : [tool.labelEn, tool.labelKo];
  return preferred.find((label): label is string => label !== null) ?? fallbackLabel(tool.code);
}

/**
 * Builds the "필요한 도구" line from `recipe.tools[]`.
 *
 * - Tools sharing an `altGroup` collapse into one entry ("오븐 또는 에어프라이어"),
 *   placed where the group's first tool appeared.
 * - Basic kitchen tools are hidden. A whole alt group is hidden when any member is
 *   basic: if a basic tool is an acceptable alternative, the reader already has
 *   what the step needs, and listing only the non-basic option would wrongly make
 *   it look required.
 * - Duplicate codes are listed once.
 */
export function groupRecipeTools(
  tools: readonly RecipeTool[] | undefined,
  lang: Lang,
  fallbackLabel: (code: string) => string = (code) => code,
): readonly RecipeToolGroup[] {
  if (tools === undefined || tools.length === 0) return [];

  const buckets = new Map<string, RecipeTool[]>();
  const seenCodes = new Set<string>();
  for (const tool of tools) {
    if (seenCodes.has(tool.code)) continue;
    seenCodes.add(tool.code);

    const key = tool.altGroup === null ? `tool:${tool.code}` : `alt:${tool.altGroup}`;
    const bucket = buckets.get(key);
    if (bucket === undefined) {
      buckets.set(key, [tool]);
    } else {
      bucket.push(tool);
    }
  }

  const groups: RecipeToolGroup[] = [];
  for (const [key, members] of buckets) {
    if (members.some((tool) => tool.basic)) continue;
    groups.push({
      key,
      labels: members.map((tool) => toolLabel(tool, lang, fallbackLabel)),
      optional: members.every((tool) => tool.optional),
    });
  }
  return groups;
}

const orSeparator: Record<Lang, string> = { ko: " 또는 ", en: " or " };

/** "오븐 또는 에어프라이어" / "Oven or Air fryer". */
export function formatToolGroupLabel(group: RecipeToolGroup, lang: Lang): string {
  return group.labels.join(orSeparator[lang]);
}
