import { useState, useEffect, useCallback, useRef } from 'react';
import { danbooruApi } from '../api/danbooru';
import type { SafePost } from '../api/types';

interface UseDiscoveryFeedOptions {
  tags?: string;
  limit?: number;
}

export function useDiscoveryFeed(options: UseDiscoveryFeedOptions = {}) {
  const [posts, setPosts] = useState<SafePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [endpointUsed, setEndpointUsed] = useState<string>('danbooru');
  const [isFallback, setIsFallback] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const seenPostIdsRef = useRef<Set<number>>(new Set());

  const fetchFeedPage = useCallback(
    async (pageNum: number, isInitial = false) => {
      // Cancel previous request if still in flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isInitial) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await danbooruApi.fetchPosts(
          {
            tags: options.tags || 'rating:g',
            page: pageNum,
            limit: options.limit || 20,
          },
          controller.signal
        );

        setEndpointUsed(result.endpointUsed);
        setIsFallback(result.isFallback);

        if (result.posts.length === 0) {
          if (isInitial) {
            setPosts([]);
          }
          setHasMore(false);
        } else {
          // Filter duplicates against seenPostIds
          const newUniquePosts = result.posts.filter((p) => !seenPostIdsRef.current.has(p.id));
          for (const p of newUniquePosts) {
            seenPostIdsRef.current.add(p.id);
          }

          setPosts((prev) => (isInitial ? newUniquePosts : [...prev, ...newUniquePosts]));
          setPage(pageNum);
          setHasMore(result.posts.length >= 10);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error fetching discovery feed:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch artwork from Danbooru');
      } finally {
        if (isInitial) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [options.tags, options.limit]
  );

  // Initial load
  useEffect(() => {
    seenPostIdsRef.current.clear();
    fetchFeedPage(1, true);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchFeedPage]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      fetchFeedPage(page + 1, false);
    }
  }, [isLoading, isLoadingMore, hasMore, fetchFeedPage, page]);

  const refresh = useCallback(() => {
    seenPostIdsRef.current.clear();
    return fetchFeedPage(1, true);
  }, [fetchFeedPage]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    endpointUsed,
    isFallback,
    loadMore,
    refresh,
  };
}
