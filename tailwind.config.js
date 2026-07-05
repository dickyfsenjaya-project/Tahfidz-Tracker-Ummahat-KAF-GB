-- =========================================================
-- Jalankan seluruh isi file ini di Supabase: SQL Editor > New query > Run
-- =========================================================

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kelompok int not null,
  tanggal date not null,
  hari text,
  mode text,
  aktivitas jsonb default '[]',
  hadir boolean not null,
  metode text,
  setoran jsonb default '[]',
  keterangan text,
  created_at timestamptz default now()
);

create table if not exists roster (
  kelompok int primary key,
  names jsonb default '[]'
);

create table if not exists config (
  id int primary key default 1,
  ref_date date not null default '2026-06-29',
  invert boolean not null default false
);

-- isi data awal (jalan sekali saja; aman diulang karena pakai "on conflict do nothing")
insert into config (id, ref_date, invert) values (1, '2026-06-29', false)
  on conflict (id) do nothing;

insert into roster (kelompok, names)
  select g, '[]'::jsonb from generate_series(1, 10) as g
  on conflict (kelompok) do nothing;

-- aktifkan Row Level Security
alter table entries enable row level security;
alter table roster enable row level security;
alter table config enable row level security;

-- izinkan semua orang yang punya link (anon) untuk baca & tulis
-- (aplikasi ini tidak pakai sistem login, jadi semua anggota kelompok memakai akses yang sama)
create policy "public read entries" on entries for select using (true);
create policy "public insert entries" on entries for insert with check (true);

create policy "public read roster" on roster for select using (true);
create policy "public update roster" on roster for update using (true);

create policy "public read config" on config for select using (true);
create policy "public update config" on config for update using (true);
