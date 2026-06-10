import type {
  RecipeCreatorSource,
  RecipeCreatorSourceType,
} from "./recipeCatalogTypes";

export type RawRecipeCreatorSource = {
  readonly sourceType?: string | null | undefined;
  readonly externalSourceType?: string | null | undefined;
  readonly sourceUrl?: string | null | undefined;
  readonly sourceAccount?: string | null | undefined;
  readonly creatorName?: string | null | undefined;
  readonly sourceId?: string | null | undefined;
};

export type CreatorPlatform = "youtube" | "tiktok";

export type CreatorSourceSummary = {
  readonly platform: CreatorPlatform;
  readonly label: string;
  readonly eyebrow: string;
  readonly name: string;
  readonly creatorName: string | null;
  readonly url: string | null;
  readonly sourceId: string | null;
  readonly previewImageUrl: string | null;
};

export function toRecipeCreatorSource(
  rawSource: RawRecipeCreatorSource | null | undefined,
): RecipeCreatorSource | undefined {
  if (rawSource === null || rawSource === undefined) {
    return undefined;
  }

  const sourceType = parseRecipeCreatorSourceType(
    rawSource.sourceType ?? rawSource.externalSourceType,
    rawSource.sourceUrl,
  );
  const sourceUrl = nonEmptyString(rawSource.sourceUrl);
  const sourceAccount = nonEmptyString(rawSource.sourceAccount);
  const creatorName = nonEmptyString(rawSource.creatorName);
  const sourceId = nonEmptyString(rawSource.sourceId);

  if (
    sourceType === "manual" &&
    sourceUrl === null &&
    sourceAccount === null &&
    creatorName === null &&
    sourceId === null
  ) {
    return undefined;
  }

  return {
    sourceType,
    sourceUrl,
    sourceAccount,
    creatorName,
    sourceId,
  };
}

export function videoCreatorSummary(
  creatorSource: RecipeCreatorSource | undefined,
): CreatorSourceSummary | null {
  if (creatorSource === undefined) {
    return null;
  }

  const platform = videoPlatform(creatorSource);
  if (platform === null) {
    return null;
  }

  return {
    platform,
    label: platform === "youtube" ? "YouTube" : "TikTok",
    eyebrow: platform === "youtube" ? "유튜브 레시피" : "틱톡 레시피",
    name: creatorName(creatorSource, platform),
    creatorName: creatorSource.creatorName,
    url: creatorSource.sourceUrl,
    sourceId: creatorSource.sourceId,
    previewImageUrl: videoPreviewImageUrl(creatorSource, platform),
  };
}

function parseRecipeCreatorSourceType(
  value: string | null | undefined,
  sourceUrl: string | null | undefined,
): RecipeCreatorSourceType {
  const normalized = nonEmptyString(value)?.toLocaleLowerCase("en-US");
  if (normalized === "youtube" || urlIncludes(sourceUrl, "youtube.com", "youtu.be")) {
    return "youtube";
  }
  if (normalized === "tiktok" || urlIncludes(sourceUrl, "tiktok.com")) {
    return "tiktok";
  }
  if (normalized === "blog") {
    return "blog";
  }
  if (normalized === "web" || normalized === "website") {
    return "website";
  }
  if (normalized === "url") {
    return "url";
  }
  return "manual";
}

function videoPlatform(source: RecipeCreatorSource): CreatorPlatform | null {
  if (source.sourceType === "youtube") {
    return "youtube";
  }
  if (source.sourceType === "tiktok") {
    return "tiktok";
  }
  return null;
}

function creatorName(source: RecipeCreatorSource, platform: CreatorPlatform): string {
  if (platform === "youtube") {
    return (
      source.sourceAccount ??
      source.creatorName ??
      "YouTube channel"
    );
  }

  return (
    source.creatorName ??
    source.sourceAccount ??
    "TikTok creator"
  );
}

function videoPreviewImageUrl(
  source: RecipeCreatorSource,
  platform: CreatorPlatform,
): string | null {
  if (platform !== "youtube") {
    return null;
  }

  const videoId = youtubeVideoId(source.sourceId, source.sourceUrl);
  return videoId === null ? null : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function youtubeVideoId(sourceId: string | null, sourceUrl: string | null): string | null {
  if (sourceId !== null) {
    return sourceId;
  }

  if (sourceUrl === null) {
    return null;
  }

  const match = /(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/iu.exec(sourceUrl);
  return match?.[1] ?? null;
}

function urlIncludes(
  value: string | null | undefined,
  ...needles: readonly string[]
): boolean {
  const normalized = nonEmptyString(value)?.toLocaleLowerCase("en-US");
  return normalized === undefined
    ? false
    : needles.some((needle) => normalized.includes(needle));
}

function nonEmptyString(value: string | null | undefined): string | null {
  return value === undefined || value === null || value.trim().length === 0
    ? null
    : value.trim();
}
