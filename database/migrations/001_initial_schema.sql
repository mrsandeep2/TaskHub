-- TaskHub Initial Schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    avatar_url  TEXT,
    role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    provider    TEXT,
    last_active TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role  ON public.users(role);

-- ─────────────────────────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title             TEXT NOT NULL,
    description       TEXT NOT NULL,
    product_image_url TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','assigned','in_progress','submitted','accepted','revision_requested')),
    assigned_to       UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    review_comment    TEXT,
    submitted_at      TIMESTAMPTZ,
    accepted_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_status      ON public.tasks(status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_created_by  ON public.tasks(created_by);
CREATE INDEX idx_tasks_created_at  ON public.tasks(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- GENERATED IMAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.generated_images (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id       UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    type          TEXT NOT NULL
                  CHECK (type IN (
                    'white_background','theme_background_1','theme_background_2',
                    'creative_1','creative_2','model_front','model_side','model_closeup'
                  )),
    image_url     TEXT,
    status        TEXT NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued','processing','completed','failed')),
    is_final      BOOLEAN NOT NULL DEFAULT FALSE,
    job_id        TEXT,
    error_message TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gen_task_id  ON public.generated_images(task_id);
CREATE INDEX idx_gen_status   ON public.generated_images(status);
CREATE INDEX idx_gen_type     ON public.generated_images(type);

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   UUID NOT NULL,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id    ON public.audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_entity     ON public.audit_logs(entity_type, entity_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at    BEFORE UPDATE ON public.tasks    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated_at    BEFORE UPDATE ON public.users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (run in Supabase Storage section OR via SQL)
-- ─────────────────────────────────────────────────────────────
-- Note: Supabase storage buckets are best created via the Dashboard UI.
-- If using the API, run:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('task-images', 'task-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "public_read_task_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-images');

CREATE POLICY "authenticated_upload_task_images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-images');

CREATE POLICY "authenticated_update_task_images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'task-images');

CREATE POLICY "authenticated_delete_task_images"
ON storage.objects FOR DELETE
USING (bucket_id = 'task-images');
