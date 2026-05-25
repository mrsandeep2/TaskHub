# TaskHub — Complete Deployment Guide
# Zero-to-live step by step. Follow in order.

---

## STEP 1 — Supabase Setup (Database)

### 1.1 Create Project
1. Go to https://supabase.com → Sign up → New Project
2. Name: `taskhub-prod`
3. Database Password: generate strong password, **save it**
4. Region: choose closest to your users
5. Wait ~2 min for provisioning

### 1.2 Run Database Migrations
1. In Supabase dashboard → SQL Editor → New Query
2. Paste contents of `database/migrations/001_initial_schema.sql` → Run
3. New Query → paste `database/policies/rls_policies.sql` → Run
4. (Optional dev only) New Query → paste `database/seeds/seed_data.sql` → Run

### 1.3 Create Storage Bucket
1. Left sidebar → Storage → New Bucket
2. Name: `task-images`
3. Public bucket: **YES** (toggle ON)
4. Click Create

### 1.4 Collect Credentials
Go to Project Settings → API:
```
SUPABASE_URL         = https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY    = eyJhbGc...  (anon/public key)
SUPABASE_SERVICE_KEY = eyJhbGc...  (service_role key — keep secret!)
```

---

## STEP 2 — Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create new project (or use existing) → name: `TaskHub`
3. Left menu → APIs & Services → OAuth consent screen
   - User Type: External → Create
   - App name: TaskHub, Support email: your email
   - Save and Continue (skip scopes) → Save and Continue → Back to Dashboard
4. Left menu → Credentials → Create Credentials → OAuth Client ID
   - Application type: **Web application**
   - Name: TaskHub Web
   - Authorized redirect URIs — add BOTH:
     ```
     http://localhost:5000/api/auth/oauth/google/callback
     https://YOUR-BACKEND-RAILWAY-URL/api/auth/oauth/google/callback
     ```
5. Copy:
```
GOOGLE_CLIENT_ID     = 123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-xxxxxxxxxxxxx
```

---

## STEP 3 — GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. New OAuth App
   - Application name: TaskHub
   - Homepage URL: `https://your-frontend.vercel.app`
   - Authorization callback URL: `https://YOUR-BACKEND-RAILWAY-URL/api/auth/oauth/github/callback`
3. Register → Generate a new client secret
4. Copy:
```
GITHUB_CLIENT_ID     = Ov23li...
GITHUB_CLIENT_SECRET = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## STEP 4 — Resend Email Setup

1. Go to https://resend.com → Sign up
2. Domains → Add Domain → follow DNS setup for your domain
   - (For testing, use the default `@resend.dev` sender — no domain needed)
3. API Keys → Create API Key
4. Copy:
```
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL     = noreply@yourdomain.com
               # or for testing: onboarding@resend.dev
```

---

## STEP 5 — Stability AI Setup (For AI Generation)

1. Go to https://platform.stability.ai → Sign up
2. Account → API Keys → Create Key
3. Copy:
```
STABILITY_API_KEY = sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
> Note: Without this key, the app works but AI generations will use placeholder images.

---

## STEP 6 — Backend Deployment on Railway

### 6.1 Create Railway Account
1. Go to https://railway.app → Sign up with GitHub

### 6.2 Deploy Backend
1. Railway Dashboard → New Project → Deploy from GitHub repo
2. Select your repo → Select the `backend` directory
3. Railway auto-detects Python via `nixpacks.toml`

### 6.3 Add Redis Service
1. In Railway project → New Service → Database → Redis
2. After it's added, click Redis → Variables tab
3. Copy `REDIS_URL` value (starts with `redis://`)

### 6.4 Set Backend Environment Variables
In Railway → your backend service → Variables → Add ALL:

```
SUPABASE_URL          = https://xxxx.supabase.co
SUPABASE_SERVICE_KEY  = eyJhbGc...
SUPABASE_ANON_KEY     = eyJhbGc...

JWT_SECRET            = <generate: python3 -c "import secrets; print(secrets.token_hex(32))">

GOOGLE_CLIENT_ID      = 123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET  = GOCSPX-xxx

GITHUB_CLIENT_ID      = Ov23li...
GITHUB_CLIENT_SECRET  = xxx

RESEND_API_KEY        = re_xxx
FROM_EMAIL            = noreply@yourdomain.com

STABILITY_API_KEY     = sk-xxx

REDIS_URL             = redis://default:xxx@xxx.railway.internal:6379
CELERY_BROKER_URL     = redis://default:xxx@xxx.railway.internal:6379
CELERY_RESULT_BACKEND = redis://default:xxx@xxx.railway.internal:6379

FRONTEND_URL          = https://your-app.vercel.app   ← fill after Step 7
FLASK_ENV             = production
PORT                  = 5000
```

