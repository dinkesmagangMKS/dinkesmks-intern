"use client"

import { Skeleton } from "@/components/ui/skeleton"

// 1. VARIASI CARD
export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between min-w-[240px]">
      <div className="space-y-3 w-full">
        {/* Sub-judul kecil */}
        <Skeleton className="h-3 w-[60%] bg-slate-200/80" />
        {/* Angka statistik utama */}
        <Skeleton className="h-7 w-[40%] bg-slate-200/80" />
      </div>
      {/* Wadah ikon melingkar di sebelah kanan */}
      <Skeleton className="h-10 w-10 rounded-full bg-slate-200/80 shrink-0" />
    </div>
  )
}

// 2. VARIASI ROW/LIST
export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm w-full">
      <div className="flex items-center gap-3 w-full">
        {/* Avatar lingkaran/Foto upload placeholder */}
        <Skeleton className="h-10 w-10 rounded-full bg-slate-200/80 shrink-0" />
        
        <div className="space-y-2 w-full max-w-md">
          {/* Nama mahasiswa / Judul logbook */}
          <Skeleton className="h-4 w-[70%] bg-slate-200/80" />
          {/* Instansi / Deskripsi singkat */}
          <Skeleton className="h-3 w-[45%] bg-slate-200/80" />
        </div>
      </div>

      {/* StatusBadge placeholder di ujung kanan */}
      <Skeleton className="h-6 w-16 rounded-full bg-slate-200/80 shrink-0" />
    </div>
  )
}