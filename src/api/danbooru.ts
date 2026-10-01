import { enforceSafeQueryTags, isPostConfirmedSafe, normalizeSafePost } from './safety';
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
   * Automatically falls back to testbooru if Danbooru main is protected by Cloudflare.
   */
  public async fetchPosts(
    params: DanbooruQueryParams = {},
    signal?: AbortSignal
  ): Promise<FetchPostsResult> {
    const limit = Math.min(Math.max(params.limit || 24, 1), 100);
    const page = params.page || 1;
    // Centralized safe query enforcement
    const safeTags = enforceSafeQueryTags(params.tags);

    const cacheKey = this.getCacheKey(safeTags, page, limit, this.config.endpoint);
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        posts: cached.data,
        endpointUsed: this.config.endpoint,
        isFallback: false,
        totalFetched: cached.data.length,
      };
    }

    // Try primary endpoint first
    try {
      const result = await this.executeFetch(this.config.endpoint, safeTags, page, limit, signal);
      if (result.posts.length > 0 || this.config.endpoint !== 'danbooru') {
        responseCache.set(cacheKey, { data: result.posts, timestamp: Date.now() });
        return result;
      }
    } catch (err: unknown) {
      if (signal?.aborted) throw err;
      console.warn(`Primary endpoint [${this.config.endpoint}] failed:`, err);
    }

    // If primary was Danbooru and it failed or was blocked by Cloudflare, fall back to testbooru
    if (this.config.endpoint === 'danbooru') {
      try {
        console.info('Switching to Danbooru mirror fallback...');
        const fallbackResult = await this.executeFetch('testbooru', safeTags, page, limit, signal);
        return {
          ...fallbackResult,
          isFallback: true,
        };
      } catch (fallbackErr: unknown) {
        if (signal?.aborted) throw fallbackErr;
        console.warn('Fallback endpoint failed:', fallbackErr);
      }
    }

    // Return empty safe result rather than crashing
    return {
      posts: [],
      endpointUsed: this.config.endpoint,
      isFallback: true,
      totalFetched: 0,
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
      url.searchParams.set('tags', safeTags);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('pid', (typeof page === 'number' ? page - 1 : 0).toString());
    } else {
      url.searchParams.set('tags', safeTags);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('page', page.toString());

      // If user provided credentials in settings, attach them
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
      throw new Error(`Danbooru API error ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    if (!Array.isArray(json)) {
      throw new Error('Malformed API response: expected array of posts');
    }

    // Centralized safe validation: filter strictly by rating 'g' and normalize
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
      isFallback: false,
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
      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((t: { name: string }) => t.name).filter(Boolean);
    } catch {
      return [];
    }
  }
}

// Global shared client instance
export const danbooruApi = new DanbooruApiClient();