### 6.5 Get Backend URL
After deploy succeeds → Settings → Networking → Generate Domain
Save this as: `https://taskhub-backend-production.up.railway.app`

### 6.6 Deploy Celery Worker
1. Railway project → New Service → from same GitHub repo
2. Settings → Build & Deploy → Start Command:
   ```
   cd backend && celery -A workers.celery_app worker --loglevel=info --concurrency 2
   ```
3. Add same environment variables as backend service

---

## STEP 7 — Frontend Deployment on Vercel

### 7.1 Import Project
1. Go to https://vercel.com → New Project → Import from GitHub
2. Select your repo
3. Framework: Next.js (auto-detected)
4. **Root Directory**: `frontend` ← IMPORTANT, set this!

### 7.2 Set Frontend Environment Variables
In Vercel → Environment Variables → add:

```
NEXT_PUBLIC_API_URL  = https://taskhub-backend-production.up.railway.app
```
That's the only env var needed for frontend.

### 7.3 Deploy
Click Deploy. Takes ~2 min.

### 7.4 Copy Vercel URL
After deploy → copy URL like `https://taskhub-xyz.vercel.app`

### 7.5 Update Backend FRONTEND_URL
Go back to Railway → backend Variables → update:
```
FRONTEND_URL = https://taskhub-xyz.vercel.app
```
Then in Railway → Redeploy backend.

### 7.6 Update Google OAuth Redirect URI
Back in Google Cloud Console → Credentials → your OAuth client:
- Add Authorized redirect URI:
  ```
  https://taskhub-backend-production.up.railway.app/api/auth/oauth/google/callback
  ```

### 7.7 Update GitHub OAuth Callback URL
Back in GitHub → Developer settings → your OAuth App:
- Authorization callback URL:
  ```
  https://taskhub-backend-production.up.railway.app/api/auth/oauth/github/callback
  ```

---

## STEP 8 — Verify Deployment

### Health check
```
GET https://taskhub-backend-production.up.railway.app/health
→ {"status": "ok", "service": "TaskHub API", "env": "production"}
```

### First login creates admin
1. Open https://taskhub-xyz.vercel.app
2. Click "Get Started" → Google or GitHub login
3. **First user who logs in automatically becomes admin**
4. All subsequent users become regular users

### Test full flow
1. Admin: Create a task, upload product image, assign to a user
2. User (log in with different account): Open task → Open AI Studio → Generate images
3. User: Submit task when 8 images complete
4. Admin: Go to Reviews → Accept or Request Revision

---

## LOCAL DEVELOPMENT

```bash
# 1. Clone
git clone <your-repo>
cd taskhub

# 2. Create .env in project root
cp .env.example .env
# Fill in all variables (at minimum: SUPABASE_*, JWT_SECRET)

# 3. Start Redis (via Docker)
docker run -d -p 6379:6379 redis:7-alpine

# 4. Backend
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run --port 5000 --debug

# 5. Celery worker (new terminal)
cd backend
source venv/bin/activate
celery -A workers.celery_app worker --loglevel=info

# 6. Frontend (new terminal)
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev

# Open: http://localhost:3000
```

---

## GENERATE JWT_SECRET

Run this once to generate a secure secret:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Example output: `a3f8d2c1e4b7a9f0c2d5e8b1a4f7c0d3e6b9a2f5c8d1e4b7a0f3c6d9e2b5a8f1`

---

## TROUBLESHOOTING

| Problem | Fix |
|---|---|
| `CORS error` in browser | Check `FRONTEND_URL` env var on Railway matches your Vercel URL exactly |
| `401 Unauthorized` | JWT_SECRET mismatch between sessions — clear browser cookies |
| `OAuth redirect mismatch` | Add Railway backend URL to Google/GitHub OAuth redirect URIs |
| `Storage upload fails` | Ensure `task-images` bucket exists in Supabase and is set to Public |
| `AI generations stay queued` | Celery worker not running — deploy worker service on Railway |
| `Email not sending` | Verify Resend API key and FROM_EMAIL domain is verified in Resend |
| `First user not admin` | Delete the test user from Supabase → users table and re-login |
| `Database connection error` | Check SUPABASE_URL and SUPABASE_SERVICE_KEY are correct (service key, not anon key) |
