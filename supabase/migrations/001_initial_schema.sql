-- MatchDay Club — Initial Database Schema
-- Version 1.0 | 16 Nisan 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- CLUBS (Multi-tenant)
-- ─────────────────────────────────────────────
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country TEXT,
  logo_url TEXT,
  theme_primary TEXT DEFAULT '#002D72',
  theme_secondary TEXT DEFAULT '#FFED00',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- BRANCHES
-- ─────────────────────────────────────────────
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  sport_type TEXT NOT NULL CHECK (sport_type IN ('football', 'basketball', 'volleyball', 'table_tennis', 'esports', 'swimming', 'athletics', 'rowing', 'other')),
  display_name_en TEXT,
  display_name_tr TEXT,
  api_source TEXT DEFAULT 'api-sports' CHECK (api_source IN ('api-sports', 'scraping', 'manual')),
  api_team_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branches_club_id ON branches(club_id);
CREATE INDEX idx_branches_sport_type ON branches(sport_type);

-- ─────────────────────────────────────────────
-- COMPETITIONS
-- ─────────────────────────────────────────────
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  season TEXT DEFAULT '2025-2026',
  country TEXT,
  competition_type TEXT CHECK (competition_type IN ('league', 'cup', 'european', 'friendly', 'playoffs')),
  api_league_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitions_branch_id ON competitions(branch_id);

-- ─────────────────────────────────────────────
-- FIXTURES
-- ─────────────────────────────────────────────
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  match_datetime TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled', 'halftime')),
  venue TEXT,
  round TEXT,
  api_fixture_id INTEGER,
  extra_data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fixtures_branch_id ON fixtures(branch_id);
CREATE INDEX idx_fixtures_competition_id ON fixtures(competition_id);
CREATE INDEX idx_fixtures_match_datetime ON fixtures(match_datetime);
CREATE INDEX idx_fixtures_status ON fixtures(status);

-- ─────────────────────────────────────────────
-- STANDINGS
-- ─────────────────────────────────────────────
CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  form TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_standings_competition_id ON standings(competition_id);

-- ─────────────────────────────────────────────
-- ROSTERS
-- ─────────────────────────────────────────────
CREATE TABLE rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  season TEXT DEFAULT '2025-2026',
  player_name TEXT NOT NULL,
  position TEXT,
  jersey_number INTEGER,
  nationality TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rosters_branch_id ON rosters(branch_id);

-- ─────────────────────────────────────────────
-- BROADCASTS
-- ─────────────────────────────────────────────
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  channel_type TEXT DEFAULT 'tv' CHECK (channel_type IN ('tv', 'streaming', 'iptv', 'club_tv', 'digital')),
  channel_url TEXT,
  country TEXT DEFAULT 'TR',
  source TEXT DEFAULT 'scraping' CHECK (source IN ('scraping', 'manual', 'api-sports')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_broadcasts_fixture_id ON broadcasts(fixture_id);

-- ─────────────────────────────────────────────
-- USER PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'tr')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'pro_live')),
  timezone TEXT DEFAULT 'Europe/Istanbul',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- USER BRANCH PREFERENCES
-- ─────────────────────────────────────────────
CREATE TABLE user_branch_prefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  UNIQUE(user_id, branch_id)
);

CREATE INDEX idx_user_branch_prefs_user_id ON user_branch_prefs(user_id);

-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  iyzico_subscription_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'pro_live')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- ─────────────────────────────────────────────
-- SCRAPE LOGS
-- ─────────────────────────────────────────────
CREATE TABLE scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url TEXT,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  scraper_name TEXT NOT NULL,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'partial')),
  records_found INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scrape_logs_scraper_name ON scrape_logs(scraper_name);
CREATE INDEX idx_scrape_logs_scraped_at ON scrape_logs(scraped_at);

-- ─────────────────────────────────────────────
-- API RESPONSE CACHE
-- ─────────────────────────────────────────────
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_api_cache_expires_at ON api_cache(expires_at);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_branch_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies (everyone can read sports data)
CREATE POLICY "Public can read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public can read branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public can read competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Public can read fixtures" ON fixtures FOR SELECT USING (true);
CREATE POLICY "Public can read standings" ON standings FOR SELECT USING (true);
CREATE POLICY "Public can read rosters" ON rosters FOR SELECT USING (true);
CREATE POLICY "Public can read broadcasts" ON broadcasts FOR SELECT USING (true);

-- User profile policies
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User branch prefs policies
CREATE POLICY "Users can read own branch prefs" ON user_branch_prefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own branch prefs" ON user_branch_prefs FOR ALL USING (auth.uid() = user_id);

-- Subscription policies
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Admin only: scrape logs
CREATE POLICY "Only service role can manage scrape logs" ON scrape_logs FOR ALL USING (false);
CREATE POLICY "Service role can insert scrape logs" ON scrape_logs FOR INSERT WITH CHECK (true);

-- Service role bypass for admin operations
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fixtures_updated_at
  BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER standings_updated_at
  BEFORE UPDATE ON standings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- SEED DATA: FENERBAHÇE
-- ─────────────────────────────────────────────

INSERT INTO clubs (id, name, slug, country, logo_url, theme_primary, theme_secondary) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Fenerbahçe SK', 'fenerbahce', 'Turkey', 'https://media.api-sports.io/football/teams/611.png', '#002D72', '#FFED00');

-- Branches
INSERT INTO branches (id, club_id, sport_type, display_name_en, display_name_tr, api_source, api_team_id) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'football', 'Football', 'Futbol', 'api-sports', 611),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'basketball', 'Basketball (Men)', 'Basketbol (Erkek)', 'api-sports', 1270),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'basketball', 'Basketball (Women)', 'Basketbol (Kadın)', 'api-sports', 1270),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'volleyball', 'Volleyball (Men)', 'Voleybol (Erkek)', 'api-sports', 1271),
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'volleyball', 'Volleyball (Women)', 'Voleybol (Kadın)', 'api-sports', 1271);

-- Competitions (Süper Lig, BSL, Sultanlar Ligi)
INSERT INTO competitions (id, branch_id, name, season, country, competition_type, api_league_id) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Süper Lig', '2025-2026', 'Turkey', 'league', 197),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'Basketball Super League', '2025-2026', 'Turkey', 'league', 118),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', 'KBSL (Women Basketball)', '2025-2026', 'Turkey', 'league', 118),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000004', 'Vestelmen''s Volleyball League', '2025-2026', 'Turkey', 'league', 119),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', 'Sultanlar Ligi (Women Volleyball)', '2025-2026', 'Turkey', 'league', 119);
