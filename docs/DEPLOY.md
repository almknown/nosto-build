# Deployment Guide

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database** - Create at [supabase.com](https://supabase.com) or [neon.tech](https://neon.tech)
3. **Google Cloud Project** - For OAuth and YouTube API
4. **Upstash Account** - For QStash at [upstash.com](https://upstash.com)

## Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Supabase/Neon dashboard |
| `NEXTAUTH_SECRET` | Random 32-char string | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your deployed URL | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Google Cloud Console |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | Google Cloud Console |
| `QSTASH_TOKEN` | QStash API token | Upstash Console |
| `QSTASH_CURRENT_SIGNING_KEY` | Webhook verification | Upstash Console |
| `QSTASH_NEXT_SIGNING_KEY` | Webhook verification | Upstash Console |

## Deploy Steps

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables
5. Deploy

## Post-Deployment

1. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Update QStash webhook URL in Upstash to point to:
   ```
   https://your-app.vercel.app/api/webhooks/qstash
   ```

3. Add your Vercel domain to Google OAuth authorized redirect URIs:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
