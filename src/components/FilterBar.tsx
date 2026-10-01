import React from 'react';
import type { DiscoveryFilter } from '../api/types';

interface FilterBarProps {
  activeFilter: DiscoveryFilter;
  onSelectFilter: (f: DiscoveryFilter) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onSelectFilter }) => {
  const filters: Array<{ id: DiscoveryFilter; label: string }> = [
    { id: 'trending', label: 'Trending' },
    { id: 'top_movies', label: 'Feature Films' },
    { id: 'masterpieces', label: 'Masterpieces' },
    { id: 'seasonal', label: 'Season' },
    { id: 'gems', label: 'Hidden Gems' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none font-mono text-[11px]">
      {filters.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all border ${
              isActive
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700 font-medium'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-800'
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
};
