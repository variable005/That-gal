import React, { useState } from 'react';
import { Bookmark, Heart, X, Maximize2, Star } from 'lucide-react';
import type { AnimeMedia } from '../api/types';

interface AnimeCardProps {
  media: AnimeMedia;
  isInWatchlist: boolean;
  isFavorite: boolean;
  onToggleWatchlist: (media: AnimeMedia) => void;
  onToggleFavorite: (media: AnimeMedia) => void;
  onDislike: (media: AnimeMedia) => void;
  onInspect: (media: AnimeMedia) => void;
  priorityIndex?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  media,
  isInWatchlist,
  isFavorite,
  onToggleWatchlist,
  onToggleFavorite,
  onDislike,
  onInspect,
  priorityIndex = 999,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const title = media.title.english || media.title.romaji;
  const isLcp = priorityIndex < 2;

  // Use the official artwork color for subtle ambient glow
  const ambientColor = media.coverImage.color || '#3F3F46';

  return (
    <article
      className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl flex flex-col select-none"
      style={{
        boxShadow: isLoaded ? `0 10px 30px -15px ${ambientColor}33` : undefined,
      }}
    >
      {/* Artwork Container */}
      <div
        className="relative w-full aspect-[2/3] overflow-hidden cursor-pointer bg-zinc-950"
        onClick={() => onInspect(media)}
      >
        {/* Loading Skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950 animate-pulse" />
        )}

        {/* High-Resolution Key Visual */}
        <img
          src={media.coverImage.extraLarge || media.coverImage.large}
          alt={title}
          fetchPriority={isLcp ? 'high' : undefined}
          loading={isLcp ? undefined : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Recommendation Reason Badge (Top) */}
        {media.recommendationReason && (
          <div className="absolute top-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
            <span className="inline-block max-w-full truncate px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-zinc-800">
              {media.recommendationReason}
            </span>
          </div>
        )}

        {/* Hover / Active Gradient & Details Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 pointer-events-none">
          
          <div className="pointer-events-auto space-y-2">
            {/* Quick Action Control Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-zinc-950/90 backdrop-blur-md p-1 rounded-lg border border-zinc-800">
                {/* Watchlist Bookmark */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist(media);
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    isInWatchlist
                      ? 'text-amber-400 bg-amber-500/20'
                      : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'
                  }`}
                  title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  aria-label="Toggle Watchlist"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isInWatchlist ? 'fill-current' : ''}`} />
                </button>

                {/* Favorite */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(media);
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    isFavorite
                      ? 'text-rose-400 bg-rose-500/20'
                      : 'text-zinc-400 hover:text-rose-300 hover:bg-zinc-800'
                  }`}
                  title={isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
                  aria-label="Toggle Favorite"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Dismiss */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDislike(media);
                  }}
                  className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Not interested"
                  aria-label="Dismiss artwork"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inspect Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect(media);
                }}
                className="p-1.5 rounded-lg bg-zinc-950/90 backdrop-blur-md text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                title="View Full Cinematic Artwork"
                aria-label="Inspect artwork"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Editorial Metadata Footer */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800/80 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
              {media.format}
            </span>
            {media.averageScore && (
              <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                {(media.averageScore / 10).toFixed(1)}
              </span>
            )}
          </div>

          <h3
            className="font-serif font-medium text-sm text-zinc-100 line-clamp-1 cursor-pointer hover:text-amber-300 transition-colors"
            onClick={() => onInspect(media)}
            title={title}
          >
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 mt-2 border-t border-zinc-800/60 font-sans">
          <span className="truncate max-w-[130px]" title={media.studios[0] || 'Studio'}>
            {media.studios[0] || 'Official'}
          </span>
          <span className="font-mono text-[10px] shrink-0">
            {media.seasonYear || (media.duration ? `${media.duration}m` : '')}
          </span>
        </div>
      </div>
    </article>
  );
};
