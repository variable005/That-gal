import type { AnimeMedia, DiscoveryFilter } from './types';
import { INITIAL_ANIME_SEED } from './seedAnime';

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

interface AniListRawMedia {
  id: number;
  title: {
    english: string | null;
    romaji: string;
    native: string | null;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    color: string | null;
  };
  bannerImage: string | null;
  format: string;
  episodes: number | null;
  duration: number | null;
  status: string;
  seasonYear: number | null;
  season: string | null;
  genres: string[];
  studios: {
    nodes: Array<{ name: string }>;
  };
  tags: Array<{ name: string; rank: number }>;
  averageScore: number | null;
  popularity: number;
  description: string | null;
  trailer: {
    id: string | null;
    site: string | null;
  } | null;
  siteUrl: string;
}

interface AniListResponse {
  data?: {
    Page?: {
      pageInfo: {
        hasNextPage: boolean;
      };
      media: AniListRawMedia[];
    };
  };
}

// 10-minute in-memory cache
const cache = new Map<string, { data: AnimeMedia[]; hasNextPage: boolean; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function cleanDescription(desc: string | null): string | null {
  if (!desc) return null;
  return desc
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

function normalizeRaw(raw: AniListRawMedia): AnimeMedia {
  return {
    id: raw.id,
    title: {
      english: raw.title.english || null,
      romaji: raw.title.romaji || 'Untitled',
      native: raw.title.native || null,
    },
    coverImage: {
      extraLarge: raw.coverImage.extraLarge || raw.coverImage.large,
      large: raw.coverImage.large,
      color: raw.coverImage.color || '#6366F1',
    },
    bannerImage: raw.bannerImage || null,
    format: (raw.format || 'TV') as AnimeMedia['format'],
    episodes: raw.episodes || null,
    duration: raw.duration || null,
    status: raw.status || 'FINISHED',
    seasonYear: raw.seasonYear || null,
    season: raw.season || null,
    genres: raw.genres || [],
    studios: (raw.studios?.nodes || []).map((s) => s.name),
    tags: (raw.tags || []).slice(0, 10).map((t) => t.name),
    averageScore: raw.averageScore || null,
    popularity: raw.popularity || 0,
    description: cleanDescription(raw.description),
    trailer: raw.trailer?.id ? { id: raw.trailer.id, site: raw.trailer.site } : null,
    siteUrl: raw.siteUrl || `https://anilist.co/anime/${raw.id}`,
  };
}

export class AniListClient {
  public async fetchDiscoveryFeed(
    filter: DiscoveryFilter = 'trending',
    page: number = 1,
    perPage: number = 24,
    search?: string,
    signal?: AbortSignal
  ): Promise<{ media: AnimeMedia[]; hasNextPage: boolean }> {
    const cacheKey = `${filter}:${page}:${perPage}:${search || ''}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { media: cached.data, hasNextPage: cached.hasNextPage };
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    let currentSeason = 'WINTER';
    if (currentMonth >= 2 && currentMonth <= 4) currentSeason = 'SPRING';
    else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = 'SUMMER';
    else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = 'FALL';

    // Construct GraphQL query variables
    const variables: Record<string, unknown> = {
      page,
      perPage,
    };

    let queryArguments = 'type: ANIME, isAdult: false';

    if (search && search.trim()) {
      variables.search = search.trim();
      queryArguments += ', search: $search';
    } else {
      switch (filter) {
        case 'top_movies':
          queryArguments += ', format: MOVIE, sort: SCORE_DESC';
          break;
        case 'masterpieces':
          queryArguments += ', sort: SCORE_DESC';
          break;
        case 'seasonal':
          variables.season = currentSeason;
          variables.seasonYear = currentYear;
          queryArguments += ', season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC';
          break;
        case 'gems':
          // High rating, lower popularity count
          variables.scoreGreater = 80;
          variables.popularityLesser = 90000;
          queryArguments += ', averageScore_greater: $scoreGreater, popularity_lesser: $popularityLesser, sort: SCORE_DESC';
          break;
        case 'trending':
        default:
          queryArguments += ', sort: TRENDING_DESC';
          break;
      }
    }

    const query = `
      query (
        $page: Int, 
        $perPage: Int, 
        $search: String, 
        $season: MediaSeason, 
        $seasonYear: Int, 
        $scoreGreater: Int, 
        $popularityLesser: Int
      ) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
          }
          media(${queryArguments}) {
            id
            title {
              english
              romaji
              native
            }
            coverImage {
              extraLarge
              large
              color
            }
            bannerImage
            format
            episodes
            duration
            status
            seasonYear
            season
            genres
            studios(isMain: true) {
              nodes {
                name
              }
            }
            tags {
              name
              rank
            }
            averageScore
            popularity
            description(asHtml: false)
            trailer {
              id
              site
            }
            siteUrl
          }
        }
      }
    `;

    try {
      const response = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`AniList returned status ${response.status}`);
      }

      const json: AniListResponse = await response.json();
      const rawMediaList = json.data?.Page?.media || [];
      const hasNextPage = Boolean(json.data?.Page?.pageInfo?.hasNextPage);
      const normalized = rawMediaList.map(normalizeRaw);

      if (normalized.length > 0) {
        cache.set(cacheKey, { data: normalized, hasNextPage, timestamp: Date.now() });
      }

      return { media: normalized, hasNextPage };
    } catch (err: unknown) {
      if (signal?.aborted) throw err;
      console.warn('AniList query failed, falling back to seed catalog:', err);
      // Return seed items if initial request fails
      if (page === 1 && !search) {
        return { media: INITIAL_ANIME_SEED, hasNextPage: false };
      }
      return { media: [], hasNextPage: false };
    }
  }
}

export const anilistApi = new AniListClient();
