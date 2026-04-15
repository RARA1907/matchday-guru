import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
  green: "#22C55E",
  blue: "#3B82F6",
  orange: "#F59E0B",
};

const BRANCH_COLORS: Record<string, string> = {
  football: "#22C55E",
  basketball: "#F59E0B",
  volleyball: "#3B82F6",
};

export default async function CalendarPage() {
  const t = await getTranslations("dashboard");

  // Sample calendar data
  const matches = [
    { date: "20 Apr", time: "20:00", home: "Fenerbahçe", away: "Galatasaray", branch: "football", venue: "Şanlıurfa" },
    { date: "22 Apr", time: "19:00", home: "Fenerbahçe", away: "Anadolu Efes", branch: "basketball", venue: "Ülker Arena" },
    { date: "25 Apr", time: "18:00", home: "Fenerbahçe", away: "Arkasspor", branch: "volleyball", venue: "Burhan Felek" },
    { date: "27 Apr", time: "20:30", home: "Samsunspor", away: "Fenerbahçe", branch: "football", venue: "Samsun" },
    { date: "01 May", time: "19:00", home: "Fenerbahçe", away: "Banvit", branch: "basketball", venue: "Ülker Arena" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-outfit)", color: FB_COLORS.navy }}
        >
          📅 {t("next7Days")}
        </h1>
        <p className="text-gray-600">Tüm branşlardan yaklaşan maçlar</p>
      </section>

      {/* Branch Filter Legend */}
      <section className="mb-6 flex flex-wrap gap-3">
        {Object.entries(BRANCH_COLORS).map(([branch, color]) => (
          <Badge
            key={branch}
            style={{ backgroundColor: `${color}20`, color }}
            className="capitalize"
          >
            {branch}
          </Badge>
        ))}
      </section>

      {/* Calendar List */}
      <section className="space-y-4">
        {matches.map((match, i) => (
          <Card
            key={i}
            className="transition-all hover:shadow-md"
            style={{ borderLeft: `4px solid ${BRANCH_COLORS[match.branch] || FB_COLORS.navy}` }}
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Date/Time */}
                <div className="text-center md:text-left">
                  <p className="text-lg font-bold" style={{ color: FB_COLORS.navy }}>
                    {match.date}
                  </p>
                  <p className="text-sm text-gray-500">{match.time}</p>
                </div>

                {/* Teams */}
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-medium">{match.home}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="font-medium">{match.away}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{match.venue}</p>
                </div>

                {/* Branch Badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: `${BRANCH_COLORS[match.branch]}20`,
                      color: BRANCH_COLORS[match.branch],
                    }}
                    className="capitalize"
                  >
                    {match.branch === "football" && "⚽ "}
                    {match.branch === "basketball" && "🏀 "}
                    {match.branch === "volleyball" && "🏐 "}
                    {match.branch}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Empty State Info */}
      <section className="mt-8 text-center text-gray-400">
        <p>Canlı takvim için API-Sports entegrasyonu yakında aktif olacak</p>
      </section>
    </div>
  );
}
