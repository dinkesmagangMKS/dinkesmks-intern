"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Ambil data role pengguna dari localStorage
    const userRole = localStorage.getItem("user_role");

    // Validasi multi-role: Hanya ADMIN dan SUPER_ADMIN yang diizinkan masuk
    if (!userRole || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
      router.replace("/login"); // Menggunakan replace agar tidak terjebak saat menekan tombol back browser
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Loading Screen dengan Skeleton sewaktu proses pengecekan otorisasi rute dijalankan
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white p-8">
        <div className="space-y-4 w-full max-w-sm">
          {/* Mengubah nilai pecahan kustom menjadi arbitrary value piksel absolut bawaan Tailwind */}
          <Skeleton className="h-8 w-[250px] bg-zinc-100" />
          <Skeleton className="h-4 w-[300px] bg-zinc-100" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        {/* Panel Sidebar Administrator / Super Admin */}
        <AdminSidebar />
        
        {/* Container Utama Sebelah Kanan */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* Bagian Topbar / Header Utama Admin */}
          <AdminHeader />
          
          {/* Konten Dinamis Halaman (Children) */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}