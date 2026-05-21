"use client";

import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AdminProfile {
  full_name: string;
  role: string;
}

export function AdminHeader() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const formattedDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    }
    getProfile();
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : "A";

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
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full text-slate-500 hover:bg-[#8db83a]/10 hover:text-[#2d5a1b]"
          onClick={() => toast.info("Tidak ada pengajuan logbook tertunda.")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
        </Button>

        <div className="h-5 w-[1px] bg-[#5a8a2d]/20" />

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800">
              {profile?.full_name ?? "Memuat..."}
            </span>
            <span className="text-[10px] font-medium text-[#5a8a2d] uppercase">
              {profile?.role ?? ""}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#2d5a1b] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}