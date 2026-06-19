"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  CalendarCheck2,
  FileEdit,
  UserCircle,
  LogOut,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";

// Import komponen dasar shadcn dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function InternSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/intern/dashboard", icon: Home },
    { name: "Presensi Harian", href: "/intern/attendance", icon: CalendarCheck2 },
    { name: "Isi Logbook", href: "/intern/logbook", icon: FileEdit },
    { name: "Profil Saya", href: "/intern/profile", icon: UserCircle },
  ];

  async function handleLogout() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json();
      if (!response.ok) { setError(data.error); return; }
      localStorage.removeItem("user_role");
      router.push("/login");
    } catch {
      setError("Terjadi kesalahan. Periksa koneksi internetmu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Sidebar className="border-r border-[#5a8a2d]/20 bg-white text-slate-800">
        <SidebarHeader className="h-16 px-4 border-b border-[#5a8a2d]/20 flex flex-row items-center gap-3 shrink-0">
          <div className="p-2 bg-[#2d5a1b] text-white rounded-lg shrink-0">
            <span className="font-bold text-sm tracking-tight text-[#2d5a1b] truncate">
              <GraduationCap className="h-5 w-5 text-white" />
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-[#2d5a1b] truncate">
              Sistem Absensi Magang
            </span>
            <span className="text-[10px] text-[#5a8a2d] font-medium uppercase tracking-wider">
              Dinkes Makassar
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-3">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[10px] font-bold text-[#5a8a2d] uppercase tracking-wider mb-2">
              Aktivitas Magang
            </SidebarGroupLabel>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenMobile(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                      isActive
                        ? "bg-[#8db83a]/15 text-[#2d5a1b] shadow-sm"
                        : "text-slate-600 hover:bg-[#8db83a]/10 hover:text-[#2d5a1b]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-[#5a8a2d]"
                          : "text-slate-400 group-hover:text-[#5a8a2d]"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </SidebarGroup>
        </SidebarContent>

        {/* SIDEBAR FOOTER — Tombol Pemicu Konfirmasi */}
        <SidebarFooter className="p-3 border-t border-[#5a8a2d]/10">
          <button
            type="button"
            onClick={() => {
              setOpenMobile(false); // Menutup otomatis laci sidebar mobile di latar belakang
              setShowLogoutModal(true);
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 transition-all hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 text-red-500" />
            Keluar
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* MODAL SHADCN DIALOG LOGOUT (STRUKTUR IDENTIK DENGAN CLOCK OUT) */}
      <Dialog
        open={showLogoutModal}
        onOpenChange={(open) => {
          setShowLogoutModal(open);
          if (!open) setError("");
        }}
      >
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2d5a1b]/10">
                <LogOut className="h-3.5 w-3.5 text-[#2d5a1b]" />
              </div>
              Keluar dari Akun?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Anda akan keluar dari sesi ini. Pastikan semua aktivitas hari ini sudah disimpan dengan benar ya.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs border-zinc-200 cursor-pointer"
              onClick={() => setShowLogoutModal(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white font-medium cursor-pointer"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "Proses..." : "Ya, Keluar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}