/**
 * Core Data Models for That Gal - Cinematic Anime Discovery & Watchlist Engine
 */

export type MediaFormat = 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL';

export type WatchlistStatus = 'plan_to_watch' | 'watching' | 'completed' | 'dropped';

export interface AnimeTitle {
  english: string | null;
  romaji: string;
  native: string | null;
}

export interface AnimeCoverImage {
  extraLarge: string;
  large: string;
  color: string | null;
}

export interface AnimeStudio {
  name: string;
  isMain: boolean;
}

export interface AnimeTag {
  name: string;
  rank: number; // 0 - 100 percentage relevance
  isMediaSpoiler?: boolean;
}

export interface AnimeTrailer {
  id: string | null;
  site: string | null;
  thumbnail?: string | null;
}

export interface AnimeMedia {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  bannerImage: string | null;
  format: MediaFormat;
  episodes: number | null;
  duration: number | null; // minutes per episode / runtime
  status: string;
  seasonYear: number | null;
  season: string | null;
  genres: string[];
  studios: string[];
  tags: string[];
  averageScore: number | null; // e.g. 85 for 8.5/10
  popularity: number;
  description: string | null;
  trailer: AnimeTrailer | null;
  siteUrl: string;

  // Recommendation engine metadata
  recommendationReason?: string;
  matchScore?: number;
}

export interface WatchlistEntry {
  media: AnimeMedia;
  status: WatchlistStatus;
  isFavorite: boolean;
  addedAt: number;
  updatedAt: number;
  userRating?: number; // 1-10
}

export interface UserTasteProfile {
  genreWeights: Record<string, number>;
  studioWeights: Record<string, number>;
  formatWeights: Record<string, number>;
  tagWeights: Record<string, number>;
  dislikedIds: number[];
  seenIds: number[];
  lastUpdated: number;
}

export type DiscoveryFilter = 'trending' | 'top_movies' | 'masterpieces' | 'seasonal' | 'gems' | 'all';
