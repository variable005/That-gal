import type { RawDanbooruPost, SafePost } from './types';

/**
 * Enforces rating:g at the query parameter level.
 * Strips any conflicting rating tags (rating:s, rating:q, rating:e)
 * and guarantees that rating:g is always present.
 */
export function enforceSafeQueryTags(inputTags?: string): string {
  if (!inputTags || !inputTags.trim()) {
    return 'rating:g';
  }

  // Remove any explicit non-safe rating tokens
  const cleanTokens = inputTags
    .trim()
    .split(/\s+/)
    .filter(token => !/^rating:(s|q|e|sensitive|questionable|explicit)$/i.test(token));

  // Ensure rating:g is present
  const hasRatingG = cleanTokens.some(token => /^rating:(g|general)$/i.test(token));
  if (!hasRatingG) {
    cleanTokens.unshift('rating:g');
  }

  return cleanTokens.join(' ');
}

/**
 * Validates whether a raw Danbooru post is confirmed safe ('g' rating).
 * Excludes any post with missing or unverified rating, banned posts,
 * deleted posts, or posts without an accessible image asset.
 */
export function isPostConfirmedSafe(raw: unknown): raw is RawDanbooruPost & { rating: 'g' } {
  if (!raw || typeof raw !== 'object') {
    return false;
  }

  const post = raw as RawDanbooruPost;

  // Must have a valid positive numeric ID
  if (typeof post.id !== 'number' || post.id <= 0) {
    return false;
  }

  // Strict safe rating check: ONLY 'g' is allowed
  if (post.rating !== 'g') {
    return false;
  }

  // Exclude banned or deleted posts
  if (post.is_banned === true || post.is_deleted === true) {
    return false;
  }

  // Must have at least one usable image URL
  const hasImageUrl = Boolean(
    post.large_file_url ||
    post.file_url ||
    post.preview_file_url ||
    (post.media_asset && post.media_asset.variants && post.media_asset.variants.length > 0)
  );

  return hasImageUrl;
}

/**
 * Helper to split space-separated tag strings safely
 */
function splitTags(tagStr?: string | null): string[] {
  if (!tagStr || typeof tagStr !== 'string') return [];
  return tagStr.trim().split(/\s+/).filter(Boolean);
}

/**
 * Transforms a verified raw post into a normalized SafePost
 */
export function normalizeSafePost(raw: RawDanbooruPost): SafePost | null {
  if (!isPostConfirmedSafe(raw)) {
    return null;
  }

  // Resolve best image URLs
  let previewUrl = raw.preview_file_url || '';
  let largeImageUrl = raw.large_file_url || raw.file_url || '';
  let imageUrl = raw.file_url || raw.large_file_url || '';

  // If media_asset variants are available, pick optimal resolution
  if (raw.media_asset?.variants && raw.media_asset.variants.length > 0) {
    const variants = raw.media_asset.variants;
    const v180 = variants.find(v => v.type === '180x180' || v.width <= 200);
    const v720 = variants.find(v => v.type === '720x720' || (v.width >= 600 && v.width <= 1000));
    const vOrig = variants.find(v => v.type === 'original');

    if (v180?.url) previewUrl = v180.url;
    if (v720?.url) largeImageUrl = v720.url;
    if (vOrig?.url) imageUrl = vOrig.url;
  }

  // Fallback chaining
  if (!previewUrl) previewUrl = largeImageUrl || imageUrl;
  if (!largeImageUrl) largeImageUrl = imageUrl || previewUrl;
  if (!imageUrl) imageUrl = largeImageUrl;

  const width = raw.image_width && raw.image_width > 0 ? raw.image_width : 800;
  const height = raw.image_height && raw.image_height > 0 ? raw.image_height : 1000;
  const aspectRatio = width / height;

  const artistTags = splitTags(raw.tag_string_artist);
  const characterTags = splitTags(raw.tag_string_character);
  const copyrightTags = splitTags(raw.tag_string_copyright);
  const generalTags = splitTags(raw.tag_string_general);
  const metaTags = splitTags(raw.tag_string_meta);
  const allTags = splitTags(raw.tag_string);

  const primaryArtist = artistTags.length > 0 ? artistTags[0].replace(/_/g, ' ') : 'Unknown Artist';
  const primaryCharacter = characterTags.length > 0 ? characterTags[0].replace(/_/g, ' ') : null;
  const primaryFranchise = copyrightTags.length > 0 ? copyrightTags[0].replace(/_/g, ' ') : null;

  return {
    id: raw.id,
    rating: 'g',
    createdAt: raw.created_at || new Date().toISOString(),
    score: typeof raw.score === 'number' ? raw.score : 0,
    favCount: typeof raw.fav_count === 'number' ? raw.fav_count : 0,
    width,
    height,
    aspectRatio,
    sourceUrl: raw.source || null,
    danbooruPostUrl: `https://danbooru.donmai.us/posts/${raw.id}`,
    imageUrl,
    previewUrl,
    largeImageUrl,
    allTags,
    artistTags,
    characterTags,
    copyrightTags,
    generalTags,
    metaTags,
    primaryArtist,
    primaryCharacter,
    primaryFranchise,
  };
}
