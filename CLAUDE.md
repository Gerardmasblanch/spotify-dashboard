# Spotify Dashboard

A personal Spotify listening dashboard built with Next.js 16, NextAuth v5, Prisma 7, and Supabase (PostgreSQL).

## Project Overview

Users log in with their Spotify account via OAuth and can view their listening data: top tracks, top artists, recently played songs, and profile stats. Data is periodically saved to Supabase for historical tracking.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth.js v5 (beta) |
| DB ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| CSS | Tailwind CSS v4 |
| Language | TypeScript |

## Project Structure

```
src/
  app/
    (auth)/login/       → Login page (public)
    (dashboard)/        → Protected dashboard pages
      page.tsx          → Overview / Dashboard
      top-tracks/       → Top tracks page
      top-artists/      → Top artists page
      recent/           → Recently played page
      profile/          → User profile page
    api/
      auth/[...nextauth]/ → NextAuth handler
  components/
    layout/             → Sidebar, Header
    ui/                 → Reusable UI components (cards, charts)
  lib/
    auth.ts             → NextAuth config
    prisma.ts           → Prisma client singleton
    spotify.ts          → Spotify API helpers
  generated/prisma/     → Auto-generated Prisma client (gitignored)
prisma/
  schema.prisma         → DB schema
  migrations/           → DB migrations
```

## Design System

- **Background:** `#0A0A0A` (primary), `#111111` / `#1A1A1A` (cards)
- **Accent:** `#1DB954` (Spotify green, used sparingly)
- **Text:** `#FFFFFF` (primary), `#A0A0A0` (secondary)
- **Borders:** `#2A2A2A`
- **Style:** Dark, minimal, serious — inspired by Spotify but more professional

## Authentication

- NextAuth v5 with Spotify OAuth provider
- Scopes: `user-read-email`, `user-top-read`, `user-read-recently-played`, `user-read-currently-playing`
- Dev server runs with `next dev --experimental-https` (Spotify requires HTTPS redirect URI)
- Redirect URI: `https://localhost:3000/api/auth/callback/spotify`

## Database Models

- **User** — Spotify profile info
- **Account** — OAuth tokens (NextAuth standard)
- **Session** — User sessions (NextAuth standard)
- **ListeningSnapshot** — Saved listening data (topTracks, topArtists, recentTracks as JSON, with timeRange)

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=           # Supabase PostgreSQL connection string
SPOTIFY_CLIENT_ID=      # From Spotify Developer Dashboard
SPOTIFY_CLIENT_SECRET=  # From Spotify Developer Dashboard
NEXTAUTH_URL=           # https://localhost:3000 for dev
AUTH_SECRET=            # Random 32-byte hex string
```

Required in `.env` (for Prisma CLI only):
```
DATABASE_URL=           # Same as above
```

## Common Commands

```bash
# Development
next dev --experimental-https

# Database
npx prisma migrate dev        # Apply migrations
npx prisma generate           # Regenerate Prisma client
npx prisma studio             # Open DB browser

# Build
next build
```

## Spotify API Endpoints Used

- `GET /me` — User profile
- `GET /me/top/tracks` — Top tracks (short_term / medium_term / long_term)
- `GET /me/top/artists` — Top artists (short_term / medium_term / long_term)
- `GET /me/player/recently-played` — Recent tracks (last 50)
- `GET /me/player/currently-playing` — Now playing

## Key Notes

- Prisma 7 uses `prisma.config.ts` (not just `schema.prisma`) for configuration
- Prisma client is generated to `src/generated/prisma` (gitignored), always run `prisma generate` after schema changes
- Tailwind CSS v4 uses a different config format — no `tailwind.config.js`, configured via CSS
- NextAuth v5 exports `auth` from a single `auth.ts` file
- Access tokens from Spotify expire in 1 hour; NextAuth handles refresh automatically via the account's `refresh_token`
