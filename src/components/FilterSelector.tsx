import { ChevronDown } from "lucide-react";

export type Option = {
  readonly value: string;
  readonly label: string;
  readonly emoji: string;
};

type SelectorCardProps = {
  readonly label: string;
  readonly value: string;
  readonly options: readonly Option[];
  readonly allLabel: string;
  readonly includeAll?: boolean;
  readonly onChange: (value: string) => void;
};

export function SelectorCard({
  label,
  value,
  options,
  allLabel,
  includeAll = true,
  onChange,
}: SelectorCardProps): JSX.Element {
  return (
    <label className="selector-card">
      <span className="selector-card__label">{label}</span>
      <span className="selector-card__control">
        <select value={value} aria-label={label} onChange={(event) => onChange(event.target.value)}>
          {includeAll ? <option value="all">{allLabel}</option> : null}
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.emoji.length > 0 ? `${option.emoji} ${option.label}` : option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </label>
  );
}
