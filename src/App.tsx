import { useState } from 'react';
import { Navbar, type MainTab } from './components/Navbar';
import { DiscoveryFeed } from './components/DiscoveryFeed';
import { WatchlistView } from './components/WatchlistView';
import { TasteView } from './components/TasteView';
import { SettingsView } from './components/SettingsView';
import { AnimeDetailModal } from './components/AnimeDetailModal';
import { useAnimeDiscovery } from './hooks/useAnimeDiscovery';
import { useWatchlist } from './hooks/useWatchlist';
import type { AnimeMedia, WatchlistStatus } from './api/types';
import { Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('discovery');
  const [selectedMedia, setSelectedMedia] = useState<AnimeMedia | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Watchlist & Taste hooks
  const {
    watchlistMap,
    watchlistEntries,
    tasteProfile,
    updateStatus,
    toggleFav,
    dislike,
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

  const handleToggleWatchlist = (media: AnimeMedia) => {
    const existing = watchlistMap.get(media.id);
    const title = media.title.english || media.title.romaji;
    if (existing) {
      updateStatus(media, null);
      showToast(`Removed "${title}" from Watchlist`);
    } else {
      updateStatus(media, 'plan_to_watch');
      showToast(`Added "${title}" to Plan to Watch`);
    }
  };

  const handleToggleFavorite = (media: AnimeMedia) => {
    const title = media.title.english || media.title.romaji;
    const isNowFav = toggleFav(media);
    showToast(isNowFav ? `Favorited "${title}"` : `Removed "${title}" from Favorites`);
  };

  const handleDislike = (media: AnimeMedia) => {
    const title = media.title.english || media.title.romaji;
    dislike(media);
    showToast(`Adjusted preferences: less like "${title}"`);
  };

  const handleInspect = (media: AnimeMedia) => {
    setSelectedMedia(media);
    inspect(media);
  };

  const handleUpdateStatus = (media: AnimeMedia, status: WatchlistStatus | null) => {
    const title = media.title.english || media.title.romaji;
    updateStatus(media, status);
    if (status) {
      showToast(`Updated "${title}" status`);
    } else {
      showToast(`Removed "${title}" from Watchlist`);
    }
  };

  const selectedEntry = selectedMedia ? watchlistMap.get(selectedMedia.id) : null;

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
        watchlistCount={watchlistEntries.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'discovery' && (
          <DiscoveryFeed
            feed={feed}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            activeFilter={filter}
            onSelectFilter={setFilter}
            searchQuery={searchQuery}
            watchlistMap={watchlistMap}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onDislike={handleDislike}
            onInspect={handleInspect}
            onLoadMore={loadMore}
            hasNextPage={hasNextPage}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            entries={watchlistEntries}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onDislike={handleDislike}
            onInspect={handleInspect}
            onClearWatchlist={clearAllWatchlist}
            onGoToDiscovery={() => setActiveTab('discovery')}
          />
        )}

        {activeTab === 'taste' && (
          <TasteView
            tasteProfile={tasteProfile}
            watchlistCount={watchlistEntries.length}
            onResetTaste={resetAllTaste}
            onGoToDiscovery={() => setActiveTab('discovery')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            watchlistEntries={watchlistEntries}
            onClearWatchlist={clearAllWatchlist}
            onResetTaste={resetAllTaste}
            onImportWatchlist={() => {
              syncState();
              showToast('Imported watchlist items');
            }}
          />
        )}
      </main>

      {/* Cinematic Detail & Trailer Modal */}
      <AnimeDetailModal
        media={selectedMedia}
        isOpen={Boolean(selectedMedia)}
        onClose={() => setSelectedMedia(null)}
        watchlistStatus={selectedEntry?.status || null}
        isFavorite={Boolean(selectedEntry?.isFavorite)}
        onUpdateStatus={handleUpdateStatus}
        onToggleFavorite={handleToggleFavorite}
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
