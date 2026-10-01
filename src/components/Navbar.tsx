import React from 'react';
import { Film, LayoutGrid, Bookmark, Sliders, Settings, Search } from 'lucide-react';

export type MainTab = 'theater' | 'stream' | 'vault' | 'taste' | 'settings';

interface NavbarProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  vaultCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  vaultCount,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Editorial Title */}
        <div 
          className="flex items-center gap-3 cursor-pointer shrink-0" 
          onClick={() => onSelectTab('theater')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-zinc-950 shadow-md">
            <Film className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-tight text-lg font-medium text-zinc-100">
                That Gal
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                Cinema
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-sans hidden sm:block">
              Visual Art Discovery
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-sm mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search banners, movies, studios..."
              className="w-full bg-zinc-900/80 text-zinc-200 placeholder-zinc-500 text-xs rounded-lg pl-9 pr-4 py-2 border border-zinc-800 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => onSelectTab('theater')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'theater'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            title="Full-Bleed Panoramic Theater"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Theater</span>
          </button>

          <button
            onClick={() => onSelectTab('stream')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'stream'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            title="Vertical Banner Artbook Stream"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stream</span>
          </button>

          <button
            onClick={() => onSelectTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              activeTab === 'vault'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            title="Saved Visual Vault"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Vault</span>
            {vaultCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                {vaultCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('taste')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'taste'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            title="Aesthetic Taste Knowledge Base"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Taste</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all ${
              activeTab === 'settings' ? 'text-zinc-100 bg-zinc-800' : ''
            }`}
            title="Settings & Privacy"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </nav>

      </div>
    </header>
  );
};
