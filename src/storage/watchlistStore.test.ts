import { describe, it, expect, beforeEach } from 'vitest';
import { watchlistStore } from './watchlistStore';
import type { AnimeMedia } from '../api/types';

// Mock localStorage for test environment
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
  key: () => null,
  length: 0,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('watchlistStore', () => {
  const sampleMedia: AnimeMedia = {
    id: 10,
    title: { english: 'Frieren', romaji: 'Sousou no Frieren', native: null },
    coverImage: { extraLarge: '', large: '', color: '#F6E05E' },
    bannerImage: null,
    format: 'TV',
    episodes: 28,
    duration: 24,
    status: 'FINISHED',
    seasonYear: 2023,
    season: 'FALL',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    studios: ['Madhouse'],
    tags: ['Magic', 'Elf'],
    averageScore: 93,
    popularity: 500000,
    description: 'An elf mage reflecting on time.',
    trailer: null,
    siteUrl: '',
  };

  beforeEach(() => {
    watchlistStore.clearWatchlist();
    watchlistStore.resetTasteProfile();
  });

  it('adds and updates watchlist entries with taste affinity boost', () => {
    watchlistStore.setWatchlistStatus(sampleMedia, 'plan_to_watch');

    const watchlist = watchlistStore.getWatchlist();
    expect(watchlist.has(10)).toBe(true);
    expect(watchlist.get(10)?.status).toBe('plan_to_watch');

    const profile = watchlistStore.getTasteProfile();
    expect(profile.studioWeights['Madhouse']).toBeGreaterThan(0);
    expect(profile.genreWeights['Fantasy']).toBeGreaterThan(0);
  });

  it('toggles favorites and applies stronger affinity', () => {
    const isFav1 = watchlistStore.toggleFavorite(sampleMedia);
    expect(isFav1).toBe(true);

    const isFav2 = watchlistStore.toggleFavorite(sampleMedia);
    expect(isFav2).toBe(false);
  });

  it('records dislikes and applies penalty to studios and genres', () => {
    watchlistStore.dislikeMedia(sampleMedia);

    const profile = watchlistStore.getTasteProfile();
    expect(profile.dislikedIds).toContain(10);
    expect(profile.studioWeights['Madhouse']).toBeLessThan(0);
    expect(profile.genreWeights['Fantasy']).toBeLessThan(0);
  });

  it('removes from watchlist when status is set to null', () => {
    watchlistStore.setWatchlistStatus(sampleMedia, 'watching');
    expect(watchlistStore.getWatchlist().has(10)).toBe(true);

    watchlistStore.setWatchlistStatus(sampleMedia, null);
    expect(watchlistStore.getWatchlist().has(10)).toBe(false);
  });
});
