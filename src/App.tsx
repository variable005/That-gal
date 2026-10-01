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
import { Loader2 } from 'lucide-react';

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
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleSave = (media: AnimeMedia) => {
    const existing = watchlistMap.get(media.id);
    const title = media.title.english || media.title.romaji;
    if (existing) {
      updateStatus(media, null);
      showToast(`Removed "${title}" from Vault`);
    } else {
      updateStatus(media, 'plan_to_watch');
      showToast(`Saved "${title}" to Vault`);
    }
  };

  const handleToggleFavorite = (media: AnimeMedia) => {
    const title = media.title.english || media.title.romaji;
    const isNowFav = toggleFav(media);
    showToast(isNowFav ? `Favorited "${title}"` : `Unfavorited "${title}"`);
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
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full bg-zinc-900/95 backdrop-blur-md text-zinc-200 border border-zinc-700 shadow-2xl font-mono text-xs animate-fade-in pointer-events-none">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Ambient Navbar */}
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

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-3 sm:px-6 py-2 flex flex-col justify-center">
        
        {/* Subtle Category Switcher for Cinema & Stream */}
        {(activeTab === 'theater' || activeTab === 'stream') && (
          <div className="mb-3 flex items-center justify-between gap-3">
            <FilterBar activeFilter={filter} onSelectFilter={handleSelectFilter} />
            <div className="hidden sm:block text-right">
              <span className="font-mono text-[10px] text-zinc-500">
                {activeTab === 'theater' ? '← / → or Space' : 'Continuous Artbook'}
              </span>
            </div>
          </div>
        )}

        {/* TAB 1: Immersive Cinema Stage */}
        {activeTab === 'theater' && (
          <div className="w-full flex-1">
            {isLoading && feed.length === 0 ? (
              <div className="w-full h-[82vh] rounded-2xl bg-[#070709] border border-zinc-900 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="font-mono text-[11px] text-zinc-500 tracking-widest uppercase">
                  Loading artwork...
                </span>
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

        {/* TAB 2: Infinite Stream */}
        {activeTab === 'stream' && (
          <div className="w-full">
            {isLoading && feed.length === 0 ? (
              <div className="w-full py-32 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="font-mono text-[11px] text-zinc-500 tracking-widest uppercase">
                  Loading stream...
                </span>
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

        {/* TAB 3: Visual Vault */}
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

      {/* Full-Resolution Lightbox Modal */}
      <ArtworkModal
        media={selectedMedia}
        isOpen={Boolean(selectedMedia)}
        onClose={() => setSelectedMedia(null)}
        isLiked={selectedMedia ? isLiked(selectedMedia.id) : false}
        isSaved={selectedMedia ? isSaved(selectedMedia.id) : false}
        onToggleLike={handleToggleFavorite}
        onToggleSave={handleToggleSave}
      />

      {/* Minimal Footer */}
      <footer className="py-6 text-center font-mono text-[11px] text-zinc-600">
        A project by var
      </footer>
    </div>
  );
}

export default App;
