-- ==============================================================================
-- NXTWAVE AI PROJECT PASSPORT: EMAIL STATUS TRACKING MIGRATION
-- Migration: 20261028000002_add_email_status.sql
-- Adds idempotent confirmation email tracking columns to public.registrations
-- ==============================================================================

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS confirmation_email_status TEXT DEFAULT 'pending'
    CHECK (confirmation_email_status IN ('pending', 'sent', 'failed', 'unconfigured', 'skipped_duplicate')),
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_registrations_email_status
  ON public.registrations(confirmation_email_status);
