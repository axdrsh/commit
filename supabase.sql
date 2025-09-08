-- Enable auth schema assumption: using Supabase Auth with public schema

-- Profiles table: one-to-one with auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  bio text,
  tech_stack text[] default '{}', -- e.g., {'react','nextjs','typescript'}
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_gin_tech_stack_idx on public.profiles using gin (tech_stack);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;

-- Policies
drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles" on public.profiles
for select
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile" on public.profiles
for delete
using (auth.uid() = id);

-- Avatar URL on profiles
alter table public.profiles add column if not exists avatar_url text;

-- Storage bucket for avatars (public read)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for avatars
drop policy if exists "Public can read avatars" on storage.objects;
create policy "Public can read avatars" on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "Authenticated can upload avatars" on storage.objects;
create policy "Authenticated can upload avatars" on storage.objects
for insert
with check (bucket_id = 'avatars');

drop policy if exists "Authenticated can update avatars" on storage.objects;
create policy "Authenticated can update avatars" on storage.objects
for update
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');

drop policy if exists "Authenticated can delete avatars" on storage.objects;
create policy "Authenticated can delete avatars" on storage.objects
for delete
using (bucket_id = 'avatars');

-- Likes: minimal swipe/like feature
create table if not exists public.likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, target_id),
  check (user_id <> target_id)
);

create index if not exists likes_target_idx on public.likes (target_id);

alter table public.likes enable row level security;

drop policy if exists "Users can insert their own likes" on public.likes;
create policy "Users can insert their own likes" on public.likes
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own likes" on public.likes;
create policy "Users can delete their own likes" on public.likes
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read likes they are part of" on public.likes;
create policy "Users can read likes they are part of" on public.likes
for select
using (auth.uid() = user_id or auth.uid() = target_id);

-- Messages: chat between mutually matched users
create table if not exists public.messages (
  id bigserial primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0),
  created_at timestamptz default now()
);

create index if not exists messages_participants_time_idx on public.messages (sender_id, recipient_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "Participants can read their messages" on public.messages;
create policy "Participants can read their messages" on public.messages
for select
using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Sender can insert if mutual like exists" on public.messages;
create policy "Sender can insert if mutual like exists" on public.messages
for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.likes l1
    where l1.user_id = sender_id and l1.target_id = recipient_id
  )
  and exists (
    select 1 from public.likes l2
    where l2.user_id = recipient_id and l2.target_id = sender_id
  )
);

drop policy if exists "Sender can delete own messages" on public.messages;
create policy "Sender can delete own messages" on public.messages
for delete
using (auth.uid() = sender_id);