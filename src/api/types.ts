/**
 * Danbooru API Data Types and Safe Post Models
 */

export type DanbooruRating = 'g' | 's' | 'q' | 'e';

export interface DanbooruMediaVariant {
  type: string;
  url: string;
  width: number;
  height: number;
  file_ext: string;
}

export interface DanbooruMediaAsset {
  id?: number;
  md5?: string;
  file_ext?: string;
  file_size?: number;
  image_width?: number;
  image_height?: number;
  variants?: DanbooruMediaVariant[];
}

export interface RawDanbooruPost {
  id: number;
  created_at?: string;
  updated_at?: string;
  up_score?: number;
  down_score?: number;
  score?: number;
  source?: string | null;
  md5?: string;
  rating?: string | null;
  is_pending?: boolean;
  is_flagged?: boolean;
  is_deleted?: boolean;
  is_banned?: boolean;
  uploader_id?: number;
  approver_id?: number | null;
  fav_count?: number;
  tag_string?: string;
  tag_count?: number;
  tag_count_general?: number;
  tag_count_artist?: number;
  tag_count_copyright?: number;
  tag_count_character?: number;
  tag_count_meta?: number;
  file_ext?: string;
  file_size?: number;
  image_width?: number;
  image_height?: number;
  parent_id?: number | null;
  has_children?: boolean;
  pixiv_id?: number | null;
  media_asset?: DanbooruMediaAsset | null;
  tag_string_general?: string;
  tag_string_character?: string;
  tag_string_copyright?: string;
  tag_string_artist?: string;
  tag_string_meta?: string;
  file_url?: string | null;
  large_file_url?: string | null;
  preview_file_url?: string | null;
}

/**
 * Normalized and validated post that is guaranteed safe for all audiences
 */
export interface SafePost {
  id: number;
  rating: 'g';
  createdAt: string;
  score: number;
  favCount: number;
  width: number;
  height: number;
  aspectRatio: number;
  sourceUrl: string | null;
  danbooruPostUrl: string;
  imageUrl: string;
  previewUrl: string;
  largeImageUrl: string;
  
  // Categorized tags
  allTags: string[];
  artistTags: string[];
  characterTags: string[];
  copyrightTags: string[];
  generalTags: string[];
  metaTags: string[];

  // Additional display metadata
  primaryArtist: string;
  primaryCharacter: string | null;
  primaryFranchise: string | null;
}

export interface DanbooruQueryParams {
  tags?: string;
  page?: number | string;
  limit?: number;
}
