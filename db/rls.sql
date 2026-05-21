alter table public.items enable row level security;
alter table public.favorites enable row level security;

-- Items: authenticated users can read only.
create policy "items_select_authenticated"
  on public.items
  for select
  to authenticated
  using (true);

-- Favorites: users can read their own rows (for list stars / refresh).
create policy "favorites_select_own"
  on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No insert/update/delete policies for authenticated on favorites.
-- Writes go through the toggle-favorite edge function (service role).
