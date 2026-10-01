import React, { useEffect, useState } from 'react';
import { X, Heart, Star, Play, ExternalLink, Sparkles } from 'lucide-react';
import type { AnimeMedia, WatchlistStatus } from '../api/types';

interface AnimeDetailModalProps {
  media: AnimeMedia | null;
  isOpen: boolean;
  onClose: () => void;
  watchlistStatus: WatchlistStatus | null;
  isFavorite: boolean;
  onUpdateStatus: (media: AnimeMedia, status: WatchlistStatus | null) => void;
  onToggleFavorite: (media: AnimeMedia) => void;
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({
  media,
  isOpen,
  onClose,
  watchlistStatus,
  isFavorite,
  onUpdateStatus,
  onToggleFavorite,
}) => {
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  useEffect(() => {
    setIsPlayingTrailer(false);
  }, [media?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  const title = media.title.english || media.title.romaji;
  const subtitle = media.title.english ? media.title.romaji : media.title.native;
  const hasTrailer = media.trailer?.id && media.trailer.site === 'youtube';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/85 backdrop-blur-md transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl w-full max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors"
          title="Close"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Panoramic Banner Artwork Header */}
        <div className="relative w-full h-48 sm:h-64 bg-zinc-950 overflow-hidden shrink-0">
          {media.bannerImage ? (
            <img
              src={media.bannerImage}
              alt={title}
              className="w-full h-full object-cover object-center opacity-70"
            />
          ) : (
            <div
              className="w-full h-full opacity-30"
              style={{ backgroundColor: media.coverImage.color || '#3F3F46' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />

          {/* Quick Meta Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-300 border border-zinc-800">
                  {media.format}
                </span>
                {media.seasonYear && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {media.season} {media.seasonYear}
                  </span>
                )}
                {media.averageScore && (
                  <span className="flex items-center gap-1 text-xs font-mono font-medium text-amber-400 px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800">
                    <Star className="w-3 h-3 fill-current" />
                    {(media.averageScore / 10).toFixed(1)} / 10
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-3xl font-serif font-medium text-zinc-100 leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-zinc-400 font-sans italic mt-0.5">{subtitle}</p>
              )}
            </div>

            {/* Trailer Action */}
            {hasTrailer && !isPlayingTrailer && (
              <button
                onClick={() => setIsPlayingTrailer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium backdrop-blur-md transition-all shadow-md shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-zinc-900">
          
          {/* Trailer Player Overlay (if active) */}
          {isPlayingTrailer && hasTrailer && (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${media.trailer!.id}?autoplay=1`}
                title={`${title} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Action & Status Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Watchlist Status:</span>
              <div className="flex items-center gap-1.5">
                {(['plan_to_watch', 'watching', 'completed'] as WatchlistStatus[]).map((st) => {
                  const isCurrent = watchlistStatus === st;
                  const label = st === 'plan_to_watch' ? 'Plan to Watch' : st === 'watching' ? 'Watching' : 'Completed';
                  return (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(media, isCurrent ? null : st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(media)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-rose-300 border-zinc-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>
          </div>

          {/* Recommendation Explanation */}
          {media.recommendationReason && (
            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-zinc-100 block mb-0.5">Why recommended:</span>
                <p className="text-zinc-400">{media.recommendationReason}</p>
              </div>
            </div>
          )}

          {/* Synopsis & Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Synopsis</h4>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                {media.description || 'No official synopsis available.'}
              </p>
            </div>

            {/* Metadata Sidebar */}
            <div className="space-y-4 p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs">
              <div>
                <span className="text-zinc-500 block mb-0.5">Animation Studio</span>
                <span className="text-zinc-200 font-medium">{media.studios.join(', ') || 'Independent'}</span>
              </div>

              <div>
                <span className="text-zinc-500 block mb-0.5">Format & Runtime</span>
                <span className="text-zinc-200 font-medium">
                  {media.format} {media.episodes ? `• ${media.episodes} episodes` : ''} {media.duration ? `(${media.duration}m)` : ''}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block mb-0.5">Genres</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {media.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {media.tags.length > 0 && (
                <div>
                  <span className="text-zinc-500 block mb-0.5">Thematic Tags</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {media.tags.slice(0, 6).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800/80">
                <a
                  href={media.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <span>View on AniList</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
