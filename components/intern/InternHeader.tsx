"use client";

import { Bell, User, LogOut, Award } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function InternHeader() {
  return (
    <header className="w-full h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
      {/* KIRI: Trigger & Penanda Status Mahasiswa */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-9 w-9 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" />
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800">Portal Mahasiswa Magang</span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-0.5 w-max">
            Universitas Hasanuddin
          </span>
        </div>
      </div>

      {/* KANAN: Notifikasi Pesan Verifikasi & Profil */}
      <div className="flex items-center gap-4">
        {/* Tombol Notifikasi feedback dari Admin Dinkes */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          onClick={() => toast.success("Logbook kemarin telah disetujui Admin!")}
        >
          <Bell className="h-4 w-4" />
        </Button>

        <div className="h-5 w-[1px] bg-slate-200" />

        {/* Identitas Ringkas Mahasiswa */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">Andi M. Iqbal</span>
            <span className="text-[10px] font-medium text-slate-400">Informatics Eng.</span>
          </div>
          
          <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            AI
          </div>
        </div>
      </div>
    </header>
  );
}