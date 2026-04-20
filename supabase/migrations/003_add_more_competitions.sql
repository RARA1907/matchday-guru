-- Add missing competitions for Fenerbahçe
-- UEFA Champions League, UEFA Europa League, Türkiye Kupası, Euroleague, Super Cup

INSERT INTO competitions (id, branch_id, name, season, country, competition_type, api_league_id) VALUES
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000001', 'UEFA Champions League', '2024-2025', 'Europe', 'european', 2),
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000001', 'UEFA Europa League', '2024-2025', 'Europe', 'european', 3),
  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000001', 'Türkiye Kupası', '2024-2025', 'Turkey', 'cup', 206),
  ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000002', 'Euroleague', '2024-2025', 'Europe', 'european', 120),
  ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000002', 'Basketbol Süper Cup', '2024-2025', 'Turkey', 'cup', 167)
ON CONFLICT (id) DO NOTHING;
