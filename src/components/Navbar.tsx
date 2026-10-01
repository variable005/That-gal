import React, { useState } from 'react';
import { Film, LayoutGrid, Bookmark, Sliders, Settings, Search, X } from 'lucide-react';

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
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 bg-gradient-to-b from-[#070709]/95 via-[#070709]/80 to-transparent backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          onClick={() => onSelectTab('theater')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <span className="font-editorial text-xl font-medium tracking-tight text-zinc-100 group-hover:text-amber-200 transition-colors">
            That Gal
          </span>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/80">
            Cinema
          </span>
        </div>

        {/* Center Floating Pill Navigation */}
        <nav className="flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-full p-1 shadow-xl">
          <button
            onClick={() => onSelectTab('theater')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-all ${
              activeTab === 'theater'
                ? 'bg-zinc-100 text-zinc-950 font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Cinema</span>
          </button>

          <button
            onClick={() => onSelectTab('stream')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-all ${
              activeTab === 'stream'
                ? 'bg-zinc-100 text-zinc-950 font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Stream</span>
          </button>

          <button
            onClick={() => onSelectTab('vault')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-all relative ${
              activeTab === 'vault'
                ? 'bg-zinc-100 text-zinc-950 font-medium shadow'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Vault</span>
            {vaultCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        </nav>

        {/* Right Actions: Search Toggle + Taste / Settings */}
        <div className="flex items-center gap-1.5">
          {showSearch ? (
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search art, titles, studios..."
                className="w-48 sm:w-64 bg-zinc-900 border border-zinc-700 text-zinc-200 placeholder-zinc-500 font-mono text-xs rounded-full pl-7 pr-7 py-1.5 focus:outline-none"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  onSearchChange('');
                }}
                className="absolute right-2 p-0.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800/80 transition-colors"
              title="Search Artwork"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onSelectTab('taste')}
            className={`p-2 rounded-full border transition-colors ${
              activeTab === 'taste'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border-zinc-800/80'
            }`}
            title="Taste Profile"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`p-2 rounded-full border transition-colors ${
              activeTab === 'settings'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border-zinc-800/80'
            }`}
            title="Settings & Export"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
