# Deployment Guide: playlist.ratnadwip.com
### Complete step-by-step instructions to deploy from scratch to Cloudflare Pages & D1

This document provides a clean, sequential guide to deploying **playlist.ratnadwip.com** from zero to a live production environment.

---

## Architecture Overview

```
                                      ┌────────────────────────────────┐
                                      │    Spotify Web API             │
                                      │    (OAuth 2.0 Playback)        │
                                      └──────────────┬─────────────────┘
                                                     │
                                                     ▼
┌────────────────────────────────┐     ┌────────────────────────────────┐
│   Cloudflare Pages Frontend    │ ──► │  Cloudflare Pages Functions    │
│   (React + Vite SPA on CDN)    │     │  (/functions/api/* Edge API)   │
└────────────────────────────────┘     └──────────────┬─────────────────┘
                                                     │
                                                     ▼
                                       ┌────────────────────────────────┐
                                       │  Cloudflare D1 Database        │
                                       │  (SQLite relational data)      │
                                       └────────────────────────────────┘
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (built to `/dist` and hosted globally on Cloudflare Pages CDN).
- **Backend**: Cloudflare Pages Functions located in `/functions/api/...` running on Cloudflare Workers edge runtime.
- **Database**: Cloudflare D1 serverless relational database (tables: `playlists`, `songs`, `playlist_songs`, `admin_users`, `admin_sessions`, `spotify_tokens`, `site_settings`, `analytics_events`).
- **Secrets Management**: Cloudflare encrypted environment variables (never committed to Git).

---

## Prerequisites

1. **A Cloudflare Account** (with the domain `ratnadwip.com` active in Cloudflare DNS).
2. **A Spotify Developer Account** (any free or Premium Spotify account).
3. **Node.js (v18+) and npm** installed locally.
4. **Git** installed locally.

---

## Step 1: Spotify Developer Dashboard Setup

1. Go to the **[Spotify Developer Dashboard](https://developer.spotify.com/dashboard)** and log in.
2. Click **Create App**:
   - **App Name**: `Ratnadwip Music Archive`
   - **App Description**: `Personal playback archive for playlist.ratnadwip.com`
   - **Which API/SDKs are you planning to use?**: Select **Web API**.
3. Under **Redirect URIs**, add **both** of the following:
   ```text
   http://127.0.0.1:3000/api/admin/spotify/callback
   https://playlist.ratnadwip.com/api/admin/spotify/callback
   ```
   > **Important**: Spotify strictly bans `http://localhost` for local development. You must use `http://127.0.0.1:3000/...` exactly as written.

4. Check the terms checkbox and click **Save**.
5. Click **Settings** in your new Spotify app:
   - Copy your **Client ID**.
   - Click **View client secret** and copy your **Client Secret**.

---

## Step 2: Push Code to GitHub

Make sure all your code is committed to your GitHub repository:

```bash
git add .
git commit -m "feat: complete music archive application"
git push origin main
```

> **Security Check**: Verify that `.env`, `.spotify_token.json`, and `.local_db.json` are NOT in your git staging area (`git status`). They are already protected by `.gitignore`.

---

## Step 3: Create Cloudflare D1 Database & Run Migrations

### 1. Log in to Cloudflare via Wrangler CLI
From your terminal in the project directory:
```bash
npx wrangler login
```
A browser window will open asking you to authorize Wrangler with your Cloudflare account.

### 2. Create the Production D1 Database
```bash
npx wrangler d1 create playlist_db
```
Wrangler will output something like:
```toml
[[d1_databases]]
binding = "DB"
database_name = "playlist_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. Update `wrangler.toml` with your `database_id`
Open `wrangler.toml` and paste the generated `database_id`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "playlist_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "migrations"
```

### 4. Apply Schema and Seed Data to Remote D1
Apply Migration 0001 (Schema) and Migration 0002 (Seed Playlists & Songs):
```bash
npm run d1:migrate:remote
```
*(Alternatively: `npx wrangler d1 migrations apply DB --remote`)*

When prompted `Are you sure you want to apply these migrations to playlist_db?`, type `y` and press Enter.

### 5. (Optional) Create Cloudflare R2 Bucket for Custom Image Uploads
If you plan to upload image files directly instead of pasting image URLs:
```bash
npx wrangler r2 bucket create playlist-media
```
And uncomment the `[[r2_buckets]]` section in `wrangler.toml`. If you only use image URLs (from Spotify, Unsplash, etc.), this step is completely optional.

---

## Step 4: Create Cloudflare Pages Project

1. Open the **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. In the left sidebar, navigate to **Workers & Pages** → **Create application** → **Pages** tab → **Connect to Git**.
3. Select your GitHub repository (`playlist`).
4. Configure the build settings:
   - **Project name**: `playlist-ratnadwip-com`
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Deploy command** (if prompted by Cloudflare): `npx wrangler pages deploy dist`
     > **Important**: If Cloudflare's dashboard has a **Deploy command** field defaulting to `npx wrangler deploy`, change it to `npx wrangler pages deploy dist` (or leave it blank for classic Pages). Running `npx wrangler deploy` causes: `[ERROR] It looks like you've run a Workers-specific command in a Pages project.`
5. Under **Environment variables (advanced)**, add:
   - `NODE_VERSION` = `20`
6. Click **Save and Deploy**.

Cloudflare will clone your repository, run `npm run build`, and deploy the initial static build.

---

## Step 5: Bind the D1 Database to Cloudflare Pages

1. In the Cloudflare Dashboard, go to **Workers & Pages** → click on your **`playlist-ratnadwip-com`** project.
2. Go to **Settings** → **Functions**.
3. Scroll down to **D1 database bindings** and click **Add binding**:
   - **Variable name**: `DB` *(Must be uppercase `DB`)*
   - **D1 database**: Select `playlist_db`
4. Click **Save**.

---

## Step 6: Configure Encrypted Secrets & Environment Variables

Never commit secrets to Git or `wrangler.toml`. Add them in Cloudflare Pages:

1. In your Pages project, go to **Settings** → **Environment variables**.
2. Click **Add variables** under **Production**:

| Variable Name | Type | Value |
| :--- | :--- | :--- |
| `SPOTIFY_CLIENT_ID` | **Secret (Encrypted)** | Your Spotify Client ID from Step 1 |
| `SPOTIFY_CLIENT_SECRET` | **Secret (Encrypted)** | Your Spotify Client Secret from Step 1 |
| `SPOTIFY_REDIRECT_URI` | **Secret (Encrypted)** | `https://playlist.ratnadwip.com/api/admin/spotify/callback` |
| `SPOTIFY_TOKEN_ENCRYPTION_KEY` | **Secret (Encrypted)** | A random 32-character hex key (e.g. `368be862e6667e26aaf41ce7e3e6c508`) |
| `ENVIRONMENT` | Plaintext | `production` |
| `SITE_URL` | Plaintext | `https://playlist.ratnadwip.com` |

