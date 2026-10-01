import React, { useState } from 'react';
import { Bookmark, Film, Heart, Trash2, Sparkles } from 'lucide-react';
import { AnimeCard } from './AnimeCard';
import type { AnimeMedia, WatchlistEntry, WatchlistStatus } from '../api/types';

interface WatchlistViewProps {
  entries: WatchlistEntry[];
  onToggleWatchlist: (media: AnimeMedia) => void;
  onToggleFavorite: (media: AnimeMedia) => void;
  onDislike: (media: AnimeMedia) => void;
  onInspect: (media: AnimeMedia) => void;
  onClearWatchlist: () => void;
  onGoToDiscovery: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  entries,
  onToggleWatchlist,
  onToggleFavorite,
  onDislike,
  onInspect,
  onClearWatchlist,
  onGoToDiscovery,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | WatchlistStatus | 'favorites'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'MOVIE' | 'TV'>('all');

  const filtered = entries.filter((e) => {
    if (activeTab === 'favorites') {
      if (!e.isFavorite) return false;
    } else if (activeTab !== 'all') {
      if (e.status !== activeTab) return false;
    }

    if (formatFilter !== 'all' && e.media.format !== formatFilter) {
      return false;
    }

    return true;
  });

  const favoritesCount = entries.filter((e) => e.isFavorite).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-serif font-medium text-zinc-100">
            Personal Watchlist & Library
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            {entries.length} anime title{entries.length === 1 ? '' : 's'} saved
          </p>
        </div>

        {entries.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Clear your entire watchlist?')) {
                onClearWatchlist();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-900/50 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Watchlist</span>
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeTab === 'all'
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            All ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab('plan_to_watch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeTab === 'plan_to_watch'
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            Plan to Watch ({entries.filter((e) => e.status === 'plan_to_watch').length})
          </button>
          <button
            onClick={() => setActiveTab('watching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeTab === 'watching'
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            Watching ({entries.filter((e) => e.status === 'watching').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeTab === 'completed'
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            Completed ({entries.filter((e) => e.status === 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeTab === 'favorites'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-rose-300 border-zinc-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Favorites ({favoritesCount})</span>
          </button>
        </div>

        {/* Format Filter */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setFormatFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              formatFilter === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Formats
          </button>
          <button
            onClick={() => setFormatFilter('MOVIE')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              formatFilter === 'MOVIE' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>Movies</span>
          </button>
          <button
            onClick={() => setFormatFilter('TV')}
            className={`px-2.5 py-1 rounded transition-colors ${
              formatFilter === 'TV' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            TV Series
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="my-16 text-center max-w-md mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-medium text-zinc-100 mb-1">
            No Titles in this Section
          </h3>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Browse the discovery feed and bookmark anime or movie posters to build your personal shelf.
          </p>
          <button
            onClick={onGoToDiscovery}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Discover Artwork</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(({ media, isFavorite }) => (
            <AnimeCard
              key={media.id}
              media={media}
              isInWatchlist={true}
              isFavorite={isFavorite}
              onToggleWatchlist={onToggleWatchlist}
              onToggleFavorite={onToggleFavorite}
              onDislike={onDislike}
              onInspect={onInspect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
