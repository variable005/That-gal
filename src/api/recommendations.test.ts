import { describe, it, expect } from 'vitest';
import { scoreMedia, rankAndDiversify } from './recommendations';
import type { AnimeMedia, UserTasteProfile } from './types';

describe('recommendations engine', () => {
  const sampleMedia1: AnimeMedia = {
    id: 1,
    title: { english: 'A Silent Voice', romaji: 'Koe no Katachi', native: null },
    coverImage: { extraLarge: '', large: '', color: '#4A5568' },
    bannerImage: null,
    format: 'MOVIE',
    episodes: 1,
    duration: 130,
    status: 'FINISHED',
    seasonYear: 2016,
    season: 'FALL',
    genres: ['Drama', 'Slice of Life'],
    studios: ['Kyoto Animation'],
    tags: ['Deaf', 'Redemption', 'School'],
    averageScore: 89,
    popularity: 400000,
    description: 'A poignant story of redemption.',
    trailer: null,
    siteUrl: '',
  };

  const sampleMedia2: AnimeMedia = {
    id: 2,
    title: { english: 'Cyberpunk Edgerunners', romaji: 'Cyberpunk Edgerunners', native: null },
    coverImage: { extraLarge: '', large: '', color: '#ECC94B' },
    bannerImage: null,
    format: 'TV',
    episodes: 10,
    duration: 24,
    status: 'FINISHED',
    seasonYear: 2022,
    season: 'FALL',
    genres: ['Action', 'Sci-Fi'],
    studios: ['Trigger'],
    tags: ['Cyberpunk', 'Dystopian', 'Gore'],
    averageScore: 86,
    popularity: 350000,
    description: 'A street kid surviving in a body modification-obsessed city.',
    trailer: null,
    siteUrl: '',
  };

  const emptyProfile: UserTasteProfile = {
    genreWeights: {},
    studioWeights: {},
    formatWeights: {},
    tagWeights: {},
    dislikedIds: [],
    seenIds: [],
    lastUpdated: Date.now(),
  };

  it('calculates score based on baseline quality when profile is fresh', () => {
    const scored1 = scoreMedia(sampleMedia1, emptyProfile);
    expect(scored1.totalScore).toBeGreaterThan(8);
    expect(scored1.reason).toBeDefined();
  });

  it('boosts media matching user preferred studio and genre', () => {
    const kyoaniProfile: UserTasteProfile = {
      ...emptyProfile,
      studioWeights: { 'Kyoto Animation': 20 },
      genreWeights: { Drama: 10 },
    };

    const scored1 = scoreMedia(sampleMedia1, kyoaniProfile);
    const scored2 = scoreMedia(sampleMedia2, kyoaniProfile);

    expect(scored1.totalScore).toBeGreaterThan(scored2.totalScore);
    expect(scored1.reason).toContain('Kyoto Animation');
  });

  it('penalizes and filters out explicitly disliked titles', () => {
    const dislikedProfile: UserTasteProfile = {
      ...emptyProfile,
      dislikedIds: [1],
    };

    const scored = scoreMedia(sampleMedia1, dislikedProfile);
    expect(scored.totalScore).toBeLessThan(-1000);

    const ranked = rankAndDiversify([sampleMedia1, sampleMedia2], dislikedProfile);
    expect(ranked.some((m) => m.id === 1)).toBe(false);
    expect(ranked.some((m) => m.id === 2)).toBe(true);
  });
});
