# TaskHub API Documentation

Base URL: `http://localhost:5000/api`

All authenticated routes require:
```
Authorization: Bearer <jwt_token>
```
or a `access_token` cookie set after OAuth login.

---

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/auth/oauth/google` | — | Redirect to Google OAuth |
| GET | `/auth/oauth/google/callback` | — | Google OAuth callback |
| GET | `/auth/oauth/github` | — | Redirect to GitHub OAuth |
| GET | `/auth/oauth/github/callback` | — | GitHub OAuth callback |
| GET | `/auth/me` | user | Get current user |
| POST | `/auth/logout` | — | Clear session cookie |

---

## Tasks (Admin)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tasks` | admin | List all tasks (filterable by `status`, `page`, `per_page`) |
| POST | `/tasks` | admin | Create task (multipart: `title`, `description`, `product_image`, `assigned_to?`) |
| GET | `/tasks/:id` | user | Get task details |
| PUT | `/tasks/:id` | admin | Update task fields |
| DELETE | `/tasks/:id` | admin | Delete task |
| POST | `/tasks/:id/assign` | admin | Assign task to user |
| PUT | `/tasks/:id/accept` | admin | Accept submitted task |
| PUT | `/tasks/:id/request-revision` | admin | Request revision with comment |

## Tasks (User)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/my-tasks` | user | Get current user's assigned tasks |
| PUT | `/tasks/:id/start` | user | Mark task as in_progress |
| POST | `/tasks/:id/submit` | user | Submit task for review |

---

## AI Generation

| Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/tasks/:id/generate` | user | 10/hour | Start generation job |
| GET | `/jobs/:job_id/status` | user | — | Poll job status |
| GET | `/tasks/:id/generations` | user | — | List all generations for task |
| DELETE | `/generations/:id` | user | — | Delete a generation |
| PUT | `/generations/:id/mark-final` | user | — | Toggle final flag |

### Generation Types

```
white_background   — Pure white studio background
theme_background_1 — Lifestyle scene matching product
theme_background_2 — Alternative themed environment
creative_1         — Artistic/editorial treatment
creative_2         — Dramatic artistic composition
model_front        — Model wearing, front view
model_side         — Model wearing, 45° angle
model_closeup      — Close-up detail on model
```

---

## Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | admin | Dashboard stats |
| GET | `/admin/users` | admin | All users |
| GET | `/admin/audit-logs` | admin | Audit log (paginated) |
| GET | `/admin/analytics` | admin | Analytics data |

---

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error:
```json
{
  "success": false,
  "message": "Error description"
}
```

Paginated:
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "total_pages": 5
}
```
