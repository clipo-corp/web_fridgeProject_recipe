# Keep Cook Web — Design & Structure Improvements

> Codex용 작업 목록. 기능 변경 없이 디자인/구조 개선에 집중.
> 각 섹션에 파일 경로, 정확한 클래스명, 변경 방향을 명시함.

---

## 1. SiteHeader — 높이 및 shadow 개선

**파일:** `src/styles/catalog.css` — `.site-header`

현재 헤더는 border-bottom만 있고 scroll sticky 시 배경 blur가 없어 콘텐츠와 구분이 흐림.

**변경 사항:**
```css
/* 현재 */
.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

/* 변경 */
.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--bg-card) 85%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--neutral-900) 5%, transparent);
}
```

---

## 2. Brand 로고 — Leaf 아이콘 배경 개선

**파일:** `src/styles/catalog.css` — `.brand__mark`

현재 `.brand__mark`는 green-400 배경에 흰 아이콘. dark모드에서 너무 강렬함.

**변경 사항:**
- `.brand__mark` 크기를 `36px → 34px`로 소폭 축소
- `border-radius`를 `var(--radius-xs)` → `10px`로 더 소프트하게
- dark 테마에서 배경 밝기 낮춤: `var(--green-400)` → `color-mix(in srgb, var(--green-400) 88%, var(--navy-800))`

---

## 3. Hero 섹션 — 배경 그라디언트 추가

**파일:** `src/styles/catalog.css` — `.hero`

현재 hero는 단색 배경. 아래 그라디언트를 추가하면 훨씬 depth가 생김.

**변경 사항:**
```css
.hero {
  /* 기존 속성 유지하고 background 추가 */
  background:
    radial-gradient(ellipse 80% 60% at 60% -10%, color-mix(in srgb, var(--green-400) 10%, transparent), transparent),
    var(--bg-app);
}

[data-theme="dark"] .hero {
  background:
    radial-gradient(ellipse 80% 60% at 60% -10%, color-mix(in srgb, var(--green-400) 7%, transparent), transparent),
    var(--bg-app);
}
```

---

## 4. Hero 검색창 — 포커스 상태 ring 개선

**파일:** `src/styles/catalog.css` — `.hero__search:focus-within`

현재 포커스 outline이 border-color만 바뀌는 수준. 더 명확하게.

**변경 사항:**
```css
.hero__search:focus-within {
  border-color: var(--border-focus);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent),
    var(--shadow-card-hover);
}
```

---

## 5. Hero h1 — Sparkles 아이콘 컬러

**파일:** `src/styles/catalog.css` — `.hero h1 svg`

현재 Sparkles 아이콘이 `color: var(--primary)`. 애니메이션 없이 정적으로만 있음.

**변경 사항:**
- svg에 subtle rotate 애니메이션 추가:
```css
.hero h1 svg {
  color: var(--primary);
  animation: sparkle-spin 6s ease-in-out infinite;
}

@keyframes sparkle-spin {
  0%, 100% { transform: rotate(-6deg) scale(1); }
  50% { transform: rotate(6deg) scale(1.07); }
}
```

---

## 6. RecipeCard — 이미지 영역 비율 및 hover 개선

**파일:** `src/styles/catalog.css` — `.recipe-visual--card`

현재 aspect-ratio `16/8.8`은 다소 납작. 카드에 더 적합한 비율로:

**변경 사항:**
```css
/* 16/8.8 → 16/9 */
.recipe-visual--card {
  aspect-ratio: 16 / 9;
}
```

카드 hover 시 이미지도 살짝 zoom 효과:
```css
.recipe-card__link:hover .recipe-visual--photo img {
  transform: scale(1.03);
  transition: transform 320ms ease;
}

.recipe-visual--photo img {
  transition: transform 320ms ease;
}

.recipe-visual {
  overflow: hidden; /* 이미 있을 수 있으나 확인 필요 */
}
```

---

## 7. RecipeCard body — padding 및 gap 정리

**파일:** `src/styles/catalog.css` — `.recipe-card__body`

현재 `gap: 7px`은 어색한 수치. 8px로 통일.

