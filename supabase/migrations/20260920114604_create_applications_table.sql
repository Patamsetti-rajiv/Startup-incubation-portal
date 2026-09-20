/*
# Create applications table for Startup Incubation Portal

## Purpose
Stores startup applications submitted by founders seeking incubation.
Each application includes startup details, founder contact, resource requirements,
a link to the uploaded pitch deck PDF, and a review status managed by admins.

## New Tables
- `applications`
  - `id` (uuid, primary key)
  - `startup_name` (text, not null) — name of the startup
  - `founder_name` (text, not null) — name of the founder
  - `email` (text, not null) — founder contact email
  - `requirements` (text, not null) — requested resources (funding, office space, lab access, etc.)
  - `pitch_deck_url` (text, not null) — public URL to uploaded pitch deck PDF in Supabase Storage
  - `status` (text, not null, enum: 'Under Review', 'Approved & Deployed', 'Needs Revision', default 'Under Review')
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on `applications`.
- This is a single-tenant app with no sign-in screen, so anon + authenticated roles
  have full CRUD access. The data is intentionally shared/public between founders
  submitting applications and admins reviewing them.

## Important Notes
1. The `status` column uses a CHECK constraint to enforce the three valid states.
2. An index on `created_at` supports chronological ordering in the admin table view.
3. A trigger updates `updated_at` automatically on row changes.
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_name text NOT NULL,
  founder_name text NOT NULL,
  email text NOT NULL,
  requirements text NOT NULL,
  pitch_deck_url text NOT NULL,
  status text NOT NULL DEFAULT 'Under Review'
    CHECK (status IN ('Under Review', 'Approved & Deployed', 'Needs Revision')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_applications" ON applications;
CREATE POLICY "anon_select_applications" ON applications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
CREATE POLICY "anon_insert_applications" ON applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_applications" ON applications;
CREATE POLICY "anon_update_applications" ON applications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_applications" ON applications;
CREATE POLICY "anon_delete_applications" ON applications FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS applications_updated_at ON applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
