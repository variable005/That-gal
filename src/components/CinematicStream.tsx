import React from 'react';
import { Heart, Bookmark, Play, Maximize2, Star, Sparkles } from 'lucide-react';
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

        return (
          <article
            key={media.id}
            className="group relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl transition-all duration-300 hover:border-zinc-700"
            style={{
              boxShadow: `0 20px 50px -20px ${ambientColor}22`,
            }}
          >
            {/* Massive Panoramic 16:9 / 21:9 Banner Canvas */}
            <div
              className="relative w-full aspect-[16/7] sm:aspect-[21/9] overflow-hidden cursor-pointer bg-zinc-950"
              onClick={() => onInspect(media)}
            >
              <img
                src={displayImage}
                alt={title}
                loading={idx < 2 ? undefined : 'lazy'}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-zinc-950/60 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Recommendation Badge */}
              {media.recommendationReason && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-950/85 backdrop-blur-md text-[11px] font-mono text-amber-300 border border-zinc-800">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{media.recommendationReason}</span>
                  </span>
                </div>
              )}

              {/* Floating Action Controls on Hover */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(media);
                  }}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
                    liked
                      ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                      : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-rose-300 border-zinc-800'
                  }`}
                  title="Like visual style"
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current text-rose-400' : ''}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(media);
                  }}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
                    saved
                      ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                      : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-amber-300 border-zinc-800'
                  }`}
                  title="Save to Collection"
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-amber-400' : ''}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspect(media);
                  }}
                  className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800 backdrop-blur-md transition-all"
                  title="Inspect Artwork"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Embedded Title Overlay (Bottom Left) */}
              <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
                <div className="max-w-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-zinc-300 border border-zinc-800">
                      {media.format}
                    </span>
                    <span className="text-zinc-400">{media.studios[0] || 'Official'}</span>
                    {media.averageScore && (
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {(media.averageScore / 10).toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-3xl font-serif font-medium text-zinc-100 leading-tight">
                    {title}
                  </h2>
                </div>

                {hasTrailer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspect(media);
                    }}
                    className="self-start sm:self-end flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs font-medium backdrop-blur-md transition-all pointer-events-auto shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-8 pb-12">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium tracking-wide border border-zinc-800 hover:border-zinc-700 transition-all shadow-xl disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isLoadingMore ? 'Discovering More Banners...' : 'Load More Artwork Banners'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
