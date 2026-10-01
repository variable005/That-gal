import React from 'react';
import { Sliders, RotateCcw, Building2, Tag, Compass } from 'lucide-react';
import type { UserTasteProfile } from '../api/types';

interface TasteViewProps {
  tasteProfile: UserTasteProfile;
  watchlistCount: number;
  onResetTaste: () => void;
  onGoToDiscovery: () => void;
}

export const TasteView: React.FC<TasteViewProps> = ({
  tasteProfile,
  watchlistCount,
  onResetTaste,
  onGoToDiscovery,
}) => {
  // Sort studios descending
  const studios = Object.entries(tasteProfile.studioWeights)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Sort genres descending
  const genres = Object.entries(tasteProfile.genreWeights)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // Sort thematic tags descending
  const tags = Object.entries(tasteProfile.tagWeights)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);

  const maxGenreWeight = genres[0]?.[1] || 1;
  const maxStudioWeight = studios[0]?.[1] || 1;

  const hasData = studios.length > 0 || genres.length > 0 || watchlistCount > 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-mono mb-2">
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Learned Taste Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-zinc-100">
            Aesthetic Knowledge Base
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            This transparent profile models your visual, directorial, and thematic preferences.
            Weights update incrementally with every bookmark, favorite, and dismissal.
          </p>
        </div>

        {hasData && (
          <button
            onClick={() => {
              if (window.confirm('Reset all learned taste weights? This cannot be undone.')) {
                onResetTaste();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-300 border border-zinc-800 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Weights</span>
          </button>
        )}
      </div>

      {!hasData ? (
        <div className="my-16 text-center max-w-md mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          <Sliders className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-medium text-zinc-100 mb-1">
            Taste Profile in Initialization
          </h3>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            As you bookmark anime to your Watchlist, favorite titles, or dismiss suggestions, the engine will map your preferred studios and genres here.
          </p>
          <button
            onClick={onGoToDiscovery}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-medium transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Start Browsing Artwork</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Studio Affinities Section */}
          <section className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Animation Studio Affinities</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">Weight</span>
            </div>

            {studios.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4">No studio patterns detected yet.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {studios.map(([studio, weight]) => {
                  const pct = Math.round((weight / maxStudioWeight) * 100);
                  return (
                    <div key={studio} className="space-y-1">
                      <div className="flex justify-between text-xs font-sans">
                        <span className="text-zinc-300 font-medium">{studio}</span>
                        <span className="font-mono text-zinc-400">+{weight.toFixed(1)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Genre Preferences Section */}
          <section className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>Genre Distribution</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">Strength</span>
            </div>

            {genres.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4">No genre patterns detected yet.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {genres.map(([genre, weight]) => {
                  const pct = Math.round((weight / maxGenreWeight) * 100);
                  return (
                    <div key={genre} className="space-y-1">
                      <div className="flex justify-between text-xs font-sans">
                        <span className="text-zinc-300 font-medium">{genre}</span>
                        <span className="font-mono text-zinc-400">+{weight.toFixed(1)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Thematic Motifs Section */}
          {tags.length > 0 && (
            <section className="md:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <h3 className="text-sm font-medium text-zinc-200">
                Top Visual & Storytelling Motifs
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map(([tag, weight]) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-xs text-zinc-300 border border-zinc-800 font-sans"
                  >
                    <span>{tag}</span>
                    <span className="font-mono text-[10px] text-zinc-500">+{weight.toFixed(0)}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* How Recommendations Work Note */}
          <section className="md:col-span-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-400 space-y-1 leading-relaxed">
            <span className="text-zinc-200 font-medium block">How scoring works:</span>
            <p>
              Recommendations blend <strong className="text-zinc-300">60% demonstrated affinity</strong> (matching your favorite studios, genres, and movie preferences), <strong className="text-zinc-300">25% adjacent discoveries</strong> (titles sharing creators or visual themes), and <strong className="text-zinc-300">15% critical wildcards</strong> to prevent repetitive echo chambers.
            </p>
          </section>

        </div>
      )}
    </div>
  );
};
