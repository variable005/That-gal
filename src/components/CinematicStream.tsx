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
    <div className="space-y-12 max-w-6xl mx-auto">
      {mediaList.map((media, idx) => {
        const title = media.title.english || media.title.romaji;
        const liked = isLiked(media.id);
        const saved = isSaved(media.id);
        const displayImage = media.bannerImage || media.coverImage.extraLarge;
        const ambientColor = media.coverImage.color || '#3F3F46';
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
            className="group relative rounded-2xl overflow-hidden bg-[#070709] border border-zinc-900 shadow-2xl transition-all duration-300"
          >
            {/* Ambient Diffused Glow */}
            <div
              className="absolute inset-0 opacity-15 filter blur-3xl pointer-events-none transition-all duration-700"
              style={{ backgroundColor: ambientColor }}
            />

            {/* Blurred Backdrop */}
            <img
              src={displayImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-20 scale-105 pointer-events-none"
            />

            {/* Foreground Uncropped Artwork */}
            <div
              className="relative w-full aspect-[16/7] sm:aspect-[21/9] flex items-center justify-center p-2 sm:p-4 cursor-pointer"
              onClick={() => onInspect(media)}
            >
              <img
                src={displayImage}
                alt={title}
                loading={idx < 2 ? undefined : 'lazy'}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />

              {/* Minimal Bottom Shadow strictly for mono font legibility */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Bottom-Left Corner: Small Mono Font */}
              <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-10 pointer-events-none text-left space-y-0.5">
                <h3 className="font-mono text-xs sm:text-sm font-medium text-zinc-100 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {title}
                </h3>
                <p className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {metaString}
                </p>
              </div>

              {/* Bottom-Right Corner: Glass Micro-Actions */}
              <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-10 flex items-center gap-1.5 p-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 shadow-xl pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(media);
                  }}
                  className={`p-2 rounded-full transition-all ${
                    liked
                      ? 'bg-rose-500/30 text-rose-300'
                      : 'text-zinc-400 hover:text-rose-300 hover:bg-zinc-900'
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
                  className={`p-2 rounded-full transition-all ${
                    saved
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900'
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-zinc-300 hover:text-amber-300 hover:bg-zinc-900 text-[10px] font-mono transition-all"
                    title="Official PV"
                  >
                    <Play className="w-3 h-3 fill-current text-amber-400" />
                    <span>PV</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspect(media);
                  }}
                  className="p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                  title="Inspect"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        );
      })}

      {/* Infinite Load Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4 pb-12">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-800 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isLoadingMore ? 'Loading artwork...' : 'Load More Banners'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
