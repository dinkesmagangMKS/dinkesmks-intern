"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface InternProfile {
  full_name: string;
  major: string;
}

export function InternHeader() {
  const [profile, setProfile] = useState<InternProfile | null>(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("interns")
        .select("full_name, major")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    }
    getProfile();
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
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
        <div className="h-5 w-[1px] bg-white/20" />
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-white truncate max-w-[120px]">
              {profile?.full_name ?? "Memuat..."}
            </span>
            <span className="text-[10px] font-medium text-white/60">
              {profile?.major ?? ""}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}