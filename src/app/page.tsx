import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
  red: "#E3001E",
  green: "#22C55E",
};

const BRANCHES = [
  { slug: "football", emoji: "⚽", name: "Futbol", color: "#22C55E" },
  { slug: "basketball-men", emoji: "🏀", name: "Basketbol (E)", color: "#F59E0B" },
  { slug: "basketball-women", emoji: "🏀", name: "Basketbol (K)", color: "#FB923C" },
  { slug: "volleyball-men", emoji: "🏐", name: "Voleybol (E)", color: "#3B82F6" },
  { slug: "volleyball-women", emoji: "🏐", name: "Voleybol (K)", color: "#8B5CF6" },
];

const LEAGUE_COLORS: Record<string, string> = {
  "Süper Lig": "#22C55E",
  "UEFA Champions League": "#0066CC",
  "UEFA Europa League": "#FF6600",
  "UEFA Europa Conference League": "#9900CC",
  "Türkiye Kupası": "#CC0000",
  "Basketball Super League": "#F59E0B",
  "Euroleague": "#0066CC",
  "Efeler Ligi": "#3B82F6",
  "Sultanlar Ligi": "#8B5CF6",
  "TKBL W": "#FB923C",
};

export const dynamic = 'force-dynamic';

const BRANCH_IDS = [
  "00000000-0000-0000-0001-000000000001",
  "00000000-0000-0000-0001-000000000002",
  "00000000-0000-0000-0001-000000000003",
  "00000000-0000-0000-0001-000000000004",
  "00000000-0000-0000-0001-000000000005",
];

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  match_datetime: string;
  status: string;
  venue: string | null;
  extra_data: {
    league_name?: string;
    home_logo?: string;
    away_logo?: string;
  };
}

function getStatusBadge(status: string, dateStr: string) {
  const now = new Date();
  const matchDate = new Date(dateStr);
  const isLive = status === "live" || status === "halftime";
  const isToday = matchDate.toDateString() === now.toDateString();
  const isFuture = matchDate > now;

  if (isLive) {
    return { text: status === "halftime" ? "DEVRE" : "CANLI", color: FB_COLORS.red, bg: "#FEE2E2" };
  }
  if (status === "finished") {
    return { text: "MS", color: "#6B7280", bg: "#F3F4F6" };
  }
  if (isToday && !isFuture) {
    return { text: "BUGÜN", color: FB_COLORS.green, bg: "#DCFCE7" };
  }
  if (isFuture && matchDate.getTime() - now.getTime() < 86400000 * 3) {
    return { text: "YAKLAŞAN", color: "#3B82F6", bg: "#DBEAFE" };
  }
  return { text: "", color: "", bg: "" };
}

function formatMatchTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function formatMatchDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) return "Bugün";
  if (date.toDateString() === tomorrow.toDateString()) return "Yarın";

  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function isFBTeam(teamName: string) {
  const lower = teamName.toLowerCase();
  return lower.includes("fenerbahçe") || lower.includes("fenerbahce") || lower === "fb";
}

