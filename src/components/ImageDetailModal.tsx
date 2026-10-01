import React, { useEffect } from 'react';
import { X, Heart, Bookmark, ThumbsDown, ExternalLink, Eye, Tag } from 'lucide-react';
import type { SafePost } from '../api/types';

interface ImageDetailModalProps {
  post: SafePost | null;
  isOpen: boolean;
  onClose: () => void;
  isLiked?: boolean;
  isSaved?: boolean;
  isDisliked?: boolean;
  onLike?: (post: SafePost) => void;
  onSave?: (post: SafePost) => void;
  onDislike?: (post: SafePost) => void;
  explanation?: string;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  isLiked = false,
  isSaved = false,
  isDisliked = false,
  onLike,
  onSave,
  onDislike,
  explanation = 'Curated safe anime artwork from Danbooru.',
}) => {
  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-atlas-bg/85 backdrop-blur-md transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] bg-atlas-surface border border-atlas-border rounded-2xl shadow-elevated overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-atlas-bg/80 hover:bg-atlas-elevated text-atlas-muted hover:text-atlas-text border border-atlas-border transition-colors"
          title="Close modal"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Artwork Presentation */}
        <div className="md:w-3/5 bg-atlas-bg flex items-center justify-center p-4 overflow-hidden min-h-[300px]">
          <img
            src={post.largeImageUrl || post.imageUrl}
            alt={post.primaryArtist}
            className="max-h-[82vh] max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Right Column: Editorial Metadata & Interaction Details */}
        <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto max-h-[92vh] border-t md:border-t-0 md:border-l border-atlas-border bg-atlas-surface">
          <div className="space-y-5">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-atlas-accent px-2 py-0.5 rounded bg-atlas-accentDim border border-atlas-accent/20">
                  Rating: Safe (g)
                </span>
                <span className="text-xs font-mono text-atlas-muted">
                  Post #{post.id}
                </span>
              </div>

              <h2 className="text-2xl font-serif font-medium text-atlas-text mt-1">
                {post.primaryArtist}
              </h2>
              {post.primaryFranchise && (
                <p className="text-xs text-atlas-muted font-sans mt-0.5">
                  Series: <span className="text-atlas-text">{post.primaryFranchise}</span>
                </p>
              )}
            </div>

            {/* Recommendation Explanation */}
            <div className="p-3 rounded-xl bg-atlas-elevated/70 border border-atlas-border text-xs text-atlas-muted flex items-start gap-2.5">
              <Eye className="w-4 h-4 text-atlas-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-atlas-text block mb-0.5">Why this artwork?</span>
                <p>{explanation}</p>
              </div>
            </div>

            {/* Interaction Buttons Bar */}
            <div className="flex items-center gap-2 pt-1 pb-2 border-b border-atlas-border">
              <button
                onClick={() => onLike?.(post)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                  isLiked
                    ? 'bg-pink-500/15 text-pink-400 border-pink-500/30'
                    : 'bg-atlas-elevated text-atlas-muted hover:text-pink-300 border-atlas-border'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </button>

              <button
                onClick={() => onSave?.(post)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                  isSaved
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    : 'bg-atlas-elevated text-atlas-muted hover:text-sky-300 border-atlas-border'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => onDislike?.(post)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                  isDisliked
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-atlas-elevated text-atlas-muted hover:text-rose-300 border-atlas-border'
                }`}
                title="Dislike"
              >
                <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Tags Categorized */}
            <div className="space-y-3">
              {/* Artists */}
              {post.artistTags.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-atlas-muted mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-red-400" />
                    Artist
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {post.artistTags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded bg-red-950/30 text-red-300 border border-red-900/40">
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Characters */}
              {post.characterTags.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-atlas-muted mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-400" />
                    Characters
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {post.characterTags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-900/40">
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Series / Copyright */}
              {post.copyrightTags.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-atlas-muted mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-purple-400" />
                    Copyright / Series
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {post.copyrightTags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded bg-purple-950/30 text-purple-300 border border-purple-900/40">
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* General Aesthetic Tags */}
              {post.generalTags.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-atlas-muted mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-sky-400" />
                    Visual Motifs ({post.generalTags.length})
                  </h4>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                    {post.generalTags.slice(0, 20).map((tag) => (
                      <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded bg-atlas-elevated text-atlas-muted border border-atlas-border">
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {post.generalTags.length > 20 && (
                      <span className="text-[11px] text-atlas-muted italic self-center">
                        +{post.generalTags.length - 20} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Technical Metadata */}
            <div className="pt-2 border-t border-atlas-border grid grid-cols-2 gap-2 text-xs font-mono text-atlas-muted">
              <div>
                <span>Dimensions:</span>
                <span className="text-atlas-text ml-1">{post.width} × {post.height}</span>
              </div>
              <div>
                <span>Favorites:</span>
                <span className="text-atlas-text ml-1">{post.favCount}</span>
              </div>
            </div>
          </div>

          {/* Footer external links */}
          <div className="pt-4 border-t border-atlas-border flex items-center justify-between mt-4">
            <a
              href={post.danbooruPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-atlas-accent hover:underline"
            >
              <span>View Danbooru Post #{post.id}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {post.sourceUrl && (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-atlas-muted hover:text-atlas-text"
              >
                <span>Original Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
