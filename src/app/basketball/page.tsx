import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
  orange: "#F59E0B",
};

export default async function BasketballPage() {
  const tBranches = await getTranslations("branches");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">🏀</span>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-outfit)", color: FB_COLORS.navy }}
            >
              {tBranches("basketball")}
            </h1>
            <p className="text-gray-600">Basketball Super League (BSL)</p>
          </div>
        </div>
        <Badge
          style={{ backgroundColor: `${FB_COLORS.orange}20`, color: FB_COLORS.orange }}
          className="font-medium"
        >
          BSL 2025-2026
        </Badge>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: FB_COLORS.navy }}>14</p>
            <p className="text-sm text-gray-500">Maç</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: FB_COLORS.green }}>11</p>
            <p className="text-sm text-gray-500">Galibiyet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: FB_COLORS.yellow }}>2</p>
            <p className="text-sm text-gray-500">Mağlubiyet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: FB_COLORS.navy }}>2nd</p>
            <p className="text-sm text-gray-500">Sıra</p>
          </CardContent>
        </Card>
      </section>

      {/* Info Card */}
      <section>
        <Card style={{ borderTop: `4px solid ${FB_COLORS.orange}` }}>
          <CardHeader>
            <CardTitle style={{ color: FB_COLORS.navy }}>Basketbol Hakkında</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Fenerbahçe Beko, Türkiye'nin en başarılı basketbol takımlarından biri.
              EuroLeague ve Basketball Super League (BSL) olmak üzere iki cepheyle mücadele ediyor.
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
