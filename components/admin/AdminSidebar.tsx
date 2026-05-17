"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  Users, 
  UserCircle,
  LogOut,
  Building2
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

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // Sesuai request: dashboard, absen, intern, dan profile
  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Data Absensi", href: "/admin/attendance", icon: CalendarCheck2 },
    { name: "Data Intern", href: "/admin/intern", icon: Users },
    { name: "Profil Admin", href: "/admin/profil", icon: UserCircle },
  ];

  return (
    <Sidebar className="border-r border-slate-200 bg-white text-slate-800">
      <SidebarHeader className="p-4 border-b border-slate-100 flex flex-row items-center gap-3">
        <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm tracking-tight text-slate-900 truncate">Dinkes Makassar</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Admin Panel</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu Navigasi
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
                      ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
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
            <span className="text-xs font-semibold text-slate-700 truncate">Suryadi, S.Kom</span>
            <span className="text-[10px] text-slate-400 truncate">Super Admin</span>
          </div>
          <button 
            onClick={() => console.log("Admin Logout")}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}