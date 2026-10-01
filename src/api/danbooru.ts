import { enforceSafeQueryTags, isPostConfirmedSafe, normalizeSafePost } from './safety';
import { INITIAL_SAFE_ART_SEED } from './seedData';
import type { DanbooruQueryParams, RawDanbooruPost, SafePost } from './types';

export interface ApiClientConfig {
  endpoint: 'danbooru' | 'testbooru' | 'safebooru';
  username?: string;
  apiKey?: string;
}

export interface FetchPostsResult {
  posts: SafePost[];
  endpointUsed: string;
  isFallback: boolean;
  totalFetched: number;
}

// In-memory cache for API responses to avoid duplicate fetches
interface CacheEntry {
  data: SafePost[];
  timestamp: number;
}
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const responseCache = new Map<string, CacheEntry>();

export class DanbooruApiClient {
  private config: ApiClientConfig;

  constructor(initialConfig?: Partial<ApiClientConfig>) {
    this.config = {
      endpoint: initialConfig?.endpoint || 'danbooru',
      username: initialConfig?.username,
      apiKey: initialConfig?.apiKey,
    };
  }

  public updateConfig(newConfig: Partial<ApiClientConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  /**
   * Generates cache key for query
   */
  private getCacheKey(tags: string, page: string | number, limit: number, endpoint: string): string {
    return `${endpoint}:${tags}:${page}:${limit}`;
  }

  /**
   * Fetches posts with safe rating guaranteed.
   * Cascades: Danbooru -> Testbooru -> Safebooru -> Seed Fallback.
   * Guarantees that the discovery feed never encounters a blank screen.
   */
  public async fetchPosts(
    params: DanbooruQueryParams = {},
    signal?: AbortSignal
  ): Promise<FetchPostsResult> {
    const limit = Math.min(Math.max(params.limit || 24, 1), 100);
    const page = params.page || 1;
    const safeTags = enforceSafeQueryTags(params.tags);

    const cacheKey = this.getCacheKey(safeTags, page, limit, this.config.endpoint);
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data.length > 0) {
      return {
        posts: cached.data,
        endpointUsed: this.config.endpoint,
        isFallback: false,
        totalFetched: cached.data.length,
      };
    }

    // 1. Try primary endpoint (default Danbooru)
    try {
      const result = await this.executeFetch(this.config.endpoint, safeTags, page, limit, signal);
      if (result.posts.length > 0) {
        responseCache.set(cacheKey, { data: result.posts, timestamp: Date.now() });
        return result;
      }
    } catch (err: unknown) {
      if (signal?.aborted) throw err;
      console.warn(`Primary endpoint [${this.config.endpoint}] unavailable:`, err);
    }

    // 2. If primary was Danbooru and was challenged, try testbooru mirror
    if (this.config.endpoint !== 'testbooru') {
      try {
        const mirrorResult = await this.executeFetch('testbooru', safeTags, page, limit, signal);
        if (mirrorResult.posts.length > 0) {
          responseCache.set(cacheKey, { data: mirrorResult.posts, timestamp: Date.now() });
          return { ...mirrorResult, isFallback: true };
        }
      } catch (mirrorErr: unknown) {
        if (signal?.aborted) throw mirrorErr;
        console.warn('Testbooru mirror unavailable, failing over to Safebooru...');
      }
    }

    // 3. Try Safebooru (open CORS, no Cloudflare challenge blocks)
    try {
      const safebooruResult = await this.executeFetch('safebooru', safeTags, page, limit, signal);
      if (safebooruResult.posts.length > 0) {
        responseCache.set(cacheKey, { data: safebooruResult.posts, timestamp: Date.now() });
        return { ...safebooruResult, isFallback: true };
      }
    } catch (safeErr: unknown) {
      if (signal?.aborted) throw safeErr;
      console.warn('Safebooru endpoint failed:', safeErr);
    }

    // 4. Offline / Initial Seed Baseline (guarantees feed is always populated with real safe art)
    console.info('Serving verified safe initial art seed');
    return {
      posts: INITIAL_SAFE_ART_SEED,
      endpointUsed: 'seed-catalog',
      isFallback: true,
      totalFetched: INITIAL_SAFE_ART_SEED.length,
    };
  }

  /**
   * Executes HTTP request to specific booru endpoint
   */
  private async executeFetch(
    endpoint: 'danbooru' | 'testbooru' | 'safebooru',
    safeTags: string,
    page: number | string,
    limit: number,
    signal?: AbortSignal
  ): Promise<FetchPostsResult> {
    const baseUrl = endpoint === 'danbooru'
      ? '/api/danbooru/posts.json'
      : endpoint === 'testbooru'
      ? '/api/testbooru/posts.json'
      : '/api/safebooru/index.php';

    const url = new URL(baseUrl, window.location.origin);
    
    if (endpoint === 'safebooru') {
      url.searchParams.set('page', 'dapi');
      url.searchParams.set('s', 'post');
      url.searchParams.set('q', 'index');
      url.searchParams.set('json', '1');
      // For safebooru, pass tag search (omit 'rating:g' prefix as Safebooru only indexes safe posts)
      const safebooruTags = safeTags.replace(/rating:(g|general|safe)\s*/i, '').trim();
      if (safebooruTags) {
        url.searchParams.set('tags', safebooruTags);
      }
      url.searchParams.set('limit', limit.toString());
      const pageIndex = typeof page === 'number' ? Math.max(page - 1, 0) : 0;
      url.searchParams.set('pid', pageIndex.toString());
    } else {
      url.searchParams.set('tags', safeTags);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('page', page.toString());

      if (this.config.username && this.config.apiKey) {
        url.searchParams.set('login', this.config.username);
        url.searchParams.set('api_key', this.config.apiKey);
      }
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Endpoint [${endpoint}] responded with HTTP ${response.status}`);
    }

    const text = await response.text();
    // Guard against HTML error / Cloudflare challenge pages
    if (text.trim().startsWith('<')) {
      throw new Error(`Endpoint [${endpoint}] returned HTML challenge or error page`);
    }

    const json = JSON.parse(text);
    if (!Array.isArray(json)) {
      throw new Error(`Malformed response from [${endpoint}]: expected JSON array`);
    }

    const safePosts: SafePost[] = [];
    for (const raw of json) {
      if (isPostConfirmedSafe(raw)) {
        const normalized = normalizeSafePost(raw as RawDanbooruPost);
        if (normalized) {
          safePosts.push(normalized);
        }
      }
    }

    return {
      posts: safePosts,
      endpointUsed: endpoint,
      isFallback: endpoint !== 'danbooru',
      totalFetched: safePosts.length,
    };
  }

  /**
   * Search related tags or autocomplete
   */
  public async fetchTags(query: string, signal?: AbortSignal): Promise<string[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const endpoint = this.config.endpoint === 'testbooru' ? '/api/testbooru' : '/api/danbooru';
      const url = new URL(`${endpoint}/tags.json`, window.location.origin);
      url.searchParams.set('search[name_matches]', `${query.trim()}*`);
      url.searchParams.set('search[order]', 'count');
      url.searchParams.set('limit', '8');

      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
        signal,
      });

      if (!response.ok) return [];
      const text = await response.text();
      if (text.trim().startsWith('<')) return [];
      const data = JSON.parse(text);
      if (!Array.isArray(data)) return [];

      return data.map((t: { name: string }) => t.name).filter(Boolean);
    } catch {
      return [];
    }
  }
}

// Global shared client instance
export const danbooruApi = new DanbooruApiClient();
