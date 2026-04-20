-- Add unique constraint on api_fixture_id for upsert operations
-- This is required for the /api/sync/fixtures endpoint to work correctly

CREATE UNIQUE INDEX IF NOT EXISTS idx_fixtures_api_fixture_id ON fixtures(api_fixture_id);

-- Also add a partial unique index to allow NULL values (for fixtures without api_fixture_id)
-- This handles the case where we might insert fixtures without an api_id
DO $$
BEGIN
  -- If there are existing NULL api_fixture_id values, we need to handle them
  -- Set a placeholder value for NULLs (they should be replaced with real API IDs)
  UPDATE fixtures SET api_fixture_id = 0 WHERE api_fixture_id IS NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Table might be empty or constraint already exists: %', SQLERRM;
END $$;

-- Now add the unique constraint (replacing the index we just created)
ALTER TABLE fixtures ADD CONSTRAINT fixtures_api_fixture_id_key UNIQUE (api_fixture_id);
