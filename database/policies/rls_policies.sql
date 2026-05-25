-- Row Level Security Policies for TaskHub
-- Run AFTER the initial schema migration

-- ─────────────────────────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs      ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- Helper: current user's role
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────
-- USERS policies
-- ─────────────────────────────────────────────────────────────
-- Admins can see all users; users can see themselves
CREATE POLICY "users_select" ON public.users FOR SELECT
  USING (
    public.current_user_role() = 'admin'
    OR id = auth.uid()
  );

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users FOR UPDATE
  USING (id = auth.uid());

-- Service role bypass (for backend)
CREATE POLICY "users_service_all" ON public.users
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────
-- TASKS policies
-- ─────────────────────────────────────────────────────────────
-- Admins see all tasks; users see their assigned tasks
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT
  USING (
    public.current_user_role() = 'admin'
    OR assigned_to = auth.uid()
  );

-- Only admins can create/update/delete tasks
CREATE POLICY "tasks_insert_admin" ON public.tasks FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "tasks_update_admin" ON public.tasks FOR UPDATE
  USING (public.current_user_role() = 'admin');

-- Users can update tasks assigned to them (status changes)
CREATE POLICY "tasks_update_assignee" ON public.tasks FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "tasks_delete_admin" ON public.tasks FOR DELETE
  USING (public.current_user_role() = 'admin');

-- ─────────────────────────────────────────────────────────────
-- GENERATED IMAGES policies
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "gen_images_select" ON public.generated_images FOR SELECT
  USING (
    public.current_user_role() = 'admin'
    OR task_id IN (SELECT id FROM public.tasks WHERE assigned_to = auth.uid())
  );

CREATE POLICY "gen_images_insert" ON public.generated_images FOR INSERT
  WITH CHECK (
    task_id IN (SELECT id FROM public.tasks WHERE assigned_to = auth.uid())
    OR public.current_user_role() = 'admin'
  );

CREATE POLICY "gen_images_update" ON public.generated_images FOR UPDATE
  USING (
    task_id IN (SELECT id FROM public.tasks WHERE assigned_to = auth.uid())
    OR public.current_user_role() = 'admin'
  );

CREATE POLICY "gen_images_delete" ON public.generated_images FOR DELETE
  USING (
    task_id IN (SELECT id FROM public.tasks WHERE assigned_to = auth.uid())
    OR public.current_user_role() = 'admin'
  );

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOGS policies
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "audit_select_admin" ON public.audit_logs FOR SELECT
  USING (public.current_user_role() = 'admin');

CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT
  WITH CHECK (true);
