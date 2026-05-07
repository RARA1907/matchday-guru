import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const API_SPORTS_KEY = process.env.API_SPORTS_KEY!;

// Fenerbahçe Tüm Takımlar
const FB_TEAMS: Record<string, { teamId: number; branchId: string }> = {
  football_men: { teamId: 611, branchId: "00000000-0000-0000-0001-000000000001" },
  basketball_men: { teamId: 1270, branchId: "00000000-0000-0000-0001-000000000002" },
  basketball_women: { teamId: 1257, branchId: "00000000-0000-0000-0001-000000000003" },
  volleyball_men: { teamId: 1271, branchId: "00000000-0000-0000-0001-000000000004" },
  volleyball_women: { teamId: 1293, branchId: "00000000-0000-0000-0001-000000000005" },
};

// League ID -> Competition ID Mapping
const COMPETITION_MAP: Record<number, string> = {
  // Football (Men)
  203: "00000000-0000-0000-0002-000000000001", // Süper Lig
  2: "00000000-0000-0000-0002-000000000006",   // UEFA Champions League
  3: "00000000-0000-0000-0002-000000000007",   // UEFA Europa League
  848: "00000000-0000-0000-0002-000000000009", // UEFA Europa Conference League
  206: "00000000-0000-0000-0002-000000000008", // Türkiye Kupası
  // Basketball (Men)
  104: "00000000-0000-0000-0002-000000000002", // BSL (Super Ligi)
  120: "00000000-0000-0000-0002-000000000010", // Euroleague
  167: "00000000-0000-0000-0002-000000000011", // Super Cup
  // Basketball (Women)
  105: "00000000-0000-0000-0002-000000000012", // TKBL W
  // Volleyball (Men)
  172: "00000000-0000-0000-0002-000000000004", // Efeler Ligi
  // Volleyball (Women)
  119: "00000000-0000-0000-0002-000000000005", // Sultanlar Ligi
};

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
  const map: Record<string, string> = {
    FT: "finished", HT: "halftime", ET: "extratime", PEN: "penalties",
    LIVE: "live", PST: "postponed", CANC: "cancelled", ABD: "abandoned",
    INT: "interrupted", NS: "scheduled",
    "Game Finished": "finished", "Finished": "finished",
    "In Progress": "live", "Postponed": "postponed", "Cancelled": "cancelled",
  };
  return map[apiStatus] || "scheduled";
}

