-- Add unique constraint on standings for upsert operations
ALTER TABLE standings ADD CONSTRAINT standings_competition_team_key UNIQUE (competition_id, team_name);
