"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export function AdminHeader() {
  const [user, setUser] = useState<any>(null);

  const formattedDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-[#5a8a2d]/20 bg-white flex items-center justify-between px-4 shrink-0 shadow-sm">
      {/* KIRI */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 border border-[#5a8a2d]/30 bg-white text-[#2d5a1b] hover:bg-[#8db83a]/10" />
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-[#2d5a1b] uppercase tracking-wider">
            Dinas Kesehatan Kota Makassar
          </span>
          <span className="text-sm text-slate-500 font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* KANAN */}
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-800">
            {user?.name ?? "Memuat..."}
          </span>
          <span className="text-[10px] font-medium text-[#5a8a2d] uppercase">
            {roleLabel[user?.role] ?? ""}
            {user?.division?.name ? ` · ${user.division.name}` : ""}
          </span>
        </div>
        <div className="h-8 w-8 rounded-full bg-[#2d5a1b] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}