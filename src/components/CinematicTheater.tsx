import React, { useEffect, useState } from 'react';
import { Heart, Bookmark, ChevronLeft, ChevronRight, Play, Maximize2 } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'banner' | 'poster'>('banner');
  const current = mediaList[currentIndex];

  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentIndex, viewMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'KeyD' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        if (currentIndex < mediaList.length - 1) onIndexChange(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        e.preventDefault();
        if (currentIndex > 0) onIndexChange(currentIndex - 1);
      } else if (e.key === 'KeyL' && current) {
        onToggleLike(current);
      } else if (e.key === 'KeyS' && current) {
        onToggleSave(current);
      } else if (e.key === 'KeyV') {
        setViewMode((prev) => (prev === 'banner' ? 'poster' : 'banner'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, mediaList, onIndexChange, current, onToggleLike, onToggleSave]);

  if (!current) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-900">
        <span className="text-[11px] text-zinc-500 font-mono">Loading cinematic artwork...</span>
      </div>
    );
  }

  const title = current.title.english || current.title.romaji;
  const liked = isLiked(current.id);
  const saved = isSaved(current.id);
  const ambientColor = current.coverImage.color || '#3F3F46';
  
  // High quality artwork selection
  const banner = current.bannerImage;
  const poster = current.coverImage.extraLarge;
  const displayImage = viewMode === 'poster' || !banner ? poster : banner;
  const hasTrailer = current.trailer?.id && current.trailer.site === 'youtube';

  const metaString = [
    current.studios[0],
    current.seasonYear,
    current.format,
    current.averageScore ? `${(current.averageScore / 10).toFixed(1)}/10` : null,
  ].filter(Boolean).join(' • ');

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl flex flex-col justify-between select-none">
      
      {/* Background Ambient Glow (Extremely subtle, behind artwork) */}
      <div
        className="absolute inset-0 opacity-15 filter blur-3xl transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: ambientColor }}
      />

      {/* Main Full-Quality Image Canvas */}
      <div 
        className={`relative w-full overflow-hidden bg-zinc-950 flex items-center justify-center transition-all ${
          viewMode === 'poster' 
            ? 'h-[75vh] sm:h-[84vh]' 
            : 'h-[65vh] sm:h-[78vh] lg:h-[84vh]'
        }`}
      >
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-zinc-950/80 animate-pulse" />
        )}
        
        <img
          key={`${current.id}-${viewMode}`}
          src={displayImage}
          alt={title}
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-center transition-opacity duration-500 ${
            viewMode === 'poster' ? 'object-contain' : 'object-cover'
          } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Minimal Bottom Shadow strictly for small mono font legibility - leaves 90% of image 100% untouched */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
      </div>

      {/* Top Bar: Minimal Index Counter & View Mode Switcher */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="font-mono text-[10px] text-zinc-400 bg-zinc-950/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-800/80">
          <span>{String(currentIndex + 1).padStart(2, '0')} / {String(mediaList.length).padStart(2, '0')}</span>
        </div>

        {banner && (
          <div className="flex items-center gap-1 bg-zinc-950/70 backdrop-blur-md p-0.5 rounded-md border border-zinc-800/80 font-mono text-[10px]">
            <button
              onClick={() => setViewMode('banner')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'banner'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              BANNER
            </button>
            <button
              onClick={() => setViewMode('poster')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'poster'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              POSTER
            </button>
          </div>
        )}
      </div>

      {/* Center Left/Right Arrow Navigators */}
      <div className="absolute inset-y-0 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => {
            if (currentIndex > 0) onIndexChange(currentIndex - 1);
          }}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-full bg-zinc-950/60 hover:bg-zinc-900/90 backdrop-blur-md text-zinc-300 hover:text-zinc-100 border border-zinc-800/80 disabled:opacity-0 pointer-events-auto transition-all shadow-lg"
          title="Previous (Left Arrow)"
          aria-label="Previous Artwork"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            if (currentIndex < mediaList.length - 1) onIndexChange(currentIndex + 1);
          }}
          disabled={currentIndex === mediaList.length - 1}
          className="p-2.5 rounded-full bg-zinc-950/60 hover:bg-zinc-900/90 backdrop-blur-md text-zinc-300 hover:text-zinc-100 border border-zinc-800/80 disabled:opacity-0 pointer-events-auto transition-all shadow-lg"
          title="Next (Right Arrow or Space)"
          aria-label="Next Artwork"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Area: Small Mono Font in Left Corner + Subtle Micro-Buttons in Right Corner */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4 pointer-events-none">
        
        {/* Left Corner: Clean Small Mono Font as Requested */}
        <div className="pointer-events-auto space-y-0.5 text-left max-w-lg">
          <h2
            onClick={() => onInspect(current)}
            className="font-mono text-xs sm:text-sm font-medium text-zinc-100 tracking-tight cursor-pointer hover:text-amber-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          >
            {title}
          </h2>
          <p className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {metaString}
          </p>
        </div>

        {/* Right Corner: Minimal Micro-Control Icons */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          {/* Like */}
          <button
            onClick={() => onToggleLike(current)}
            className={`p-2 rounded-lg border backdrop-blur-md transition-all ${
              liked
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                : 'bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-rose-300 border-zinc-800/80'
            }`}
            title="Like (L)"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current text-rose-400' : ''}`} />
          </button>

          {/* Collect */}
          <button
            onClick={() => onToggleSave(current)}
            className={`p-2 rounded-lg border backdrop-blur-md transition-all ${
              saved
                ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                : 'bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-amber-300 border-zinc-800/80'
            }`}
            title="Collect to Vault (S)"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current text-amber-400' : ''}`} />
          </button>

          {/* Trailer */}
          {hasTrailer && (
            <button
              onClick={() => onInspect(current)}
              className="p-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800/80 backdrop-blur-md transition-all"
              title="Official Trailer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
            </button>
          )}

          {/* Full Lightbox */}
          <button
            onClick={() => onInspect(current)}
            className="p-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800/80 backdrop-blur-md transition-all"
            title="Inspect Full Image"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Sleek Filmstrip Dock below the artwork */}
      <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {mediaList.map((m, idx) => {
          const isSelected = idx === currentIndex;
          const thumb = m.bannerImage || m.coverImage.large;
          return (
            <button
              key={m.id}
              onClick={() => onIndexChange(idx)}
              className={`relative h-10 w-16 sm:w-20 rounded overflow-hidden shrink-0 border transition-all duration-150 ${
                isSelected
                  ? 'border-amber-400 opacity-100 scale-105'
                  : 'border-zinc-800/60 opacity-40 hover:opacity-80'
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