export default async function HomePage() {
  let allMatches: Match[] = [];
  let liveMatches: Match[] = [];

  try {
    const supabase = createClient();
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data } = await supabase
      .from("fixtures")
      .select("*")
      .gte("match_datetime", now.toISOString())
      .lte("match_datetime", weekLater.toISOString())
      .in("branch_id", BRANCH_IDS)
      .order("match_datetime", { ascending: true })
      .limit(20);

    allMatches = (data || []) as unknown as Match[];
    liveMatches = allMatches.filter(m => m.status === "live" || m.status === "halftime");
  } catch (error) {
    console.error("Supabase error:", error);
  }

  const groupedByDate = allMatches.reduce((acc, match) => {
    const dateKey = new Date(match.match_datetime).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#002D72] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔵</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">FENERBAHÇE</h1>
              <p className="text-xs text-white/70">SPOR KULÜBÜ</p>
            </div>
          </div>
          <Link href="/settings" className="p-2 hover:bg-white/10 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Live Matches Banner */}
      {liveMatches.length > 0 && (
        <div className="bg-red-600 text-white px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="animate-pulse w-2 h-2 bg-white rounded-full" />
            <span className="font-bold text-sm">CANLI MAÇ{liveMatches.length > 1 ? "LAR" : ""}</span>
          </div>
        </div>
      )}

      {/* Branch Filter */}
      <div className="bg-white border-b px-4 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#002D72] text-white transition"
          >
            Tümü
          </Link>
          {BRANCHES.map((branch) => (
            <Link
              key={branch.slug}
              href={`/?branch=${branch.slug}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition"
              style={{
                backgroundColor: `${branch.color}15`,
                color: branch.color,
              }}
            >
              <span>{branch.emoji}</span>
              <span>{branch.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 py-4 space-y-6">
        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Canlı Maçlar</h2>
            <div className="space-y-2">
              {liveMatches.map((match) => {
                const badge = getStatusBadge(match.status, match.match_datetime);
                return (
                  <div key={match.id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </span>
                      <span className="text-xs text-gray-500">{match.extra_data.league_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold ${isFBTeam(match.home_team) ? "text-[#002D72]" : ""}`}>
                          {match.home_team}
                        </p>
                      </div>
                      <div className="px-4 text-center">
                        <span className="text-xl font-bold text-gray-800">
                          {match.home_score ?? 0} - {match.away_score ?? 0}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className={`font-semibold ${isFBTeam(match.away_team) ? "text-[#002D72]" : ""}`}>
                          {match.away_team}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Grouped by Date */}
        {Object.entries(groupedByDate).map(([dateKey, matches]) => {
          const date = new Date(dateKey);
          const now = new Date();
          const isToday = date.toDateString() === now.toDateString();

          return (
            <section key={dateKey}>
              <h2 className={`text-sm font-bold uppercase mb-3 ${isToday ? "text-[#002D72]" : "text-gray-500"}`}>
                {isToday ? "Bugün" : formatMatchDate(matches[0].match_datetime)}
              </h2>
              <div className="space-y-2">
                {matches.map((match) => {
                  const badge = getStatusBadge(match.status, match.match_datetime);
                  const leagueColor = LEAGUE_COLORS[match.extra_data.league_name || ""] || "#6B7280";

                  return (
                    <div
                      key={match.id}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${leagueColor}15`, color: leagueColor }}
                        >
                          {match.extra_data.league_name}
                        </span>
                        {badge.text && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {badge.text}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${isFBTeam(match.home_team) ? "text-[#002D72] font-bold" : "text-gray-800"}`}>
                            {match.home_team}
                          </p>
                        </div>
                        <div className="px-4 text-center">
                          {match.status === "finished" ? (
                            <span className="text-lg font-bold text-gray-800">
                              {match.home_score} - {match.away_score}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-gray-500">
                              {formatMatchTime(match.match_datetime)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <p className={`font-medium text-sm ${isFBTeam(match.away_team) ? "text-[#002D72] font-bold" : "text-gray-800"}`}>
                            {match.away_team}
                          </p>
                        </div>
                      </div>
                      {match.venue && (
                        <p className="text-xs text-gray-400 mt-2 text-center">{match.venue}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Empty State */}
        {allMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Yaklaşan maç yok</h3>
            <p className="text-sm text-gray-500">Verileri görmek için sync tetikleyin</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 text-[#002D72]">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs font-medium">Ana Sayfa</span>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-[#002D72] transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Takvim</span>
          </Link>
          <Link href="/standings" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-[#002D72] transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Puan</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-[#002D72] transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-xs">Bildirim</span>
          </Link>
        </div>
      </nav>

      {/* Bottom padding for nav */}
      <div className="h-20" />
    </div>
  );
}