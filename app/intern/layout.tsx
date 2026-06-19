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
    const userRole = localStorage.getItem("user_role");
    if (!userRole || userRole !== "INTERN") {
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-8">
        <div className="space-y-4 w-full max-w-sm">
          <Skeleton className="h-8 w-[200px] bg-slate-200" />
          <Skeleton className="h-4 w-[250px] bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="w-full min-h-screen">
      <div className="flex min-h-screen w-full bg-slate-50">
        {/* Sidebar Navigasi Utama Intern */}
        <InternSidebar />

        {/* Area Konten Kanan */}
        <div className="flex flex-1 flex-col min-w-0 w-full">
          
          {/* PERBAIKAN: Langsung panggil <InternHeader /> tanpa dibungkus div 'h-14'. 
            <InternHeader /> sudah mengantongi class w-full, h-16, bg-[#2d5a1b], dan border-b sendiri.
          */}
          <InternHeader />

          {/* Konten Halaman yang Dapat Di-scroll */}
          <main className="flex-1 w-full min-w-0 px-1 py-4 sm:p-6 overflow-x-hidden overflow-y-auto pb-16 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Komponen Toaster Global untuk alert / feedback */}
      <Toaster position="top-center" richColors />
    </SidebarProvider>
  );
}