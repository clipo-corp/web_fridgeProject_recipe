import type { ReactNode } from "react";
import {
  Bookmark,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Download,
  Heart,
  Monitor,
  MoreHorizontal,
  Plus,
  Refrigerator,
  Search,
  Share2,
  Star,
} from "lucide-react";
import { MobileInstallCta } from "./AppInstallCta";
import { useI18n } from "../lib/i18n";
import type { Lang } from "../lib/translations";

type InstallCopy = {
  readonly badge: string;
  readonly titleLines: readonly [string, string, string];
  readonly bodyLines: readonly [string, string];
  readonly primary: string;
  readonly secondary: string;
  readonly featureIngredients: string;
  readonly featureIngredientsBody: string;
  readonly featureSaved: string;
  readonly featureSavedBody: string;
  readonly featurePicks: string;
  readonly featurePicksBody: string;
};

type RecipePreview = {
  readonly title: string;
  readonly meta: string;
  readonly visual: FoodVisual;
};

type IngredientPreview = {
  readonly name: string;
  readonly date: string;
  readonly visual: FoodVisual;
};

type SavedPreview = {
  readonly title: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly visual: FoodVisual;
};

type ScreenCopy = {
  readonly resultTitle: string;
  readonly matchLabel: string;
  readonly filterLabel: string;
  readonly noFilter: string;
  readonly saveCount: string;
  readonly fridgeName: string;
  readonly fridgeCount: string;
  readonly searchPlaceholder: string;
  readonly savedTitle: string;
  readonly savedOwner: string;
  readonly savedMeta: string;
  readonly addRecipe: string;
  readonly recipesLabel: string;
  readonly recipesCount: string;
  readonly recipeResults: readonly RecipePreview[];
  readonly ingredients: readonly IngredientPreview[];
  readonly savedRecipes: readonly SavedPreview[];
};

type FoodVisual =
  | "salad"
  | "corn"
  | "toast"
  | "eggs"
  | "pork"
  | "lettuce"
  | "tomato"
  | "milk"
  | "onion"
  | "noodles"
  | "soup"
  | "stir";

const installCopy: Record<Lang, InstallCopy> = {
  ko: {
    badge: "Keep Cook 앱 다운로드",
    titleLines: ["앱 설치하고", "냉장고에 맞는", "레시피 받기"],
    bodyLines: [
      "레시피 저장, 냉장고 재료 관리,",
      "내 재료 기반 추천까지 Keep Cook 앱에서 한 번에!",
    ],
    primary: "앱 설치하기",
    secondary: "웹 레시피 보기",
    featureIngredients: "재료 등록과 관리",
    featureIngredientsBody: "냉장고 속 재료를 등록하고 유통기한을 관리해요.",
    featureSaved: "레시피 저장",
    featureSavedBody: "마음에 드는 레시피를 저장하고 나만의 레시피북을 만들어요.",
    featurePicks: "맞춤 추천 받기",
    featurePicksBody: "내 냉장고 재료를 분석해 맞춤 레시피를 추천해줘요.",
  },
  en: {
    badge: "Download Keep Cook",
    titleLines: ["Install the app", "and get recipes", "for your fridge"],
    bodyLines: [
      "Save recipes, manage fridge ingredients,",
      "and get recommendations from Keep Cook in one place.",
    ],
    primary: "Install app",
    secondary: "View web recipes",
    featureIngredients: "Register ingredients",
    featureIngredientsBody: "Add fridge ingredients and keep expiration dates organized.",
    featureSaved: "Save recipes",
    featureSavedBody: "Save favorites and build your own recipe book.",
    featurePicks: "Get recommendations",
    featurePicksBody: "Analyze your fridge and receive recipes that fit what you have.",
  },
};

