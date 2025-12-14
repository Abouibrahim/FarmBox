'use client';

interface FarmFiltersProps {
  filters: {
    region: string;
    category: string;
    search: string;
  };
  onFilterChange: (filters: { region: string; category: string; search: string }) => void;
  regions: { id: string; label: string }[];
  categories: { id: string; label: string }[];
}

export function FarmFilters({
  filters,
  onFilterChange,
  regions,
  categories,
}: FarmFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une ferme..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-brown"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Region Filter */}
      <select
        value={filters.region}
        onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
        className="px-4 py-2 border border-brand-cream-dark rounded-lg bg-white focus:outline-none focus:border-brand-green"
      >
        {regions.map((region) => (
          <option key={region.id} value={region.id}>
            {region.label}
          </option>
        ))}
      </select>

      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
        className="px-4 py-2 border border-brand-cream-dark rounded-lg bg-white focus:outline-none focus:border-brand-green"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}
