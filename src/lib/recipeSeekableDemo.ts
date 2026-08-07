import type { PublicRecipeRecord, RecipeStep } from "./recipeCatalogTypes";

/**
 * A single hand-built record exercising the sectioned, seekable-video shape.
 *
 * The deployed API cannot produce this yet — production Flyway is at V32 and the
 * migration adding the section/timestamp columns is not deployed. This exists so the
 * grouping and seek UI can be reviewed locally in mock mode; it is appended only when
 * `VITE_MOCK_MODE` is on and never reaches a server-backed build.
 */

function demoStep(
  stepNumber: number,
  section: string,
  way: string,
  startSeconds: number,
  endSeconds: number,
): RecipeStep {
  return {
    stepNumber,
    way,
    cookingTip: null,
    imageUrl: null,
    ingredientMasterIds: null,
    ingredientChips: [],
    section,
    startSeconds,
    endSeconds,
  };
}

export const seekableDemoRecipe: PublicRecipeRecord = {
  recipeId: "demo-seekable-timeline",
  title: "[데모] 섹션 + 타임스탬프 레시피",
  titleImageUrl: null,
  description:
    "섹션 그룹핑과 영상 구간 이동을 확인하기 위한 로컬 전용 데모입니다. 서버 데이터가 아닙니다.",
  cookingTip: "각 단계의 시간 버튼을 누르면 영상이 해당 지점부터 재생됩니다.",
  writtenLang: "ko",
  requestedDisplayLang: "ko-KR",
  displayLang: "ko-KR",
  availableLangs: ["ko-KR"],
  isOriginal: true,
  isTranslated: false,
  translationStatus: "original",
  source: "user",
  creatorSource: {
    sourceType: "youtube",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sourceAccount: "keepcook",
    creatorName: "Keep Cook Demo",
    sourceId: "dQw4w9WgXcQ",
  },
  visibility: "public",
  isUseLocalData: true,
  likeCount: 0,
  viewCount: 0,
  createdAt: "2026-08-07",
  countryCode: "KR",
  country: "Korea",
  city: null,
  district: null,
  canonicalCountry: null,
  canonicalCity: null,
  canonicalDistrict: null,
  cityKey: null,
  districtKey: null,
  recipeType: "everyday",
  cookingMethod: "boil",
  technique: "one-pan",
  dietaryGoal: "standard",
  dietaryRestriction: "none",
  primaryIngredient: "vegetable",
  category: "soup",
  occasion: "everyday",
  difficulty: "easy",
  cookingTime: "20min",
  cuisineRegion: "korean",
  servings: "3-4",
  requiredTool: "pan",
  ingredients: [
    { masterId: null, name: "무", quantity: 300, unit: "g", description: "나박 썰기" },
    { masterId: null, name: "대파", quantity: 1, unit: "대", description: "어슷 썰기" },
  ],
  steps: [
    demoStep(1, "PREP", "무를 나박하게 썹니다.", 12, 38),
    demoStep(2, "PREP", "대파를 어슷하게 썰어 둡니다.", 38, 61),
    demoStep(3, "MAIN", "냄비에 물을 붓고 무를 넣어 끓입니다.", 61, 145),
    demoStep(4, "MAIN", "국간장과 소금으로 간을 맞춥니다.", 145, 190),
    demoStep(5, "FINISH", "대파를 넣고 한소끔 더 끓인 뒤 그릇에 담습니다.", 190, 228),
  ],
  sections: [
    { section: "PREP", title: null, startSeconds: 12, endSeconds: 61 },
    { section: "MAIN", title: "끓이기", startSeconds: 61, endSeconds: 190 },
    { section: "FINISH", title: null, startSeconds: 190, endSeconds: 228 },
  ],
  sourcePlatform: "YOUTUBE",
  sourceMediaType: "VIDEO",
  timelineCapability: "SEEKABLE",
};
