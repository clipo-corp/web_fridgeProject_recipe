type FilterBarProps = {
  readonly countries: readonly string[];
  readonly selectedCountry: string;
  readonly onSelectCountry: (country: string) => void;
};

export function FilterBar({
  countries,
  selectedCountry,
  onSelectCountry,
}: FilterBarProps): JSX.Element {
  return (
    <div className="filter-bar">
      <span>나라별 레시피</span>
      <select
        aria-label="나라 선택"
        value={selectedCountry}
        onChange={(event) => onSelectCountry(event.target.value)}
      >
        <option value="all">전체 국가</option>
        {countries.map((country) => (
          <option value={country} key={country}>
            {country}
          </option>
        ))}
      </select>
    </div>
  );
}
