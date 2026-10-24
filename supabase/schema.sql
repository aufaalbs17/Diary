-- ==============================================================================
-- OUR LITTLE MOMENTS 🤍 - DATABASE SCHEMA & RLS POLICIES
-- PostgreSQL + Supabase Authentication & Storage
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  nickname text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SPACES TABLE (Max 2 people per space)
create table if not exists public.spaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'Our Little Space',
  created_by uuid references public.profiles(id) on delete cascade not null,
  invite_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SPACE MEMBERS TABLE
create table if not exists public.space_members (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('owner', 'partner')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (space_id, user_id)
);

-- ENFORCE STRICT MAX 2 MEMBERS PER SPACE TRIGGER
create or replace function public.enforce_max_two_members()
returns trigger as $$
declare
  member_count integer;
begin
  select count(*) into member_count
  from public.space_members
  where space_id = new.space_id;

  if member_count >= 2 then
    raise exception 'Ruang kenangan ini sudah memiliki 2 anggota (maksimum)';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_check_max_members on public.space_members;
create trigger tr_check_max_members
  before insert on public.space_members
  for each row execute function public.enforce_max_two_members();

-- 4. INVITATIONS TABLE
create table if not exists public.invitations (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  inviter_id uuid references public.profiles(id) on delete cascade not null,
  code text unique not null,
  recipient_email text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. MEMORIES TABLE (Our Diary)
create table if not exists public.memories (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  event_date date not null,
  event_time time without time zone,
  location_name text,
  location_lat double precision,
  location_lng double precision,
  story text not null,
  mood text not null check (mood in ('senang_banget', 'bahagia', 'lucu', 'terharu', 'tenang', 'berkesan')),
  category text not null check (category in ('jalan_jalan', 'makan_bareng', 'nongkrong', 'traveling', 'random', 'special', 'lainnya')),
  tags text[] default '{}'::text[],
  is_favorite boolean default false not null,
  spotify_url text,
  cover_image_url text,
  is_draft boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. MEMORY MEDIA TABLE (Photos & Videos)
create table if not exists public.memory_media (
  id uuid default uuid_generate_v4() primary key,
  memory_id uuid references public.memories(id) on delete cascade not null,
  file_path text not null,
  file_type text not null check (file_type in ('image', 'video')),
  caption text,
  display_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. MEMORY NOTES TABLE (Dual notes from each user)
create table if not exists public.memory_notes (
  id uuid default uuid_generate_v4() primary key,
  memory_id uuid references public.memories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  author_name text not null,
  note text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. LOCATIONS TABLE (Places We've Been)
create table if not exists public.locations (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  name text not null,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  visit_date date not null,
  cover_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. MILESTONES TABLE (Our Timeline)
create table if not exists public.milestones (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  title text not null,
  date date not null,
  description text,
  image_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. LITTLE NOTES TABLE (Surprise letters / notes)
create table if not exists public.little_notes (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  sender_name text not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  recipient_name text not null,
  title text not null,
  message text not null,
  emoji text default '💌' not null,
  unlock_at timestamp with time zone,
  is_opened boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. BUCKET LIST ITEMS
create table if not exists public.bucket_list_items (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null,
  title text not null,
  category text not null default 'Petualangan Bersama',
  target_date date,
  is_completed boolean default false not null,
  completed_at timestamp with time zone,
  notes text,
  photo_url text,
  memory_id uuid references public.memories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.invitations enable row level security;
alter table public.memories enable row level security;
alter table public.memory_media enable row level security;
alter table public.memory_notes enable row level security;
alter table public.locations enable row level security;
alter table public.milestones enable row level security;
alter table public.little_notes enable row level security;
alter table public.bucket_list_items enable row level security;

-- Helper function: is user a member of space
create or replace function public.is_space_member(check_space_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.space_members
    where space_id = check_space_id and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Profiles: users can read profiles of people in their shared spaces
create policy "Users can view profile if in same space or own profile"
  on public.profiles for select
  using (
    id = auth.uid() or
    exists (
      select 1 from public.space_members sm1
      join public.space_members sm2 on sm1.space_id = sm2.space_id
      where sm1.user_id = auth.uid() and sm2.user_id = profiles.id
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Spaces: only members can see or update space
create policy "Members can view space"
  on public.spaces for select
  using (public.is_space_member(id) or created_by = auth.uid());

create policy "Members can update space"
  on public.spaces for update
  using (public.is_space_member(id));

-- Space Members
create policy "Members can view space members"
  on public.space_members for select
  using (public.is_space_member(space_id));

-- Memories
create policy "Members can select memories"
  on public.memories for select
  using (public.is_space_member(space_id));

create policy "Members can insert memories"
  on public.memories for insert
  with check (public.is_space_member(space_id));

create policy "Members can update memories"
  on public.memories for update
  using (public.is_space_member(space_id));

create policy "Members can delete memories"
  on public.memories for delete
  using (public.is_space_member(space_id));

-- Memory Media
create policy "Members can access memory media"
  on public.memory_media for all
  using (
    exists (
      select 1 from public.memories
      where memories.id = memory_media.memory_id
      and public.is_space_member(memories.space_id)
    )
  );

-- Memory Notes
create policy "Members can access memory notes"
  on public.memory_notes for all
  using (
    exists (
      select 1 from public.memories
      where memories.id = memory_notes.memory_id
      and public.is_space_member(memories.space_id)
    )
  );

-- Locations
create policy "Members can access locations"
  on public.locations for all
  using (public.is_space_member(space_id));

-- Milestones
create policy "Members can access milestones"
  on public.milestones for all
  using (public.is_space_member(space_id));

-- Little Notes
create policy "Members can view little notes"
  on public.little_notes for select
  using (public.is_space_member(space_id));

create policy "Members can insert little notes"
  on public.little_notes for insert
  with check (public.is_space_member(space_id) and sender_id = auth.uid());

create policy "Members can update little notes"
  on public.little_notes for update
  using (public.is_space_member(space_id));

-- Bucket List
create policy "Members can access bucket list"
  on public.bucket_list_items for all
  using (public.is_space_member(space_id));

-- ==============================================================================
-- STORAGE BUCKET CREATION & POLICIES
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('memories', 'memories', false)
on conflict (id) do nothing;

create policy "Space members can view media"
  on storage.objects for select
  using (bucket_id = 'memories' and auth.role() = 'authenticated');

create policy "Space members can upload media"
  on storage.objects for insert
  with check (bucket_id = 'memories' and auth.role() = 'authenticated');

create policy "Space members can delete media"
  on storage.objects for delete
  using (bucket_id = 'memories' and auth.role() = 'authenticated');
