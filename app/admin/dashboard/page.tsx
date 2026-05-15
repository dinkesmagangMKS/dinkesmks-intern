"use client";

import React from "react";

<<<<<<< HEAD
export default function AdminDashboard() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      const data = await response.json()

      console.log("Response:", response.ok, data)
      
      if (!response.ok) {
        setError(data.error)
        return
      }

      router.push("/login")

    } catch {
      setError("Terjadi kesalahan. Periksa koneksi internetmu.")
    } finally {
      setLoading(false)
    }
  }
=======
export default function AdminDashboardPage() {
>>>>>>> layout-component
  return (
    <div className="space-y-6">
      {/* Bagian Top Informasi / Judul */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
          Dashboard Utama
        </h1>
        <p className="text-sm text-slate-500">
          Selamat datang di Sistem Monitoring Magang Dinas Kesehatan Kota Makassar.
        </p>
      </div>

      {/* Placeholder Konten Utama */}
      <div className="grid grid-cols-1 gap-6">
        <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          </div>
          <span className="text-sm font-semibold text-slate-800">
            Panel Konten Admin Dinkes
          </span>
          <span className="text-xs text-slate-400 max-w-sm mt-1">
            Halaman ini otomatis terikat dengan AdminSidebar (biru) dan AdminHeader melalui file layout.
          </span>
        </div>
      </div>
    </div>
  );
}