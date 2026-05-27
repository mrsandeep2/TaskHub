-- Migration to add custom_prompt to public.tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS custom_prompt TEXT;
