import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const API_SPORTS_KEY = process.env.API_SPORTS_KEY!;

// Fenerbahçe Team IDs
const FB_TEAMS = {
  football: 611,
  basketball: 1270,
  volleyball: 1271,
};

interface ApiSportsFixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    timezone: string;
    status: { short: string; long: string };
    venue: { name: string; city: string } | null;
  };
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

async function fetchFixtures(teamId: number, sport: string): Promise<ApiSportsFixture[]> {
  const baseUrls: Record<string, string> = {
    football: "https://v3.football.api-sports.io",
    basketball: "https://v1.basketball.api-sports.io",
    volleyball: "https://v1.volleyball.api-sports.io",
  };

  const url = `${baseUrls[sport]}/fixtures?team=${teamId}&season=2024`;

  try {
    const res = await fetch(url, {
      headers: { "x-apisports-key": API_SPORTS_KEY },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`API Error for ${sport}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.response || [];
  } catch (error) {
    console.error(`Fetch error for ${sport}:`, error);
    return [];
  }
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
  };
  return statusMap[apiStatus] || "scheduled";
}

export async function GET(request: Request) {
  // Verify cron secret (optional but recommended)
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
    console.log(`Syncing ${sport} fixtures for team ${teamId}...`);

    const fixtures = await fetchFixtures(teamId, sport);

    for (const fixture of fixtures) {
      try {
        // Map status
        const status = mapStatus(fixture.fixture.status.short);

        // Extract venue
        const venue = fixture.fixture.venue?.name || null;

        // Determine branch_id based on sport
        const branchIds: Record<string, string> = {
          football: "00000000-0000-0000-0001-000000000001",
          basketball: "00000000-0000-0000-0001-000000000002",
          volleyball: "00000000-0000-0000-0001-000000000004",
        };

        const branchId = branchIds[sport];

        // Determine competition_id based on league
        const competitionIds: Record<number, string> = {
          197: "00000000-0000-0000-0002-000000000001", // Süper Lig
          118: "00000000-0000-0000-0002-000000000002", // BSL
          119: "00000000-0000-0000-0002-000000000004", // Vestelmen's
        };
        const competitionId = competitionIds[fixture.league.id] || null;

        const fixtureData = {
          api_fixture_id: fixture.fixture.id,
          competition_id: competitionId,
          branch_id: branchId,
          home_team: fixture.teams.home.name,
          away_team: fixture.teams.away.name,
          home_score: fixture.goals.home,
          away_score: fixture.goals.away,
          match_datetime: new Date(fixture.fixture.date).toISOString(),
          status,
          venue,
          extra_data: {
            league_name: fixture.league.name,
            league_id: fixture.league.id,
            home_logo: fixture.teams.home.logo,
            away_logo: fixture.teams.away.logo,
            halftime_score: fixture.score.halftime,
            fulltime_score: fixture.score.fulltime,
          },
        };

        const { error } = await getSupabaseAdmin()
          .from("fixtures")
          .upsert(fixtureData as never, { onConflict: "api_fixture_id" });

        if (error) {
          console.error(`Error upserting fixture ${fixture.fixture.id}:`, error);
          results[sport as keyof typeof results].error++;
        } else {
          results[sport as keyof typeof results].success++;
        }
      } catch (err) {
        console.error(`Error processing fixture:`, err);
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