**변경 사항:**
```css
.recipe-card__body {
  gap: 8px; /* 7px → 8px */
  padding: var(--space-md) var(--space-lg); /* 상하 md, 좌우 lg로 여백 확대 */
}
```

---

## 8. RecipeCard h3 — line-clamp 2줄로

**파일:** `src/styles/catalog.css` — `.recipe-card h3`

현재 제목이 1줄 clamp라 긴 제목이 잘려서 아쉬움. grid variant에서는 2줄 허용.

**변경 사항:**
```css
.recipe-card h3 {
  -webkit-line-clamp: 2;
  min-height: calc(1.28em * 2); /* 레이아웃 안정화 */
}

/* spotlight은 1줄 유지 */
.recipe-card--spotlight h3 {
  -webkit-line-clamp: 1;
  min-height: auto;
}
```

---

## 9. RecipeVisual placeholder — 패턴 opacity 낮춤

**파일:** `src/styles/catalog.css` — `.recipe-visual__pattern`

현재 dot pattern opacity `0.7`이 dark 모드에서 너무 강하게 보임.

**변경 사항:**
```css
.recipe-visual__pattern {
  opacity: 0.45; /* 0.7 → 0.45 */
}

[data-theme="dark"] .recipe-visual__pattern {
  opacity: 0.25;
}
```

---

## 10. FeaturedCarousel controls — 위치 조정

**파일:** `src/styles/catalog.css` — `.featured-carousel__controls`

현재 `position: absolute; top: calc(-1 * (var(--space-lg) + var(--h-button)))` 이 구조는 section head와 겹칠 수 있음.

**변경 방향:**
- controls를 carousel 하단으로 이동 (absolute → relative, section head 아래)
- 또는 section head 우측에 inline으로 배치하는 구조로 변경

**추천:** `RecipeCatalogBrowsingContent.tsx`의 `Section` 컴포넌트에 `actions` slot prop 추가:
```tsx
// Section에 actions prop 추가
type SectionProps = {
  eyebrow: string;
  title: string;
  note?: string;
  actions?: ReactNode; // NEW
  children: ReactNode;
};

// section__head에 렌더링
<div className="section__head">
  <div>
    <span className="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
  </div>
  {actions}
</div>
```

```css
.section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
```

그리고 `FeaturedRecipeCarousel`에서 controls를 외부로 올려 Section의 actions로 전달.

---

## 11. FilterPanel — 기본 chip group 레이아웃

**파일:** `src/styles/catalog.css` — `.filter-chip-group`

현재 `flex: 1 1 calc(50% - var(--space-sm))`로 2열 배치인데, 내용이 많을 때 한쪽으로 쏠림.

**변경 사항:**
```css
/* basic filter groups를 단일 행 scroll로 변경 */
.filter-chip-groups {
  display: flex;
  flex-direction: column;  /* 기존 wrap → column으로 */
  gap: var(--space-sm);
}

.filter-chip-group {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  align-items: center;
  gap: var(--space-sm);
}

.filter-chip-group__rail {
  overflow-x: auto;
  overflow-y: visible;
  flex-wrap: nowrap; /* 한 줄로 */
  scrollbar-width: none;
}

.filter-chip-group__rail::-webkit-scrollbar {
  display: none;
}
```

이렇게 하면 각 필터가 label + 가로 스크롤 chip 한 줄로 정리되어 훨씬 깔끔.

---

## 12. DetailPanel — 헤더 영역 개선

**파일:** `src/styles/catalog.css` — `.detail-panel`, `.detail-header`

현재 닫기 버튼(X)이 이미지 위에 float되어 있는데, 이미지 없을 때(placeholder) 어색함.

**변경 사항:**
- `.detail-panel`에 sticky 닫기 버튼 바 추가:
```css
/* detail-panel 상단에 sticky close bar */
.detail-close-bar {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
  padding: var(--space-md);
  background: linear-gradient(to bottom, var(--bg-card) 60%, transparent);
}
```

