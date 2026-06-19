"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { InternSidebar } from "@/components/intern/InternSidebar";
import { InternHeader } from "@/components/intern/InternHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

export default function InternLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Mengambil role pengguna dari localStorage
    const userRole = localStorage.getItem("user_role");

    // Jika role tidak ditemukan atau bukan INTERN, arahkan kembali ke halaman login
    if (!userRole || userRole !== "INTERN") {
      router.replace("/login"); // Menggunakan replace agar rute tidak masuk ke history tombol 'back'
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Tampilan loading skeleton saat melakukan verifikasi otorisasi di sisi klien
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-8">
        <div className="space-y-4 w-full max-w-sm">
          {/* Menggunakan arbitrary values standar Tailwind [px] agar komponen merender sempurna */}
          <Skeleton className="h-8 w-[200px] bg-slate-200" />
          <Skeleton className="h-4 w-[250px] bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50">
        {/* Sidebar Navigasi Utama Intern */}
        <InternSidebar />

        {/* Area Konten Kanan */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* Topbar / Header Intern */}
          <InternHeader />

          {/* Konten Halaman yang Dapat Di-scroll */}
          <main className="flex-1 p-6 overflow-y-auto pb-16 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Komponen Toaster Global untuk alert / feedback */}
      <Toaster position="top-center" richColors />
    </SidebarProvider>
  );
}