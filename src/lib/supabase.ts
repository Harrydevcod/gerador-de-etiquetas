import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && key ? createClient(url, key) : null;
export const hasSupabase = !!supabase;

// SQL to run in Supabase SQL editor:
//
// create table labels (
//   id uuid primary key,
//   c text not null default '',
//   name text not null,
//   brand text default '',
//   price integer not null,
//   old_price integer default 0,
//   unit text default 'por unid.',
//   section text default 'Mercearia',
//   store text default 'Minimarket',
//   created_at timestamptz default now()
// );
// alter table labels enable row level security;
// create policy "anon_all" on labels for all using (true) with check (true);
//
// create table user_config (
//   id text primary key default 'default',
//   config jsonb not null,
//   updated_at timestamptz default now()
// );
// alter table user_config enable row level security;
// create policy "anon_all" on user_config for all using (true) with check (true);
