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

        {/* SIDEBAR FOOTER — Menambahkan tombol pemicu modal logout */}
        <SidebarFooter className="p-3 border-t border-[#5a8a2d]/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 transition-all hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 shrink-0 text-red-500" />
            Keluar 
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm p-4 md:items-center">
          <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl border border-zinc-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2d5a1b]/10">
                <LogOut className="h-3.5 w-3.5 text-[#2d5a1b]" />
              </div>
              Keluar dari Akun?
            </div>

            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Anda akan keluar dari sesi ini. Pastikan semua pekerjaan sudah
              tersimpan sebelum melanjutkan.
            </p>

            {error && (
              <p className="mt-3 text-xs text-red-500">{error}</p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setShowLogoutModal(false); setError(""); }}
                disabled={loading}
                className="flex-1 h-8 text-xs rounded-lg border border-zinc-200 font-medium text-slate-700 transition hover:bg-zinc-50 disabled:opacity-50 outline-none"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 h-8 text-xs rounded-lg bg-[#2d5a1b] font-medium text-white transition hover:bg-[#204013] disabled:opacity-50 outline-none shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
              >
                {loading ? "Memproses..." : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}