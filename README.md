# playlist.ratnadwip.com
### A personal music archive, listening journal and playlist collection

This is the source code for **[playlist.ratnadwip.com](https://playlist.ratnadwip.com)** — the personal music archive belonging to Ratnadwip Sarkar.

Designed to feel like finding someone's small, carefully maintained corner of the internet.

---

## Key Features

- **Live Listening Hero**: Real-time display of currently playing Spotify tracks with ambient artwork blur glow, audio visualizer bars, and outbound Spotify links.
- **Graceful Fallbacks**: When nothing is playing, displays human notes (*"A rare moment of silence"*) alongside the last played track.
- **Authentic Listening Statistics**: Verifiable metrics directly from Cloudflare D1 (playlists, unique songs, artists, and first-party visits).
- **Curated Playlists & Stories**: Every playlist has an editorial essay/journal entry sharing the memories, context, and emotions behind it.
- **Annotated Tracklists**: Individual track listings with personal notes and direct Spotify links without embedded players.
- **Private Admin Dashboard (`/admin`)**:
  - Secure Web Crypto PBKDF2 password hashing & HttpOnly cookie sessions.
  - Playlist CRUD with rich story writing, tags, and cover image management.
  - Song management with 1-click Spotify URL lookup or manual entry.
  - Spotify OAuth 2.0 connection management with AES-GCM encrypted token storage.
  - Site copy editor for the about section, hero text, and signature.
- **Serverless & Edge-Native**: Powered entirely by Cloudflare Pages, Cloudflare Pages Functions, and Cloudflare D1.

---

## Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Typography**: Big Shoulders Display (Expressive Headings) + DM Sans (Body, metadata, UI)
- **Aesthetic**: Charcoal/near-black backgrounds (`#121212`), glassmorphism, analog grain texture, restrained yellow-green accent (`#E0F11F`)
- **Backend**: Cloudflare Pages Functions (`/functions/api/...`)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Object Storage**: Cloudflare R2 (optional for playlist artwork)
- **External Integration**: Spotify Web API (OAuth 2.0 Authorization Code flow)

---

## Project Structure

```
playlist/
├── migrations/
│   ├── 0001_initial_schema.sql    # D1 relational database schema
│   └── 0002_seed_data.sql         # Curated seed playlists, stories & tracks
├── functions/                     # Cloudflare Pages Functions
│   ├── _middleware.ts             # Security headers & CORS
│   └── api/
│       ├── _auth.ts               # Admin session & authentication
│       ├── _crypto.ts             # Web Crypto PBKDF2 & AES-GCM encryption
│       ├── _db.ts                 # D1 query helpers
│       ├── _spotify.ts            # Spotify Web API client
│       ├── spotify/now-playing.ts # Public playback endpoint
│       ├── playlists/             # Public playlist endpoints
│       ├── stats.ts               # Public archive statistics
│       └── admin/                 # Protected admin API routes
├── src/
│   ├── components/
│   │   ├── common/                # Navigation, Footer, Equalizer, LiveIndicator
│   │   ├── public/                # NowPlayingHero, ListeningStats, PlaylistGrid, About
│   │   ├── playlist/              # PlaylistHeader, PlaylistStory, TrackList, TrackItem
│   │   └── admin/                 # AdminOverview, PlaylistEditor, TrackManager, SpotifySettings
│   ├── context/                   # AuthContext, NowPlayingContext
│   ├── pages/                     # HomePage, PlaylistDetailPage, AdminPage
│   ├── services/                  # API client & local dev fixtures
│   └── utils/                     # Formatting & color extraction
├── wrangler.toml                  # Cloudflare Pages, D1 & R2 configuration
├── tailwind.config.js             # Custom colors, typography, keyframe animations
├── vite.config.ts                 # Vite bundler configuration
└── package.json                   # Dependencies & scripts
```

---

## Getting Started

### 1. Install Dependencies

When you are ready to install dependencies:

```bash
npm install
```

### 2. Local Development

You can run the frontend development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`. When running in standalone Vite mode, the application uses development fixtures so you can explore playlists, stories, and the admin interface immediately.

To develop with local Cloudflare Pages Functions and local D1 database:

```bash
npx wrangler pages dev dist --d1=DB --compatibility-date=2024-09-23
```

---

## Database Setup (Cloudflare D1)

### 1. Create the D1 Database

```bash
npx wrangler d1 create playlist_db
```

Wrangler will output your database configuration. Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "playlist_db"
database_id = "your-database-id-here"
```

### 2. Run Database Migrations

For local development:

```bash
npm run d1:migrate:local
```

For production on Cloudflare:

```bash
npm run d1:migrate:remote
```

This sets up all tables and inserts Ratnadwip's initial curated playlists, deeply personal stories, and tracks.

---

## Spotify Developer Configuration

1. Visit the **[Spotify Developer Dashboard](https://developer.spotify.com/dashboard)** and log in with your Spotify account.
2. Click **Create an App**:
   - App Name: `Ratnadwip Music Archive`
   - App Description: `Personal music playback and playlist archive for playlist.ratnadwip.com`
   - Redirect URI: `https://playlist.ratnadwip.com/api/admin/spotify/callback` (and `http://localhost:3000/api/admin/spotify/callback` for dev)
3. Under **Settings**, copy your **Client ID** and **Client Secret**.
4. Configure the secrets on Cloudflare Pages:

```bash
npx wrangler secret put SPOTIFY_CLIENT_ID
npx wrangler secret put SPOTIFY_CLIENT_SECRET
npx wrangler secret put SPOTIFY_TOKEN_ENCRYPTION_KEY
```

> **Note on SPOTIFY_TOKEN_ENCRYPTION_KEY**: Use any random 32-character string (or generate one with `openssl rand -hex 16`). This key encrypts your Spotify refresh tokens using AES-256-GCM before saving them to D1.

5. Open `https://playlist.ratnadwip.com/admin` → **Spotify** → Click **Connect Spotify Account** to authorize your personal account.

---

## Admin Account Provisioning

When you first open `/admin`:
1. Click **First time setup?** at the bottom of the login card.
2. Enter your desired administrator username and a secure password (minimum 8 characters).
3. The server uses native Web Crypto PBKDF2 (100,000 iterations) with a unique salt to hash the credentials and saves the administrator account to D1.
4. Once created, the setup endpoint automatically locks permanently.

---

## Deployment to Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages in the Cloudflare Dashboard.
2. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Under **Settings → Functions → D1 database bindings**:
   - Variable name: `DB`
   - D1 Database: `playlist_db`
4. Under **Custom Domains**, bind `playlist.ratnadwip.com`.

