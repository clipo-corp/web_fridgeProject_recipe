import { describe, expect, it } from "vitest";
import {
  toRecipeCreatorSource,
  videoCreatorSummary,
} from "./recipeCreatorSource";

describe("videoCreatorSummary", () => {
  it("builds a YouTube creator profile summary from import metadata", () => {
    const source = toRecipeCreatorSource({
      sourceType: "YOUTUBE",
      sourceUrl: "https://www.youtube.com/watch?v=bYH5SAKEnFI",
      sourceAccount: "김진순 접시시간",
      creatorName: "김진순",
      sourceId: "bYH5SAKEnFI",
    });

    expect(videoCreatorSummary(source)).toEqual({
      platform: "youtube",
      label: "YouTube",
      eyebrow: "유튜브 레시피",
      name: "김진순 접시시간",
      creatorName: "김진순",
      url: "https://www.youtube.com/watch?v=bYH5SAKEnFI",
      sourceId: "bYH5SAKEnFI",
      previewImageUrl: "https://i.ytimg.com/vi/bYH5SAKEnFI/hqdefault.jpg",
    });
  });

  it("builds a YouTube preview image from a youtu.be URL when sourceId is missing", () => {
    const source = toRecipeCreatorSource({
      sourceType: "URL",
      sourceUrl: "https://youtu.be/wILIP0qob3c",
      sourceAccount: "FreshKeeper kitchen",
      creatorName: null,
      sourceId: null,
    });

    expect(videoCreatorSummary(source)).toMatchObject({
      platform: "youtube",
      name: "FreshKeeper kitchen",
      previewImageUrl: "https://i.ytimg.com/vi/wILIP0qob3c/hqdefault.jpg",
    });
  });

  it("uses external source type when source type is not present", () => {
    const source = toRecipeCreatorSource({
      externalSourceType: "youtube",
      sourceUrl: "https://example.com/watch",
      sourceAccount: "FreshKeeper kitchen",
      creatorName: null,
      sourceId: "external-video-id",
    });

    expect(videoCreatorSummary(source)).toMatchObject({
      platform: "youtube",
      name: "FreshKeeper kitchen",
      previewImageUrl: "https://i.ytimg.com/vi/external-video-id/hqdefault.jpg",
    });
  });

  it("detects TikTok from the source URL when sourceType is generic", () => {
    const source = toRecipeCreatorSource({
      sourceType: "URL",
      sourceUrl: "https://www.tiktok.com/@freshkeeper/video/123",
      sourceAccount: "@freshkeeper",
      creatorName: null,
      sourceId: "123",
    });

    expect(videoCreatorSummary(source)).toMatchObject({
      platform: "tiktok",
      label: "TikTok",
      name: "@freshkeeper",
      previewImageUrl: null,
    });
  });

  it("ignores ordinary web sources", () => {
    const source = toRecipeCreatorSource({
      sourceType: "WEB",
      sourceUrl: "https://example.com/recipe",
      sourceAccount: "Example",
      creatorName: "Example",
      sourceId: "example",
    });

    expect(videoCreatorSummary(source)).toBeNull();
  });
});
