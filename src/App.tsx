import { useState } from 'react';
import { Navbar, type NavTab } from './components/Navbar';
import { FeedGrid } from './components/FeedGrid';
import { ImageDetailModal } from './components/ImageDetailModal';
import { useDiscoveryFeed } from './hooks/useDiscoveryFeed';
import type { SafePost } from './api/types';
import { Sparkles, Info, RefreshCw, Compass } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('for_you');
  const [selectedPost, setSelectedPost] = useState<SafePost | null>(null);

  // Simple Phase 1 state for reactions (will be persisted via storage in Phase 2)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [dislikedIds, setDislikedIds] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    isFallback,
    endpointUsed,
    loadMore,
    refresh,
  } = useDiscoveryFeed();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLike = (post: SafePost) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(post.id)) {
        next.delete(post.id);
        showToast('Removed like');
      } else {
        next.add(post.id);
        // Remove dislike if present
        setDislikedIds((d) => {
          const nd = new Set(d);
          nd.delete(post.id);
          return nd;
        });
        showToast(`Liked artwork by ${post.primaryArtist}`);
      }
      return next;
    });
  };

  const handleSave = (post: SafePost) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(post.id)) {
        next.delete(post.id);
        showToast('Removed from saved collection');
      } else {
        next.add(post.id);
        showToast(`Saved to personal gallery`);
      }
      return next;
    });
  };

  const handleDislike = (post: SafePost) => {
    setDislikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(post.id)) {
        next.delete(post.id);
        showToast('Removed dislike');
      } else {
        next.add(post.id);
        // Remove like if present
        setLikedIds((l) => {
          const nl = new Set(l);
          nl.delete(post.id);
          return nl;
        });
        showToast('Preference adjusted: less art like this');
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-atlas-bg text-atlas-text flex flex-col font-sans selection:bg-atlas-accent/20 selection:text-atlas-text">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-atlas-elevated/95 backdrop-blur-md text-atlas-text border border-atlas-accent/40 shadow-elevated text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-atlas-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedIds.size}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Editorial Feed Header */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-atlas-border">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-atlas-accentDim text-atlas-accent border border-atlas-accent/20 text-xs font-mono mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Phase 1 • Live Danbooru Discovery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-atlas-text">
                {activeTab === 'for_you' ? 'The Discovery Feed' : 'Art Magazine'}
              </h1>
              <p className="text-sm text-atlas-muted mt-1.5 max-w-2xl leading-relaxed">
                A visual publication that learns your aesthetic preferences over time.
                Safe-rating is enforced at the network boundary.
              </p>
            </div>

            {/* Status and Refresh Toolbar */}
            <div className="flex items-center gap-2 self-start md:self-end">
              {isFallback && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 text-amber-300 border border-amber-900/40 text-xs font-mono" title="Danbooru main Cloudflare challenge active; using testbooru mirror">
                  <Info className="w-3.5 h-3.5" />
                  <span>Mirror Active ({endpointUsed})</span>
                </div>
              )}

              <button
                onClick={refresh}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-atlas-surface hover:bg-atlas-elevated text-atlas-muted hover:text-atlas-text border border-atlas-border text-xs font-medium transition-colors disabled:opacity-50"
                title="Refresh Discoveries"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-atlas-accent' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Views */}
        {activeTab === 'for_you' && (
          <FeedGrid
            posts={posts}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            onRetry={refresh}
            onLoadMore={loadMore}
            likedIds={likedIds}
            savedIds={savedIds}
            dislikedIds={dislikedIds}
            onLike={handleLike}
            onSave={handleSave}
            onDislike={handleDislike}
            onSelect={setSelectedPost}
          />
        )}

        {activeTab === 'explore' && (
          <div className="my-16 text-center max-w-lg mx-auto p-10 rounded-2xl bg-atlas-surface border border-atlas-border">
            <Compass className="w-10 h-10 text-atlas-accent mx-auto mb-3" />
            <h3 className="text-xl font-serif font-medium text-atlas-text mb-2">Direct Exploration</h3>
            <p className="text-xs text-atlas-muted leading-relaxed">
              Explore will allow direct tag and artist queries in subsequent phases. Use "For You" to browse current discoveries.
            </p>
            <button
              onClick={() => setActiveTab('for_you')}
              className="mt-6 px-4 py-2 rounded-lg bg-atlas-elevated text-atlas-accent text-xs font-medium border border-atlas-border"
            >
              Back to Discovery Feed
            </button>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="my-16 text-center max-w-lg mx-auto p-10 rounded-2xl bg-atlas-surface border border-atlas-border">
            <h3 className="text-xl font-serif font-medium text-atlas-text mb-2">Saved Collection</h3>
            <p className="text-xs text-atlas-muted leading-relaxed">
              {savedIds.size === 0
                ? "You haven't saved any artwork yet. Click the bookmark icon on any image to save it."
                : `You have saved ${savedIds.size} artwork(s) during this session.`}
            </p>
          </div>
        )}

        {activeTab === 'taste' && (
          <div className="my-16 text-center max-w-lg mx-auto p-10 rounded-2xl bg-atlas-surface border border-atlas-border">
            <h3 className="text-xl font-serif font-medium text-atlas-text mb-2">Your Learned Taste</h3>
            <p className="text-xs text-atlas-muted leading-relaxed">
              The recommendation engine and taste profile visualization will be implemented in Phase 3 & 4.
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="my-16 text-center max-w-lg mx-auto p-10 rounded-2xl bg-atlas-surface border border-atlas-border">
            <h3 className="text-xl font-serif font-medium text-atlas-text mb-2">Engine Settings & Privacy</h3>
            <p className="text-xs text-atlas-muted leading-relaxed">
              Configure endpoints, local privacy preferences, and optional Danbooru credentials.
            </p>
          </div>
        )}
      </main>

      {/* Image Detail Modal */}
      <ImageDetailModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        isLiked={selectedPost ? likedIds.has(selectedPost.id) : false}
        isSaved={selectedPost ? savedIds.has(selectedPost.id) : false}
        isDisliked={selectedPost ? dislikedIds.has(selectedPost.id) : false}
        onLike={handleLike}
        onSave={handleSave}
        onDislike={handleDislike}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-atlas-border bg-atlas-surface py-8 mt-12 text-center text-xs text-atlas-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-serif text-sm text-atlas-text">
            That Gal — Adaptive Anime Art Discovery Engine
          </p>
          <p className="font-mono text-[11px] text-atlas-muted">
            Powered by the Danbooru API • Safe All-Ages Content Enforced
          </p>
          <p className="text-[11px] text-atlas-muted/70 pt-2">
            A project by Hariom Sharnam
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
