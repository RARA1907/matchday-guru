import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const API_SPORTS_KEY = process.env.API_SPORTS_KEY!;

// Fenerbahçe Team IDs
const FB_TEAMS = {
  football: 611,
  basketball: 1270,
  volleyball: 1271,
};

// Branch IDs
const BRANCH_IDS: Record<string, string> = {
  football: "00000000-0000-0000-0001-000000000001",
  basketball: "00000000-0000-0000-0001-000000000002",
  volleyball: "00000000-0000-0000-0001-000000000004",
};

// League ID to Competition ID mapping
const COMPETITION_IDS: Record<string, Record<number, string | null>> = {
  football: {
    203: "00000000-0000-0000-0002-000000000001", // Süper Lig
    2: "00000000-0000-0000-0002-000000000006",    // UEFA Champions League
    3: "00000000-0000-0000-0002-000000000007",    // UEFA Europa League
    206: "00000000-0000-0000-0002-000000000008",  // Türkiye Kupası
    667: null,                                     // Friendlies Clubs - skip
  },
  basketball: {
    120: "00000000-0000-0000-0002-000000000009",  // Euroleague
    167: "00000000-0000-0000-0002-000000000010",  // Super Cup
    118: "00000000-0000-0000-0002-000000000002",  // BSL
  },
  volleyball: {
    119: "00000000-0000-0000-0002-000000000004",  // Vestelmen's Volleyball League
    167: null,                                     // Skip other
  },
};

// Unified fixture interface
interface UnifiedFixture {
  id: number;
  date: string;
  status: string;
  venue: string | null;
  league: { id: number; name: string };
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  homeLogo: string;
  awayLogo: string;
  extraData: Record<string, unknown>;
}

// API Response Types
interface FootballFixtureResponse {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
    venue: { name: string } | null;
  };
  league: { id: number; name: string; country: string };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number; away: number };
    fulltime: { home: number; away: number };
  };
}

interface BasketballGameResponse {
  id: number;
  date: string;
  status: { short: string };
  venue: string | null;
  league: { id: number; name: string };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  scores: {
    home: { total: number };
    away: { total: number };
  };
}

interface VolleyballGameResponse {
  id: number;
  date: string;
  status: { short: string };
  venue: string | null;
  league: { id: number; name: string };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  scores: {
    home: { total: number };
    away: { total: number };
  };
}

function mapStatus(apiStatus: string): string {
  const statusMap: Record<string, string> = {
    FT: "finished",
    HT: "halftime",
    ET: "extratime",
    PEN: "penalties",
    LIVE: "live",
    PST: "postponed",
    CANC: "cancelled",
    ABD: "abandoned",
    INT: "interrupted",
    NS: "scheduled",
    "Game Finished": "finished",
    "Finished": "finished",
    "In Progress": "live",
    "Postponed": "postponed",
    "Cancelled": "cancelled",
  };
  return statusMap[apiStatus] || "scheduled";
}

