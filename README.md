# That Gal (Dream Atlas) — Adaptive Anime Art Discovery Engine

> An intelligent, visual art publication powered by the Danbooru API. It continuously discovers artwork you might appreciate, learns from your aesthetic interactions, and refines recommendations over time.

---

## 1. Product Philosophy

Most anime art platforms are search engines where users must formulate precise queries to find what they want. **That Gal (Dream Atlas)** flips this paradigm:

- **Serendipity Over Searching**: Opening the platform feels like opening an editorial art magazine curated specifically for you.
- **Continuous Adaptation**: Rather than requiring onboarding forms or questionnaires, the engine observes natural browsing signals (likes, bookmarks, detail inspections, and dislikes) to build an evolving taste profile.
- **Exploration & Novelty**: Avoids filter bubbles and echo chambers by balancing familiar tastes with adjacent discoveries (new artists, related franchises) and calculated wildcards.
- **Artwork-First Presentation**: A dark editorial aesthetic with minimal chrome, respectful typography, and fluid responsive masonry layouts that emphasize the artwork.

---

## 2. Architecture & Danbooru API Integration

The application operates as a high-performance, local-first client built on top of the official Danbooru REST API specification (`/posts.json` and `/tags.json`).

### API Pipeline & Endpoints

- **Live Danbooru REST API**: Primary target is `https://danbooru.donmai.us/posts.json`.
- **Danbooru Testbooru Mirror**: Secondary target is `https://testbooru.donmai.us/posts.json`, ensuring continuous feed operation even when Cloudflare automated challenge protection triggers on unauthenticated IP traffic.
- **Vite Development Proxy**: Configured via `vite.config.ts` to seamlessly proxy `/api/danbooru/*` and `/api/testbooru/*` requests with custom `User-Agent` headers, resolving browser Cross-Origin Resource Sharing (CORS) constraints without external dependencies.
- **Client In-Memory Cache**: 5-minute TTL cache layer prevents redundant network requests and enforces polite rate limiting conforming to Danbooru's 10 requests/second policy.

### Data Attributes Utilized

| Field | Source Type | Usage in Discovery Engine |
| :--- | :--- | :--- |
| `id` | `integer` | Unique post identifier, deduplication, and direct post link. |
| `rating` | `string` (`g`, `s`, `q`, `e`) | Content safety verification. Only `g` is permitted. |
| `tag_string_artist` | `string` | Primary artist credit, artist affinity weighting. |
| `tag_string_character` | `string` | Character recognition, character affinity weighting. |
| `tag_string_copyright` | `string` | Franchise and series correlation. |
| `tag_string_general` | `string` | Visual motifs, thematic descriptors, aesthetic vectors. |
| `media_asset.variants` | `array` | Optimal multi-resolution image selection (`180x180`, `720x720`, `original`). |
| `score` & `fav_count` | `integer` | Quality indicators and popularity baselines. |

---

## 3. Content Safety Filter (100% All-Ages Verified)

Safety is not treated as an optional UI toggle; it is enforced as a structural invariant at the centralized API boundary:

1. **Query-Level Enforcement**: Every outbound request automatically injects `rating:g` into the query string (`tags=rating:g ...`). Conflicting or explicit rating tags (`rating:e`, `rating:q`, `rating:s`) are stripped before transmission.
2. **Response-Level Verification**: All incoming posts pass through `isPostConfirmedSafe()` before entering the feed state. Any post with an unverified rating, missing asset, or non-`g` rating is rejected.
3. **Immutability**: UI components cannot override or circumvent safety policies.

---

## 4. Recommendation Engine (System Overview)

The recommendation pipeline operates through five deterministic stages:

```
[ Danbooru Candidate Pool ]
           │
           ▼
[ Centralized Safety Filter ]  ── (Rejects non-'g', banned, or deleted posts)
           │
           ▼
[ Preference Match Scoring ]  ── (Calculates artist, character, and motif weights)
           │
           ▼
[ Diversity & Novelty Pass ]   ── (Penalizes over-represented artists/tags)
           │
           ▼
[ Re-ranked Feed Assembly ]    ── (60% Familiar, 25% Adjacent, 15% Wildcards)
```

### Signal Weights

- **Explicit Like**: `+3.0`
- **Save to Gallery**: `+5.0`
- **Inspect Details**: `+0.5`
- **Explicit Dislike**: `-5.0` (with strict negative penalty filter)
- **Seen Post History**: Repetition penalty prevents duplicate exposures.

---

## 5. Visual Design System

- **Palette**: Editorial dark mode (`#0B0B0D` canvas, `#151518` primary surface, `#202024` elevated cards, `#C7A6FF` restrained lavender accent).
- **Typography**: Editorial serif (*Newsreader*) for titles, clean geometric sans (*Inter*) for interface controls, and monospace (*JetBrains Mono*) for technical metadata.
- **Layout**: Dynamic multi-column responsive masonry preserving native artwork aspect ratios with progressive image loading.
- **Web Guidance Compliant**: Adheres to modern web performance standards, using `fetchpriority="high"` for LCP candidates and native `loading="lazy"` for below-the-fold artwork.

---

A project by Hariom Sharnam
