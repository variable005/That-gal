import React, { useState } from 'react';
import { Heart, Bookmark, ThumbsDown, ExternalLink, Maximize2 } from 'lucide-react';
import type { SafePost } from '../api/types';

interface ImageCardProps {
  post: SafePost;
  priorityIndex?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isDisliked?: boolean;
  onLike?: (post: SafePost) => void;
  onSave?: (post: SafePost) => void;
  onDislike?: (post: SafePost) => void;
  onSelect?: (post: SafePost) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  post,
  priorityIndex = 999,
  isLiked = false,
  isSaved = false,
  isDisliked = false,
  onLike,
  onSave,
  onDislike,
  onSelect,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Modern web guidance: LCP priority boost on first 2 items
  const isLcpCandidate = priorityIndex < 2;

  return (
    <article
      className="group relative rounded-xl overflow-hidden bg-atlas-surface border border-atlas-border transition-all duration-300 hover:border-atlas-borderLight hover:shadow-elevated flex flex-col"
      style={{ breakInside: 'avoid' }}
    >
      {/* Artwork Container */}
      <div 
        className="relative w-full overflow-hidden cursor-pointer bg-atlas-elevated/40"
        onClick={() => onSelect?.(post)}
      >
        {/* Placeholder Skeleton */}
        {!isLoaded && !hasError && (
          <div 
            className="w-full animate-pulse bg-gradient-to-b from-atlas-surface to-atlas-elevated"
            style={{ paddingBottom: `${Math.min(Math.max((1 / post.aspectRatio) * 100, 70), 160)}%` }}
          />
        )}

        {/* Artwork Image */}
        {!hasError ? (
          <img
            src={post.largeImageUrl || post.imageUrl || post.previewUrl}
            alt={post.primaryCharacter ? `${post.primaryCharacter} by ${post.primaryArtist}` : `Artwork by ${post.primaryArtist}`}
            fetchPriority={isLcpCandidate ? 'high' : undefined}
            loading={isLcpCandidate ? undefined : 'lazy'}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-auto object-cover transition-all duration-500 group-hover:scale-[1.02] ${
              isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />
        ) : (
          <div className="w-full h-48 flex flex-col items-center justify-center p-4 text-center text-atlas-muted bg-atlas-surface">
            <span className="text-xs">Image unavailable</span>
          </div>
        )}

        {/* Hover Overlay with Action Bar */}
        <div className="absolute inset-0 bg-gradient-to-t from-atlas-bg/90 via-atlas-bg/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 pointer-events-none">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between pointer-events-auto">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-atlas-bg/80 backdrop-blur-sm text-atlas-text/90 border border-atlas-border/50">
              #{post.id}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(post);
              }}
              className="p-1.5 rounded-lg bg-atlas-bg/80 backdrop-blur-sm text-atlas-muted hover:text-atlas-text hover:bg-atlas-elevated transition-colors"
              title="Inspect Artwork"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between pointer-events-auto pt-2">
            <div className="flex items-center gap-1.5 bg-atlas-bg/85 backdrop-blur-md p-1 rounded-lg border border-atlas-border/70 shadow-sm">
              {/* Like */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.(post);
                }}
                className={`p-1.5 rounded transition-all ${
                  isLiked
                    ? 'text-pink-400 bg-pink-500/20'
                    : 'text-atlas-muted hover:text-pink-300 hover:bg-atlas-elevated'
                }`}
                title={isLiked ? 'Unlike' : 'Like'}
                aria-label="Like artwork"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Save */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.(post);
                }}
                className={`p-1.5 rounded transition-all ${
                  isSaved
                    ? 'text-sky-400 bg-sky-500/20'
                    : 'text-atlas-muted hover:text-sky-300 hover:bg-atlas-elevated'
                }`}
                title={isSaved ? 'Unsave' : 'Save artwork'}
                aria-label="Save artwork"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              {/* Dislike */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDislike?.(post);
                }}
                className={`p-1.5 rounded transition-all ${
                  isDisliked
                    ? 'text-rose-400 bg-rose-500/20'
                    : 'text-atlas-muted hover:text-rose-300 hover:bg-atlas-elevated'
                }`}
                title={isDisliked ? 'Remove dislike' : 'Dislike artwork'}
                aria-label="Dislike artwork"
              >
                <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Link to Danbooru */}
            <a
              href={post.danbooruPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-atlas-bg/85 backdrop-blur-md text-atlas-muted hover:text-atlas-accent border border-atlas-border/70 transition-colors"
              title="View on Danbooru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="p-3 flex flex-col gap-1.5 bg-atlas-surface border-t border-atlas-border/40">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-xs text-atlas-text truncate" title={post.primaryArtist}>
            {post.primaryArtist}
          </span>
          {post.score > 0 && (
            <span className="text-[10px] font-mono text-atlas-muted shrink-0">
              +{post.score}
            </span>
          )}
        </div>

        {/* Character / Franchise Tags */}
        <div className="flex flex-wrap gap-1 items-center">
          {post.primaryCharacter && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-atlas-elevated text-atlas-accent/90 border border-atlas-border/60 truncate max-w-[130px]">
              {post.primaryCharacter}
            </span>
          )}
          {post.primaryFranchise && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-atlas-elevated text-atlas-muted border border-atlas-border/60 truncate max-w-[130px]">
              {post.primaryFranchise}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
