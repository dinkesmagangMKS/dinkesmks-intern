"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  CalendarCheck2, 
  FileEdit, 
  UserCircle,
  LogOut,
  GraduationCap
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

export function InternSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // Sesuai request: dashboard, absen, logbook, dan profil
  const menuItems = [
    { name: "Dashboard", href: "/intern/dashboard", icon: Home },
    { name: "Presensi Harian", href: "/intern/absensi", icon: CalendarCheck2 },
    { name: "Isi Logbook", href: "/intern/logbook", icon: FileEdit },
    { name: "Profil Saya", href: "/intern/profil", icon: UserCircle },
  ];

  return (
    <Sidebar className="border-r border-slate-200 bg-white text-slate-800">
      <SidebarHeader className="p-4 border-b border-slate-100 flex flex-row items-center gap-3">
        <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm tracking-tight text-slate-900 truncate">Internship System</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Unhas Student</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
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
                      ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="text-xs font-semibold text-slate-700 truncate">Andi Muhammad Iqbal</span>
            <span className="text-[10px] text-slate-400 truncate">NIM H10123...</span>
          </div>
          <button 
            onClick={() => console.log("Intern Logout")}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}