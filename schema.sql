-- ==========================================================
-- SQL Script untuk Supabase (Monkey Banana Shooter Leaderboard)
-- ==========================================================
-- Jalankan query ini di menu "SQL Editor" pada dashboard Supabase Anda.

-- 1. Buat tabel leaderboard
create table if not exists public.leaderboard (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  score integer not null,
  wave integer default 1,
  accuracy integer default 0
);

-- 2. Aktifkan Row Level Security (RLS) demi keamanan
alter table public.leaderboard enable row level security;

-- 3. Policy: Izinkan siapa saja membaca (SELECT) data leaderboard
create policy "Izinkan publik membaca leaderboard"
on public.leaderboard
for select
using (true);

-- 4. Policy: Izinkan siapa saja menambahkan skor baru (INSERT)
create policy "Izinkan publik menyimpan skor baru"
on public.leaderboard
for insert
with check (true);

-- 5. Masukkan data awal (Dummy data)
insert into public.leaderboard (name, score, wave, accuracy) values
  ('Raja Monyet', 5800, 6, 88),
  ('Wukong Sakti', 4200, 5, 82),
  ('George Pintar', 3100, 4, 76),
  ('Tarzan Rimba', 2050, 3, 70),
  ('Chimp Pemula', 950, 2, 65);
