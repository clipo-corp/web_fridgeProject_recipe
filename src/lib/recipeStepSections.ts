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
  /**
   * Number shown beside each step, parallel to `steps`. Numbered stages restart at 1
   * per stage (`sectionStepNumber`); the legacy string grouping keeps `stepNumber`.
   */
  readonly displayNumbers: readonly number[];
};

type SectionLabels = { readonly ko: string; readonly en: string };

/** Canonical section keys that have a built-in localized label. */
const defaultSectionLabels = new Map<string, SectionLabels>([
  ["PREP", { ko: "재료 준비", en: "Preparation" }],
  ["MAIN", { ko: "조리", en: "Main" }],
  ["FINISH", { ko: "마무리", en: "Finish" }],
]);

/**
 * Titles that restate a default label, per key. Includes the native client's
 * labels ("준비", "본 조리") so a title written for the app is treated the same way.
 */
const defaultTitleAliases = new Map<string, readonly string[]>([
  ["PREP", ["재료 준비", "준비", "preparation", "prep"]],
  ["MAIN", ["조리", "본 조리", "main"]],
  ["FINISH", ["마무리", "finish"]],
]);

/**
 * Numeric stages: the pipeline writes stage 1 as ingredient prep and every later
 * stage as cooking, so an untitled stage borrows the PREP or MAIN label.
 */
function isNumericStage(section: string): boolean {
  return /^[1-9]\d*$/.test(section);
}

function defaultKeyFor(section: string): string {
  if (!isNumericStage(section)) return section;
  return section === "1" ? "PREP" : "MAIN";
}

function normalizeSection(value: string | null | undefined): string {
  const trimmed = typeof value === "string" ? value.trim().toUpperCase() : "";
  return trimmed.length > 0 ? trimmed : "MAIN";
}

/** "1단계 재료 손질" → "재료 손질"; a bare "1단계" is not a title at all. */
function stripStagePrefix(title: string): string {
  return title.replace(/^\d+\s*단계\s*[:.·-]?\s*/u, "").replace(/^(stage|part|step)\s*\d+\s*[:.·-]?\s*/iu, "").trim();
}

/**
 * A section title is only worth showing if it says something the default label
 * does not. The seed pipeline fills `title` with the default label itself, so
 * comparing against the built-ins keeps those from becoming noise.
 */
function meaningfulTitle(title: string | null, section: string): string | null {
  const trimmed = stripStagePrefix(title?.trim() ?? "");
  if (trimmed.length === 0) return null;

  const aliases = defaultTitleAliases.get(defaultKeyFor(section));
  if (aliases === undefined) return trimmed;

  const lowered = trimmed.toLocaleLowerCase();
  return aliases.some((label) => label.toLocaleLowerCase() === lowered) ? null : trimmed;
}

/**
 * `recipe_step.section` is free text on the server, so a key outside the canonical
 * three is expected rather than exceptional. Falling back to the key itself keeps an
 * unknown section visible: returning null would split the steps into blocks with no
 * heading, which reads as a layout glitch rather than a section boundary.
 */