const screenCopy: Record<Lang, ScreenCopy> = {
  ko: {
    resultTitle: "생성 결과",
    matchLabel: "매칭",
    filterLabel: "레시피 필터",
    noFilter: "선택된 필터 없음",
    saveCount: "0개의 레시피 저장",
    fridgeName: "S16809751",
    fridgeCount: "11개",
    searchPlaceholder: "재료 이름으로 검색",
    savedTitle: "저장한 레시피",
    savedOwner: "게시자: Healthy Homey Owner",
    savedMeta: "저장한 레시피 · 비공개 · 3개",
    addRecipe: "레시피 추가하기",
    recipesLabel: "레시피",
    recipesCount: "3개",
    recipeResults: [
      { title: "사과 옥수수 샐러드", meta: "5min · easy · 2/2", visual: "salad" },
      { title: "콘 옥수수와 사과 슬라이스", meta: "10min · easy · 2/2", visual: "corn" },
      { title: "구운 옥수수", meta: "10min · easy · 1/1", visual: "toast" },
    ],
    ingredients: [
      { name: "달걀", date: "2024.05.25", visual: "eggs" },
      { name: "돼지고기 (삼겹살)", date: "2024.05.26", visual: "pork" },
      { name: "상추", date: "2024.05.27", visual: "lettuce" },
      { name: "방울토마토", date: "2024.05.28", visual: "tomato" },
      { name: "우유", date: "2024.05.28", visual: "milk" },
      { name: "양파", date: "2024.06.01", visual: "onion" },
    ],
    savedRecipes: [
      { title: "지중해 샐러드", author: "Healthy Homey Owner", tags: ["채식", "샐러드", "초급"], visual: "salad" },
      { title: "콘 크림 파스타", author: "KeepCook Kitchen", tags: ["면", "간단", "10분"], visual: "noodles" },
      { title: "토마토 채소볶음", author: "Home Cook", tags: ["볶음", "채소", "초급"], visual: "stir" },
    ],
  },
  en: {
    resultTitle: "Generated recipes",
    matchLabel: "Match",
    filterLabel: "Recipe filter",
    noFilter: "No filter selected",
    saveCount: "0 saved recipes",
    fridgeName: "S16809751",
    fridgeCount: "11 items",
    searchPlaceholder: "Search ingredients",
    savedTitle: "Saved recipes",
    savedOwner: "Owner: Healthy Homey Owner",
    savedMeta: "Saved recipes · Private · 3",
    addRecipe: "Add recipe",
    recipesLabel: "Recipes",
    recipesCount: "3",
    recipeResults: [
      { title: "Apple corn salad", meta: "5min · easy · 2/2", visual: "salad" },
      { title: "Corn and apple slices", meta: "10min · easy · 2/2", visual: "corn" },
      { title: "Grilled corn", meta: "10min · easy · 1/1", visual: "toast" },
    ],
    ingredients: [
      { name: "Eggs", date: "2024.05.25", visual: "eggs" },
      { name: "Pork belly", date: "2024.05.26", visual: "pork" },
      { name: "Lettuce", date: "2024.05.27", visual: "lettuce" },
      { name: "Cherry tomatoes", date: "2024.05.28", visual: "tomato" },
      { name: "Milk", date: "2024.05.28", visual: "milk" },
      { name: "Onion", date: "2024.06.01", visual: "onion" },
    ],
    savedRecipes: [
      { title: "Mediterranean salad", author: "Healthy Homey Owner", tags: ["fresh", "salad", "easy"], visual: "salad" },
      { title: "Cream corn pasta", author: "KeepCook Kitchen", tags: ["noodle", "quick", "10m"], visual: "noodles" },
      { title: "Tomato veggie stir-fry", author: "Home Cook", tags: ["pan", "veggie", "easy"], visual: "stir" },
    ],
  },
};

