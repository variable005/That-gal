import type { AnimeMedia, WatchlistEntry, WatchlistStatus, UserTasteProfile } from '../api/types';

const STORAGE_KEY_WATCHLIST = 'that_gal_watchlist_v1';
const STORAGE_KEY_TASTE = 'that_gal_taste_profile_v1';

const DEFAULT_PROFILE: UserTasteProfile = {
  genreWeights: {},
  studioWeights: {},
  formatWeights: {},
  tagWeights: {},
  dislikedIds: [],
  seenIds: [],
  lastUpdated: Date.now(),
};

class WatchlistStore {
  private watchlistCache: Map<number, WatchlistEntry> | null = null;
  private tasteCache: UserTasteProfile | null = null;

  public getWatchlist(): Map<number, WatchlistEntry> {
    if (this.watchlistCache) return this.watchlistCache;

    try {
      const raw = localStorage.getItem(STORAGE_KEY_WATCHLIST);
      if (raw) {
        const parsed: Record<number, WatchlistEntry> = JSON.parse(raw);
        const map = new Map<number, WatchlistEntry>();
        for (const [idStr, entry] of Object.entries(parsed)) {
          if (entry && entry.media) {
            map.set(Number(idStr), entry);
          }
        }
        this.watchlistCache = map;
        return map;
      }
    } catch (e) {
      console.warn('Failed to load watchlist from localStorage:', e);
    }

    this.watchlistCache = new Map();
    return this.watchlistCache;
  }

  private saveWatchlist(): void {
    if (!this.watchlistCache) return;
    try {
      const obj: Record<number, WatchlistEntry> = {};
      this.watchlistCache.forEach((entry, id) => {
        obj[id] = entry;
      });
      localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(obj));
    } catch (e) {
      console.warn('Failed to persist watchlist:', e);
    }
  }

  public getTasteProfile(): UserTasteProfile {
    if (this.tasteCache) return this.tasteCache;

    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASTE);
      if (raw) {
        this.tasteCache = JSON.parse(raw);
        return this.tasteCache!;
      }
    } catch (e) {
      console.warn('Failed to load taste profile:', e);
    }

    this.tasteCache = { ...DEFAULT_PROFILE };
    return this.tasteCache;
  }

  private saveTasteProfile(): void {
    if (!this.tasteCache) return;
    this.tasteCache.lastUpdated = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY_TASTE, JSON.stringify(this.tasteCache));
    } catch (e) {
      console.warn('Failed to persist taste profile:', e);
    }
  }

  // --- Interaction & Preference Learning Engine ---

  public setWatchlistStatus(media: AnimeMedia, status: WatchlistStatus | null): void {
    const list = this.getWatchlist();
    const taste = this.getTasteProfile();

    if (status === null) {
      // Remove from watchlist
      list.delete(media.id);
      this.saveWatchlist();
      return;
    }

    const existing = list.get(media.id);
    const isFavorite = existing?.isFavorite || false;

    list.set(media.id, {
      media,
      status,
      isFavorite,
      addedAt: existing?.addedAt || Date.now(),
      updatedAt: Date.now(),
    });
    this.saveWatchlist();

    // Reward taste weights
    const weightMultiplier = status === 'completed' ? 1.4 : 1.0;
    this.applyAffinityBoost(media, 5.0 * weightMultiplier);

    // If previously disliked, remove dislike
    taste.dislikedIds = taste.dislikedIds.filter((id) => id !== media.id);
    this.saveTasteProfile();
  }

  public toggleFavorite(media: AnimeMedia): boolean {
    const list = this.getWatchlist();
    const existing = list.get(media.id);

    if (existing) {
      existing.isFavorite = !existing.isFavorite;
      existing.updatedAt = Date.now();
      this.saveWatchlist();
      if (existing.isFavorite) {
        this.applyAffinityBoost(media, 8.0);
      }
      return existing.isFavorite;
    } else {
      // Add as plan_to_watch and favorite
      list.set(media.id, {
        media,
        status: 'plan_to_watch',
        isFavorite: true,
        addedAt: Date.now(),
        updatedAt: Date.now(),
      });
      this.saveWatchlist();
      this.applyAffinityBoost(media, 8.0);
      return true;
    }
  }

  public dislikeMedia(media: AnimeMedia): void {
    const list = this.getWatchlist();
    list.delete(media.id);
    this.saveWatchlist();

    const taste = this.getTasteProfile();
    if (!taste.dislikedIds.includes(media.id)) {
      taste.dislikedIds.push(media.id);
      if (taste.dislikedIds.length > 400) {
        taste.dislikedIds = taste.dislikedIds.slice(-400);
      }
    }

    // Apply negative penalty
    this.applyAffinityPenalty(media, 6.0);
    this.saveTasteProfile();
  }

  public removeDislike(mediaId: number): void {
    const taste = this.getTasteProfile();
    taste.dislikedIds = taste.dislikedIds.filter((id) => id !== mediaId);
    this.saveTasteProfile();
  }

  public recordDetailInspection(media: AnimeMedia): void {
    const taste = this.getTasteProfile();
    if (!taste.seenIds.includes(media.id)) {
      taste.seenIds.push(media.id);
      if (taste.seenIds.length > 800) {
        taste.seenIds = taste.seenIds.slice(-800);
      }
    }
    // Subtle discovery interest signal
    this.applyAffinityBoost(media, 1.2);
    this.saveTasteProfile();
  }

  private applyAffinityBoost(media: AnimeMedia, score: number): void {
    const taste = this.getTasteProfile();

    media.genres.forEach((g) => {
      taste.genreWeights[g] = (taste.genreWeights[g] || 0) + score;
    });

    media.studios.forEach((s) => {
      taste.studioWeights[s] = (taste.studioWeights[s] || 0) + score * 1.3;
    });

    if (media.format) {
      taste.formatWeights[media.format] = (taste.formatWeights[media.format] || 0) + score * 0.7;
    }

    media.tags.slice(0, 6).forEach((t) => {
      taste.tagWeights[t] = (taste.tagWeights[t] || 0) + score * 0.8;
    });

    this.saveTasteProfile();
  }

  private applyAffinityPenalty(media: AnimeMedia, penalty: number): void {
    const taste = this.getTasteProfile();

    media.genres.forEach((g) => {
      taste.genreWeights[g] = (taste.genreWeights[g] || 0) - penalty;
    });

    media.studios.forEach((s) => {
      taste.studioWeights[s] = (taste.studioWeights[s] || 0) - penalty * 1.2;
    });

    media.tags.slice(0, 4).forEach((t) => {
      taste.tagWeights[t] = (taste.tagWeights[t] || 0) - penalty * 0.6;
    });

    this.saveTasteProfile();
  }

  public resetTasteProfile(): void {
    this.tasteCache = {
      genreWeights: {},
      studioWeights: {},
      formatWeights: {},
      tagWeights: {},
      dislikedIds: [],
      seenIds: [],
      lastUpdated: Date.now(),
    };
    try {
      localStorage.removeItem(STORAGE_KEY_TASTE);
    } catch {
      // ignore
    }
  }

  public clearWatchlist(): void {
    this.watchlistCache = new Map();
    localStorage.removeItem(STORAGE_KEY_WATCHLIST);
  }
}

export const watchlistStore = new WatchlistStore();
