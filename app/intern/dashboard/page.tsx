"use client";

import React from "react";

export default function InternDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Bagian Top Informasi / Judul */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
          Overview Magang
        </h1>
        <p className="text-sm text-slate-500">
          Kelola presensi, logbook harian, dan pantau perkembangan magang Anda di sini.
        </p>
      </div>

      {/* Placeholder Konten Utama */}
      <div className="grid grid-cols-1 gap-6">
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            🎓
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Panel Konten Mahasiswa Magang
          </span>
          <span className="text-xs text-slate-400 max-w-sm mt-1">
            Halaman ini otomatis terikat dengan InternSidebar (hijau) dan InternHeader melalui file layout.
          </span>
        </div>
      </div>
    </div>
  );
}