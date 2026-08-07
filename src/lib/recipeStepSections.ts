import type {
  PublicRecipeRecord,
  RecipeSection,
  RecipeStep,
} from "./recipeCatalogTypes";

export type RecipeStepGroup = {
  readonly section: string;
  /** Null means "render no heading for this group". */
  readonly title: string | null;
  readonly steps: readonly RecipeStep[];
};

type SectionLabels = { readonly ko: string; readonly en: string };

/** Canonical section keys that have a built-in localized label. */
const defaultSectionLabels = new Map<string, SectionLabels>([
  ["PREP", { ko: "재료 준비", en: "Preparation" }],
  ["MAIN", { ko: "조리", en: "Main" }],
  ["FINISH", { ko: "마무리", en: "Finish" }],
]);

function normalizeSection(value: string | null | undefined): string {
  const trimmed = typeof value === "string" ? value.trim().toUpperCase() : "";
  return trimmed.length > 0 ? trimmed : "MAIN";
}

/**
 * A section title is only worth showing if it says something the default label
 * does not. The seed pipeline fills `title` with the default label itself, so
 * comparing against the built-ins keeps those from becoming noise.
 */
function meaningfulTitle(title: string | null, section: string): string | null {
  const trimmed = title?.trim() ?? "";
  if (trimmed.length === 0) return null;

  const defaults = defaultSectionLabels.get(section);
  if (defaults === undefined) return trimmed;

  const isDefaultLabel = [defaults.ko, defaults.en].some(
    (label) => label.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
  );
  return isDefaultLabel ? null : trimmed;
}

export function sectionLabel(
  section: string,
  title: string | null,
  lang: string,
): string | null {
  if (title !== null) return title;
  const defaults = defaultSectionLabels.get(section);
  if (defaults === undefined) return null;
  return lang.startsWith("ko") ? defaults.ko : defaults.en;
}

/**
 * Groups steps into contiguous runs of the same section, mirroring the native
 * client. Runs are used rather than unique keys because a recipe can legitimately
 * return to an earlier section (PREP -> MAIN -> PREP -> FINISH), and collapsing
 * those would reorder the steps.
 *
 * Recipe-level `sections[]` only contributes display titles; step order always wins.
 */
export function groupRecipeSteps(
  steps: readonly RecipeStep[],
  sections: readonly RecipeSection[] = [],
): readonly RecipeStepGroup[] {
  const titles = new Map<string, string | null>();
  sections.forEach((entry) => {
    const key = normalizeSection(entry.section);
    if (!titles.has(key)) titles.set(key, meaningfulTitle(entry.title, key));
  });

  const groups: { section: string; title: string | null; steps: RecipeStep[] }[] = [];
  steps.forEach((step) => {
    const section = normalizeSection(step.section);
    const previous = groups[groups.length - 1];
    if (previous !== undefined && previous.section === section) {
      previous.steps.push(step);
      return;
    }
    groups.push({ section, title: titles.get(section) ?? null, steps: [step] });
  });

  return groups;
}

/**
 * True when the grouping adds nothing for the reader — a single MAIN run with no
 * custom title is just the flat step list, so the heading would be noise.
 */
export function shouldRenderSectionHeadings(
  groups: readonly RecipeStepGroup[],
): boolean {
  if (groups.length > 1) return true;
  const only = groups[0];
  if (only === undefined) return false;
  return only.section !== "MAIN" || only.title !== null;
}

/** `93` -> `1:33`, `3723` -> `1:02:03`. */
export function formatTimestamp(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`;
}

/**
 * Per-step seeking is only offered when the server says the source is a seekable
 * video. Anything less and the timestamps are either absent or unverified.
 */
export function isSeekableVideoRecipe(recipe: PublicRecipeRecord): boolean {
  return (
    recipe.sourceMediaType === "VIDEO" &&
    recipe.timelineCapability === "SEEKABLE" &&
    recipe.sourcePlatform === "YOUTUBE"
  );
}

export function youtubeEmbedUrl(videoId: string, startSeconds: number | null): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (startSeconds !== null) {
    params.set("start", String(Math.max(0, Math.floor(startSeconds))));
    params.set("autoplay", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
