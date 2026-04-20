import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
  green: "#22C55E",
};

const FB_BRANCH_ID = "00000000-0000-0000-0001-000000000001";
const FB_COMPETITION_ID = "00000000-0000-0000-0002-000000000001"; // Süper Lig

interface Standing {
  team_name: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
}

interface Fixture {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  match_datetime: string;
  status: string;
  venue: string | null;
  extra_data: {
    home_logo?: string;
    away_logo?: string;
    league_name?: string;
  };
}

export default async function FootballPage() {
  const tBranches = await getTranslations("branches");

  // Fetch standings
  let standings: Standing[] = [];
  let upcomingFixtures: Fixture[] = [];
  let recentResults: Fixture[] = [];

  try {
    const supabase = await createClient();

    // Fetch standings for Süper Lig
    const { data: standingsData } = await supabase
      .from("standings")
      .select("*")
      .eq("competition_id", FB_COMPETITION_ID)
      .order("position", { ascending: true })
      .limit(10);

    standings = standingsData || [];

    // Fetch upcoming fixtures
    const { data: upcomingData } = await supabase
      .from("fixtures")
      .select("*")
      .eq("branch_id", FB_BRANCH_ID)
      .eq("competition_id", FB_COMPETITION_ID)
      .in("status", ["scheduled", "postponed"])
      .gte("match_datetime", new Date().toISOString())
      .order("match_datetime", { ascending: true })
      .limit(5);

    upcomingFixtures = upcomingData || [];

    // Fetch recent results
    const { data: resultsData } = await supabase
      .from("fixtures")
      .select("*")
      .eq("branch_id", FB_BRANCH_ID)
      .eq("competition_id", FB_COMPETITION_ID)
      .in("status", ["finished", "halftime", "live"])
      .lte("match_datetime", new Date().toISOString())
      .order("match_datetime", { ascending: false })
      .limit(5);

    recentResults = resultsData || [];
  } catch (error) {
    console.error("Error fetching from Supabase:", error);
  }

  // Calculate stats for Fenerbahçe
  const fbStanding = standings.find((s) => s.team_name.toLowerCase().includes("fenerbahçe") || s.team_name.toLowerCase().includes("fenerbahce"));
  const stats = fbStanding
    ? {
        played: fbStanding.played,
        won: fbStanding.won,
        drawn: fbStanding.drawn,
        lost: fbStanding.lost,
        points: fbStanding.points,
      }
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">⚽</span>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-outfit)", color: FB_COLORS.navy }}
            >
              {tBranches("football")}
            </h1>
            <p className="text-gray-600">Süper Lig</p>
          </div>
        </div>
        <Badge
          style={{ backgroundColor: `${FB_COLORS.green}20`, color: FB_COLORS.green }}
          className="font-medium"
        >
          Süper Lig 2024-2025
        </Badge>
      </section>

      {/* Quick Stats */}
      {stats && (
        <section className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: FB_COLORS.navy }}>
                {stats.played}
              </p>
              <p className="text-sm text-gray-500">Maç</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: FB_COLORS.green }}>
                {stats.won}
              </p>
              <p className="text-sm text-gray-500">Galibiyet</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: FB_COLORS.yellow }}>
                {stats.drawn}
              </p>
              <p className="text-sm text-gray-500">Beraberlik</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: "#EF4444" }}>
                {stats.lost}
              </p>
              <p className="text-sm text-gray-500">Mağlubiyet</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Standings Preview */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: FB_COLORS.navy }}>
          Puan Durumu
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">#</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Takım</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">O</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">G</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">B</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">M</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">A</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">P</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {standings.slice(0, 5).map((standing) => {
                    const isFB =
                      standing.team_name.toLowerCase().includes("fenerbahçe") ||
                      standing.team_name.toLowerCase().includes("fenerbahce");
                    return (
                      <tr key={standing.team_name} className={isFB ? "bg-blue-50" : undefined}>
                        <td className="px-4 py-3 font-bold">{standing.position}</td>
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          {isFB && <span>🔵</span>}
                          {standing.team_name}
                        </td>
                        <td className="px-4 py-3 text-center">{standing.played}</td>
                        <td className="px-4 py-3 text-center">{standing.won}</td>
                        <td className="px-4 py-3 text-center">{standing.drawn}</td>
                        <td className="px-4 py-3 text-center">{standing.lost}</td>
                        <td className="px-4 py-3 text-center">
                          {standing.goals_for}-{standing.goals_against}
                        </td>
                        <td
                          className="px-4 py-3 text-center font-bold"
                          style={{ color: FB_COLORS.navy }}
                        >
                          {standing.points}
                        </td>
                      </tr>
                    );
                  })}
                  {standings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        Puan durumu için API-Sports entegrasyonu bekleniyor
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: FB_COLORS.navy }}>
            Sonuçlar
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recentResults.map((match) => {
                  const isFBHome = match.home_team.toLowerCase().includes("fenerbahçe") || match.home_team.toLowerCase().includes("fenerbahce");
                  const isFBAway = match.away_team.toLowerCase().includes("fenerbahçe") || match.away_team.toLowerCase().includes("fenerbahce");
                  const isFBTeam = isFBHome || isFBAway;
                  const fbScore = isFBHome ? match.home_score : match.away_score;
                  const oppScore = isFBHome ? match.away_score : match.home_score;
                  const result =
                    fbScore !== null && oppScore !== null
                      ? fbScore > oppScore
                        ? "W"
                        : fbScore < oppScore
                        ? "L"
                        : "D"
                      : null;

                  return (
                    <div
                      key={match.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isFBTeam ? "bg-blue-50 border-blue-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium">{match.home_team}</span>
                        <span className="text-gray-400">vs</span>
                        <span className="text-lg font-medium">{match.away_team}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {match.home_score !== null && (
                          <span
                            className={`font-bold ${
                              result === "W"
                                ? "text-green-600"
                                : result === "L"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {match.home_score} - {match.away_score}
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            result === "W"
                              ? "bg-green-100 text-green-700"
                              : result === "L"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {result || match.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Upcoming Matches */}
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: FB_COLORS.navy }}>
          Yaklaşan Maçlar
        </h2>
        <Card>
          <CardContent className="p-6">
            {upcomingFixtures.length > 0 ? (
              <div className="space-y-4">
                {upcomingFixtures.map((match) => {
                  const matchDate = new Date(match.match_datetime);
                  const isFBHome =
                    match.home_team.toLowerCase().includes("fenerbahçe") ||
                    match.home_team.toLowerCase().includes("fenerbahce");

                  return (
                    <div
                      key={match.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isFBHome ? "bg-blue-50 border-blue-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{isFBHome ? "🔵" : "⚽"}</span>
                        <div>
                          <p className="font-medium">{match.home_team}</p>
                          <p className="text-sm text-gray-500">vs</p>
                        </div>
                        <div>
                          <p className="font-medium">{match.away_team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: FB_COLORS.navy }}>
                          {matchDate.toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {matchDate.toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400">
                Yaklaşan maç için API-Sports entegrasyonu bekleniyor
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