export function InstallPage(): JSX.Element {
  const { lang } = useI18n();
  const copy = installCopy[lang];
  const screen = screenCopy[lang];

  return (
    <>
      <main className="install-clean">
        <section className="install-clean-hero" id="app-download">
          <div className="install-clean-copy">
            <span className="install-clean-badge">{copy.badge}</span>
            <h1>
              {copy.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p>
              {copy.bodyLines[0]}
              <br />
              {copy.bodyLines[1]}
            </p>
            <div className="install-clean-actions">
              <a className="btn btn--primary" href="https://keepcook.app" target="_blank" rel="noreferrer">
                <Download size={18} aria-hidden="true" />
                {copy.primary}
              </a>
              <a className="btn btn--ghost" href="/recipe-catalog">
                <Monitor size={18} aria-hidden="true" />
                {copy.secondary}
              </a>
            </div>
          </div>

          <div className="install-clean-showcase" aria-hidden="true">
            <span className="install-clean-float install-clean-float--leaf-a" />
            <span className="install-clean-float install-clean-float--leaf-b" />
            <span className="install-clean-float install-clean-float--pea" />
            <img className="install-clean-hero-shot" src="/install-picks-card.png" alt="" />
          </div>
        </section>

        <section className="install-clean-cards" aria-label="Keep Cook app preview screens">
          <InstallFeatureCard
            icon={<Refrigerator size={31} aria-hidden="true" />}
            title={copy.featureIngredients}
            body={copy.featureIngredientsBody}
          />

          <InstallFeatureCard
            icon={<Bookmark size={31} aria-hidden="true" />}
            title={copy.featureSaved}
            body={copy.featureSavedBody}
          />

          <InstallFeatureCard
            icon={<Star size={31} aria-hidden="true" />}
            title={copy.featurePicks}
            body={copy.featurePicksBody}
          />
        </section>
      </main>
      <MobileInstallCta />
    </>
  );
}

function InstallFeatureCard({
  icon,
  title,
  body,
  children,
}: {
  readonly icon: ReactNode;
  readonly title: string;
  readonly body: string;
  readonly children?: ReactNode;
}): JSX.Element {
  const hasPreview = children !== undefined && children !== null;

  return (
    <article className={`install-clean-card${hasPreview ? "" : " install-clean-card--plain"}`}>
      <div className="install-clean-card__copy">
        <span className="install-clean-card__icon">{icon}</span>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      {hasPreview ? (
        <div className="install-clean-card__preview" aria-hidden="true">
          {children}
        </div>
      ) : null}
    </article>
  );
}

function PhoneMock({
  size,
  children,
}: {
  readonly size: "hero" | "card";
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <div className={`install-clean-phone install-clean-phone--${size}`}>
      <div className="install-clean-phone__bezel">
        <span className="install-clean-phone__notch" />
        <div className="install-clean-phone__screen">{children}</div>
      </div>
    </div>
  );
}

function StatusBar({
  time,
  network,
}: {
  readonly time: string;
  readonly network: "LTE" | "5G";
}): JSX.Element {
  return (
    <div className="install-clean-status">
      <strong>{time}</strong>
      <span>
        <i />
        <i />
        <i />
        {network}
        <b>60</b>
      </span>
    </div>
  );
}

function RecipeResultScreen({
  screen,
  compact = false,
}: {
  readonly screen: ScreenCopy;
  readonly compact?: boolean;
}): JSX.Element {
  const visibleRecipes = compact ? screen.recipeResults.slice(0, 3) : screen.recipeResults;

  return (
    <div className="install-clean-screen install-clean-screen--result">
      <StatusBar time="10:16" network="LTE" />
      <header className="install-clean-result-head">
        <div className="install-clean-result-title">
          <span />
          <strong>{screen.resultTitle}</strong>
        </div>
        <div className="install-clean-result-match">
          <span>{screen.matchLabel}</span>
          <strong>100%</strong>
        </div>
      </header>
      <div className="install-clean-filter">
        <span>{screen.filterLabel}</span>
        <b>{screen.noFilter}</b>
      </div>
      <div className="install-clean-result-list">
        {visibleRecipes.map((recipe) => (
          <article className="install-clean-result-item" key={recipe.title}>
            <FoodPhoto variant={recipe.visual} />
            <div>
              <span className="install-clean-match-pill">100% 매칭</span>
              <h3>{recipe.title}</h3>
              <p>
                <Clock3 size={12} aria-hidden="true" />
                {recipe.meta}
              </p>
            </div>
            <button type="button" aria-label={recipe.title}>
              <Bookmark size={17} aria-hidden="true" />
            </button>
            <button type="button" aria-label={recipe.title}>
              <ChevronDown size={18} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
      <div className="install-clean-save-bar">{screen.saveCount}</div>
    </div>
  );
}

function FridgeScreen({ screen }: { readonly screen: ScreenCopy }): JSX.Element {
  return (
    <div className="install-clean-screen install-clean-screen--fridge">
      <StatusBar time="10:12" network="LTE" />
      <header className="install-clean-fridge-head">
        <button type="button" aria-label="Back">
          <ChevronLeft size={21} aria-hidden="true" />
        </button>
        <strong>
          <span />
          {screen.fridgeName}
        </strong>
        <b>{screen.fridgeCount}</b>
      </header>
      <div className="install-clean-search">
        <Search size={17} aria-hidden="true" />
        <span>{screen.searchPlaceholder}</span>
      </div>
      <div className="install-clean-chips">
        <b>유통기한 빠른순</b>
        <span>최근 추가순</span>
        <span>즐겨찾기 우선</span>
      </div>
      <div className="install-clean-ingredients">
        {screen.ingredients.map((ingredient) => (
          <article className="install-clean-ingredient" key={ingredient.name}>
            <FoodPhoto variant={ingredient.visual} />
            <div>
              <h3>{ingredient.name}</h3>
              <p>{ingredient.date}</p>
            </div>
            <Heart size={18} aria-hidden="true" />
          </article>
        ))}
      </div>
    </div>
  );
}

function SavedRecipeScreen({ screen }: { readonly screen: ScreenCopy }): JSX.Element {
  return (
    <div className="install-clean-screen install-clean-screen--saved">
      <StatusBar time="10:14" network="5G" />
      <header className="install-clean-saved-head">
        <button type="button" aria-label="Back">
          <ChevronLeft size={21} aria-hidden="true" />
        </button>
        <div>
          <button type="button" aria-label="Search">
            <Search size={19} aria-hidden="true" />
          </button>
          <button type="button" aria-label="More">
            <MoreHorizontal size={19} aria-hidden="true" />
          </button>
        </div>
      </header>
      <section className="install-clean-saved-panel">
        <div className="install-clean-photo-grid">
          {screen.savedRecipes.map((recipe) => (
            <FoodPhoto variant={recipe.visual} key={recipe.title} />
          ))}
          <span />
        </div>
        <h3>{screen.savedTitle}</h3>
        <p>{screen.savedOwner}</p>
        <span>{screen.savedMeta}</span>
        <div className="install-clean-saved-actions">
          <button type="button">
            <Plus size={18} aria-hidden="true" />
            {screen.addRecipe}
          </button>
          <button type="button" aria-label="Share">
            <Share2 size={17} aria-hidden="true" />
          </button>
        </div>
      </section>
      <div className="install-clean-saved-list">
        <strong>{screen.recipesLabel}</strong>
        <span>{screen.recipesCount}</span>
      </div>
    </div>
  );
}

function FoodPhoto({ variant }: { readonly variant: FoodVisual }): JSX.Element {
  return (
    <span className={`install-clean-photo install-clean-photo--${variant}`}>
      <i />
    </span>
  );
}
