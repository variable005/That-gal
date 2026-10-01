import { describe, it, expect } from 'vitest';
import { enforceSafeQueryTags, isPostConfirmedSafe, normalizeSafePost } from './safety';
import type { RawDanbooruPost } from './types';

describe('enforceSafeQueryTags', () => {
  it('adds rating:g if no tags provided', () => {
    expect(enforceSafeQueryTags()).toBe('rating:g');
    expect(enforceSafeQueryTags('')).toBe('rating:g');
    expect(enforceSafeQueryTags('   ')).toBe('rating:g');
  });

  it('preserves existing tags while ensuring rating:g', () => {
    expect(enforceSafeQueryTags('scenery 1girl')).toBe('rating:g scenery 1girl');
  });

  it('keeps rating:g if already present', () => {
    expect(enforceSafeQueryTags('rating:g scenery')).toBe('rating:g scenery');
  });

  it('strips unsafe rating tags like rating:e, rating:s, rating:q', () => {
    expect(enforceSafeQueryTags('rating:e 1girl')).toBe('rating:g 1girl');
    expect(enforceSafeQueryTags('rating:q rating:s scenery')).toBe('rating:g scenery');
    expect(enforceSafeQueryTags('scenery rating:explicit')).toBe('rating:g scenery');
  });
});

describe('isPostConfirmedSafe', () => {
  const validBasePost: RawDanbooruPost = {
    id: 101,
    rating: 'g',
    preview_file_url: 'https://testbooru-cdn.donmai.us/180x180/sample.jpg',
    large_file_url: 'https://testbooru-cdn.donmai.us/720x720/sample.jpg',
    is_banned: false,
    is_deleted: false,
  };

  it('accepts valid post with rating "g"', () => {
    expect(isPostConfirmedSafe(validBasePost)).toBe(true);
  });

  it('rejects posts with non-safe ratings (s, q, e)', () => {
    expect(isPostConfirmedSafe({ ...validBasePost, rating: 's' })).toBe(false);
    expect(isPostConfirmedSafe({ ...validBasePost, rating: 'q' })).toBe(false);
    expect(isPostConfirmedSafe({ ...validBasePost, rating: 'e' })).toBe(false);
    expect(isPostConfirmedSafe({ ...validBasePost, rating: null })).toBe(false);
    expect(isPostConfirmedSafe({ ...validBasePost, rating: undefined })).toBe(false);
    expect(isPostConfirmedSafe({ ...validBasePost, rating: '' })).toBe(false);
  });

  it('rejects banned or deleted posts', () => {
    expect(isPostConfirmedSafe({ ...validBasePost, is_banned: true })).toBe(false);
    expect(isPostConfirmedSafe({ ...validBasePost, is_deleted: true })).toBe(false);
  });

  it('rejects posts without images', () => {
    expect(isPostConfirmedSafe({ id: 102, rating: 'g' })).toBe(false);
  });

  it('rejects invalid or non-numeric ids', () => {
    expect(isPostConfirmedSafe({ ...validBasePost, id: 0 })).toBe(false);
    expect(isPostConfirmedSafe({ ...validBasePost, id: -5 })).toBe(false);
    expect(isPostConfirmedSafe({ ...validBasePost, id: 'abc' as unknown as number })).toBe(false);
  });
});

describe('normalizeSafePost', () => {
  it('returns null for unsafe post', () => {
    const unsafePost: RawDanbooruPost = {
      id: 999,
      rating: 'e',
      file_url: 'https://example.com/art.jpg',
    };
    expect(normalizeSafePost(unsafePost)).toBeNull();
  });

  it('correctly maps tags and attributes for safe post', () => {
    const post: RawDanbooruPost = {
      id: 42,
      rating: 'g',
      score: 15,
      fav_count: 8,
      image_width: 1200,
      image_height: 800,
      tag_string_artist: 'mika_pikazo',
      tag_string_character: 'frieren fern',
      tag_string_copyright: 'sousou_no_frieren',
      tag_string_general: 'scenery starry_sky fantasy',
      tag_string_meta: 'highres',
      tag_string: 'mika_pikazo frieren fern sousou_no_frieren scenery starry_sky fantasy highres',
      preview_file_url: 'https://example.com/p.jpg',
      large_file_url: 'https://example.com/l.jpg',
    };

    const normalized = normalizeSafePost(post);
    expect(normalized).not.toBeNull();
    expect(normalized?.rating).toBe('g');
    expect(normalized?.primaryArtist).toBe('mika pikazo');
    expect(normalized?.primaryCharacter).toBe('frieren');
    expect(normalized?.primaryFranchise).toBe('sousou no frieren');
    expect(normalized?.aspectRatio).toBe(1.5);
    expect(normalized?.danbooruPostUrl).toBe('https://danbooru.donmai.us/posts/42');
  });
});