3. Click **Save**.

*(Note: If you have already deployed before setting the binding or variables, go to the **Deployments** tab, click **View details** on the latest deployment, and click **Retry deployment** so the new variables and database binding take effect).*

---

## Step 7: Configure Custom Domain (`playlist.ratnadwip.com`)

1. In your Pages project, go to the **Custom domains** tab.
2. Click **Set up a custom domain**.
3. Enter:
   ```text
   playlist.ratnadwip.com
   ```
4. Click **Continue**.
5. Cloudflare will automatically detect that `ratnadwip.com` is in your Cloudflare account and create the CNAME DNS record pointing to your Pages project.
6. Click **Activate domain**.
7. SSL/TLS provisioning will take 1–2 minutes. Once active, your site will be live at `https://playlist.ratnadwip.com`.

---

## Step 8: Initialize Admin Account

1. Open your live site in your browser:
   ```text
   https://playlist.ratnadwip.com/admin
   ```
2. Click **First time setup?** at the bottom of the login card.
3. Choose your administrator username (e.g., `ratnadwip`) and a strong password (minimum 8 characters).
4. Click **Create Admin Account**.
   - The password is hashed using Web Crypto PBKDF2 (100,000 iterations) with a unique salt.
   - The admin user is stored securely in your production D1 database.
   - The `/api/admin/setup` endpoint permanently locks once the first admin account is created.

---

## Step 9: Connect Spotify in Production

1. While logged into the Admin dashboard at `https://playlist.ratnadwip.com/admin`, click the **Spotify** tab in the navigation.
2. Verify that **Redirect URI** matches:
   ```text
   https://playlist.ratnadwip.com/api/admin/spotify/callback
   ```
3. Click **Connect Spotify Account**.
4. You will be redirected to Spotify's authorization page.
5. Click **Agree** to authorize `user-read-currently-playing` and `user-read-recently-played`.
6. Spotify will redirect back to:
   ```text
   https://playlist.ratnadwip.com/admin?spotify=connected
   ```
   - The server exchanges the authorization code for tokens.
   - The refresh token is encrypted with AES-256-GCM using your `SPOTIFY_TOKEN_ENCRYPTION_KEY` and saved in D1.
   - The dashboard will now show **Account Connection: Live**.
7. Click **Test Now-Playing Endpoint** to verify that metadata is returned.

---

## Step 10: Verification & Smoke Test

1. **Homepage (`/`)**:
   - Start playing any song on Spotify (desktop, mobile, or web player).
   - Open `https://playlist.ratnadwip.com`.
   - Verify that the hero section displays your currently playing song, album art, ambient glow, and animated audio equalizer.
2. **Playlist Detail Page**:
   - Click on any playlist card (e.g., *Late Nights in North Kolkata*).
   - Verify that the personal essay loads cleanly.
   - Click a song's Spotify icon to verify it opens the song in Spotify in a new tab.
3. **Editorial Changes**:
   - Go to `/admin` → **Settings**.
   - Edit the About heading or personal note, then click **Save Settings**.
   - Reload the public homepage to confirm the copy reflects your changes immediately.

---

## Routine Maintenance & FAQ

### How do I add new playlists or tracks?
1. Open `https://playlist.ratnadwip.com/admin`.
2. Go to **Playlists** → **Create Playlist**.
3. In the track manager, paste any Spotify track URL or Spotify track ID. The system automatically fetches the artist, title, album, artwork, and duration via the Spotify Web API.
4. Add your personal note (e.g., *"Track 03 — Listened to this leaning against the iron railings..."*).
5. Switch the status from **Draft** to **Published** and save.

### What happens if I'm not listening to music?
The hero section gracefully shows:
`"Nothing playing right now. A rare moment of silence."` (or your last played track if recently active).

### How do I refresh or revoke Spotify access?
In `/admin` → **Spotify**, click **Disconnect Spotify**. You can re-authorize at any time with a single click.

### Where can I check error logs?
In Cloudflare Dashboard → **Workers & Pages** → `playlist-ratnadwip-com` → **Deployments** → Select active deployment → **Functions** → **Real-time Logs**.

### Fix: "It looks like you've run a Workers-specific command in a Pages project"
If Cloudflare build logs show `Executing user deploy command: npx wrangler deploy` and fail with this error:
1. In Cloudflare Dashboard, go to your project → **Settings** → **Builds & deployments** (or **Builds**).
2. Under **Build configuration**, click **Edit configurations**.
3. Change **Deploy command** to `npx wrangler pages deploy dist` (or leave it empty if using standard Pages).
4. Save and retry the deployment.
