-- Drop the problematic btree index on description column
-- This index causes errors when description text exceeds ~2704 bytes
DROP INDEX IF EXISTS "job_postings_description_idx";

-- Create a GIN full-text search index instead
-- GIN indexes can handle large text values and are better for text search
CREATE INDEX IF NOT EXISTS "job_postings_description_fts_idx"
  ON "job_postings" USING GIN (to_tsvector('english', description));

-- Note: For exact matching on description, you can query without an index
-- For full-text search, use: WHERE to_tsquery('english', 'search terms') @@ to_tsvector('english', description)
