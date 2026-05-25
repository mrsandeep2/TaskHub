# TaskHub — AI Product Photography Platform

A production-grade SaaS platform combining **Task Management** with an **AI-Powered Product Photography Studio**.

```
taskhub/
├── frontend/          # Next.js 14 App Router (TypeScript, Tailwind, shadcn/ui)
├── backend/           # Flask REST API + Celery workers
├── database/          # Supabase schema, RLS policies, seeds
├── docs/              # Architecture & API docs
└── generated_samples/ # Sample AI-generated image outputs
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript (strict), Tailwind CSS, Framer Motion, React Query, Zustand |
| Backend | Python, Flask, Celery, Redis |
| Database | Supabase (PostgreSQL + Auth + Storage + RLS) |
| AI | Stability AI (img2img), background removal (rembg) |
| Email | Resend |
| Auth | Google OAuth 2.0, GitHub OAuth |
| Deploy | Vercel (frontend), Railway/Render (backend), Supabase (DB) |

---

## Quick Start

### 1. Clone & configure

```bash
git clone <repo-url>
cd taskhub
cp .env.example .env
# Fill in all environment variables
```

### 2. Database setup (Supabase)

1. Create a new Supabase project
2. Go to **SQL Editor**
3. Run `database/migrations/001_initial_schema.sql`
4. Run `database/policies/rls_policies.sql`
5. (Optional) Run `database/seeds/seed_data.sql`
6. Create a **Storage bucket** named `task-images` (set to public)

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev          # http://localhost:3000
```

### 4. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
flask run --port 5000  # http://localhost:5000
```

### 5. Celery worker (for AI generation jobs)

```bash
cd backend
celery -A workers.celery_app worker --loglevel=info
```

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (backend) |
| `JWT_SECRET` | Min 32-char secret for JWT tokens |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth credentials |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth credentials |
| `STABILITY_API_KEY` | Stability AI for image generation |
| `RESEND_API_KEY` | Resend for transactional emails |
| `REDIS_URL` | Redis for Celery job queue |

---

## AI Product Consistency Strategy

The core challenge: generated images must preserve the **exact product** while only changing context.

**Pipeline:**
1. **Background Removal** — `rembg` library extracts product with clean mask
2. **img2img at low strength** — `strength=0.30-0.40` preserves product structure
3. **Strong negative prompts** — prevent `"altered product, different design, distorted"`
4. **Reference conditioning** — original product passed as `init_image` every time
5. **Compositing** — extracted product composited onto generated background

**Limitations:**
- Stability AI img2img at low strength (~0.35) preserves ~85-90% product fidelity
- For production-grade pixel-perfect consistency, use ComfyUI with ControlNet + IP-Adapter
- Model wearing shots are hardest — require inpainting pipeline

---

## Task Status Flow

```
pending → assigned → in_progress → submitted → accepted
                                        ↓
                              revision_requested
                                        ↓
                                  in_progress
```

---

## API Documentation

See `docs/api.md` for full API reference.

**Base URL:** `http://localhost:5000/api`

Key endpoints:
- `POST /auth/oauth/google` — Google OAuth login
- `GET /auth/me` — Current user
- `GET /tasks` — List tasks (admin)
- `POST /tasks` — Create task with product image (admin)
- `GET /my-tasks` — User's assigned tasks
- `POST /tasks/:id/generate` — Start AI generation
- `GET /tasks/:id/generations` — List generated images
- `PUT /tasks/:id/accept` — Accept submission (admin)

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel deploy
```

### Backend → Railway
```bash
# railway.json already configured
railway up
```

### Required env vars on both platforms — copy from `.env.example`

---

## License
MIT