async function fetchFootballFixtures(teamId: number): Promise<UnifiedFixture[]> {
  const url = `https://v3.football.api-sports.io/fixtures?team=${teamId}&season=2024`;
  try {
    const res = await fetch(url, {
      headers: { "x-apisports-key": API_SPORTS_KEY },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Football API Error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.response || []).map((f: FootballFixtureResponse) => ({
      id: f.fixture.id,
      date: f.fixture.date,
      status: f.fixture.status.short,
      venue: f.fixture.venue?.name || null,
      league: { id: f.league.id, name: f.league.name },
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeScore: f.goals?.home ?? null,
      awayScore: f.goals?.away ?? null,
      homeLogo: f.teams.home.logo,
      awayLogo: f.teams.away.logo,
      extraData: {
        league_country: f.league.country,
        halftime_score: f.score?.halftime,
        fulltime_score: f.score?.fulltime,
      },
    }));
  } catch (error) {
    console.error("Football fetch error:", error);
    return [];
  }
}

async function fetchBasketballGames(teamId: number): Promise<UnifiedFixture[]> {
  const url = `https://v1.basketball.api-sports.io/games?team=${teamId}&season=2024`;
  try {
    const res = await fetch(url, {
      headers: { "x-apisports-key": API_SPORTS_KEY },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Basketball API Error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.response || []).map((g: BasketballGameResponse) => ({
      id: g.id,
      date: g.date,
      status: g.status.short,
      venue: g.venue || null,
      league: { id: g.league.id, name: g.league.name },
      homeTeam: g.teams.home.name,
      awayTeam: g.teams.away.name,
      homeScore: g.scores?.home?.total ?? null,
      awayScore: g.scores?.away?.total ?? null,
      homeLogo: g.teams.home.logo,
      awayLogo: g.teams.away.logo,
      extraData: { quarter_scores: g.scores },
    }));
  } catch (error) {
    console.error("Basketball fetch error:", error);
    return [];
  }
}

async function fetchVolleyballGames(teamId: number): Promise<UnifiedFixture[]> {
  const url = `https://v1.volleyball.api-sports.io/games?team=${teamId}&season=2024`;
  try {
    const res = await fetch(url, {
      headers: { "x-apisports-key": API_SPORTS_KEY },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Volleyball API Error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.response || []).map((g: VolleyballGameResponse) => ({
      id: g.id,
      date: g.date,
      status: g.status.short,
      venue: g.venue || null,
      league: { id: g.league.id, name: g.league.name },
      homeTeam: g.teams.home.name,
      awayTeam: g.teams.away.name,
      homeScore: g.scores?.home?.total ?? null,
      awayScore: g.scores?.away?.total ?? null,
      homeLogo: g.teams.home.logo,
      awayLogo: g.teams.away.logo,
      extraData: { set_scores: g.scores },
    }));
  } catch (error) {
    console.error("Volleyball fetch error:", error);
    return [];
  }
}

async function fetchFixtures(sport: string, teamId: number): Promise<UnifiedFixture[]> {
  if (sport === "football") return fetchFootballFixtures(teamId);
  if (sport === "basketball") return fetchBasketballGames(teamId);
  if (sport === "volleyball") return fetchVolleyballGames(teamId);
  return [];
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, { success: number; error: number }> = {
    football: { success: 0, error: 0 },
    basketball: { success: 0, error: 0 },
    volleyball: { success: 0, error: 0 },
  };

  for (const [sport, teamId] of Object.entries(FB_TEAMS)) {
    console.log(`Syncing ${sport} (team ${teamId})...`);
    const fixtures = await fetchFixtures(sport, teamId);
    console.log(`  Found ${fixtures.length} fixtures`);

    const competitionMap = COMPETITION_IDS[sport] || {};
    const branchId = BRANCH_IDS[sport];

    for (const fixture of fixtures) {
      try {
        const status = mapStatus(fixture.status);
        const competitionId = competitionMap[fixture.league.id] ?? null;

        if (!competitionId) {
          console.log(`  Skipping ${fixture.id} - unmapped league ${fixture.league.id} (${fixture.league.name})`);
          results[sport as keyof typeof results].error++;
          continue;
        }

        const fixtureData = {
          api_fixture_id: fixture.id,
          competition_id: competitionId,
          branch_id: branchId,
          home_team: fixture.homeTeam,
          away_team: fixture.awayTeam,
          home_score: fixture.homeScore,
          away_score: fixture.awayScore,
          match_datetime: new Date(fixture.date).toISOString(),
          status,
          venue: fixture.venue,
          extra_data: {
            league_name: fixture.league.name,
            league_id: fixture.league.id,
            home_logo: fixture.homeLogo,
            away_logo: fixture.awayLogo,
            ...fixture.extraData,
          },
        };

        const { error } = await getSupabaseAdmin()
          .from("fixtures")
          .upsert(fixtureData as never, { onConflict: "api_fixture_id" });

        if (error) {
          console.error(`  Error upserting ${fixture.id}:`, error.message);
          results[sport as keyof typeof results].error++;
        } else {
          results[sport as keyof typeof results].success++;
        }
      } catch (err) {
        console.error(`  Error processing fixture:`, err);
        results[sport as keyof typeof results].error++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  });
}
