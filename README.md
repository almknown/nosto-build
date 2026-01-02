# 📼 Nostalgia Playlist Generator

A YouTube Nostalgia Playlist Generator that creates randomized playlists from any YouTube channel's archive. Users can filter by year range, keywords, duration, and "deep cuts" (bottom 25% by views).

**Live URL:** https://nostalgiaplaylist.vercel.app

## Features

- 🔍 **Channel Lookup** - Search by handle (@name) or channel ID
- 📦 **Serverless Indexing** - Videos indexed on-demand via QStash
- 🎚️ **Smart Filters** - Year range, keywords, duration, deep cuts, shorts exclusion
- ▶️ **YouTube Integration** - One-click watch URL opens directly on YouTube
- 🔐 **Google OAuth** - Sign in to save playlist history
- 📊 **Rate Limiting** - 3 free playlists/day, more for Pro users

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Neon)
- **Queue:** Upstash QStash (serverless)
- **Auth:** NextAuth.js v5
- **ORM:** Prisma 7
- **Validation:** Zod

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp docs/env.template.txt .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up database:**
   ```bash
   npx prisma migrate dev
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `NEXTAUTH_SECRET` | Random secret for sessions |
| `NEXTAUTH_URL` | Your app URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `QSTASH_TOKEN` | Upstash QStash token |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash webhook signing key |
| `QSTASH_NEXT_SIGNING_KEY` | QStash next signing key |

## Commands

```bash
# Development
npm run dev

# Testing
npm test
npm run test:watch
npm run test:coverage

# Database
npx prisma migrate dev
npx prisma studio

# Production Build
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   ├── channels/lookup/       # Channel search
│   │   ├── channels/[channelId]/  # Indexing trigger
│   │   ├── playlists/             # History & generation
│   │   └── webhooks/qstash/       # Serverless indexing
│   ├── generate/                  # Main generator wizard
│   ├── history/                   # Saved playlists
│   ├── login/                     # OAuth login
│   └── page.tsx                   # Landing page
├── components/                    # React components
├── lib/
│   ├── playlist/                  # Filter & generator logic
│   └── youtube/                   # YouTube API client
└── types/                         # TypeScript types
```

## License

MIT
