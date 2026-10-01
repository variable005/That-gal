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

  // Keyboard navigation: Left/Right arrows, Space, A/D, L for like, S for save, V for toggle view
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
      <div className="w-full h-[85vh] flex items-center justify-center bg-[#070709] rounded-2xl border border-zinc-900">
        <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Loading artwork...</span>
      </div>
    );
  }

  const title = current.title.english || current.title.romaji;
  const liked = isLiked(current.id);
  const saved = isSaved(current.id);
  const ambientColor = current.coverImage.color || '#3F3F46';
  
  const banner = current.bannerImage;
  const poster = current.coverImage.extraLarge;
  const activeImage = viewMode === 'poster' || !banner ? poster : banner;
  const hasTrailer = current.trailer?.id && current.trailer.site === 'youtube';

  const metaString = [
    current.studios[0],
    current.seasonYear,
    current.format,
    current.averageScore ? `${(current.averageScore / 10).toFixed(1)}/10` : null,
  ].filter(Boolean).join(' • ');

  return (
    <div className="relative w-full h-[82vh] sm:h-[86vh] rounded-2xl overflow-hidden bg-[#070709] border border-zinc-900 shadow-2xl flex items-center justify-center select-none group">
      
      {/* Ambient Diffused Color Glow */}
      <div
        className="absolute inset-0 opacity-20 filter blur-3xl pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: ambientColor }}
      />

      {/* Ambient Blurred Artwork Backdrop (prevents dead space while keeping foreground 100% uncropped) */}
      <img
        key={`backdrop-${current.id}-${viewMode}`}
        src={activeImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-20 scale-110 pointer-events-none transition-opacity duration-700"
      />

      {/* Foreground Uncropped Artwork Hero */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-6 md:p-8">
        {!isImageLoaded && (
          <div className="absolute inset-8 rounded-xl bg-zinc-950/60 animate-pulse pointer-events-none" />
        )}
        <img
          key={`hero-${current.id}-${viewMode}`}
          src={activeImage}
          alt={title}
          onLoad={() => setIsImageLoaded(true)}
          className={`max-w-full max-h-full object-contain rounded-xl shadow-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] transition-all duration-500 ${
            isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
          }`}
        />
      </div>

      {/* Soft Vignette strictly at the very bottom edge for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none z-10" />

      {/* Top HUD: Index & Banner/Poster Switcher */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="font-mono text-[11px] text-zinc-400 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800/80 shadow">
          <span>{String(currentIndex + 1).padStart(2, '0')} / {String(mediaList.length).padStart(2, '0')}</span>
        </div>

        {banner && (
          <div className="flex items-center bg-zinc-950/80 backdrop-blur-md p-0.5 rounded-full border border-zinc-800/80 font-mono text-[10px] shadow">
            <button
              onClick={() => setViewMode('banner')}
              className={`px-3 py-0.5 rounded-full transition-all ${
                viewMode === 'banner'
                  ? 'bg-zinc-100 text-zinc-950 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              BANNER
            </button>
            <button
              onClick={() => setViewMode('poster')}
              className={`px-3 py-0.5 rounded-full transition-all ${
                viewMode === 'poster'
                  ? 'bg-zinc-100 text-zinc-950 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              POSTER
            </button>
          </div>
        )}
      </div>

      {/* Clickable Nav Zones (Left 15% and Right 15%) with subtle hover chevrons */}
      <div 
        onClick={() => {
          if (currentIndex > 0) onIndexChange(currentIndex - 1);
        }}
        className={`absolute inset-y-0 left-0 w-20 sm:w-28 z-20 flex items-center justify-start pl-4 cursor-pointer transition-opacity ${
          currentIndex === 0 ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover:opacity-100'
        }`}
        title="Previous (←)"
      >
        <div className="p-2.5 rounded-full bg-zinc-950/80 backdrop-blur-md text-zinc-300 hover:text-white border border-zinc-800 shadow-xl transition-all">
          <ChevronLeft className="w-5 h-5" />
        </div>
      </div>

      <div 
        onClick={() => {
          if (currentIndex < mediaList.length - 1) onIndexChange(currentIndex + 1);
        }}
        className={`absolute inset-y-0 right-0 w-20 sm:w-28 z-20 flex items-center justify-end pr-4 cursor-pointer transition-opacity ${
          currentIndex === mediaList.length - 1 ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover:opacity-100'
        }`}
        title="Next (→ / Space)"
      >
        <div className="p-2.5 rounded-full bg-zinc-950/80 backdrop-blur-md text-zinc-300 hover:text-white border border-zinc-800 shadow-xl transition-all">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom HUD: Small Mono Font in Left Corner + Micro-Action Dock in Right Corner */}
      <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 z-20 flex items-end justify-between gap-4 pointer-events-none">
        
        {/* Left Corner: Small Mono Font */}
        <div className="pointer-events-auto space-y-0.5 text-left max-w-lg">
          <h1
            onClick={() => onInspect(current)}
            className="font-mono text-sm sm:text-base font-medium text-zinc-100 tracking-tight cursor-pointer hover:text-amber-200 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          >
            {title}
          </h1>
          <p className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {metaString}
          </p>
        </div>

        {/* Right Corner: Glass Action Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 shadow-2xl pointer-events-auto">
          {/* Like */}
          <button
            onClick={() => onToggleLike(current)}
            className={`p-2 rounded-full transition-all ${
              liked
                ? 'bg-rose-500/30 text-rose-300'
                : 'text-zinc-400 hover:text-rose-300 hover:bg-zinc-900'
            }`}
            title="Like (L)"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current text-rose-400' : ''}`} />
          </button>

          {/* Collect */}
          <button
            onClick={() => onToggleSave(current)}
            className={`p-2 rounded-full transition-all ${
              saved
                ? 'bg-amber-500/30 text-amber-300'
                : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900'
            }`}
            title="Collect to Vault (S)"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current text-amber-400' : ''}`} />
          </button>

          {/* Official PV Trailer */}
          {hasTrailer && (
            <button
              onClick={() => onInspect(current)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-zinc-300 hover:text-amber-300 hover:bg-zinc-900 text-[10px] font-mono transition-all"
              title="Official Trailer"
            >
              <Play className="w-3 h-3 fill-current text-amber-400" />
              <span>PV</span>
            </button>
          )}

          {/* Lightbox */}
          <button
            onClick={() => onInspect(current)}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            title="Inspect Artwork"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
