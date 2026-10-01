# That Gal - Cinematic Anime Discovery and Watchlist Engine

An editorial anime discovery platform where visual craft is the primary interface. Instead of text-dense databases and microscopic thumbnails, That Gal treats official high-resolution key visual posters and widescreen banner art as the core decision-making vector for curating a personal watchlist.

---

## 1. Product Philosophy and Design Intent

### Visual Craft as the Primary Vector
Traditional anime databases require users to search through complex text taxonomies and low-resolution thumbnails. That Gal reverses this interaction model:
- Artwork is presented edge-to-edge in its native aspect ratio.
- High-definition official posters and panoramic concept art banners serve as the primary discovery medium.
- Users evaluate titles based on visual direction, character designs, and animation studio aesthetics.

### Rejection of Algorithmic Echo Chambers
A common failure of recommendation engines is trapping users in narrow loops of identical titles. That Gal balances:
- 60 percent demonstrated affinity: Matching demonstrated preferences for studios, genres, and formats.
- 25 percent adjacent discovery: Introducing related animation directors, neighboring aesthetics, and studio lineages.
- 15 percent critical wildcards: Introducing acclaimed masterpieces and feature films outside established clusters.

### Restrained Editorial Aesthetics
The interface intentionally avoids artificial gradients, decorative cards, and generic interface trends. It employs deep obsidian tones, clean typographical contrast between editorial serifs and monospace data points, and ambient illumination derived directly from the official artwork's dominant color.

---

## 2. API Architecture and Data Contracts

The application interfaces directly with the public AniList GraphQL endpoint (https://graphql.anilist.co) with zero client-side authentication or API keys required.

### Core Query Attributes

| Field | Type | Purpose in Engine |
| :--- | :--- | :--- |
| id | Integer | Unique identifier for deduplication and local state indexing. |
| title | Object (english, romaji, native) | International and native title display. |
| coverImage.extraLarge | String URL | Full-resolution key visual poster (up to 1400px height). |
| bannerImage | String URL | Panoramic widescreen concept art (1920x400px). |
| coverImage.color | String Hex | Extracted dominant color used for card lighting. |
| format | Enum (TV, MOVIE, OVA, SPECIAL) | Format categorization and format-affinity weighting. |
| studios.nodes | Array of Objects | Studio attribution for director and production affinity. |
| genres and tags | Array of Strings | Categorical and thematic descriptor mapping. |
| averageScore | Integer | Reception score used as a baseline quality heuristic. |
| trailer | Object (id, site) | Embedded official promotional previews. |

---

## 3. Recommendation and Taste Modeling Engine

The recommendation pipeline evaluates candidates through a deterministic scoring matrix:

### Signal Weights

```
Action                     Affinity Multiplier
------------------------------------------------
Add to Watchlist           +5.0 (Genres, Tags, Formats)
Mark as Favorite           +8.0 (Studio +1.6x, Genres +1.0x)
Inspect Artwork / Trailer  +1.2 (Subtle interest signal)
Explicit Dismissal         -6.0 (Heavy studio and genre penalty)
```

### Candidate Scoring Formula

```
Score(title) = 
    Sum(GenreAffinity * w_genre) +
    Sum(StudioAffinity * 1.6) +
    Sum(TagAffinity * 0.9) +
    (FormatAffinity * 0.8) +
    (AverageScore / 10.0)
```

Titles explicitly dismissed by the user are immediately assigned a score of -9999 and removed from candidate pools.

### Diversity and Cluster Prevention
When multiple titles from the same production studio appear in succession, a soft penalty threshold defers redundant titles to later positions in the discovery stream, ensuring diverse visual discovery.

### Explainable Recommendations
Every ranked title generates a data-driven justification based on the highest weighted contributor, for example:
- "Features artwork from Kyoto Animation, one of your preferred studios"
- "Critically acclaimed Cyberpunk film matching your tastes"
- "Recommended based on your affinity for Psychological Thrillers"

---

## 4. Local-First Storage Architecture

The application adheres strictly to a local-first paradigm. All data resides on the client device inside browser storage:

- that_gal_watchlist_v1: Normalized dictionary containing watchlist entries, watching status, and favorite flags.
- that_gal_taste_profile_v1: Numeric affinity weights, dismissed title IDs, and history registers.

The system includes JSON backup export and import mechanisms, enabling library portability without cloud dependency.

---

A project by var
