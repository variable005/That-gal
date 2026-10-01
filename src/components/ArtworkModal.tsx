import React, { useEffect, useState } from 'react';
import { X, Heart, Bookmark, Play, Star, ExternalLink, Sparkles } from 'lucide-react';
import type { AnimeMedia } from '../api/types';

interface ArtworkModalProps {
  media: AnimeMedia | null;
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (media: AnimeMedia) => void;
  onToggleSave: (media: AnimeMedia) => void;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  media,
  isOpen,
  onClose,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
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
  const hasTrailer = media.trailer?.id && media.trailer.site === 'youtube';
  const bannerImage = media.bannerImage || media.coverImage.extraLarge;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/90 backdrop-blur-xl transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-5xl w-full max-h-[94vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors shadow-lg"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Panoramic Artwork Hero Banner */}
        <div className="relative w-full h-64 sm:h-80 bg-zinc-950 overflow-hidden shrink-0">
          <img
            src={bannerImage}
            alt={title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

          {/* Banner Meta Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <div className="max-w-2xl space-y-1">
              <div className="flex items-center gap-2 mb-1 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-300 border border-zinc-800">
                  {media.format}
                </span>
                <span className="text-zinc-300 font-medium">{media.studios[0] || 'Official'}</span>
                {media.averageScore && (
                  <span className="flex items-center gap-1 text-amber-400 font-medium px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800">
                    <Star className="w-3 h-3 fill-current" />
                    {(media.averageScore / 10).toFixed(1)}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif font-medium text-zinc-100 leading-tight">
                {title}
              </h2>
            </div>

            {hasTrailer && !isPlayingTrailer && (
              <button
                onClick={() => setIsPlayingTrailer(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium backdrop-blur-md transition-all shadow-xl shrink-0"
              >
                <Play className="w-4 h-4 fill-current text-amber-400" />
                <span>Play Official Trailer</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-zinc-900">
          {/* Trailer Player */}
          {isPlayingTrailer && hasTrailer && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${media.trailer!.id}?autoplay=1`}
                title={`${title} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Quick Reaction Dock */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleLike(media)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isLiked
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-zinc-900 text-zinc-300 hover:text-rose-300 border-zinc-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
                <span>{isLiked ? 'Liked Visual Style' : 'Like Visual Style'}</span>
              </button>

              <button
                onClick={() => onToggleSave(media)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-300 hover:text-amber-300 border-zinc-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-amber-400' : ''}`} />
                <span>{isSaved ? 'Collected to Vault' : 'Save to Vault'}</span>
              </button>
            </div>

            <a
              href={media.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <span>View AniList Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Recommendation Reason */}
          {media.recommendationReason && (
            <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-zinc-100 block mb-0.5">Recommendation Context</span>
                <p className="text-zinc-400">{media.recommendationReason}</p>
              </div>
            </div>
          )}

          {/* Two-Column Artwork & Synopsis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {/* High-Res Vertical Poster */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                Official Poster Key Art
              </span>
              <img
                src={media.coverImage.extraLarge || media.coverImage.large}
                alt={title}
                className="w-full rounded-2xl border border-zinc-800 shadow-xl object-cover"
              />
            </div>

            {/* Synopsis and Tag Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                  Synopsis
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                  {media.description || 'No official synopsis available.'}
                </p>
              </div>

              {/* Genres */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Genres
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {media.genres.map((g) => (
                    <span key={g} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Thematic Descriptors */}
              {media.tags.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
                    Visual & Storytelling Themes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {media.tags.slice(0, 8).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
