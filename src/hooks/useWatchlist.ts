import { useState, useCallback, useEffect } from 'react';
import { watchlistStore } from '../storage/watchlistStore';
import type { AnimeMedia, WatchlistEntry, WatchlistStatus, UserTasteProfile } from '../api/types';

export function useWatchlist() {
  const [watchlistMap, setWatchlistMap] = useState<Map<number, WatchlistEntry>>(new Map());
  const [tasteProfile, setTasteProfile] = useState<UserTasteProfile>(watchlistStore.getTasteProfile());

  const syncState = useCallback(() => {
    setWatchlistMap(new Map(watchlistStore.getWatchlist()));
    setTasteProfile({ ...watchlistStore.getTasteProfile() });
  }, []);

  useEffect(() => {
    syncState();
  }, [syncState]);

  const updateStatus = useCallback((media: AnimeMedia, status: WatchlistStatus | null) => {
    watchlistStore.setWatchlistStatus(media, status);
    syncState();
  }, [syncState]);

  const toggleFav = useCallback((media: AnimeMedia): boolean => {
    const isFav = watchlistStore.toggleFavorite(media);
    syncState();
    return isFav;
  }, [syncState]);

  const dislike = useCallback((media: AnimeMedia) => {
    watchlistStore.dislikeMedia(media);
    syncState();
  }, [syncState]);

  const inspect = useCallback((media: AnimeMedia) => {
    watchlistStore.recordDetailInspection(media);
    syncState();
  }, [syncState]);

  const clearAllWatchlist = useCallback(() => {
    watchlistStore.clearWatchlist();
    syncState();
  }, [syncState]);

  const resetAllTaste = useCallback(() => {
    watchlistStore.resetTasteProfile();
    syncState();
  }, [syncState]);

  const watchlistEntries = Array.from(watchlistMap.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return {
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
  };
}
