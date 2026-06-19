"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function InternHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Ditambahkan cache: "no-store" agar data selalu fresh setelah update profile via PATCH
    fetch("/api/profile", { cache: "no-store" })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => {})
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "IN";

  const formattedDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-[#2d5a1b]/20 bg-[#2d5a1b] flex items-center justify-between px-4 shrink-0 shadow-sm">
      {/* KIRI */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 border border-white/20 bg-white/10 text-white hover:bg-white/20" />
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-white">
            Portal Mahasiswa Magang
          </span>
          <span className="text-xs text-white/70 font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* KANAN */}
      <div className="flex items-center gap-3">
        <div className="h-5 w-px bg-white/20" />
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-white truncate max-w-30">
              {user?.name ?? "Memuat..."}
            </span>
            <span className="text-[10px] font-medium text-white/60">
              {user?.profile?.major ?? ""}
            </span>
          </div>

          {/* FOTO PROFIL INTERN */}
          <Avatar className="h-8 w-8 border border-white/20 shadow-sm">
            <AvatarImage 
              src={user?.profile?.photo_url ?? user?.image} 
              alt={user?.name ?? "Intern Profile"} 
              className="object-cover"
            />
            <AvatarFallback className="bg-white/20 text-white font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}