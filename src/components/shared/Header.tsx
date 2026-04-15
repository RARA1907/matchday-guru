"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const FB_COLORS = {
  navy: "#002D72",
  yellow: "#FFED00",
};

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: t("dashboard") },
    { href: "/football", label: t("football") },
    { href: "/basketball", label: t("basketball") },
    { href: "/volleyball", label: t("volleyball") },
    { href: "/calendar", label: t("calendar") },
  ];

  const switchLocale = locale === "en" ? "tr" : "en";
  const newLocalePath = pathname.replace(`/${locale}`, `/${switchLocale}`);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ borderColor: FB_COLORS.navy, backgroundColor: FB_COLORS.navy }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded"
              style={{ backgroundColor: FB_COLORS.yellow }}
            >
              <span className="text-lg font-bold" style={{ color: FB_COLORS.navy }}>
                M
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">MatchDay</span>
              <span className="text-xs text-white/70">Guru</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname === `/${locale}${item.href}`;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium rounded transition-colors"
                  style={{
                    backgroundColor: isActive ? FB_COLORS.yellow : "transparent",
                    color: isActive ? FB_COLORS.navy : "white",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <Link
              href={newLocalePath}
              className="px-3 py-1.5 text-sm font-medium rounded border text-white border-white/30 hover:bg-white/10 transition-colors"
            >
              {switchLocale.toUpperCase()}
            </Link>

            {/* Subscribe CTA */}
            <Link
              href="/subscribe"
              className="hidden sm:flex px-4 py-2 text-sm font-bold rounded transition-colors"
              style={{ backgroundColor: FB_COLORS.yellow, color: FB_COLORS.navy }}
            >
              {t("subscribe")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
