import React from 'react';
import { Flame, Film, Trophy, Calendar, Gem } from 'lucide-react';
import type { DiscoveryFilter } from '../api/types';

interface FilterBarProps {
  activeFilter: DiscoveryFilter;
  onSelectFilter: (f: DiscoveryFilter) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onSelectFilter }) => {
  const filters: Array<{ id: DiscoveryFilter; label: string; icon: React.ReactNode }> = [
    { id: 'trending', label: 'Trending', icon: <Flame className="w-3 h-3" /> },
    { id: 'top_movies', label: 'Feature Films', icon: <Film className="w-3 h-3" /> },
    { id: 'masterpieces', label: 'Masterpieces', icon: <Trophy className="w-3 h-3" /> },
    { id: 'seasonal', label: 'Seasonal', icon: <Calendar className="w-3 h-3" /> },
    { id: 'gems', label: 'Hidden Gems', icon: <Gem className="w-3 h-3" /> },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-[11px]">
      {filters.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all border ${
              isActive
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-medium shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:border-zinc-700'
            }`}
          >
            {f.icon}
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};
