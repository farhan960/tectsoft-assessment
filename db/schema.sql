create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists items_created_at_id_idx
  on public.items (created_at desc, id asc);

-- Favorites: one row per user + item (edge function writes via service role).
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_item_unique unique (user_id, item_id)
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);
