-- ============================================================================
-- Strategy First / Room KPI — full schema for PostgreSQL (Supabase SQL editor)
-- Mirrors Laravel migrations in database/migrations (fresh install).
--
-- Usage: Supabase → SQL Editor → paste → Run.
-- Project ref: pxczvudicswvzsuwenpd → Dashboard: https://supabase.com/dashboard/project/pxczvudicswvzsuwenpd
-- After this, copy .env.example → .env, set DB_CONNECTION=pgsql and Supabase vars (see .env.example).
-- Then run:
--   php artisan migrate:status
-- If tables already exist, Laravel will skip; or use migrate:fresh only on empty DB.
--
-- Optional: enable Row Level Security per table if you access Supabase from the browser;
-- this app uses Laravel as API with direct DB connection — RLS not required for Laravel.
-- This file must never contain passwords or connection secrets — only DDL.
-- ============================================================================

-- Extensions (Supabase has uuid helpers available; not required for this schema)

-- -----------------------------------------------------------------------------
-- users (+ is_admin from add_is_admin migration)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMPTZ NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NULL
);

-- -----------------------------------------------------------------------------
-- password_reset_tokens (from default Laravel migration)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NULL
);

-- -----------------------------------------------------------------------------
-- sessions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_index ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_last_activity_index ON public.sessions (last_activity);

-- -----------------------------------------------------------------------------
-- cache & cache_locks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

-- -----------------------------------------------------------------------------
-- jobs, job_batches, failed_jobs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL,
    reserved_at INTEGER NULL,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS jobs_queue_index ON public.jobs (queue);

CREATE TABLE IF NOT EXISTS public.job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INTEGER NOT NULL,
    pending_jobs INTEGER NOT NULL,
    failed_jobs INTEGER NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options TEXT NULL,
    cancelled_at INTEGER NULL,
    created_at INTEGER NOT NULL,
    finished_at INTEGER NULL
);

CREATE TABLE IF NOT EXISTS public.failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- clubs (before bookings FK)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clubs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NULL
);

-- -----------------------------------------------------------------------------
-- bookings (includes club_id + FK)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id BIGSERIAL PRIMARY KEY,
    club_id BIGINT NULL REFERENCES public.clubs (id) ON DELETE RESTRICT,
    day_of_week VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    club_name VARCHAR(255) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NULL
);

-- -----------------------------------------------------------------------------
-- personal_access_tokens (Sanctum)
-- morphs('tokenable') => tokenable_type + tokenable_id + index
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index
    ON public.personal_access_tokens (tokenable_type, tokenable_id);

-- -----------------------------------------------------------------------------
-- events (announcements)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    location VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    day_of_week VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NULL
);

-- ============================================================================
-- End of schema. Seed data remains via Laravel:
--   php artisan db:seed
-- Or insert rows manually in Supabase Table Editor.
-- ============================================================================
