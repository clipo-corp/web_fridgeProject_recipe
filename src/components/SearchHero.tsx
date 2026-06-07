import { Search, Smartphone } from "lucide-react";

type SearchHeroProps = {
  readonly query: string;
  readonly recipeCount: number;
  readonly onQueryChange: (query: string) => void;
};

export function SearchHero({ query, recipeCount, onQueryChange }: SearchHeroProps): JSX.Element {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">FreshKeeper 공개 레시피</span>
        <h1>오늘 냉장고에 있는 재료로 뭐 먹지?</h1>
        <p>
          전세계 레시피를 가볍게 둘러보고, 저장과 맞춤 추천은 앱에서 이어가세요.
        </p>
      </div>
      <div className="hero-search">
        <label htmlFor="recipe-search">레시피 검색</label>
        <div className="search-box">
          <Search size={22} aria-hidden="true" />
          <input
            id="recipe-search"
            type="search"
            placeholder="두유, 김치, 파스타, 닭고기..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <div className="hero-stats">
          <span>{recipeCount}개 mock 레시피</span>
          <span>로그인 없이 읽기 전용</span>
          <a href="#app-download">
            <Smartphone size={16} aria-hidden="true" />
            앱 설치
          </a>
        </div>
      </div>
    </section>
  );
}
