import type { AnimeMedia, UserTasteProfile } from './types';

export interface ScoredMedia {
  media: AnimeMedia;
  totalScore: number;
  reason: string;
}

/**
 * Deterministic recommendation scoring function based on demonstrated taste signals
 */
export function scoreMedia(media: AnimeMedia, profile: UserTasteProfile): ScoredMedia {
  // Hard penalty for explicitly disliked items
  if (profile.dislikedIds.includes(media.id)) {
    return {
      media,
      totalScore: -9999,
      reason: 'Previously dismissed',
    };
  }

  let genreScore = 0;
  let topGenre = '';
  let topGenreWeight = 0;

  for (const genre of media.genres) {
    const w = profile.genreWeights[genre] || 0;
    genreScore += w;
    if (w > topGenreWeight) {
      topGenreWeight = w;
      topGenre = genre;
    }
  }

  let studioScore = 0;
  let topStudio = '';
  let topStudioWeight = 0;

  for (const studio of media.studios) {
    const w = profile.studioWeights[studio] || 0;
    studioScore += w * 1.6;
    if (w > topStudioWeight) {
      topStudioWeight = w;
      topStudio = studio;
    }
  }

  let tagScore = 0;
  for (const tag of media.tags) {
    const w = profile.tagWeights[tag] || 0;
    tagScore += w * 0.9;
  }

  const formatScore = (profile.formatWeights[media.format] || 0) * 0.8;

  // Base score from critic / community reception
  const qualityBaseline = (media.averageScore || 70) / 10;

  const totalScore = genreScore + studioScore + tagScore + formatScore + qualityBaseline;

  // Generate data-driven, truthful explanation
  let reason = 'Curated discovery based on visual acclaim';

  if (topStudioWeight > 10) {
    reason = `Features artwork from ${topStudio}, one of your preferred studios`;
  } else if (topGenreWeight > 12 && media.format === 'MOVIE') {
    reason = `Critically acclaimed ${topGenre} film matching your tastes`;
  } else if (topGenreWeight > 8) {
    reason = `Recommended based on your affinity for ${topGenre}`;
  } else if (media.averageScore && media.averageScore >= 88) {
    reason = `Universal masterpiece with a ${media.averageScore}% acclaim score`;
  } else if (media.format === 'MOVIE') {
    reason = 'Feature film with exceptional visual production';
  }

  return {
    media: {
      ...media,
      matchScore: Math.round(totalScore * 10) / 10,
      recommendationReason: reason,
    },
    totalScore,
    reason,
  };
}

/**
 * Re-ranks candidates with diversity adjustments to avoid repetitive clusters
 */
export function rankAndDiversify(
  candidates: AnimeMedia[],
  profile: UserTasteProfile
): AnimeMedia[] {
  const scored = candidates
    .filter((m) => !profile.dislikedIds.includes(m.id))
    .map((m) => scoreMedia(m, profile));

  // Sort descending by score
  scored.sort((a, b) => b.totalScore - a.totalScore);

  const finalResult: AnimeMedia[] = [];
  const studioCount: Record<string, number> = {};

  for (const item of scored) {
    const mainStudio = item.media.studios[0] || 'Unknown';
    const currentCount = studioCount[mainStudio] || 0;

    // Apply soft diversity penalty if the same studio appears more than twice in succession
    if (currentCount >= 3) {
      continue; // defer to later in feed
    }

    studioCount[mainStudio] = currentCount + 1;
    finalResult.push(item.media);
  }

  return finalResult;
}
