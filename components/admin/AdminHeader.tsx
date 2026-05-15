"use client";

import { Bell, ChevronDown, User, ShieldAlert, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminHeader() {
  // Mengambil tanggal hari ini dengan format Indonesia
  const formattedDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="w-full h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
      {/* KIRI: Trigger & Breadcrumb Informasi Lokasi */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-9 w-9 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" />
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Dinas Kesehatan Kota Makassar</span>
          <span className="text-xs text-slate-500 font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* KANAN: Notifikasi & Profil Dropdown Akses */}
      <div className="flex items-center gap-4">
        {/* Tombol Notifikasi Pengajuan Logbook Masuk */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          onClick={() => toast.info("Tidak ada pengajuan logbook tertunda.")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
        </Button>

        <div className="h-5 w-[1px] bg-slate-200" />

        {/* Info Profil Ringkas */}
        <div className="flex items-center gap-3 pl-1">
          <div className="flex flex-col text-right hidden md:flex">
            <span className="text-xs font-semibold text-slate-800">Suryadi, S.Kom</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase">Super Admin</span>
          </div>
          
          {/* Avatar Ringkas */}
          <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            S
          </div>
        </div>
      </div>
    </header>
  );
}