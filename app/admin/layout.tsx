"use client";

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
    // Ganti dengan logic aslimu nanti (misal: dari NextAuth atau localStorage)
    const userRole = localStorage.getItem("user_role") || "ADMIN"; // Mocking default ke ADMIN untuk dev

    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      // Redirect paksa ke halaman login jika bukan Admin
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Loading screen tipis-tipis saat memverifikasi role beneran
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 p-8">
        <div className="space-y-4 w-full max-w-sm">
          <Skeleton className="h-8 w-62.5 bg-slate-200" />
          <Skeleton className="h-4 w-75 bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-100">
        <AdminSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}