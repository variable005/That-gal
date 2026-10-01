import React from 'react';
import { Heart, Bookmark, Play, Maximize2, Sparkles } from 'lucide-react';
import type { AnimeMedia } from '../api/types';

interface CinematicStreamProps {
  mediaList: AnimeMedia[];
  isLiked: (id: number) => boolean;
  isSaved: (id: number) => boolean;
  onToggleLike: (media: AnimeMedia) => void;
  onToggleSave: (media: AnimeMedia) => void;
  onInspect: (media: AnimeMedia) => void;
  onLoadMore: () => void;
  hasNextPage: boolean;
  isLoadingMore: boolean;
}

export const CinematicStream: React.FC<CinematicStreamProps> = ({
  mediaList,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onInspect,
  onLoadMore,
  hasNextPage,
  isLoadingMore,
}) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {mediaList.map((media, idx) => {
        const title = media.title.english || media.title.romaji;
        const liked = isLiked(media.id);
        const saved = isSaved(media.id);
        const displayImage = media.bannerImage || media.coverImage.extraLarge;
        const hasTrailer = media.trailer?.id && media.trailer.site === 'youtube';

        const metaString = [
          media.studios[0],
          media.seasonYear,
          media.format,
          media.averageScore ? `${(media.averageScore / 10).toFixed(1)}/10` : null,
        ].filter(Boolean).join(' • ');

        return (
          <article
            key={media.id}
            className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-850 shadow-xl transition-all duration-300 hover:border-zinc-700"
          >
            {/* Full-Quality Panoramic Canvas */}
            <div
              className="relative w-full aspect-[16/7] sm:aspect-[21/9] overflow-hidden cursor-pointer bg-zinc-950"
              onClick={() => onInspect(media)}
            >
              <img
                src={displayImage}
                alt={title}
                loading={idx < 2 ? undefined : 'lazy'}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
              />

              {/* Minimal Bottom Shadow for mono font readability */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Minimal Small Mono Font in Bottom-Left Corner */}
              <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-10 pointer-events-none text-left space-y-0.5">
                <h3 className="font-mono text-xs sm:text-sm font-medium text-zinc-100 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {title}
                </h3>
                <p className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {metaString}
                </p>
              </div>

              {/* Micro-Actions in Bottom-Right Corner */}
              <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-10 flex items-center gap-1.5 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(media);
                  }}
                  className={`p-2 rounded-lg border backdrop-blur-md transition-all ${
                    liked
                      ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                      : 'bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-rose-300 border-zinc-800/80'
                  }`}
                  title="Like"
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current text-rose-400' : ''}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(media);
                  }}
                  className={`p-2 rounded-lg border backdrop-blur-md transition-all ${
                    saved
                      ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                      : 'bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-amber-300 border-zinc-800/80'
                  }`}
                  title="Collect"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current text-amber-400' : ''}`} />
                </button>

                {hasTrailer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspect(media);
                    }}
                    className="p-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800/80 backdrop-blur-md transition-all"
                    title="Watch Trailer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspect(media);
                  }}
                  className="p-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800/80 backdrop-blur-md transition-all"
                  title="Expand"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        );
      })}

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4 pb-12">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-800 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isLoadingMore ? 'Loading artwork...' : 'Load More Banners'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
