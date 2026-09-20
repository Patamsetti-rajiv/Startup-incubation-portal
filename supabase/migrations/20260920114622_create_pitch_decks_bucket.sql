/*
# Create pitch-decks storage bucket

## Purpose
A public storage bucket to hold founder pitch deck PDF uploads.
The bucket is public so that uploaded PDFs can be viewed/downloaded
via their public URL without authentication.

## New Storage Buckets
- `pitch-decks` (public bucket for PDF files)

## Security
- Public bucket: anyone with the file path can read/download.
- Insert/Update/Delete policies allow anon + authenticated to manage files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('pitch-decks', 'pitch-decks', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_read_pitch_decks" ON storage.objects;
CREATE POLICY "anon_read_pitch_decks" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'pitch-decks');

DROP POLICY IF EXISTS "anon_insert_pitch_decks" ON storage.objects;
CREATE POLICY "anon_insert_pitch_decks" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'pitch-decks');

DROP POLICY IF EXISTS "anon_update_pitch_decks" ON storage.objects;
CREATE POLICY "anon_update_pitch_decks" ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'pitch-decks') WITH CHECK (bucket_id = 'pitch-decks');

DROP POLICY IF EXISTS "anon_delete_pitch_decks" ON storage.objects;
CREATE POLICY "anon_delete_pitch_decks" ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'pitch-decks');
