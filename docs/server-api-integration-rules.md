# Server API Integration Rules for `/recipe-catalog`

이 문서는 서버 작업자가 FreshKeeper 웹 레시피 카탈로그 API를 연결할 때
지켜야 하는 프론트 계약과 작업 규칙입니다. 프론트 구현 상세를 몰라도 이
문서와 타입 파일만 보면 연결 범위를 판단할 수 있게 작성했습니다.

## Goal

`/recipe-catalog`는 공개 읽기 전용 레시피 탐색 페이지입니다.

서버 연결의 목표는 현재 mock seed 기반 동작을 public API 기반 동작으로
교체하되, 화면 구조와 사용자 흐름은 유지하는 것입니다.

- 공개 검색
- 공개 지역/필터 옵션 조회
- 공개 레시피 상세 조회
- 앱 설치 유도 CTA 유지

## Non-Goals

이 웹 페이지에는 아래 기능을 넣지 않습니다.

- 로그인
- 회원가입
- 인증 모달
- 게스트 모드
- 냉장고 재료 저장/수정
- 레시피 저장/좋아요 mutation
- 유저 맞춤 추천 API
- 쿠키/세션 기반 API 호출

앱 설치 이후의 개인화 기능은 native 앱에서 처리합니다.

## Public API Requirements

웹에서 호출하는 레시피 API는 반드시 unauthenticated public read-only API여야
합니다.

- `Authorization` 헤더 없이 성공해야 합니다.
- 쿠키 없이 성공해야 합니다.
- `credentials: "omit"`으로 호출해도 성공해야 합니다.
- public catalog 호출은 `401` 또는 로그인 redirect를 반환하면 안 됩니다.
- CORS는 로컬 개발 origin과 배포 origin을 허용해야 합니다.
- mutation endpoint는 이 웹 프로젝트에서 호출하지 않습니다.

서버가 아직 public API를 열지 못한 상태라면 mock 모드를 유지하고, 릴리즈
acceptance는 public API가 열린 뒤 다시 검증합니다.

## Current Frontend Entry Points

중요 파일:

- `src/components/RecipeCatalogPage.tsx`
- `src/components/RecipeDetailPage.tsx`
- `src/components/FilterBar.tsx`
- `src/components/RecipeCard.tsx`
- `src/lib/recipeCatalogTypes.ts`
- `src/lib/recipeCatalogRequest.ts`
- `src/lib/recipeCatalogMock.ts`
- `src/lib/recipeCatalogMock.test.ts`
- `src/lib/routes.ts`

현재 mock loader:

- `loadPublicMockRecipes()`
- `filterPublicRecipes()`
- `collectCatalogOptions()`
- `toPublicRecipeSearchRequest()`

서버 연결 시 권장 방식:

1. API client/adapter를 `src/lib` 아래에 새로 만든다.
2. 컴포넌트가 서버 response shape를 직접 알지 않게 한다.
3. 서버 response는 adapter에서 `PublicRecipeRecord`로 정규화한다.
4. mock mode를 남겨 로컬 QA가 서버 없이도 가능하게 한다.

## Routes

프론트 route는 유지합니다.

| Route | Meaning |
| --- | --- |
| `/recipe-catalog` | 공개 검색/탐색 페이지 |
| `/recipe-catalog/:recipeId` | 공개 레시피 상세 페이지 |
| `/install` | 앱 설치 유도 페이지 |

API 연결 때문에 route를 바꾸지 않습니다.

## Request Contract

검색 request는 `src/lib/recipeCatalogRequest.ts`의
`toPublicRecipeSearchRequest()` 결과를 기준으로 합니다.

```ts
type PublicRecipeSearchRequest = {
  readonly ingredients: readonly RecipeIngredient[];
  readonly searchValue: string | null;
  readonly pageNumber: number;
  readonly displayLang: string;
  readonly writtenLang: string | null;
  readonly sort: "latest" | "popular" | "hot_month";
  readonly regionScope: "country" | "city" | "district" | null;
  readonly countryCode: string | null;
  readonly country: string | null;
  readonly city: string | null;
  readonly district: string | null;
  readonly cityKey: string | null;
  readonly districtKey: string | null;
  readonly recipeVisibility: "public";
  readonly isUseLocalData: boolean | null;
  readonly recipeType: string | null;
  readonly cookingMethod: string | null;
  readonly technique: string | null;
  readonly dietaryGoal: string | null;
  readonly dietaryRestriction: string | null;
  readonly primaryIngredient: string | null;
  readonly category: string | null;
  readonly occasion: string | null;
  readonly difficulty: string | null;
  readonly cookingTime: string | null;
  readonly cuisineRegion: string | null;
  readonly servings: string | null;
  readonly requiredTool: string | null;
};
```

