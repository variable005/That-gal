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
      <div className="my-20 text-center max-w-md mx-auto p-10 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4 border border-zinc-700">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif font-medium text-zinc-100 mb-2">
          Your Visual Vault is Empty
        </h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Artwork banners you collect while browsing will be archived here in full panoramic resolution.
        </p>
        <button
          onClick={onGoToDiscovery}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-xs font-medium transition-all shadow-lg hover:bg-white"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Discover Cinematic Banners</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-zinc-100">
            Collected Visual Vault
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            {savedList.length} panoramic banner{savedList.length === 1 ? '' : 's'} archived
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Clear all saved banners from your vault?')) {
              onClearVault();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Vault</span>
        </button>
      </div>

      {/* Panoramic Art Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedList.map((media) => {
          const title = media.title.english || media.title.romaji;
          const displayImage = media.bannerImage || media.coverImage.extraLarge;
          const liked = isLiked(media.id);

          return (
            <article
              key={media.id}
              className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl transition-all duration-300 hover:border-zinc-700"
            >
              <div
                className="relative aspect-[16/8] overflow-hidden cursor-pointer bg-zinc-950"
                onClick={() => onInspect(media)}
              >
                <img
                  src={displayImage}
                  alt={title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent pointer-events-none" />

                {/* Top Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(media);
                    }}
                    className={`p-2 rounded-lg border backdrop-blur-md transition-colors ${
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
                    className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md"
                    title="Remove from vault"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspect(media);
                    }}
                    className="p-2 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 backdrop-blur-md"
                    title="Inspect"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Meta */}
                <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">
                    {media.format} • {media.studios[0] || 'Official'}
                  </span>
                  <h3 className="font-serif font-medium text-base text-zinc-100 line-clamp-1">
                    {title}
                  </h3>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
