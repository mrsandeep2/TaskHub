# TaskHub Architecture

## System Overview

```
                    ┌─────────────────┐
                    │   Vercel CDN    │
                    │  Next.js 14 App │
                    └────────┬────────┘
                             │ API calls
                    ┌────────▼────────┐
                    │  Flask REST API  │
                    │   (Railway)      │
                    └────────┬────────┘
             ┌───────────────┼───────────────┐
    ┌────────▼────────┐ ┌───▼───┐  ┌────────▼────┐
    │ Supabase Postgres│ │ Redis │  │ Stability AI│
    │ + Storage + RLS  │ │ Queue │  │   API       │
    └─────────────────┘ └───┬───┘  └─────────────┘
                    ┌───────▼───────┐
                    │ Celery Worker │
                    │ (AI Jobs)     │
                    └───────────────┘
```

## Frontend Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── auth/login/         # OAuth login
│   ├── dashboard/
│   │   ├── admin/          # Admin dashboard, tasks, reviews, analytics
│   │   └── user/           # User tasks, history, profile
│   └── ai-studio/          # AI Studio page
├── components/
│   ├── ui/                 # Base components (Button, Card, Badge, Input...)
│   ├── layout/             # Sidebar, Topbar, DashboardLayout
│   ├── dashboard/          # StatsCard, TaskTable
│   ├── tasks/              # CreateTaskModal
│   └── ai-studio/          # GenerationCard
├── hooks/                  # useAuth, useTasks, useGenerations
├── services/               # api.ts, tasks.ts, ai.ts, admin.ts
├── store/                  # Zustand: auth.ts, ui.ts
├── types/                  # TypeScript interfaces
└── utils/                  # cn(), format helpers
```

## Backend Architecture

```
backend/
├── app.py                  # Flask factory, blueprint registration
├── api/
│   ├── auth/routes.py      # OAuth, JWT, /me, /logout
│   ├── tasks/routes.py     # CRUD + workflow transitions
│   ├── ai/routes.py        # Generate, status, manage
│   └── admin/routes.py     # Stats, users, audit logs
├── models/                 # Supabase query wrappers
├── services/
│   ├── ai_service.py       # Generation pipeline
│   ├── email_service.py    # Resend transactional emails
│   ├── storage_service.py  # Supabase Storage uploads
│   └── audit_service.py    # Audit log writes
├── workers/
│   ├── celery_app.py       # Celery configuration
│   └── tasks.py            # generate_image_task
└── middleware/
    ├── auth.py             # JWT require_auth, require_admin decorators
    └── rate_limit.py       # Flask-Limiter
```

## AI Generation Pipeline

```
User clicks "Generate"
    │
    ▼
POST /api/tasks/:id/generate
    │
    ├── Create generation record (status: queued)
    ├── Dispatch Celery task
    └── Return {job_id, status: queued}

Celery Worker:
    │
    ├── Download product_image_url
    ├── remove_background() → product_no_bg.png
    ├── generate_image_stability()
    │   ├── img2img with init_image=product
    │   ├── strength=0.30 (preserves product)
    │   ├── positive prompt (background/scene)
    │   └── negative prompt (no altered product)
    ├── upload_generated_image() → Supabase Storage
    └── Update generation record (status: completed, image_url)

Frontend polls GET /api/jobs/:job_id/status every 2s
    │
    └── React Query refetchInterval = 2000ms when status=processing
```

## Database Schema

```sql
users              (id, email, name, role, provider, ...)
tasks              (id, title, description, product_image_url, status, assigned_to, ...)
generated_images   (id, task_id, type, image_url, status, is_final, ...)
audit_logs         (id, user_id, action, entity_type, entity_id, metadata, ...)
```