Mapping rules:

- Empty search text maps to `searchValue: null`.
- UI `"all"` filters map to `null`.
- `recipeVisibility` is always `"public"`.
- `isUseLocalData` maps as:
  - `"all"` -> `null`
  - `"local"` -> `true`
  - `"original"` -> `false`
- Sort values are native-compatible only:
  - `latest`
  - `popular`
  - `hot_month`
- Do not introduce web-only `recommended` sort.

## Response Contract

The UI consumes normalized `PublicRecipeRecord`.

Server response may use a different field shape internally, but the frontend
adapter must normalize it to this type before rendering:

```ts
type PublicRecipeRecord = {
  readonly recipeId: string;
  readonly title: string;
  readonly titleImageUrl: string | null;
  readonly description: string;
  readonly cookingTip: string;
  readonly writtenLang: "ko" | "en";
  readonly requestedDisplayLang: string;
  readonly displayLang: string;
  readonly availableLangs: readonly string[];
  readonly isOriginal: boolean;
  readonly isTranslated: boolean;
  readonly translationStatus: "original" | "translated" | "unavailable";
  readonly source: "ai" | "user";
  readonly visibility: "private" | "shared" | "public";
  readonly isUseLocalData: boolean;
  readonly likeCount: number;
  readonly viewCount: number;
  readonly createdAt: string;
  readonly countryCode: string;
  readonly country: string;
  readonly city: string | null;
  readonly district: string | null;
  readonly cityKey: string | null;
  readonly districtKey: string | null;
  readonly recipeType: string;
  readonly cookingMethod: string;
  readonly technique: string;
  readonly dietaryGoal: string;
  readonly dietaryRestriction: string;
  readonly primaryIngredient: string;
  readonly category: string;
  readonly occasion: string;
  readonly difficulty: string;
  readonly cookingTime: string;
  readonly cuisineRegion: string;
  readonly servings: string;
  readonly requiredTool: string;
  readonly ingredients: readonly RecipeIngredient[];
  readonly steps: readonly RecipeStep[];
};
```

Required detail fields:

- `ingredients[]`
- `steps[]`
- `title`
- `description`
- region fields
- filter metadata fields

If a field is unavailable, return `null` only where the type allows it. For
string filter fields, return stable fallback values rather than missing keys.

## Region and Filter Options

The filter UI needs available options for:

- countries
- cities
- districts
- all 13 native filter keys
- original language

Server may provide a separate public options endpoint, or the frontend may derive
options from the current search result. Prefer a separate endpoint if the result
set is paginated.

If using a separate endpoint, it must be public and read-only.

## Pagination Rules

Current UI does not implement infinite scroll yet, but the request already
contains `pageNumber`.

When server pagination is connected:

- Keep page size server-defined or adapter-defined.
- Page 1 must be enough to render initial results.
- Do not break the current empty state.
- Do not hide filters during pagination.

## UI Rules Server Work Must Not Break

Do not change these without a frontend design pass:

- `/recipe-catalog` first screen remains the search hero plus trending recipes.
- Search results use compact Google-like header search.
- Result filters are visible by default as one horizontal row.
- `상세 조건 더보기` expands all detailed filters.
- Filter controls are chips, not select dropdowns.
- Active query/filter chips remain removable one by one.
- Detail page is a real route, not a side modal.
- App install CTA remains in header/detail/inline/mobile surfaces.

## Error Handling Expectations

Frontend should distinguish these cases:

- `200` with empty results: show the existing empty state.
- Network error: show retry-friendly public catalog error state.
- `401` from public search/detail/options: treat as server configuration blocker.
- `404` for detail: show recipe not found.

Do not redirect to login for any `/recipe-catalog` API error.

## Local Development Rules

Recommended mode split:

- mock mode: current bundled `recipe_seed_mock_100.json`
- API mode: public server endpoints

Mock mode must stay usable for UI QA.

Do not commit local secrets:

- `.env`
- API keys
- private server URLs
- credentials

## Acceptance Checklist

Before saying the server integration is complete:

- `/recipe-catalog` loads without login.
- Search request succeeds with no cookies and no auth header.
- Region/options request succeeds with no cookies and no auth header.
- Detail request succeeds with no cookies and no auth header.
- `sort` supports `latest`, `popular`, and `hot_month`.
- `writtenLang`, `isUseLocalData`, country/city/district, and all 13 filter keys
  work.
- Empty results render the current empty state.
- Detail route shows ingredients and steps.
- `npm test` passes.
- `npm run build` passes.
- `npm audit --audit-level=moderate` passes.

## Related Docs

- `docs/recipe-catalog-search-spec.md`
- `docs/recipe-catalog-native-parity-audit.md`
- `docs/recipe-catalog-native-parity-mock-scaffold.md`
