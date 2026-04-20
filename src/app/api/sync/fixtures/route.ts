import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const API_SPORTS_KEY = process.env.API_SPORTS_KEY!;

// Fenerbahçe Team IDs
const FB_TEAMS = {
  football: 611,
  basketball: 1270,
  volleyball: 1271,
};

// Season mapping (some sports use different seasons)
const SEASONS: Record<string, string> = {
  football: "2024",
  basketball: "2024",
  volleyball: "2024",
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
    // Basketball/Volleyball statuses
    "Game Finished": "finished",
    "Finished": "finished",
    "In Progress": "live",
    "Postponed": "postponed",
    "Cancelled": "cancelled",
    " Interrupted": "interrupted",
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
    return (data.response || []).map((f: Record<string, unknown>) => ({
      id: f.fixture.id as number,
      date: f.fixture.date as string,
      status: (f.fixture.status as { short: string }).short,
      venue: (f.fixture.venue as { name: string } | null)?.name || null,
      league: {
        id: (f.league as { id: number }).id,
        name: (f.league as { name: string }).name,
      },
      homeTeam: (f.teams as { home: { name: string } }).home.name,
      awayTeam: (f.teams as { away: { name: string } }).away.name,
      homeScore: (f.goals as { home: number | null } | null)?.home ?? null,
      awayScore: (f.goals as { away: number | null } | null)?.away ?? null,
      homeLogo: (f.teams as { home: { logo: string } }).home.logo,
      awayLogo: (f.teams as { away: { logo: string } }).away.logo,
      extraData: {
        league_country: (f.league as { country: string }).country,
        halftime_score: (f.score as { halftime: { home: number; away: number } } | null)?.halftime,
        fulltime_score: (f.score as { fulltime: { home: number; away: number } } | null)?.fulltime,
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
    return (data.response || []).map((g: Record<string, unknown>) => ({
      id: g.id as number,
      date: g.date as string,
      status: (g.status as { short: string }).short,
      venue: (g.venue as string | null) || null,
      league: {
        id: (g.league as { id: number }).id,
        name: (g.league as { name: string }).name,
      },
      homeTeam: (g.teams as { home: { name: string } }).home.name,
      awayTeam: (g.teams as { away: { name: string } }).away.name,
      homeScore: (g.scores as { home: { total: number } } | null)?.home?.total ?? null,
      awayScore: (g.scores as { away: { total: number } } | null)?.away?.total ?? null,
      homeLogo: (g.teams as { home: { logo: string } }).home.logo,
      awayLogo: (g.teams as { away: { logo: string } }).away.logo,
      extraData: {
        quarter_scores: g.scores,
      },
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
    return (data.response || []).map((g: Record<string, unknown>) => ({
      id: g.id as number,
      date: g.date as string,
      status: (g.status as { short: string }).short,
      venue: (g.venue as string | null) || null,
      league: {
        id: (g.league as { id: number }).id,
        name: (g.league as { name: string }).name,
      },
      homeTeam: (g.teams as { home: { name: string } }).home.name,
      awayTeam: (g.teams as { away: { name: string } }).away.name,
      homeScore: (g.scores as { home: { total: number } } | null)?.home?.total ?? null,
      awayScore: (g.scores as { away: { total: number } } | null)?.away?.total ?? null,
      homeLogo: (g.teams as { home: { logo: string } }).home.logo,
      awayLogo: (g.teams as { away: { logo: string } }).away.logo,
      extraData: {
        set_scores: g.scores,
      },
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
