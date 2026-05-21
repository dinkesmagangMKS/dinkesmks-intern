"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { InternSidebar } from "@/components/intern/InternSidebar";
import { InternHeader } from "@/components/intern/InternHeader";
import { InternBottomNav } from "@/components/intern/InternBottomNav";
import { Skeleton } from "@/components/ui/skeleton";

export default function InternLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("user_role") || "INTERN";

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
          <Skeleton className="h-8 w-50 bg-slate-200" />
          <Skeleton className="h-4 w-62.5 bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50">
        <InternSidebar />

        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <InternHeader />

          <main className="flex-1 p-6 overflow-y-auto pb-16 md:pb-6">
            {children}
          </main>
        </div>

        <InternBottomNav />
      </div>
    </SidebarProvider>
  );
}