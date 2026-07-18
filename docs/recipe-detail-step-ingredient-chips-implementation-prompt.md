# Codex 구현 프롬프트: 웹 레시피 상세 스텝별 재료 칩 렌더링

## 목표

`web_fridgeProject_recipe`의 공개 레시피 상세 화면에서도 네이티브 앱처럼 각 조리 스텝에 연결된 재료 칩을 렌더링한다.

중요한 기준:

- 웹에서 AI/자연어 추론을 새로 하지 않는다.
- 서버가 내려주는 `steps[].ingredientMasterIds`를 기준으로 렌더링한다.
- 칩 라벨/수량/단위는 같은 레시피의 `ingredients[]`와 `masterId`로 조인해서 만든다.
- 기존 레시피처럼 `ingredientMasterIds`가 없거나 `null`인 스텝은 지금 화면과 동일하게 칩 없이 렌더링한다.
- 전체 페이지 상세와 모달 상세 두 화면 모두 같은 결과가 나와야 한다.

## 작업 위치

```bash
cd /Users/hyunwu/Desktop/fridgeProject/web_fridgeProject_recipe
```

주요 파일:

- `src/lib/recipeCatalogTypes.ts`
- `src/lib/recipeServerTypes.ts`
- `src/lib/recipeServerAdapter.ts`
- `src/lib/recipeMockSchema.ts`
- `src/lib/recipeCatalogMock.ts`
- `src/components/RecipeDetailPage.tsx`
- `src/components/RecipeDetail.tsx`
- `src/styles/catalog.css`
- 필요 시 `src/lib/*.test.ts`

## 현재 상태

웹 상세 화면은 재료 섹션과 조리 단계 섹션을 분리해서 렌더링하고 있다.

- `RecipeDetailPage.tsx`: 라우트 상세 화면
- `RecipeDetail.tsx`: 모달/패널 상세 화면
- `RecipeStep` 타입은 현재 `stepNumber`, `way`, `cookingTip`, `imageUrl`만 가진다.
- `ServerRecipeStep`도 현재 `ingredientMasterIds`를 받지 않는다.
- `toPublicStep()`은 서버 step에서 본문/팁/이미지만 매핑한다.
- mock seed schema도 step의 `ingredientMasterIds`를 허용하지 않는다.

서버/네이티브 기준 계약:

- 서버 DTO: `fridgeServerMain/src/main/java/com/hong/smartref/data/dto/recipe/StepsDTO.java`
- 필드: `private List<Long> ingredientMasterIds;`
- 서버 조회 응답 생성부는 step별 링크가 있으면 `StepsDTO.ingredientMasterIds`를 채운다.
- 네이티브 타입도 `RecipeStep.ingredientMasterIds?: readonly number[] | null`을 사용한다.

## 구현 지시

### 1. 공개 레시피 타입 확장

`src/lib/recipeCatalogTypes.ts`의 `RecipeStep`에 스텝 재료 칩 배열을 추가한다.

권장 타입:

```ts
export type RecipeStepIngredientChip = {
  readonly masterId: number | null;
  readonly name: string;
  readonly quantity: number | null;
  readonly unit: string | null;
  readonly description: string;
};

export type RecipeStep = {
  readonly stepNumber: number;
  readonly way: string;
  readonly cookingTip: string | null;
  readonly imageUrl: string | null;
  readonly ingredientMasterIds: readonly number[] | null;
  readonly ingredientChips: readonly RecipeStepIngredientChip[];
};
```

기존 코드 호환을 위해 `ingredientMasterIds`는 `null` 허용, `ingredientChips`는 항상 배열로 둔다.

구형 `src/lib/recipeTypes.ts`도 아직 테스트/레거시 mock에서 쓰이고 있으므로 같은 shape가 필요한지 확인하고, 타입 에러가 생기면 동일하게 확장한다.

### 2. 서버 응답 타입 확장

`src/lib/recipeServerTypes.ts`의 `ServerRecipeStep`에 아래 필드를 추가한다.

```ts
readonly ingredientMasterIds?: readonly (number | string)[] | null;
```