async function fetchFootballFixtures(teamId: number): Promise<UnifiedFixture[]> {
  const url = `https://v3.football.api-sports.io/fixtures?team=${teamId}&season=2024`;
  try {
    const res = await fetch(url, { headers: { "x-apisports-key": API_SPORTS_KEY }, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response || []).map((f: {
      fixture: { id: number; date: string; status: { short: string }; venue: { name: string } | null };
      league: { id: number; name: string; country: string };
      teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
      goals: { home: number | null; away: number | null };
      score: { halftime: { home: number; away: number }; fulltime: { home: number; away: number } };
    }) => ({
      id: f.fixture.id, date: f.fixture.date, status: f.fixture.status.short,
      venue: f.fixture.venue?.name || null, league: { id: f.league.id, name: f.league.name },
      homeTeam: f.teams.home.name, awayTeam: f.teams.away.name,
      homeScore: f.goals?.home ?? null, awayScore: f.goals?.away ?? null,
      homeLogo: f.teams.home.logo, awayLogo: f.teams.away.logo,
      extraData: { league_country: f.league.country, halftime_score: f.score?.halftime, fulltime_score: f.score?.fulltime },
    }));
  } catch { return []; }
}

async function fetchBasketballGames(teamId: number): Promise<UnifiedFixture[]> {
  const url = `https://v1.basketball.api-sports.io/games?team=${teamId}&season=2024`;
  try {
    const res = await fetch(url, { headers: { "x-apisports-key": API_SPORTS_KEY }, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response || []).map((g: {
      id: number; date: string; status: { short: string }; venue: string | null;
      league: { id: number; name: string };
      teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
      scores: { home: { total: number }; away: { total: number } };
    }) => ({
      id: g.id, date: g.date, status: g.status.short, venue: g.venue || null,
      league: { id: g.league.id, name: g.league.name },
      homeTeam: g.teams.home.name, awayTeam: g.teams.away.name,
      homeScore: g.scores?.home?.total ?? null, awayScore: g.scores?.away?.total ?? null,
      homeLogo: g.teams.home.logo, awayLogo: g.teams.away.logo,
      extraData: { quarter_scores: g.scores },
    }));
  } catch { return []; }
}

async function fetchVolleyballGames(teamId: number): Promise<UnifiedFixture[]> {
  const url = `https://v1.volleyball.api-sports.io/games?team=${teamId}&season=2024`;
  try {
    const res = await fetch(url, { headers: { "x-apisports-key": API_SPORTS_KEY }, cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.response || []).map((g: {
      id: number; date: string; status: { short: string }; venue: string | null;
      league: { id: number; name: string };
      teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
      scores: { home: { total: number }; away: { total: number } };
    }) => ({
      id: g.id, date: g.date, status: g.status.short, venue: g.venue || null,
      league: { id: g.league.id, name: g.league.name },
      homeTeam: g.teams.home.name, awayTeam: g.teams.away.name,
      homeScore: g.scores?.home?.total ?? null, awayScore: g.scores?.away?.total ?? null,
      homeLogo: g.teams.home.logo, awayLogo: g.teams.away.logo,
      extraData: { set_scores: g.scores },
    }));
  } catch { return []; }
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

  const results: Record<string, { success: number; error: number; total: number }> = {};

  for (const [sportKey, config] of Object.entries(FB_TEAMS)) {
    console.log(`\n🔄 Syncing ${sportKey} (team ${config.teamId})...`);

    const sportType = sportKey.includes("basketball") ? "basketball" : sportKey.includes("volleyball") ? "volleyball" : "football";
    const fixtures = await fetchFixtures(sportType, config.teamId);
    console.log(`  📊 Found ${fixtures.length} fixtures`);

    let success = 0;
    let error = 0;

    for (const fixture of fixtures) {
      try {
        const competitionId = COMPETITION_MAP[fixture.league.id];
        if (!competitionId) {
          console.log(`  ⏭️ Skipping ${fixture.id} - unmapped league ${fixture.league.id} (${fixture.league.name})`);
          error++;
          continue;
        }

        const fixtureData = {
          api_fixture_id: fixture.id,
          competition_id: competitionId,
          branch_id: config.branchId,
          home_team: fixture.homeTeam,
          away_team: fixture.awayTeam,
          home_score: fixture.homeScore,
          away_score: fixture.awayScore,
          match_datetime: new Date(fixture.date).toISOString(),
          status: mapStatus(fixture.status),
          venue: fixture.venue,
          extra_data: {
            league_name: fixture.league.name,
            league_id: fixture.league.id,
            home_logo: fixture.homeLogo,
            away_logo: fixture.awayLogo,
            ...fixture.extraData,
          },
        };

        const { error: dbError } = await getSupabaseAdmin()
          .from("fixtures")
          .upsert(fixtureData as never, { onConflict: "api_fixture_id" });

        if (dbError) {
          console.error(`  ❌ Error upserting ${fixture.id}:`, dbError.message);
          error++;
        } else {
          success++;
        }
      } catch (err) {
        console.error(`  ❌ Error processing fixture:`, err);
        error++;
      }
    }

    results[sportKey] = { success, error, total: fixtures.length };
    console.log(`  ✅ Success: ${success}, ❌ Error: ${error}`);
  }

  return NextResponse.json({
    success: true,
    results,
    totalFixtures: Object.values(results).reduce((acc, r) => acc + r.total, 0),
    syncedAt: new Date().toISOString(),
  });
}