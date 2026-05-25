# TaskHub Deployment Guide

## Frontend → Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
5. Deploy

## Backend → Railway

1. Connect GitHub repo to Railway
2. Set **Root Directory** to `backend`
3. Add all environment variables from `.env.example`
4. Railway auto-detects Python/Gunicorn via `Procfile`
5. Add a Redis service for Celery queue

## Database → Supabase

1. Create project at supabase.com
2. In SQL Editor, run in order:
   ```
   database/migrations/001_initial_schema.sql
   database/policies/rls_policies.sql
   database/seeds/seed_data.sql   (optional, dev only)
   ```
3. Create Storage bucket named `task-images` → set to **Public**
4. Copy Project URL + Service Role Key + Anon Key to env vars

## Google OAuth Setup

1. Go to console.cloud.google.com → APIs → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs: `https://your-backend.railway.app/api/auth/oauth/google/callback`
4. Copy Client ID + Secret to env vars

## GitHub OAuth Setup

1. Go to github.com/settings/developers → New OAuth App
2. Authorization callback URL: `https://your-backend.railway.app/api/auth/oauth/github/callback`
3. Copy Client ID + Secret to env vars

## Stability AI (image generation)

1. Sign up at platform.stability.ai
2. Create API key
3. Add as `STABILITY_API_KEY` in env vars

## Resend (emails)

1. Sign up at resend.com
2. Add + verify your sending domain
3. Create API key → add as `RESEND_API_KEY`
4. Set `FROM_EMAIL` to your verified address
