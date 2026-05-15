"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { InternSidebar } from "@/components/intern/InternSidebar";
import { InternHeader } from "@/components/intern/InternHeader";
import { InternBottomNav } from "@/components/intern/InternBottomNav"; // Panggil komponen bottom nav mobile
import { Skeleton } from "@/components/ui/skeleton";

export default function InternLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 🔒 PROTEKSI ROUTE: Hanya boleh diakses oleh INTERN
    const userRole = localStorage.getItem("user_role") || "INTERN"; // Mocking default ke INTERN untuk dev

    if (userRole !== "INTERN") {
      router.push("/login");
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 pb-16 md:pb-0">
        {/* 1. Navigasi Samping: Otomatis disembunyikan shadcn di layar mobile, aktif di desktop */}
        <InternSidebar />
        
        <div className="flex flex-1 flex-col min-w-0">
          {/* 2. Top Header */}
          <InternHeader />
          
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* 3. Navigasi Bawah: Khusus layar Mobile (md:hidden otomatis dikelola di dalam komponennya) */}
        <InternBottomNav />
      </div>
    </SidebarProvider>
  );
}