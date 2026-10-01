import { useState } from 'react';
import { Navbar, type MainTab } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { CinematicTheater } from './components/CinematicTheater';
import { CinematicStream } from './components/CinematicStream';
import { VaultView } from './components/VaultView';
import { TasteView } from './components/TasteView';
import { SettingsView } from './components/SettingsView';
import { ArtworkModal } from './components/ArtworkModal';
import { useAnimeDiscovery } from './hooks/useAnimeDiscovery';
import { useWatchlist } from './hooks/useWatchlist';
import type { AnimeMedia } from './api/types';
import { Sparkles, Loader2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('theater');
  const [theaterIndex, setTheaterIndex] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<AnimeMedia | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Watchlist & Taste hooks
  const {
    watchlistMap,
    watchlistEntries,
    tasteProfile,
    updateStatus,
    toggleFav,
    inspect,
    clearAllWatchlist,
    resetAllTaste,
    syncState,
  } = useWatchlist();

  // Discovery Feed hook
  const {
    feed,
    isLoading,
    isLoadingMore,
    filter,
    searchQuery,
    hasNextPage,
    setFilter,
    setSearchQuery,
    loadMore,
  } = useAnimeDiscovery();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSave = (media: AnimeMedia) => {
    const existing = watchlistMap.get(media.id);
    const title = media.title.english || media.title.romaji;
    if (existing) {
      updateStatus(media, null);
      showToast(`Removed "${title}" from Vault`);
    } else {
      updateStatus(media, 'plan_to_watch');
      showToast(`Archived "${title}" to Visual Vault`);
    }
  };

  const handleToggleFavorite = (media: AnimeMedia) => {
    const title = media.title.english || media.title.romaji;
    const isNowFav = toggleFav(media);
    showToast(isNowFav ? `Favorited aesthetic of "${title}"` : `Removed "${title}" from Favorites`);
  };

  const handleInspect = (media: AnimeMedia) => {
    setSelectedMedia(media);
    inspect(media);
  };

  const handleSelectFilter = (f: typeof filter) => {
    setFilter(f);
    setTheaterIndex(0);
  };

  const isLiked = (id: number) => Boolean(watchlistMap.get(id)?.isFavorite);
  const isSaved = (id: number) => watchlistMap.has(id);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900/95 backdrop-blur-md text-zinc-200 border border-zinc-700 shadow-2xl text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        vaultCount={watchlistEntries.length}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setTheaterIndex(0);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Curated Category Switcher for Theater & Stream */}
        {(activeTab === 'theater' || activeTab === 'stream') && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <FilterBar activeFilter={filter} onSelectFilter={handleSelectFilter} />
            
            <div className="text-right hidden md:block">
              <span className="text-[11px] font-mono text-zinc-300">
                {activeTab === 'theater' ? 'Use Arrow Keys / Space to advance' : 'Continuous Panoramic Stream'}
              </span>
            </div>
          </div>
        )}

        {/* TAB 1: Cinematic Full-bleed Theater */}
        {activeTab === 'theater' && (
          <div>
            {isLoading && feed.length === 0 ? (
              <div className="w-full h-[76vh] sm:h-[82vh] rounded-3xl bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="text-xs font-mono text-zinc-400">Loading high-resolution cinematic artwork...</span>
              </div>
            ) : (
              <CinematicTheater
                mediaList={feed}
                currentIndex={theaterIndex}
                onIndexChange={setTheaterIndex}
                isLiked={isLiked}
                isSaved={isSaved}
                onToggleLike={handleToggleFavorite}
                onToggleSave={handleToggleSave}
                onInspect={handleInspect}
              />
            )}
          </div>
        )}

        {/* TAB 2: Continuous Cinematic Stream */}
        {activeTab === 'stream' && (
          <div>
            {isLoading && feed.length === 0 ? (
              <div className="w-full py-32 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="text-xs font-mono text-zinc-400">Loading cinematic art stream...</span>
              </div>
            ) : (
              <CinematicStream
                mediaList={feed}
                isLiked={isLiked}
                isSaved={isSaved}
                onToggleLike={handleToggleFavorite}
                onToggleSave={handleToggleSave}
                onInspect={handleInspect}
                onLoadMore={loadMore}
                hasNextPage={hasNextPage}
                isLoadingMore={isLoadingMore}
              />
            )}
          </div>
        )}

        {/* TAB 3: Collected Vault */}
        {activeTab === 'vault' && (
          <VaultView
            savedList={watchlistEntries.map((e) => e.media)}
            isLiked={isLiked}
            onToggleLike={handleToggleFavorite}
            onToggleSave={handleToggleSave}
            onInspect={handleInspect}
            onClearVault={clearAllWatchlist}
            onGoToDiscovery={() => setActiveTab('theater')}
          />
        )}

        {/* TAB 4: Learned Taste Matrix */}
        {activeTab === 'taste' && (
          <TasteView
            tasteProfile={tasteProfile}
            watchlistCount={watchlistEntries.length}
            onResetTaste={resetAllTaste}
            onGoToDiscovery={() => setActiveTab('theater')}
          />
        )}

        {/* TAB 5: Settings & Backups */}
        {activeTab === 'settings' && (
          <SettingsView
            watchlistEntries={watchlistEntries}
            onClearWatchlist={clearAllWatchlist}
            onResetTaste={resetAllTaste}
            onImportWatchlist={() => {
              syncState();
              showToast('Imported visual vault data');
            }}
          />
        )}
      </main>

      {/* High-Resolution Artwork Lightbox & Trailer Modal */}
      <ArtworkModal
        media={selectedMedia}
        isOpen={Boolean(selectedMedia)}
        onClose={() => setSelectedMedia(null)}
        isLiked={selectedMedia ? isLiked(selectedMedia.id) : false}
        isSaved={selectedMedia ? isSaved(selectedMedia.id) : false}
        onToggleLike={handleToggleFavorite}
        onToggleSave={handleToggleSave}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-8 mt-16 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-serif text-sm text-zinc-300">
            That Gal — Cinematic Anime Discovery & Watchlist Engine
          </p>
          <p className="font-mono text-[11px] text-zinc-500">
            Powered by the open AniList GraphQL and Jikan v4 APIs
          </p>
          <p className="text-[11px] text-zinc-400 pt-2 font-mono">
            A project by var
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
