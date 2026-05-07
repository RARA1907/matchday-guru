import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#002D72] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">Ayarlar</h1>
              <p className="text-xs text-white/70">Fenerbahçe SK</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="space-y-4">
          {/* Language */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <p className="font-medium text-gray-800">Dil</p>
                  <p className="text-xs text-gray-500">Türkçe / English</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Türkçe</span>
            </div>
          </div>

          {/* Notifications */}
          <Link href="/notifications" className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-medium text-gray-800">Bildirim Tercihleri</p>
                  <p className="text-xs text-gray-500">Maç hatırlatmaları ve canlı skor</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* About */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="font-medium text-gray-800">Hakkında</p>
                  <p className="text-xs text-gray-500">MatchDay Club v1.0</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">Beta</span>
            </div>
          </div>

          {/* Data Source */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📡</span>
                <div>
                  <p className="font-medium text-gray-800">Veri Kaynağı</p>
                  <p className="text-xs text-gray-500">API-Sports (Free Tier)</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">2024-25</span>
            </div>
          </div>

          {/* Sync Button */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-medium text-gray-800">Veri Senkronizasyonu</p>
                  <p className="text-xs text-gray-500">Son güncelleme: -</p>
                </div>
              </div>
              <button className="text-xs px-3 py-1.5 bg-[#002D72] text-white rounded-lg hover:bg-[#003d8f] transition">
                Sync
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🔵</span>
              <span className="font-bold text-[#002D72]">FENERBAHÇE</span>
            </div>
            <p className="text-xs text-gray-400">© 2026 MatchDay Club</p>
            <p className="text-xs text-gray-400 mt-1">Tüm hakları Fenerbahçe Spor Kulübü&apos;ne aittir.</p>
          </div>
        </div>
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