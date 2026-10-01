import React from 'react';
import { Compass, Sparkles, Bookmark, HeartHandshake, Settings, ShieldCheck } from 'lucide-react';

export type NavTab = 'for_you' | 'explore' | 'saved' | 'taste' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, savedCount }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-atlas-border bg-atlas-bg/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Editorial Title */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onSelectTab('for_you')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-atlas-accent to-purple-400 flex items-center justify-center shadow-accent text-atlas-bg font-serif font-bold text-lg select-none">
            TG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wider text-xl font-medium text-atlas-text">
                That Gal
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-atlas-elevated text-atlas-muted border border-atlas-border">
                Atlas
              </span>
            </div>
            <p className="text-[11px] text-atlas-muted font-sans hidden sm:block">
              Adaptive Anime Art Discovery
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('for_you')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'for_you'
                ? 'bg-atlas-elevated text-atlas-accent border border-atlas-accent/30 shadow-sm'
                : 'text-atlas-muted hover:text-atlas-text hover:bg-atlas-surface'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>For You</span>
          </button>

          <button
            onClick={() => onSelectTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-atlas-elevated text-atlas-accent border border-atlas-accent/30 shadow-sm'
                : 'text-atlas-muted hover:text-atlas-text hover:bg-atlas-surface'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Explore</span>
          </button>

          <button
            onClick={() => onSelectTab('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'saved'
                ? 'bg-atlas-elevated text-atlas-accent border border-atlas-accent/30 shadow-sm'
                : 'text-atlas-muted hover:text-atlas-text hover:bg-atlas-surface'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-atlas-accent text-atlas-bg font-semibold">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('taste')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'taste'
                ? 'bg-atlas-elevated text-atlas-accent border border-atlas-accent/30 shadow-sm'
                : 'text-atlas-muted hover:text-atlas-text hover:bg-atlas-surface'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span className="hidden sm:inline">Your Taste</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`p-2 rounded-lg text-atlas-muted hover:text-atlas-text hover:bg-atlas-surface transition-all ${
              activeTab === 'settings' ? 'text-atlas-accent bg-atlas-elevated' : ''
            }`}
            title="Engine Settings & Privacy"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>

        {/* Safe Rating Verification Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safe (All-Ages)</span>
        </div>

      </div>
    </header>
  );
};
