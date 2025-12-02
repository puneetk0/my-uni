
-- Create achievement_teams table
create table public.achievement_teammates (
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text,
  created_at timestamptz default now(),
  primary key (achievement_id, user_id)
);

alter table public.achievement_teammates enable row level security;

create policy "Allow read access to achievement teammates" on public.achievement_teammates for select using (true);
create policy "Allow achievement creator to insert team members" on public.achievement_teammates for insert with check (auth.uid() = (select user_id from public.achievements where id = achievement_id));
create policy "Allow achievement creator to update team members" on public.achievement_teammates for update using (auth.uid() = (select user_id from public.achievements where id = achievement_id));
create policy "Allow achievement creator to delete team members" on public.achievement_teammates for delete using (auth.uid() = (select user_id from public.achievements where id = achievement_id));

-- Create achievement_photos table
create table public.achievement_photos (
  id bigint primary key generated always as identity,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_index smallint not null default 0,
  created_at timestamptz default now()
);

create index achievement_photos_ach_idx on public.achievement_photos (achievement_id, sort_index);

alter table public.achievement_photos enable row level security;

drop policy if exists "read photos of approved or own" on public.achievement_photos;
create policy "read photos of approved or own"
  on public.achievement_photos for select
  using (
    exists (
      select 1 from public.achievements a
      where a.id = achievement_photos.achievement_id
        and (
          a.status = 'approved'
          or a.user_id = auth.uid()
          or public.has_role(auth.uid(), 'faculty')
          or public.has_role(auth.uid(), 'admin')
        )
    )
  );

drop policy if exists "owner inserts photos" on public.achievement_photos;
create policy "owner inserts photos"
  on public.achievement_photos for insert
  with check (
    exists (
      select 1 from public.achievements a
      where a.id = achievement_photos.achievement_id
        and (
          a.user_id = auth.uid()
          or public.has_role(auth.uid(), 'faculty')
          or public.has_role(auth.uid(), 'admin')
        )
    )
  );

drop policy if exists "owner updates photos while pending" on public.achievement_photos;
create policy "owner updates photos while pending"
  on public.achievement_photos for update
  using (
    exists (
      select 1 from public.achievements a
      where a.id = achievement_photos.achievement_id
        and (
          (a.user_id = auth.uid() and a.status = 'pending')
          or public.has_role(auth.uid(), 'faculty')
          or public.has_role(auth.uid(), 'admin')
        )
    )
  ) with check (true);

drop policy if exists "owner deletes photos while pending" on public.achievement_photos;
create policy "owner deletes photos while pending"
  on public.achievement_photos for delete
  using (
    exists (
      select 1 from public.achievements a
      where a.id = achievement_photos.achievement_id
        and (
          (a.user_id = auth.uid() and a.status = 'pending')
          or public.has_role(auth.uid(), 'faculty')
          or public.has_role(auth.uid(), 'admin')
        )
    )
  );

-- Create achievement_upvotes table
create table public.achievement_upvotes (
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (achievement_id, user_id)
);

create index achievement_upvotes_ach_idx on public.achievement_upvotes (achievement_id);

alter table public.achievement_upvotes enable row level security;

drop policy if exists "read upvotes public" on public.achievement_upvotes;
create policy "read upvotes public"
  on public.achievement_upvotes for select
  using (true);

drop policy if exists "insert upvote if approved" on public.achievement_upvotes;
create policy "insert upvote if approved"
  on public.achievement_upvotes for insert
  with check (
    auth.uid() is not null
    and exists (
      select 1 from public.achievements a
      where a.id = achievement_upvotes.achievement_id
        and a.status = 'approved'
    )
  );

drop policy if exists "delete own upvote" on public.achievement_upvotes;
create policy "delete own upvote"
  on public.achievement_upvotes for delete
  using (user_id = auth.uid());

-- Create achievement_comments table
create table public.achievement_comments (
  id bigint primary key generated always as identity,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) <= 5000),
  parent_id bigint null references public.achievement_comments(id) on delete cascade,
  created_at timestamptz default now()
);

create index achievement_comments_ach_created_idx on public.achievement_comments (achievement_id, created_at);
create index achievement_comments_parent_idx on public.achievement_comments (parent_id);

alter table public.achievement_comments enable row level security;

drop policy if exists "read comments" on public.achievement_comments;
create policy "read comments"
  on public.achievement_comments for select
  using (
    exists (
      select 1 from public.achievements a
      where a.id = achievement_comments.achievement_id
        and (
          a.status = 'approved'
          or a.user_id = auth.uid()
          or public.has_role(auth.uid(), 'faculty')
          or public.has_role(auth.uid(), 'admin')
        )
    )
  );

drop policy if exists "insert comment if approved" on public.achievement_comments;
create policy "insert comment if approved"
  on public.achievement_comments for insert
  with check (
    auth.uid() is not null
    and exists (
      select 1 from public.achievements a
      where a.id = achievement_comments.achievement_id
        and a.status = 'approved'
    )
  );

drop policy if exists "update own comment" on public.achievement_comments;
create policy "update own comment"
  on public.achievement_comments for update
  using (user_id = auth.uid());

drop policy if exists "delete own or moderator" on public.achievement_comments;
create policy "delete own or moderator"
  on public.achievement_comments for delete
  using (
    user_id = auth.uid()
    or public.has_role(auth.uid(), 'faculty')
    or public.has_role(auth.uid(), 'admin')
  );

-- Tighten teammates indexes (assuming achievement_teammates table exists or will be created elsewhere)
alter table public.achievement_teammates
  drop constraint if exists unique_achievement_user,
  add constraint unique_achievement_user unique (achievement_id, user_id);

create index if not exists achievement_teammates_ach_idx on public.achievement_teammates (achievement_id);
create index if not exists achievement_teammates_user_idx on public.achievement_teammates (user_id);
