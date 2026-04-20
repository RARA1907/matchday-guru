import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const API_SPORTS_KEY = process.env.API_SPORTS_KEY!;

// League configurations
const LEAGUES: Record<string, { leagueId: number; competitionId: string; season: string }> = {
  football_superlig: { leagueId: 203, competitionId: "00000000-0000-0000-0002-000000000001", season: "2024" },
  football_ucl: { leagueId: 2, competitionId: "00000000-0000-0000-0002-000000000006", season: "2024" },
  football_uel: { leagueId: 3, competitionId: "00000000-0000-0000-0002-000000000007", season: "2024" },
  football_tk: { leagueId: 206, competitionId: "00000000-0000-0000-0002-000000000008", season: "2024" },
  basketball_bsl: { leagueId: 118, competitionId: "00000000-0000-0000-0002-000000000002", season: "2024" },
  volleyball_vestel: { leagueId: 119, competitionId: "00000000-0000-0000-0002-000000000004", season: "2024" },
};

interface StandingTeam {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

interface StandingsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season: number;
    standings: StandingTeam[][];
  };
}

async function fetchStandings(leagueId: number, season: string): Promise<StandingsResponse | null> {
  const url = `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`;

  try {
    const res = await fetch(url, {
      headers: { "x-apisports-key": API_SPORTS_KEY },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Standings API Error for league ${leagueId}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.response?.[0] || null;
  } catch (error) {
    console.error(`Fetch standings error for league ${leagueId}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, { success: number; error: number }> = {};
  let totalSuccess = 0;
  let totalError = 0;

  for (const [key, config] of Object.entries(LEAGUES)) {
    console.log(`Syncing standings for ${key} (league ${config.leagueId})...`);

    const data = await fetchStandings(config.leagueId, config.season);

    if (!data) {
      results[key] = { success: 0, error: 1 };
      totalError++;
      continue;
    }

    // standings is nested inside league object: league.standings[0]
    const standings = data.league?.standings?.[0] || [];
    console.log(`  Found ${standings.length} teams`);

    let successCount = 0;
    let errorCount = 0;

    for (const standing of standings) {
      try {
        const standingData = {
          competition_id: config.competitionId,
          team_name: standing.team.name,
          position: standing.rank,
          points: standing.points,
          played: standing.all.played,
          won: standing.all.win,
          drawn: standing.all.draw,
          lost: standing.all.lose,
          goals_for: standing.all.goals.for,
          goals_against: standing.all.goals.against,
          goal_difference: standing.goalsDiff,
          form: standing.form,
        };

        const { error } = await getSupabaseAdmin()
          .from("standings")
          .upsert(standingData as never, {
            onConflict: "competition_id,team_name",
          });

        if (error) {
          console.error(`  Error upserting ${standing.team.name}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`  Error processing team:`, err);
        errorCount++;
      }
    }

    results[key] = { success: successCount, error: errorCount };
    totalSuccess += successCount;
    totalError += errorCount;
  }

  return NextResponse.json({
    success: true,
    results,
    total: { success: totalSuccess, error: totalError },
    timestamp: new Date().toISOString(),
  });
}
