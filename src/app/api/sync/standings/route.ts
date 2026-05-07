import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const API_SPORTS_KEY = process.env.API_SPORTS_KEY!;

const STANDINGS_CONFIG: Record<string, { leagueId: number; competitionId: string; season: string; sport: string }> = {
  superlig: { leagueId: 203, competitionId: "00000000-0000-0000-0002-000000000001", season: "2024", sport: "football" },
  ucl: { leagueId: 2, competitionId: "00000000-0000-0000-0002-000000000006", season: "2024", sport: "football" },
  uel: { leagueId: 3, competitionId: "00000000-0000-0000-0002-000000000007", season: "2024", sport: "football" },
  tk: { leagueId: 206, competitionId: "00000000-0000-0000-0002-000000000008", season: "2024", sport: "football" },
  bsl: { leagueId: 104, competitionId: "00000000-0000-0000-0002-000000000002", season: "2024", sport: "basketball" },
  euroleague: { leagueId: 120, competitionId: "00000000-0000-0000-0002-000000000010", season: "2024", sport: "basketball" },
  efeler: { leagueId: 172, competitionId: "00000000-0000-0000-0002-000000000004", season: "2024", sport: "volleyball" },
  sultanlar: { leagueId: 119, competitionId: "00000000-0000-0000-0002-000000000005", season: "2024", sport: "volleyball" },
};

async function fetchFootballStandings(leagueId: number, season: string) {
  const url = `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`;
  const res = await fetch(url, { headers: { "x-apisports-key": API_SPORTS_KEY }, cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.response?.[0]?.league?.standings?.[0] || null;
}

async function fetchBasketballStandings(leagueId: number, season: string) {
  const url = `https://v1.basketball.api-sports.io/standings?league=${leagueId}&season=${season}`;
  const res = await fetch(url, { headers: { "x-apisports-key": API_SPORTS_KEY }, cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.response || [];
}

async function fetchVolleyballStandings(leagueId: number, season: string) {
  const url = `https://v1.volleyball.api-sports.io/standings?league=${leagueId}&season=${season}`;
  const res = await fetch(url, { headers: { "x-apisports-key": API_SPORTS_KEY }, cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.response || [];
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, { success: number; error: number }> = {};

  for (const [key, config] of Object.entries(STANDINGS_CONFIG)) {
    console.log(`\n📊 Syncing standings: ${key} (league ${config.leagueId})...`);

    let standings: unknown[] = [];
    if (config.sport === "football") {
      standings = await fetchFootballStandings(config.leagueId, config.season) || [];
    } else if (config.sport === "basketball") {
      standings = await fetchBasketballStandings(config.leagueId, config.season);
    } else if (config.sport === "volleyball") {
      standings = await fetchVolleyballStandings(config.leagueId, config.season);
    }

    console.log(`  Found ${standings.length} teams`);

    let success = 0;
    let error = 0;

    for (const standing of standings as { rank?: number; team?: { name: string; logo?: string }; points?: number; all?: { played: number; win: number; draw?: number; lose: number; goals?: { for: number; against: number } }; goalsDiff?: number; form?: string }[]) {
      try {
        const standingData = {
          competition_id: config.competitionId,
          team_name: standing.team?.name || "Unknown",
          position: standing.rank || 0,
          points: standing.points || 0,
          played: standing.all?.played || 0,
          won: standing.all?.win || 0,
          drawn: standing.all?.draw || 0,
          lost: standing.all?.lose || 0,
          goals_for: standing.all?.goals?.for || 0,
          goals_against: standing.all?.goals?.against || 0,
          goal_difference: standing.goalsDiff || 0,
          form: standing.form || "",
        };

        const { error: dbError } = await getSupabaseAdmin()
          .from("standings")
          .upsert(standingData as never, { onConflict: "competition_id,team_name" });

        if (dbError) {
          console.error(`  ❌ Error: ${dbError.message}`);
          error++;
        } else {
          success++;
        }
      } catch (err) {
        console.error(`  ❌ Error processing:`, err);
        error++;
      }
    }

    results[key] = { success, error };
    console.log(`  ✅ Success: ${success}, ❌ Error: ${error}`);
  }

  return NextResponse.json({
    success: true,
    results,
    syncedAt: new Date().toISOString(),
  });
}