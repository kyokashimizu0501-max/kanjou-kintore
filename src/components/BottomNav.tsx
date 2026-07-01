"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/record", label: "記録", icon: PenLine },
  { href: "/history", label: "履歴", icon: History },
  { href: "/settings", label: "設定", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  // 記録フロー・オンボーディング中はボトムナビを非表示
  if (pathname === "/record" || pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50">
      <div className="bg-white/95 backdrop-blur-xl border-t border-[#e8e4dc]/60 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200",
                  active
                    ? "bg-gradient-to-b from-[#c9a882]/20 to-[#c9a882]/10"
                    : "hover:bg-[#c9a882]/5 active:scale-95",
                )}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    active
                      ? "text-[#c07850] stroke-[2.5px]"
                      : "text-[#8c857a] stroke-[1.5px]",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium transition-colors duration-200",
                    active ? "text-[#c07850]" : "text-[#8c857a]",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
