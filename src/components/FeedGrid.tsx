import React from 'react';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { ImageCard } from './ImageCard';
import type { SafePost } from '../api/types';

interface FeedGridProps {
  posts: SafePost[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onLoadMore?: () => void;
  likedIds?: Set<number>;
  savedIds?: Set<number>;
  dislikedIds?: Set<number>;
  onLike?: (post: SafePost) => void;
  onSave?: (post: SafePost) => void;
  onDislike?: (post: SafePost) => void;
  onSelect?: (post: SafePost) => void;
}

export const FeedGrid: React.FC<FeedGridProps> = ({
  posts,
  isLoading,
  isLoadingMore = false,
  error,
  onRetry,
  onLoadMore,
  likedIds = new Set(),
  savedIds = new Set(),
  dislikedIds = new Set(),
  onLike,
  onSave,
  onDislike,
  onSelect,
}) => {
  // Initial loading skeleton
  if (isLoading && posts.length === 0) {
    return (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl overflow-hidden bg-atlas-surface border border-atlas-border p-0 animate-pulse break-inside-avoid"
          >
            <div
              className="w-full bg-atlas-elevated"
              style={{ height: `${220 + (idx % 4) * 60}px` }}
            />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-atlas-elevated rounded w-2/3" />
              <div className="h-2 bg-atlas-elevated rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="my-16 text-center max-w-md mx-auto p-8 rounded-2xl bg-atlas-surface border border-atlas-border shadow-elevated">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-serif font-medium text-atlas-text mb-2">
          Unable to Load Discoveries
        </h3>
        <p className="text-xs text-atlas-muted mb-6 leading-relaxed">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-atlas-elevated hover:bg-atlas-border text-atlas-text text-xs font-medium border border-atlas-border transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="my-20 text-center max-w-md mx-auto p-8 rounded-2xl bg-atlas-surface border border-atlas-border">
        <Sparkles className="w-8 h-8 text-atlas-muted mx-auto mb-3" />
        <h3 className="text-lg font-serif font-medium text-atlas-text mb-1">
          No Artwork Found
        </h3>
        <p className="text-xs text-atlas-muted mb-4">
          All fetched posts were filtered by safety criteria or query yielded no safe results.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-atlas-elevated text-atlas-accent text-xs font-medium border border-atlas-border"
          >
            Refresh Feed
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Artwork Masonry Columns */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {posts.map((post, idx) => (
          <ImageCard
            key={post.id}
            post={post}
            priorityIndex={idx}
            isLiked={likedIds.has(post.id)}
            isSaved={savedIds.has(post.id)}
            isDisliked={dislikedIds.has(post.id)}
            onLike={onLike}
            onSave={onSave}
            onDislike={onDislike}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Incremental Load More Bar */}
      {onLoadMore && (
        <div className="flex justify-center pt-4 pb-12">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-atlas-surface hover:bg-atlas-elevated border border-atlas-border hover:border-atlas-accent/40 text-atlas-text text-xs font-medium tracking-wide transition-all shadow-subtle disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-atlas-accent" />
                <span>Discovering New Artwork...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-atlas-accent group-hover:rotate-12 transition-transform" />
                <span>Load More Discoveries</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
