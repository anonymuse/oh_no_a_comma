interface LocationDropdownProps {
  label: string;
  options: readonly string[];
  selected?: string;
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
        {options.map((option, index) => (
          <div className="dropdown-option" role="option" key={`${option}-${index}`} data-location-label={option}>
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}
