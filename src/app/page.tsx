import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
  red: "#E3001E",
};

const BRANCHES = [
  {
    slug: "football",
    name: "Football",
    emoji: "⚽",
    color: "#22C55E",
    apiLeagueId: 197,
    teamId: 611,
  },
  {
    slug: "basketball",
    name: "Basketball",
    emoji: "🏀",
    color: "#F59E0B",
    apiLeagueId: 118,
    teamId: 1270,
  },
  {
    slug: "volleyball",
    name: "Volleyball",
    emoji: "🏐",
    color: "#3B82F6",
    apiLeagueId: 119,
    teamId: 1271,
  },
];

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const tBranches = await getTranslations("branches");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1
          className="mb-4 text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-outfit)", color: FB_COLORS.navy }}
        >
          {tCommon("appName")} <span style={{ color: FB_COLORS.yellow }}>Guru</span>
        </h1>
        <p className="text-lg text-gray-600">{tCommon("tagline")}</p>
      </section>

      {/* Branch Cards */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold" style={{ color: FB_COLORS.navy }}>
          {t("todayMatches")}
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {BRANCHES.map((branch) => (
            <Link key={branch.slug} href={`/${branch.slug}`}>
              <Card
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ borderTop: `4px solid ${branch.color}` }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold" style={{ color: FB_COLORS.navy }}>
                      {branch.emoji} {tBranches(branch.slug)}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="font-medium"
                      style={{ backgroundColor: `${branch.color}20`, color: branch.color }}
                    >
                      {branch.slug === "football" ? "Süper Lig" : branch.slug === "basketball" ? "BSL" : "VSL"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Next Match</p>
                      <p className="font-medium">Loading...</p>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-8 w-16 mb-1" />
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Matches Section */}
      <section>
        <h2 className="mb-6 text-2xl font-bold" style={{ color: FB_COLORS.navy }}>
          {t("upcoming")}
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12 text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📅</div>
                <p>{t("noMatches")}</p>
                <p className="text-sm mt-1">API-Sports verileri yakında burada görünecek</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Live Matches Banner */}
      <section className="mt-8">
        <Card
          className="border-2"
          style={{ borderColor: FB_COLORS.red, backgroundColor: `${FB_COLORS.red}05` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <div
                className="h-3 w-3 rounded-full animate-pulse"
                style={{ backgroundColor: FB_COLORS.red }}
              />
              <span className="font-bold" style={{ color: FB_COLORS.red }}>
                {t("live")} — Turkish Super Lig
              </span>
              <div
                className="h-3 w-3 rounded-full animate-pulse"
                style={{ backgroundColor: FB_COLORS.red }}
              />
            </div>
            <p className="text-center text-gray-600 mt-2">
              Canlı skorlar için API-Sports entegrasyonu aktif ediliyor...
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
