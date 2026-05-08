interface LocationDropdownOption {
  label: string;
  count?: number;
  rawValues?: readonly string[];
}

interface LocationDropdownProps {
  label: string;
  options: readonly (string | LocationDropdownOption)[];
  selected?: string;
}

function toOption(option: string | LocationDropdownOption): LocationDropdownOption {
  return typeof option === 'string' ? { label: option } : option;
}

export function LocationDropdown({ label, options, selected }: LocationDropdownProps) {
  return (
    <div className="dropdown-card" data-testid="location-dropdown">
      <div className="dropdown-label">{label}</div>
      <button className="dropdown-trigger" type="button" aria-expanded="true">
        {selected ?? 'All locations'}
        <span aria-hidden="true">⌄</span>
      </button>
      <div className="dropdown-menu" role="listbox" aria-label={label}>
        {options.map((rawOption, index) => {
          const option = toOption(rawOption);
          return (
            <div className="dropdown-option" role="option" key={`${option.label}-${index}`} data-location-label={option.label}>
              <span>{option.label}</span>
              {option.count === undefined ? null : <strong>{option.count} jobs</strong>}
              {option.rawValues && option.rawValues.length > 1 ? (
                <small>from {option.rawValues.length} raw labels</small>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
