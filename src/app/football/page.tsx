import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
  green: "#22C55E",
};

export default async function FootballPage() {
  const t = await getTranslations("dashboard");
  const tBranches = await getTranslations("branches");

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
          Süper Lig 2025-2026
        </Badge>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: FB_COLORS.navy }}>17</p>
            <p className="text-sm text-gray-500">Maç</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: FB_COLORS.green }}>10</p>
            <p className="text-sm text-gray-500">Galibiyet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: FB_COLORS.yellow }}>4</p>
            <p className="text-sm text-gray-500">Beraberlik</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: "#EF4444" }}>3</p>
            <p className="text-sm text-gray-500">Mağlubiyet</p>
          </CardContent>
        </Card>
      </section>

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
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 font-bold">1</td>
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <span>🔵</span> Fenerbahçe
                    </td>
                    <td className="px-4 py-3 text-center">17</td>
                    <td className="px-4 py-3 text-center">10</td>
                    <td className="px-4 py-3 text-center">4</td>
                    <td className="px-4 py-3 text-center">3</td>
                    <td className="px-4 py-3 text-center">32-15</td>
                    <td className="px-4 py-3 text-center font-bold" style={{ color: FB_COLORS.navy }}>34</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">2</td>
                    <td className="px-4 py-3">Galatasaray</td>
                    <td className="px-4 py-3 text-center">16</td>
                    <td className="px-4 py-3 text-center">9</td>
                    <td className="px-4 py-3 text-center">5</td>
                    <td className="px-4 py-3 text-center">2</td>
                    <td className="px-4 py-3 text-center">28-12</td>
                    <td className="px-4 py-3 text-center">32</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">3</td>
                    <td className="px-4 py-3">Beşiktaş</td>
                    <td className="px-4 py-3 text-center">16</td>
                    <td className="px-4 py-3 text-center">8</td>
                    <td className="px-4 py-3 text-center">4</td>
                    <td className="px-4 py-3 text-center">4</td>
                    <td className="px-4 py-3 text-center">25-18</td>
                    <td className="px-4 py-3 text-center">28</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Upcoming Matches */}
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: FB_COLORS.navy }}>
          Yaklaşan Maçlar
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🔵</span>
                  <div>
                    <p className="font-medium">Fenerbahçe</p>
                    <p className="text-sm text-gray-500">vs</p>
                  </div>
                  <div>
                    <p className="font-medium">Galatasaray</p>
                    <p className="text-sm text-gray-500">Reklam</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: FB_COLORS.navy }}>20:00</p>
                  <p className="text-sm text-gray-500">20 Nisan 2026</p>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 mt-6">
              Canlı veriler için API-Sports entegrasyonu yakında aktif olacak
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
