import React, { useEffect, useState } from 'react';
import { Heart, Bookmark, ChevronLeft, ChevronRight, Play, Maximize2, Sparkles, Star } from 'lucide-react';
import type { AnimeMedia } from '../api/types';

interface CinematicTheaterProps {
  mediaList: AnimeMedia[];
  currentIndex: number;
  onIndexChange: (idx: number) => void;
  isLiked: (id: number) => boolean;
  isSaved: (id: number) => boolean;
  onToggleLike: (media: AnimeMedia) => void;
  onToggleSave: (media: AnimeMedia) => void;
  onInspect: (media: AnimeMedia) => void;
}

export const CinematicTheater: React.FC<CinematicTheaterProps> = ({
  mediaList,
  currentIndex,
  onIndexChange,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onInspect,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const current = mediaList[currentIndex];

  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'KeyD' || e.key === ' ' && !e.shiftKey) {
        e.preventDefault();
        if (currentIndex < mediaList.length - 1) onIndexChange(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        e.preventDefault();
        if (currentIndex > 0) onIndexChange(currentIndex - 1);
      } else if (e.key === 'KeyL' && current) {
        onToggleLike(current);
      } else if (e.key === 'KeyS' && current) {
        onToggleSave(current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, mediaList, onIndexChange, current, onToggleLike, onToggleSave]);

  if (!current) {
    return (
      <div className="w-full h-[75vh] flex items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-900">
        <span className="text-xs text-zinc-500 font-mono">Loading cinematic artwork...</span>
      </div>
    );
  }

  const title = current.title.english || current.title.romaji;
  const liked = isLiked(current.id);
  const saved = isSaved(current.id);
  const ambientColor = current.coverImage.color || '#3F3F46';
  const displayImage = current.bannerImage || current.coverImage.extraLarge;
  const hasTrailer = current.trailer?.id && current.trailer.site === 'youtube';

  return (
    <div className="relative w-full h-[76vh] sm:h-[82vh] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl flex flex-col justify-between select-none">
      
      {/* Background Ambient Color Tint */}
      <div
        className="absolute inset-0 opacity-25 filter blur-3xl transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: ambientColor }}
      />

      {/* Primary Panoramic Banner Artwork */}
      <div className="absolute inset-0 overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-zinc-950 animate-pulse" />
        )}
        <img
          key={displayImage}
          src={displayImage}
          alt={title}
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover object-center transition-all duration-700 ${
            isImageLoaded ? 'opacity-90 scale-100' : 'opacity-0 scale-105'
          }`}
        />

        {/* Cinematic Vignette & Gradients (Top and Bottom) */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/50 pointer-events-none" />
      </div>

      {/* Top Bar: Progress & Counter */}
      <div className="relative z-20 p-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md text-[11px] font-mono text-zinc-300 border border-zinc-800">
            {currentIndex + 1} / {mediaList.length}
          </span>
          {current.recommendationReason && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md text-[11px] font-mono text-amber-300 border border-zinc-800">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{current.recommendationReason}</span>
            </span>
          )}
        </div>

        {/* Format & Studio Badge */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="px-2 py-0.5 rounded bg-zinc-900/90 backdrop-blur-md border border-zinc-800">
            {current.format}
          </span>
          <span className="hidden sm:inline text-zinc-300">
            {current.studios[0] || 'Official'}
          </span>
        </div>
      </div>

      {/* Center Left/Right Arrow Navigators */}
      <div className="absolute inset-y-0 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => {
            if (currentIndex > 0) onIndexChange(currentIndex - 1);
          }}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-zinc-950/70 hover:bg-zinc-900 backdrop-blur-md text-zinc-300 hover:text-zinc-100 border border-zinc-800 disabled:opacity-20 pointer-events-auto transition-all shadow-xl"
          title="Previous Artwork (Left Arrow)"
          aria-label="Previous Artwork"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            if (currentIndex < mediaList.length - 1) onIndexChange(currentIndex + 1);
          }}
          disabled={currentIndex === mediaList.length - 1}
          className="p-3 rounded-full bg-zinc-950/70 hover:bg-zinc-900 backdrop-blur-md text-zinc-300 hover:text-zinc-100 border border-zinc-800 disabled:opacity-20 pointer-events-auto transition-all shadow-xl"
          title="Next Artwork (Right Arrow or Space)"
          aria-label="Next Artwork"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Cinematic Control Dock */}
      <div className="relative z-20 p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pointer-events-auto">
        
        {/* Left: Title & Aesthetic Summary */}
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs">
            {current.averageScore && (
              <span className="flex items-center gap-1 font-mono text-amber-400 font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                {(current.averageScore / 10).toFixed(1)}
              </span>
            )}
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400 font-sans">
              {current.genres.slice(0, 3).join(' / ')}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl lg:text-5xl font-serif font-medium text-zinc-100 leading-tight tracking-tight drop-shadow-md cursor-pointer hover:text-amber-200 transition-colors"
            onClick={() => onInspect(current)}
          >
            {title}
          </h1>

          {current.description && (
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-xl font-sans leading-relaxed drop-shadow">
              {current.description}
            </p>
          )}
        </div>

        {/* Right: Primary Reaction Bar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Like */}
          <button
            onClick={() => onToggleLike(current)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium backdrop-blur-md transition-all shadow-lg ${
              liked
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/40 shadow-rose-950/50'
                : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-rose-300 border-zinc-800'
            }`}
            title="Like this visual style (L)"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current text-rose-400' : ''}`} />
            <span>{liked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Save to Collection */}
          <button
            onClick={() => onToggleSave(current)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium backdrop-blur-md transition-all shadow-lg ${
              saved
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-amber-950/50'
                : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-amber-300 border-zinc-800'
            }`}
            title="Collect to Visual Vault (S)"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-amber-400' : ''}`} />
            <span>{saved ? 'Collected' : 'Collect'}</span>
          </button>

          {/* Inspect / Trailer */}
          {hasTrailer && (
            <button
              onClick={() => onInspect(current)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs font-medium backdrop-blur-md transition-all shadow-lg"
              title="Watch Official PV"
            >
              <Play className="w-4 h-4 fill-current text-amber-400" />
              <span className="hidden sm:inline">Trailer</span>
            </button>
          )}

          {/* Full Lightbox */}
          <button
            onClick={() => onInspect(current)}
            className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800 backdrop-blur-md transition-colors shadow-lg"
            title="Inspect Full Artwork"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Filmstrip Mini-Thumbnails Dock at the bottom */}
      <div className="relative z-20 px-6 pb-4 overflow-x-auto scrollbar-none flex items-center gap-2 pointer-events-auto">
        {mediaList.map((m, idx) => {
          const isSelected = idx === currentIndex;
          const thumb = m.bannerImage || m.coverImage.large;
          return (
            <button
              key={m.id}
              onClick={() => onIndexChange(idx)}
              className={`relative h-12 w-20 rounded-md overflow-hidden shrink-0 border transition-all duration-200 ${
                isSelected
                  ? 'border-amber-400 scale-105 shadow-md opacity-100'
                  : 'border-zinc-800/80 opacity-40 hover:opacity-80'
              }`}
              title={m.title.english || m.title.romaji}
            >
              <img src={thumb} alt="" className="w-full h-full object-cover object-center" />
            </button>
          );
        })}
      </div>

    </div>
  );
};