`RecipeDetail.tsx`에서 `.icon-button`을 `.detail-close-bar` div로 감싸서 상단에 배치:
```tsx
<aside className="detail-panel" ...>
  <div className="detail-close-bar">
    <button className="icon-button" ...>
      <X size={20} />
    </button>
  </div>
  <div className="detail-header"> ... </div>
  ...
</aside>
```

---

## 13. DetailPanel — meta 아이콘 그룹 시각 분리

**파일:** `src/styles/catalog.css` — `.detail-meta`

현재 meta items가 모두 동등하게 나열되어 중요도 구분이 없음.

**변경 사항:**
- 앞 4개(시간, 난이도, 인원, 좋아요)를 pill 형태로 묶어 강조
- 뒤쪽(언어, 지역, 카테고리)은 기존 스타일 유지

```css
/* 첫 4개 span을 강조 pill로 */
.detail-meta > span:nth-child(-n+4) {
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--bg-card-alt);
  border: 1px solid var(--border);
}
```

---

## 14. Ingredient list — 2열 그리드 최소너비 조정

**파일:** `src/styles/catalog.css` — `.ingredient-list`

현재 `grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))`는 560px 미만 패널에서 강제 1열로 떨어짐. detail panel width가 560px이라 항상 1열로 렌더됨.

**변경 사항:**
```css
.ingredient-list {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
}
```

---

## 15. step-list — step number 색상 개선

**파일:** `src/styles/catalog.css` — `.step-list__num`

현재 green-400 solid background. dark 모드에서 대비가 강함.

**변경 사항:**
```css
.step-list__num {
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary-pressed);
  border: 1.5px solid color-mix(in srgb, var(--primary) 40%, transparent);
  font-weight: 800;
}
```

---

## 16. Empty state — 아이콘 배경 추가

**파일:** `src/styles/catalog.css` — `.empty-state svg`

현재 아이콘이 단독으로 떠 있어 허전.

**변경 사항:**
```css
.empty-state svg {
  /* 기존 color 유지하고 배경 추가 */
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--badge-brand-bg);
  box-sizing: content-box;
}
```

---

## 17. Home chip — border color 변수 수정

**파일:** `src/styles/catalog.css` — `.home-chip`

현재 `border: 1px solid var(--line)` 인데 `--line` 변수가 base.css에 정의되어 있지 않음 → undefined.

**변경 사항:**
```css
.home-chip {
  border: 1px solid var(--border); /* var(--line) → var(--border) */
}
```

---

## 18. ResultsSearchBar — 상단 sticky 배경 blur

**파일:** `src/styles/catalog.css` — `.results-search-shell`

results 모드로 전환 시 상단 검색바가 scroll해도 blur 없이 고정됨.

**변경 사항:**
```css
.results-search-shell {
  background: color-mix(in srgb, var(--bg-card) 80%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

---

## 19. Mobile — Filter panel scroll 처리

**파일:** `src/styles/catalog.css`

768px 이하에서 filter-chip-groups가 화면을 넘어가면 스크롤 없이 잘림.

**변경 사항:**
```css
@media (max-width: 768px) {
  .filter-panel {
    overflow-x: hidden;
  }

  .filter-chip-group__rail {
    max-width: calc(100vw - 2 * var(--space-lg) - 100px - var(--space-sm));
  }
}
```

---

## 20. Typography — eyebrow 글자간격 추가

**파일:** `src/styles/catalog.css` — `.eyebrow`

현재 eyebrow에 letter-spacing이 없어 소문자 영문이 답답하게 보임.

**변경 사항:**
```css
.eyebrow {
  letter-spacing: 0.06em; /* 추가 */
}
```

---

## 우선순위 요약

| 우선 | 항목 | 임팩트 |
|------|------|--------|
| 🔴 높음 | #17 (--line 버그), #7 (card padding), #11 (filter layout) | 버그 or 레이아웃 깨짐 |
| 🟡 중간 | #1 (header blur), #3 (hero bg), #6 (card hover), #12 (detail close) | 시각적 완성도 |
| 🟢 낮음 | #5 (sparkle animation), #9 (pattern opacity), #16 (empty state), #20 (eyebrow) | 디테일 polish |
