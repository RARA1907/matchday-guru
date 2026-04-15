import Link from "next/link";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
};

export function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: `${FB_COLORS.navy}20` }}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: FB_COLORS.navy }}>
              RARA PROJECTS
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-500">matchday.guru</span>
          </div>

          {/* Center */}
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </nav>

          {/* Right */}
          <div className="text-sm text-gray-500">
            www.raraprojects.com
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t text-center text-xs text-gray-400">
          <p>
            Bu uygulama resmi Fenerbahçe SK ile bağlantılı değildir. Taraftar uygulamasıdır.
          </p>
          <p className="mt-1">
            This app is not affiliated with Fenerbahçe SK. Fan-made application.
          </p>
        </div>
      </div>
    </footer>
  );
}
