import React from 'react';
import { Bookmark, Trash2, Sparkles, Maximize2, Heart } from 'lucide-react';
import type { AnimeMedia } from '../api/types';

interface VaultViewProps {
  savedList: AnimeMedia[];
  isLiked: (id: number) => boolean;
  onToggleLike: (media: AnimeMedia) => void;
  onToggleSave: (media: AnimeMedia) => void;
  onInspect: (media: AnimeMedia) => void;
  onClearVault: () => void;
  onGoToDiscovery: () => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  savedList,
  isLiked,
  onToggleLike,
  onToggleSave,
  onInspect,
  onClearVault,
  onGoToDiscovery,
}) => {
  if (savedList.length === 0) {
    return (
      <div className="my-20 text-center max-w-md mx-auto p-10 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto mb-4 border border-zinc-800">
          <Bookmark className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-mono font-medium text-zinc-100 mb-2">
          Visual Vault Empty
        </h3>
        <p className="text-xs text-zinc-400 font-mono mb-6 leading-relaxed">
          Artwork banners you collect will be archived here in full panoramic resolution.
        </p>
        <button
          onClick={onGoToDiscovery}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-100 text-zinc-950 text-xs font-mono font-medium transition-all shadow-lg hover:bg-white"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Discover Banners</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div>
          <h2 className="text-lg font-mono font-medium text-zinc-100">
            Collected Vault
          </h2>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
            {savedList.length} banner{savedList.length === 1 ? '' : 's'} archived
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Clear all saved banners from your vault?')) {
              onClearVault();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 text-xs font-mono transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear Vault</span>
        </button>
      </div>

      {/* Panoramic Art Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedList.map((media) => {
          const title = media.title.english || media.title.romaji;
          const displayImage = media.bannerImage || media.coverImage.extraLarge;
          const liked = isLiked(media.id);

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
              <div
                className="relative aspect-[16/8] overflow-hidden cursor-pointer bg-zinc-950"
                onClick={() => onInspect(media)}
              >
                <img
                  src={displayImage}
                  alt={title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Minimal Bottom Shadow for mono readability */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                {/* Left Corner: Small Mono Font */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 pointer-events-none text-left space-y-0.5">
                  <h3 className="font-mono text-xs sm:text-sm font-medium text-zinc-100 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-1">
                    {title}
                  </h3>
                  <p className="font-mono text-[10px] text-zinc-400 tracking-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {metaString}
                  </p>
                </div>

                {/* Right Corner: Actions */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(media);
                    }}
                    className={`p-1.5 rounded-lg border backdrop-blur-md transition-colors ${
                      liked
                        ? 'bg-rose-500/30 text-rose-300 border-rose-500/40'
                        : 'bg-zinc-950/80 text-zinc-400 hover:text-rose-300 border-zinc-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current text-rose-400' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(media);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md"
                    title="Remove from vault"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspect(media);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 backdrop-blur-md"
                    title="Inspect"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
