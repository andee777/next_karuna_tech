-- Run this against your Neon database to create the tables this app writes
-- to (Neon SQL Editor, or `psql "$DATABASE_URL" -f db/schema.sql`). Both
-- tables are written to exclusively from Next.js Server Actions using the
-- single DATABASE_URL connection string (see lib/db.ts), which is never
-- exposed to the browser.

create table if not exists project_inquiries (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  name              text not null,
  email             text not null,
  phone             text,
  preferred_contact text,
  company           text,
  project_type      text,
  budget            text,
  message           text not null
);

create table if not exists discovery_call_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null,
  email          text not null,
  phone          text,
  preferred_date date not null,
  preferred_time text not null,
  notes          text
);