서버의 실제 계약은 `ingredientMasterIds`다. 다른 필드명을 임의로 만들지 않는다.

### 3. 서버 어댑터에서 칩 생성

`src/lib/recipeServerAdapter.ts`에서 `toPublicRecipeRecord()`가 재료를 먼저 normalize한 뒤, 그 결과를 step mapping에 넘기도록 바꾼다.

권장 흐름:

```ts
const ingredients = (recipe.ingredients ?? []).map(toPublicIngredient);

return withCatalogDemoMedia({
  ...
  ingredients,
  steps: (recipe.steps ?? []).map((step, index) => toPublicStep(step, index, ingredients)),
});
```

`toPublicStep()`은 다음 규칙을 따른다.

- `step.ingredientMasterIds`가 배열이면 number로 정규화한다.
- 숫자로 파싱되지 않는 값은 버린다.
- 중복 masterId는 첫 등장만 유지한다.
- 각 masterId를 recipe-level `ingredients[]`에서 `ingredient.masterId`로 찾는다.
- 매칭되는 재료가 있으면 `ingredientChips`에 `name`, `quantity`, `unit`, `description`을 담는다.
- 매칭되지 않는 masterId는 렌더링하지 않는다. 이름 없는 칩을 만들지 않는다.
- `ingredientMasterIds`는 원본 의미 보존을 위해 정규화된 id 배열로 유지한다.
- id 배열이 비었거나 서버가 `null/undefined`를 내려주면 `ingredientMasterIds: null`, `ingredientChips: []`.

주의:

- 웹에서 step 문장 `way`를 파싱해서 자동 매칭하지 않는다.
- 웹에서 master DB/nickname DB를 번들하지 않는다.
- 서버나 API endpoint를 변경하지 않는다.

### 4. mock schema와 mock adapter 확장

mock 모드에서도 QA가 바로 볼 수 있어야 한다.

`src/lib/recipeMockSchema.ts`의 `stepSchema`에 추가:

```ts
ingredientMasterIds: z.array(z.number()).nullable().optional()
```

`src/lib/recipeCatalogMock.ts`에서도 서버 어댑터와 동일한 방식으로 `recipe.ingredients`를 먼저 public ingredients로 만든 뒤, `step.ingredientMasterIds`를 `ingredientChips`로 조인한다.

mock seed 파일 자체를 대량 수정하지 않아도 된다. 다만 테스트/시각 QA용으로 최소 1개 레시피에는 step별 `ingredientMasterIds`가 보이도록 한다. 방법은 둘 중 하나를 선택한다.

- `src/data/recipe_seed_mock_100.json`의 첫 번째 공개 레시피에 step별 `ingredientMasterIds`를 소량 추가한다.
- 또는 mock adapter에서 테스트 전용 fixture를 사용해 칩 조인 테스트를 추가한다.

시각 QA까지 고려하면 seed 첫 레시피에 명시적으로 넣는 쪽이 좋다.

### 5. 상세 화면 렌더링

두 컴포넌트 모두 같은 UI 규칙을 적용한다.

- `src/components/RecipeDetailPage.tsx`
- `src/components/RecipeDetail.tsx`

렌더 위치:

- 각 step item 안에서 step 번호 다음, step 본문 `way` 위에 렌더링한다.
- step image가 있는 grid layout에서도 칩이 본문 영역 안에 들어가야 한다.
- `ingredientChips.length === 0`이면 아무 것도 렌더링하지 않는다.

권장 마크업:

```tsx
{step.ingredientChips.length > 0 ? (
  <div className="step-ingredient-chips" aria-label={`Step ${step.stepNumber} ingredients`}>
    {step.ingredientChips.map((ingredient) => (
      <span className="step-ingredient-chip" key={`${step.stepNumber}-${ingredient.masterId ?? ingredient.name}`}>
        <span className="step-ingredient-chip__name">{ingredient.name}</span>
        {formatIngredientAmount(ingredient) !== null ? (
          <span className="step-ingredient-chip__amount">{formatIngredientAmount(ingredient)}</span>
        ) : null}
      </span>
    ))}
  </div>
) : null}
```

