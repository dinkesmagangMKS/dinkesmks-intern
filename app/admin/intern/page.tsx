"use client"

import { useEffect, useState, useCallback } from "react"
import type { InternWithStatus } from "@/types"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, AlertCircle, Users, Search, FolderKanban, Loader2, Check, FileText, UserX } from "lucide-react"

interface Division {
  id: string;
  name: string;
}

function InternStatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    ACTIVE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING:  "bg-amber-50 text-amber-700 border-amber-200",
    FINISHED: "bg-zinc-50 text-zinc-400 border-zinc-200",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-medium px-1.5 py-0 shadow-none ${cls[status] ?? cls.FINISHED}`}>
      {status === "ACTIVE" ? "Aktif" : status === "PENDING" ? "Pending" : "Selesai"}
    </Badge>
  )
}

function InternCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-100 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-50 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8 rounded-full" />
          </div>
          <div className="space-y-2.5">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function InternPage() {
  const [loading, setLoading] = useState(true)
  const [interns, setInterns] = useState<InternWithStatus[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    divisionId: ""
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")
  const [search, setSearch] = useState("")
  const [filterStatusTab, setFilterStatusTab] = useState<"SEMUA" | "ACTIVE" | "FINISHED">("SEMUA")

  // Fetch Interns dibungkus dengan useCallback agar stabil
  const fetchInterns = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/interns?divisi=semua")
      if (!response.ok) throw new Error("Gagal mengambil data")
      const data = await response.json()
      setInterns(data || [])
    } catch (error) {
      console.error("Gagal memuat data intern:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInterns()
  }, [fetchInterns])

  // Memuat data divisi hanya saat modal terbuka untuk efisiensi resource
  useEffect(() => {
    if (!showModal) return

    let isMounted = true
    const fetchDivisions = async () => {
      try {
        const response = await fetch("/api/divisions")
        if (!response.ok) throw new Error()
        const data = await response.json()
        if (isMounted) setDivisions(data || [])
      } catch (error) {
        console.error("Gagal memuat divisi:", error)
      }
    }
    
    fetchDivisions()
    return () => { isMounted = false }
  }, [showModal])

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleTambahIntern = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)
    setModalError("")

    try {
      const response = await fetch("/api/interns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await response.json()
      if (!response.ok) {
        setModalError(data.error || "Gagal menambahkan data intern.")
        return
      }

      setShowModal(false)
      setForm({ name: "", email: "", password: "", divisionId: "" })
      fetchInterns()
    } catch {
      setModalError("Terjadi kesalahan sistem. Silakan coba lagi.")
    } finally {
      setModalLoading(false)
    }
  }

  // Filter pencarian dan tab status secara real-time
  const filteredInterns = interns.filter(intern => {
    const statusMatch = filterStatusTab === "SEMUA" 
      || (filterStatusTab === "ACTIVE" && (intern.status === "ACTIVE" || intern.status === "PENDING"))
      || intern.status === filterStatusTab

    const searchNormalized = search.trim().toLowerCase()
    const nameMatch = intern.name.toLowerCase().includes(searchNormalized)
    const universityMatch = (intern.profile?.university ?? "").toLowerCase().includes(searchNormalized)

    return statusMatch && (nameMatch || universityMatch)
  })

  // Pengelompokan data intern berdasarkan divisi secara aman
  const groupedByDivision = filteredInterns.reduce<Record<string, { name: string; items: InternWithStatus[] }>>((acc, intern) => {
    const divId = intern.division_id || "no-division"
    const divName = intern.division?.name || "Tanpa Divisi"

    if (!acc[divId]) {
      acc[divId] = { name: divName, items: [] }
    }
    acc[divId].items.push(intern)
    return acc
  }, {})

  const divisionKeys = Object.keys(groupedByDivision)

  return (
    <main className="min-h-fit bg-white p-5">
      <div className="mx-auto max-w-4xl space-y-5">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 py-1">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-extrabold text-[#2d5a1b] tracking-tight leading-tight">Intern</h1>
            <p className="text-xs font-medium text-zinc-500 max-w-sm sm:max-w-none">
              Kelola data intern dan monitoring status magang per divisi.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => { setModalError(""); setShowModal(true) }}
            className="w-full sm:w-auto bg-[#2d5a1b] hover:bg-[#204013] text-white text-xs h-8 px-3.5 gap-1.5 shadow-none cursor-pointer rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Intern
          </Button>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 rounded-lg p-0.5">
            {(["SEMUA", "ACTIVE", "FINISHED"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilterStatusTab(key)}
                className={`flex-1 sm:flex-none text-center rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 cursor-pointer ${
                  filterStatusTab === key
                    ? "bg-[#2d5a1b] text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {key === "SEMUA" ? "Semua" : key === "ACTIVE" ? "Aktif" : "Selesai"}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-400" />
            <Input
              placeholder="Cari nama atau kampus..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs border-zinc-200 focus-visible:ring-[#2d5a1b] focus-visible:ring-1 shadow-none rounded-lg"
            />
          </div>
        </div>

        {/* AREA UTAMA DATA INTERN */}
        {loading ? (
          <InternCardSkeleton />
        ) : divisionKeys.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-16 text-zinc-300 border border-dashed border-zinc-200 rounded-xl bg-white">
            <UserX className="h-6 w-6 text-zinc-300" />
            <p className="text-xs font-medium">Tidak ada data intern yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {divisionKeys.map((divId) => {
              const division = groupedByDivision[divId]
              return (
                <div key={divId} className="flex flex-col rounded-xl border border-zinc-100 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50/70 border-b border-zinc-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2d5a1b]">
                      <FolderKanban className="h-3.5 w-3.5 text-[#5a8a2d]" />
                      <span>{division.name}</span>
                    </div>
                    <Badge variant="secondary" className="h-4 bg-zinc-200/60 text-zinc-600 text-[10px] font-semibold px-1.5 rounded-full shadow-none">
                      {division.items.length} Orang
                    </Badge>
                  </div>

                  <div className="divide-y divide-zinc-50 flex-1 bg-white">
                    {division.items.map((intern) => (
                      <div key={intern.id} className="flex items-center justify-between p-3 hover:bg-zinc-50/50 transition-colors">
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <h2 className="text-xs font-semibold text-zinc-900 truncate">{intern.name}</h2>
                          <p className="text-[11px] text-zinc-400 truncate">{intern.profile?.university ?? "-"}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <InternStatusBadge status={intern.status} />
                          <Link
                            href={`/admin/intern/${intern.id}`}
                            className="inline-flex h-6 items-center justify-center rounded-md border border-zinc-200 bg-white px-2 text-[10px] font-medium text-zinc-600 hover:bg-zinc-50 hover:border-[#5a8a2d] hover:text-[#2d5a1b] transition-colors"
                          >
                            Detail
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL TAMBAH INTERN */}
      <Dialog open={showModal} onOpenChange={open => { setShowModal(open); if (!open) setModalError("") }}>
        <DialogContent className="sm:max-w-sm rounded-xl p-5 border-zinc-100 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-[#2d5a1b]">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50 border border-zinc-100">
                <Plus className="h-3.5 w-3.5 text-[#2d5a1b]" />
              </div>
              Tambah Akun Intern
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleTambahIntern} className="space-y-3.5 mt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600">Nama Lengkap</label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={form.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full h-8 border border-zinc-200 bg-white rounded-lg px-3 text-xs placeholder-zinc-400 focus-visible:ring-1 focus-visible:ring-[#2d5a1b] shadow-none"
                required
                disabled={modalLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600">Email</label>
              <Input
                type="email"
                placeholder="contoh@email.com"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full h-8 border border-zinc-200 bg-white rounded-lg px-3 text-xs placeholder-zinc-400 focus-visible:ring-1 focus-visible:ring-[#2d5a1b] shadow-none"
                required
                disabled={modalLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600">Password Awal</label>
              <Input
                type="password"
                placeholder="Masukkan password awal"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full h-8 border border-zinc-200 bg-white rounded-lg px-3 text-xs placeholder-zinc-400 focus-visible:ring-1 focus-visible:ring-[#2d5a1b] shadow-none"
                required
                disabled={modalLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-600">Divisi</label>
              <select
                value={form.divisionId}
                onChange={(e) => handleInputChange("divisionId", e.target.value)}
                className="w-full h-8 border border-zinc-200 bg-white rounded-lg px-2 text-xs text-zinc-700 outline-none hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] cursor-pointer"
                required
                disabled={modalLoading}
              >
                <option value="">Pilih Divisi</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>

            {modalError && (
              <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3 shadow-none flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                <AlertDescription className="text-xs text-red-700 font-medium">{modalError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-zinc-200 shadow-none rounded-lg text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white shadow-none rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                disabled={modalLoading}
              >
                {modalLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                {modalLoading ? "Menyimpan..." : "Tambah Intern"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}