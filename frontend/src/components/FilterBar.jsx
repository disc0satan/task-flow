const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export default function FilterBar({ filter, counts, onChange }) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter tasks by status">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`filter-btn${filter === value ? ' is-active' : ''}`}
          aria-pressed={filter === value}
          onClick={() => onChange(value)}
        >
          {label} <span className="filter-count">{counts[value]}</span>
        </button>
      ))}
    </div>
  );
}
