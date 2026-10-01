import React from 'react';
import { FilterBar } from './FilterBar';
import { AnimeCard } from './AnimeCard';
import { RefreshCw, Sparkles, Film } from 'lucide-react';
import type { AnimeMedia, DiscoveryFilter, WatchlistEntry } from '../api/types';

interface DiscoveryFeedProps {
  feed: AnimeMedia[];
  isLoading: boolean;
  isLoadingMore: boolean;
  activeFilter: DiscoveryFilter;
  onSelectFilter: (f: DiscoveryFilter) => void;
  searchQuery: string;
  watchlistMap: Map<number, WatchlistEntry>;
  onToggleWatchlist: (media: AnimeMedia) => void;
  onToggleFavorite: (media: AnimeMedia) => void;
  onDislike: (media: AnimeMedia) => void;
  onInspect: (media: AnimeMedia) => void;
  onLoadMore: () => void;
  hasNextPage: boolean;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  feed,
  isLoading,
  isLoadingMore,
  activeFilter,
  onSelectFilter,
  searchQuery,
  watchlistMap,
  onToggleWatchlist,
  onToggleFavorite,
  onDislike,
  onInspect,
  onLoadMore,
  hasNextPage,
}) => {
  return (
    <div className="space-y-6">
      {/* Editorial Section Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-zinc-100">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Official Visual Discovery'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Curate your watchlist by visual craft. As you save films and series, our recommendation engine adapts to your preferred animation studios and themes.
          </p>
        </div>

        {/* Filter Pills */}
        {!searchQuery && (
          <FilterBar activeFilter={activeFilter} onSelectFilter={onSelectFilter} />
        )}
      </div>

      {/* Artwork Grid / Skeletons */}
      {isLoading && feed.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 animate-pulse aspect-[2/3]"
            />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="my-20 text-center max-w-md mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          <Film className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-medium text-zinc-100 mb-1">No Artwork Found</h3>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            No official posters matched your query or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {feed.map((media, idx) => {
            const entry = watchlistMap.get(media.id);
            return (
              <AnimeCard
                key={media.id}
                media={media}
                isInWatchlist={Boolean(entry)}
                isFavorite={Boolean(entry?.isFavorite)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavorite={onToggleFavorite}
                onDislike={onDislike}
                onInspect={onInspect}
                priorityIndex={idx}
              />
            );
          })}
        </div>
      )}

      {/* Incremental Load More */}
      {feed.length > 0 && hasNextPage && !searchQuery && (
        <div className="flex justify-center pt-6 pb-12">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium tracking-wide transition-all shadow-lg disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Loading Discoveries...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load More Discoveries</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
