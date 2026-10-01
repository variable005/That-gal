import React, { useEffect, useState } from 'react';
import { X, Heart, Bookmark, Play, ExternalLink } from 'lucide-react';
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
  const [artMode, setArtMode] = useState<'banner' | 'poster'>('banner');

  useEffect(() => {
    setIsPlayingTrailer(false);
    setArtMode('banner');
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
  const banner = media.bannerImage;
  const poster = media.coverImage.extraLarge;
  const currentImage = artMode === 'poster' || !banner ? poster : banner;

  const metaString = [
    media.studios[0],
    media.seasonYear,
    media.format,
    media.averageScore ? `${(media.averageScore / 10).toFixed(1)}/10` : null,
  ].filter(Boolean).join(' • ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-2xl transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-6xl w-full max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls Bar */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
          {banner && !isPlayingTrailer ? (
            <div className="flex items-center gap-1 bg-zinc-950/80 backdrop-blur-md p-1 rounded-md border border-zinc-800 font-mono text-[10px]">
              <button
                onClick={() => setArtMode('banner')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  artMode === 'banner'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                BANNER
              </button>
              <button
                onClick={() => setArtMode('poster')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  artMode === 'poster'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                POSTER
              </button>
            </div>
          ) : (
            <div />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors shadow-lg"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Central Artwork Viewport */}
        <div className="relative w-full h-[75vh] sm:h-[82vh] bg-black flex items-center justify-center overflow-hidden">
          {isPlayingTrailer && hasTrailer ? (
            <div className="w-full h-full max-w-5xl aspect-video p-4 flex items-center justify-center">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${media.trailer!.id}?autoplay=1`}
                title={`${title} Trailer`}
                className="w-full h-full rounded-xl border border-zinc-800 shadow-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <img
              key={`${media.id}-${artMode}`}
              src={currentImage}
              alt={title}
              className={`w-full h-full object-center transition-opacity duration-300 ${
                artMode === 'poster' ? 'object-contain' : 'object-cover sm:object-contain'
              }`}
            />
          )}

          {/* Minimal Bottom Shadow for mono font readability */}
          {!isPlayingTrailer && (
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Bottom Bar: Small Mono Font in Left Corner + Micro-Actions in Right Corner */}
        <div className="absolute bottom-4 left-4 right-4 z-30 flex items-end justify-between gap-4 pointer-events-none">
          {/* Left Corner: Small Mono Font */}
          <div className="pointer-events-auto space-y-0.5 text-left max-w-xl">
            <h3 className="font-mono text-xs sm:text-sm font-medium text-zinc-100 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {title}
            </h3>
            <p className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {metaString}
            </p>
          </div>

          {/* Right Corner: Micro Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            {hasTrailer && (
              <button
                onClick={() => setIsPlayingTrailer(!isPlayingTrailer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono backdrop-blur-md transition-all ${
                  isPlayingTrailer
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-950/80 text-zinc-300 hover:text-zinc-100 border-zinc-800'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span className="hidden sm:inline">{isPlayingTrailer ? 'Artwork' : 'Trailer'}</span>
              </button>
            )}

            <button
              onClick={() => onToggleLike(media)}
              className={`p-2 rounded-lg border backdrop-blur-md transition-all ${
                isLiked
                  ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                  : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-rose-300 border-zinc-800'
              }`}
              title="Like"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
            </button>

            <button
              onClick={() => onToggleSave(media)}
              className={`p-2 rounded-lg border backdrop-blur-md transition-all ${
                isSaved
                  ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                  : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-amber-300 border-zinc-800'
              }`}
              title="Collect to Vault"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-amber-400' : ''}`} />
            </button>

            <a
              href={`https://anilist.co/anime/${media.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 backdrop-blur-md transition-colors"
              title="AniList Source"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
