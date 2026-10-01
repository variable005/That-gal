import { useState, useEffect, useCallback, useRef } from 'react';
import { anilistApi } from '../api/anilist';
import { watchlistStore } from '../storage/watchlistStore';
import { rankAndDiversify } from '../api/recommendations';
import type { AnimeMedia, DiscoveryFilter } from '../api/types';

export function useAnimeDiscovery() {
  const [filter, setFilter] = useState<DiscoveryFilter>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [feed, setFeed] = useState<AnimeMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (pageNum: number, isInitial = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await anilistApi.fetchDiscoveryFeed(
          filter,
          pageNum,
          24,
          searchQuery,
          controller.signal
        );

        const profile = watchlistStore.getTasteProfile();
        // Rank and diversify through recommendation algorithm
        const ranked = rankAndDiversify(result.media, profile);

        setHasNextPage(result.hasNextPage);
        setPage(pageNum);

        setFeed((prev) => {
          if (isInitial) return ranked;
          // Filter duplicates
          const seen = new Set(prev.map((m) => m.id));
          const uniqueNew = ranked.filter((m) => !seen.has(m.id));
          return [...prev, ...uniqueNew];
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Failed to load anime discovery feed:', err);
      } finally {
        if (isInitial) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [filter, searchQuery]
  );

  // Initial and filter changes
  useEffect(() => {
    fetchPage(1, true);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasNextPage) {
      fetchPage(page + 1, false);
    }
  }, [isLoading, isLoadingMore, hasNextPage, page, fetchPage]);

  const refresh = useCallback(() => {
    return fetchPage(1, true);
  }, [fetchPage]);

  return {
    feed,
    isLoading,
    isLoadingMore,
    filter,
    searchQuery,
    hasNextPage,
    setFilter,
    setSearchQuery,
    loadMore,
    refresh,
  };
}