export function sectionLabel(
  section: string,
  title: string | null,
  lang: string,
): string | null {
  if (title !== null) return title;

  const defaults = defaultSectionLabels.get(defaultKeyFor(section));
  if (defaults !== undefined) {
    return lang.startsWith("ko") ? defaults.ko : defaults.en;
  }

  const trimmed = section.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Kicker shown above each group title, numbered by position like the native
 * client's `recipeDetailPhaseHeading` ("1단계", "Part 1"). Position rather than the
 * section key, so PREP/MAIN/FINISH recipes and numeric-stage recipes read the same.
 */
export function stageKicker(index: number, lang: string): string {
  return lang.startsWith("ko") ? `${index + 1}단계` : `Part ${index + 1}`;
}

/** Positive stage number from a numeric key (`"2"`), else null. */
function stageNumberOf(key: string): number | null {
  return isNumericStage(key) ? Number(key) : null;
}

/**
 * Groups steps for display.
 *
 * When `sections[]` carries numbered stages (server contract V40: `[{ section: 1, title }]`
 * plus `steps[].sectionNumber`), steps are grouped by stage number and ordered by it,
 * and each stage is ordered internally by `sectionStepNumber` (then `stepNumber`).
 * Otherwise this falls back to the legacy `steps[].section` string runs.
 */
export function groupRecipeSteps(
  steps: readonly RecipeStep[],
  sections: readonly RecipeSection[] = [],
): readonly RecipeStepGroup[] {
  const numbered = sections.some((entry) => stageNumberOf(normalizeSection(entry.section)) !== null);
  return numbered ? groupByStageNumber(steps, sections) : groupBySectionRuns(steps, sections);
}

/**
 * Numbered stages. A step's stage is `sectionNumber`, or its legacy `section` when that
 * is itself a stage number. A number missing from `sections[]` still gets its own
 * untitled group in numeric order (the server lists every used number, so this is a
 * defensive path). A step with no stage at all goes to one untitled trailing group
 * rather than being folded into a titled stage it may not belong to.
 */
function groupByStageNumber(
  steps: readonly RecipeStep[],
  sections: readonly RecipeSection[],
): readonly RecipeStepGroup[] {
  // First title per number wins, matching the server's RecipeSections.titles().
  const titles = new Map<number, string | null>();
  sections.forEach((entry) => {
    const key = normalizeSection(entry.section);
    const number = stageNumberOf(key);
    if (number === null) return;
    const title = meaningfulTitle(entry.title, key);
    if (!titles.has(number) || (titles.get(number) === null && title !== null)) {
      titles.set(number, title);
    }
  });

  const byStage = new Map<number, RecipeStep[]>();
  const unstaged: RecipeStep[] = [];
  steps.forEach((step) => {
    const number = step.sectionNumber ?? stageNumberOf(normalizeSection(step.section));
    if (number === null || number === undefined) {
      unstaged.push(step);
      return;
    }
    const bucket = byStage.get(number);
    if (bucket === undefined) byStage.set(number, [step]);
    else bucket.push(step);
  });

  const inStageOrder = (a: RecipeStep, b: RecipeStep): number =>
    (a.sectionStepNumber ?? Number.MAX_SAFE_INTEGER) - (b.sectionStepNumber ?? Number.MAX_SAFE_INTEGER) ||
    a.stepNumber - b.stepNumber;

  const groups: RecipeStepGroup[] = [...byStage.keys()]
    .sort((a, b) => a - b)
    .map((number) => {
      const stageSteps = [...(byStage.get(number) ?? [])].sort(inStageOrder);
      return {
        section: String(number),
        title: titles.get(number) ?? null,
        steps: stageSteps,
        displayNumbers: stageSteps.map((step, index) => step.sectionStepNumber ?? index + 1),
      };
    });

  if (unstaged.length > 0) {
    const ordered = [...unstaged].sort((a, b) => a.stepNumber - b.stepNumber);
    groups.push({
      section: "MAIN",
      title: null,
      steps: ordered,
      displayNumbers: ordered.map((_, index) => index + 1),
    });
  }
  return groups;
}

/**
 * Legacy path: contiguous runs of the same `steps[].section` string, mirroring the
 * native client. Runs are used rather than unique keys because a recipe can
 * legitimately return to an earlier section (PREP -> MAIN -> PREP -> FINISH), and
 * collapsing those would reorder the steps.
 *
 * Recipe-level `sections[]` only contributes display titles; step order always wins.
 */
function groupBySectionRuns(
  steps: readonly RecipeStep[],
  sections: readonly RecipeSection[],
): readonly RecipeStepGroup[] {
  const runs: { section: string; steps: RecipeStep[] }[] = [];
  steps.forEach((step) => {
    const section = normalizeSection(step.section);
    const previous = runs[runs.length - 1];
    if (previous !== undefined && previous.section === section) {
      previous.steps.push(step);
      return;
    }
    runs.push({ section, steps: [step] });
  });

  // `sections[]` describes runs, not unique keys — each entry carries its own
  // start/end seconds, so a recipe that returns to PREP sends two PREP entries with
  // different titles. Consume them in order, matching each run to the next unused
  // entry with the same key, so a repeated run keeps its own title instead of
  // inheriting the first one's.
  const consumed = new Array<boolean>(sections.length).fill(false);
  const titleForRun = (section: string): string | null => {
    const index = sections.findIndex(
      (entry, i) => !consumed[i] && normalizeSection(entry.section) === section,
    );
    if (index === -1) return null;
    consumed[index] = true;
    return meaningfulTitle(sections[index]?.title ?? null, section);
  };

  return runs.map((run) => ({
    section: run.section,
    title: titleForRun(run.section),
    steps: run.steps,
    displayNumbers: run.steps.map((step) => step.stepNumber),
  }));
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

/**
 * `recipe.source_id` is free-text server data, and `youtubeVideoId` hands it back
 * verbatim when present. Anything that is not a real video id would otherwise be
 * interpolated straight into the embed path and produce a silently broken player, so
 * validate the shape and let the caller fall back to no video instead.
 */
export function isValidYoutubeVideoId(value: string | null): value is string {
  return value !== null && /^[A-Za-z0-9_-]{6,20}$/.test(value);
}

export function youtubeEmbedUrl(videoId: string, startSeconds: number | null): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (startSeconds !== null) {
    params.set("start", String(Math.max(0, Math.floor(startSeconds))));
    params.set("autoplay", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}
