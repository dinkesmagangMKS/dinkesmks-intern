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
    const userRole = localStorage.getItem("user_role");
    if (!userRole || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white p-8">
        <div className="space-y-4 w-full max-w-sm">
          <Skeleton className="h-8 w-[250px] bg-zinc-100" />
          <Skeleton className="h-4 w-[300px] bg-zinc-100" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="w-full min-h-screen">
      <div className="flex min-h-screen w-full bg-white">
        {/* Panel Sidebar Administrator / Super Admin */}
        <AdminSidebar />
        
        {/* Container Utama Sebelah Kanan */}
        <div className="flex flex-1 flex-col min-w-0 w-full">
          
          {/* PERBAIKAN: Langsung panggil <AdminHeader /> tanpa dibungkus div 'h-14'. 
            <AdminHeader /> sudah mengantongi class w-full, h-16, bg-white, dan border-b sendiri.
          */}
          <AdminHeader />
          
          {/* Konten Dinamis Halaman (Children) */}
          <main className="flex-1 w-full min-w-0 px-1 py-4 sm:p-6 overflow-x-hidden overflow-y-auto bg-slate-50/40">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}