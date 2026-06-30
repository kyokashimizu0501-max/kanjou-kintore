"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/record", label: "記録", icon: "✏️" },
  { href: "/history", label: "履歴", icon: "📋" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // 記録フロー中はボトムナビを非表示
  if (pathname === "/record") return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-200 flex safe-area-pb">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
              active ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className={active ? "font-semibold" : ""}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
