import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const BRANCH_IDS = [
  "00000000-0000-0000-0001-000000000001",
  "00000000-0000-0000-0001-000000000002",
  "00000000-0000-0000-0001-000000000003",
  "00000000-0000-0000-0001-000000000004",
  "00000000-0000-0000-0001-000000000005",
];

const BRANCH_INFO: Record<string, { emoji: string; name: string; color: string }> = {
  "00000000-0000-0000-0001-000000000001": { emoji: "⚽", name: "Futbol", color: "#22C55E" },
  "00000000-0000-0000-0001-000000000002": { emoji: "🏀", name: "Basketbol (E)", color: "#F59E0B" },
  "00000000-0000-0000-0001-000000000003": { emoji: "🏀", name: "Basketbol (K)", color: "#FB923C" },
  "00000000-0000-0000-0001-000000000004": { emoji: "🏐", name: "Voleybol (E)", color: "#3B82F6" },
  "00000000-0000-0000-0001-000000000005": { emoji: "🏐", name: "Voleybol (K)", color: "#8B5CF6" },
};

interface Match {
  id: string;
  branch_id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  match_datetime: string;
  status: string;
  venue: string | null;
  extra_data: {
    league_name?: string;
  };
}

function isFBTeam(teamName: string) {
  const lower = teamName.toLowerCase();
  return lower.includes("fenerbahçe") || lower.includes("fenerbahce") || lower === "fb";
}

function formatDateHeader(date: Date) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) return { label: "Bugün", full: "Bugün, d MMMM" };
  if (date.toDateString() === tomorrow.toDateString()) return { label: "Yarın", full: "Yarın, d MMMM" };

  return {
    label: date.toLocaleDateString("tr-TR", { weekday: "short" }),
    full: date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" }),
  };
}

function getDaysInRange(start: Date, days: number) {
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    result.push(date);
  }
  return result;
}

export default async function CalendarPage() {
  const supabase = createClient();

  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 14);

  const { data } = await supabase
    .from("fixtures")
    .select("*")
    .gte("match_datetime", startDate.toISOString())
    .lte("match_datetime", endDate.toISOString())
    .in("branch_id", BRANCH_IDS)
    .order("match_datetime", { ascending: true });

  const matches = (data || []) as unknown as Match[];

  const days = getDaysInRange(startDate, 14);

  const groupedByDate = days.map(day => ({
    date: day,
    matches: matches.filter(m => new Date(m.match_datetime).toDateString() === day.toDateString()),
  })).filter(g => g.matches.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#002D72] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">Takvim</h1>
              <p className="text-xs text-white/70">14 Günlük Görünüm</p>
            </div>
          </div>
        </div>
      </header>

      {/* Date Scroll */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="flex px-4 py-2 min-w-max">
          {days.map((day, i) => {
            const isToday = day.toDateString() === now.toDateString();
            const hasMatch = matches.some(m => new Date(m.match_datetime).toDateString() === day.toDateString());

            return (
              <div
                key={i}
                className={`flex flex-col items-center px-3 py-2 rounded-lg mr-2 ${
                  isToday ? "bg-[#002D72] text-white" : ""
                }`}
              >
                <span className="text-xs text-gray-500">{day.toLocaleDateString("tr-TR", { weekday: "short" })}</span>
                <span className={`text-lg font-bold ${isToday ? "text-white" : ""}`}>
                  {day.getDate()}
                </span>
                {hasMatch && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isToday ? "bg-[#FFED00]" : "bg-[#002D72]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Matches by Date */}
      <div className="px-4 py-4">
        {groupedByDate.length > 0 ? (
          groupedByDate.map(({ date, matches: dayMatches }) => {
            const dateInfo = formatDateHeader(date);
            return (
              <div key={date.toISOString()} className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className={dateInfo.label === "Bugün" || dateInfo.label === "Yarın" ? "text-[#002D72]" : ""}>
                    {dateInfo.full}
                  </span>
                  {(dateInfo.label === "Bugün" || dateInfo.label === "Yarın") && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${dateInfo.label === "Bugün" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                      {dateInfo.label}
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {dayMatches.map((match) => {
                    const branchInfo = BRANCH_INFO[match.branch_id] || { emoji: "⚽", name: "Diğer", color: "#6B7280" };
                    const matchTime = new Date(match.match_datetime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div
                        key={match.id}
                        className="bg-white rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{branchInfo.emoji}</span>
                            <span className="text-xs text-gray-500">{branchInfo.name}</span>
                          </div>
                          {match.status === "finished" ? (
                            <span className="text-xs text-gray-500">MS</span>
                          ) : (
                            <span className="text-sm font-semibold text-[#002D72]">{matchTime}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isFBTeam(match.home_team) ? "text-[#002D72] font-bold" : "text-gray-800"}`}>
                              {match.home_team}
                            </p>
                          </div>
                          <div className="px-4 text-center">
                            {match.home_score !== null ? (
                              <span className="text-lg font-bold text-gray-800">
                                {match.home_score} - {match.away_score}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">vs</span>
                            )}
                          </div>
                          <div className="flex-1 text-right">
                            <p className={`text-sm font-medium ${isFBTeam(match.away_team) ? "text-[#002D72] font-bold" : "text-gray-800"}`}>
                              {match.away_team}
                            </p>
                          </div>
                        </div>
                        {match.extra_data.league_name && (
                          <p className="text-xs text-gray-400 mt-2 text-center">{match.extra_data.league_name}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Maç yok</h3>
            <p className="text-sm text-gray-500">14 gün içinde planlı maç bulunamadı</p>
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
          <Link href="/calendar" className="flex flex-col items-center gap-1 p-2 text-[#002D72]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Takvim</span>
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
    </div>
  );
}