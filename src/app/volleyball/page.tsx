import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
  blue: "#3B82F6",
  green: "#22C55E",
};

export default async function VolleyballPage() {
  const tBranches = await getTranslations("branches");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">🏐</span>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-outfit)", color: FB_COLORS.navy }}
            >
              {tBranches("volleyball")}
            </h1>
            <p className="text-gray-600">Sultanlar Ligi & Erkekler Voleybol Ligi</p>
          </div>
        </div>
        <Badge
          style={{ backgroundColor: `${FB_COLORS.blue}20`, color: FB_COLORS.blue }}
          className="font-medium"
        >
          2025-2026 Sezonu
        </Badge>
      </section>

      {/* Tabs for Men/Women */}
      <section className="mb-8">
        <Card style={{ borderTop: `4px solid ${FB_COLORS.blue}` }}>
          <CardHeader>
            <CardTitle style={{ color: FB_COLORS.navy }}>🏐 Erkekler Voleybol</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Fenerbahçe HDI Sigorta, erkekler voleybolunda Türkiye'nin en güçlü takımlarından biri.
              Vestelmen's Volleyball League'de mücadele ediyor.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold" style={{ color: FB_COLORS.navy }}>8</p>
                <p className="text-sm text-gray-500">Maç</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold" style={{ color: FB_COLORS.green }}>6</p>
                <p className="text-sm text-gray-500">Galibiyet</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold" style={{ color: FB_COLORS.blue }}>4th</p>
                <p className="text-sm text-gray-500">Sıra</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card style={{ borderTop: `4px solid ${FB_COLORS.yellow}` }}>
          <CardHeader>
            <CardTitle style={{ color: FB_COLORS.navy }}>👩 Kadınlar Voleybol (Sultanlar Ligi)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Fenerbahçe Opet, kadınlar voleybolunda Avrupa'nın en güçlü takımlarından biri.
              Sultanlar Ligi'nde şampiyonluk mücadelesi veriyor.
            </p>
            <p className="text-center text-gray-400">
              Canlı veriler için API-Sports entegrasyonu yakında aktif olacak
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
