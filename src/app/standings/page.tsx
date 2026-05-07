import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const STANDINGS_CONFIG = [
  { competitionId: "00000000-0000-0000-0002-000000000001", name: "Süper Lig", emoji: "⚽", color: "#22C55E" },
  { competitionId: "00000000-0000-0000-0002-000000000006", name: "UCL", emoji: "🏆", color: "#0066CC" },
  { competitionId: "00000000-0000-0000-0002-000000000007", name: "UEL", emoji: "🏆", color: "#FF6600" },
  { competitionId: "00000000-0000-0000-0002-000000000002", name: "BSL", emoji: "🏀", color: "#F59E0B" },
  { competitionId: "00000000-0000-0000-0002-000000000010", name: "EuroLeague", emoji: "🏆", color: "#0066CC" },
  { competitionId: "00000000-0000-0000-0002-000000000004", name: "Efeler Ligi", emoji: "🏐", color: "#3B82F6" },
  { competitionId: "00000000-0000-0000-0002-000000000005", name: "Sultanlar Ligi", emoji: "🏐", color: "#8B5CF6" },
];

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

function isFBTeam(teamName: string) {
  const lower = teamName.toLowerCase();
  return lower.includes("fenerbahçe") || lower.includes("fenerbahce") || lower === "fb";
}

export default async function StandingsPage() {
  const supabase = createClient();

  const standingsData: Record<string, Standing[]> = {};
  for (const config of STANDINGS_CONFIG) {
    const { data } = await supabase
      .from("standings")
      .select("*")
      .eq("competition_id", config.competitionId)
      .order("position", { ascending: true })
      .limit(10);

    standingsData[config.competitionId] = (data || []) as unknown as Standing[];
  }

  const fbStandings = STANDINGS_CONFIG.map(config => ({
    ...config,
    fbPosition: standingsData[config.competitionId]?.findIndex(s => isFBTeam(s.team_name)) ?? -1,
    fbData: standingsData[config.competitionId]?.find(s => isFBTeam(s.team_name)),
    totalTeams: standingsData[config.competitionId]?.length || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#002D72] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">Puan Durumları</h1>
              <p className="text-xs text-white/70">Fenerbahçe SK</p>
            </div>
          </div>
        </div>
      </header>

      {/* FB Quick View */}
      <div className="bg-gradient-to-r from-[#002D72] to-[#003d8f] px-4 py-4 text-white">
        <h2 className="text-sm font-medium text-white/70 mb-3">Fenerbahçe Pozisyonları</h2>
        <div className="grid grid-cols-2 gap-3">
          {fbStandings.filter(s => s.fbPosition >= 0).map(s => (
            <div key={s.competitionId} className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span>{s.emoji}</span>
                <span className="text-xs text-white/70">{s.name}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{s.fbData?.position || "-"}</span>
                <span className="text-xs text-white/60">/ {s.totalTeams}</span>
                <span className="text-sm ml-auto bg-[#FFED00] text-[#002D72] px-2 py-0.5 rounded font-bold">
                  {s.fbData?.points || 0} P
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standings Tabs */}
      <div className="bg-white border-b px-4 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {STANDINGS_CONFIG.map((config, i) => (
            <button
              key={config.competitionId}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                i === 0 ? "bg-[#002D72] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{config.emoji}</span>
              <span>{config.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Standings Table */}
      <div className="px-4 py-4">
        {STANDINGS_CONFIG.map((config, idx) => {
          const standings = standingsData[config.competitionId] || [];
          if (standings.length === 0) return null;

          return (
            <div key={config.competitionId} className={idx > 0 ? "mt-6" : ""}>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>{config.emoji}</span>
                <span>{config.name}</span>
              </h3>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-500 text-xs">
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Takım</th>
                      <th className="px-2 py-2 text-center">O</th>
                      <th className="px-2 py-2 text-center">G</th>
                      <th className="px-2 py-2 text-center">B</th>
                      <th className="px-2 py-2 text-center">M</th>
                      <th className="px-2 py-2 text-center font-bold text-[#002D72]">P</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {standings.map((standing) => {
                      const isFB = isFBTeam(standing.team_name);
                      return (
                        <tr
                          key={standing.team_name}
                          className={`${isFB ? "bg-blue-50" : ""} ${standing.position <= 3 ? "font-medium" : ""}`}
                        >
                          <td className="px-3 py-2">
                            <span className={`font-bold ${standing.position <= 3 ? "text-[#002D72]" : "text-gray-500"}`}>
                              {standing.position}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={isFB ? "font-bold text-[#002D72]" : ""}>
                              {isFB && "🔵 "}
                              {standing.team_name}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center text-gray-600">{standing.played}</td>
                          <td className="px-2 py-2 text-center text-green-600 font-medium">{standing.won}</td>
                          <td className="px-2 py-2 text-center text-gray-500">{standing.drawn}</td>
                          <td className="px-2 py-2 text-center text-red-500">{standing.lost}</td>
                          <td className="px-2 py-2 text-center font-bold text-[#002D72]">{standing.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {fbStandings.every(s => s.fbPosition < 0) && (
          <div className="text-center py-12 text-gray-500">
            <p>Puan durumu verisi yok</p>
            <p className="text-sm text-gray-400 mt-1">API-Sports Pro gerekiyor</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-[#002D72] transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs">Ana Sayfa</span>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-[#002D72] transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Takvim</span>
          </Link>
          <Link href="/standings" className="flex flex-col items-center gap-1 p-2 text-[#002D72]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Puan</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-[#002D72] transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-xs">Bildirim</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}