create table public.routes (
  id uuid not null default gen_random_uuid (),
  "createdAt" timestamp with time zone not null default now(),
  "userId" uuid not null default auth.uid (),
  "brouterProfile" character varying not null default 'trekking'::character varying,
  points jsonb null default '[]'::jsonb,
  name text not null default ''::text,
  constraint routes_pkey primary key (id),
  constraint routes_id_key unique (id),
  constraint routes_userId_fkey foreign KEY ("userId") references auth.users (id) on update CASCADE on delete CASCADE,
  constraint routes_name_check check ((length(name) <= 100))
) TABLESPACE pg_default;