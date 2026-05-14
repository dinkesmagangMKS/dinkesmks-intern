"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck2, FileEdit, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function InternBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/intern/dashboard", icon: Home },
    { name: "Absen", href: "/intern/absensi", icon: CalendarCheck2 },
    { name: "Logbook", href: "/intern/logbook", icon: FileEdit },
    { name: "Profil", href: "/intern/profil", icon: UserCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-slate-200 shadow-lg flex items-center justify-around px-2 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
              isActive ? "text-emerald-600 font-semibold" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}