이미 `RecipeDetailPage.tsx`와 `RecipeDetail.tsx`에 재료 수량 표기 로직이 있으면 공통 helper로 빼서 중복을 줄인다.

칩은 읽기 전용이다.

- 버튼으로 만들지 않는다.
- 장바구니/재고 상태/선택 상태를 넣지 않는다.
- public web 상세에서는 앱 다운로드 CTA와 충돌하지 않게 한다.

### 6. 스타일

`src/styles/catalog.css`에 step chip 스타일을 추가한다.

요구사항:

- 모바일/데스크톱 모두 줄바꿈이 자연스러워야 한다.
- 긴 재료명은 레이아웃을 밀어내지 않아야 한다.
- 기존 `.ingredient-list`, `.step-list` 톤과 맞춘다.
- 카드 안에 또 다른 큰 카드처럼 보이지 않게 한다.
- hover 인터랙션은 넣지 않는다. read-only chip이다.

권장 클래스:

```css
.step-list__content {
  min-width: 0;
}

.step-ingredient-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.step-ingredient-chip {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid color-mix(in srgb, var(--primary) 22%, var(--border));
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--primary) 8%, var(--bg-card));
  color: var(--text);
  font-size: var(--type-small-size);
  font-weight: 700;
  line-height: 1.35;
}

.step-ingredient-chip__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-ingredient-chip__amount {
  flex: 0 0 auto;
  color: var(--primary-pressed);
  font-weight: 800;
  white-space: nowrap;
}
```

이미 `.step-list__item--media`가 grid이므로, 본문 영역을 감싸는 `div.step-list__content`를 도입하면 image 유무와 관계없이 안정적으로 배치하기 쉽다.

### 7. 테스트

최소 테스트를 추가/수정한다.

권장 테스트:

1. `recipeServerAdapter` 단위 테스트 신설
   - 서버 응답에 `ingredients`와 `steps[].ingredientMasterIds`가 있을 때 `ingredientChips`가 생성되는지 확인
   - 중복 id가 dedupe 되는지 확인
   - 매칭되지 않는 id는 렌더링 칩에서 제외되는지 확인
   - `ingredientMasterIds: null` 또는 누락이면 `ingredientChips: []`인지 확인

2. mock schema/adapter 테스트
   - mock step의 `ingredientMasterIds`가 parse되고 public record로 유지되는지 확인

3. 가능하면 컴포넌트 테스트
   - `RecipeDetail` 또는 `RecipeDetailPage`가 `ingredientChips`를 가진 step에서 칩 텍스트와 수량을 렌더링하는지 확인
   - 칩이 없는 step은 빈 row를 만들지 않는지 확인

기존 QA selector나 테스트 기대값은 깨지지 않게 유지한다.

## 검증 명령

```bash
cd /Users/hyunwu/Desktop/fridgeProject/web_fridgeProject_recipe
npm run test
npm run build
git diff --check
```

시각 확인:

```bash
cd /Users/hyunwu/Desktop/fridgeProject/web_fridgeProject_recipe
VITE_MOCK_MODE=true npm run dev
```

브라우저에서 mock 레시피 상세로 들어가서 확인한다.

- 재료 링크가 있는 step에는 재료 칩이 보인다.
- 재료 링크가 없는 step은 기존처럼 본문/팁만 보인다.
- 모바일 폭에서 칩이 줄바꿈되고 본문/이미지/CTA와 겹치지 않는다.
- 전체 페이지 상세와 모달 상세가 같은 데이터를 같은 방식으로 보여준다.

## 완료 기준

- `steps[].ingredientMasterIds`가 있는 서버/목업 데이터에서 스텝별 재료 칩이 렌더링된다.
- 기존 데이터처럼 step ingredient link가 없는 레시피는 UI 회귀 없이 기존 형태를 유지한다.
- 웹은 자연어 파싱/AI 추론 없이 서버 저장값만 사용한다.
- `npm run test`, `npm run build`, `git diff --check`가 통과한다.
- 변경 범위는 웹 렌더링/타입/어댑터/목업/테스트에 한정한다. 서버 코드는 이 작업에서 수정하지 않는다.
