-- Sample seed data for development
-- Run AFTER schema and RLS policies

-- Admin user (replace with real OAuth user after first login)
INSERT INTO public.users (id, email, name, role, provider, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@taskhub.dev',
  'Admin User',
  'admin',
  'seed',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sample regular user
INSERT INTO public.users (id, email, name, role, provider, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'designer@taskhub.dev',
  'Product Designer',
  'user',
  'seed',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sample tasks
INSERT INTO public.tasks (id, title, description, product_image_url, status, created_by, assigned_to)
VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Diamond Solitaire Ring Collection',
  'Generate 8 product photography shots for our new diamond solitaire ring. Maintain exact ring design, stone clarity, and metal finish. Required: white background, 2 lifestyle scenes, 2 creative backgrounds, and 3 model wearing shots (front, side 45°, close-up).',
  'https://via.placeholder.com/800x800/f0f0f5/7c3aed?text=Ring',
  'assigned',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
),
(
  '10000000-0000-0000-0000-000000000002',
  'Gold Chain Necklace — Summer Edit',
  'Product photography for layered gold chain necklace set. Critical: preserve exact chain link style, gold tone, and pendant design across all 8 generated images.',
  'https://via.placeholder.com/800x800/f0f0f5/7c3aed?text=Necklace',
  'pending',
  '00000000-0000-0000-0000-000000000001',
  NULL
);

SELECT 'Seed data inserted' AS status;
