"use client"

import { useEffect, useState } from "react"
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
import { Plus, AlertCircle, Users, Search } from "lucide-react"

// Status Badge - Warna semantik lembut diselaraskan dengan dashboard
function InternStatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    ACTIVE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING:  "bg-amber-50 text-amber-700 border-amber-200",
    FINISHED: "bg-zinc-50 text-zinc-400 border-zinc-200",
  }
  return (
    <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 shadow-none ${cls[status] ?? cls.FINISHED}`}>
      {status}
    </Badge>
  )
}

// Skeleton Loader untuk list intern
function InternSkeleton() {
  return (
    <div className="divide-y divide-zinc-50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-6 w-14 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function InternPage() {
  const [loading, setLoading] = useState(true)
  const [interns, setInterns] = useState<InternWithStatus[]>([])
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([])
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

  const [filterStatus, setFilterStatus] = useState<
    "SEMUA" | "ACTIVE" | "PENDING" | "FINISHED"
  >("SEMUA")

  const [filterDivisi, setFilterDivisi] = useState<"SAYA" | "SEMUA">("SAYA")

  useEffect(() => {
    if (!showModal) return

    const fetchDivisions = async () => {
      const response = await fetch("/api/divisions")
      const data = await response.json()
      setDivisions(data)
    }

    fetchDivisions()
  }, [showModal])

  // FETCH DATA
  const fetchInterns = async () => {
    try {
      setLoading(true)
      const query = filterDivisi === "SEMUA" ? "?divisi=semua" : ""
      const response = await fetch(`/api/interns${query}`)
      const data = await response.json()
      setInterns(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchInterns()
  }, [filterDivisi])

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
        setModalError(data.error)
        return
      }

      setShowModal(false)
      setForm({ name: "", email: "", password: "", divisionId: "" }) // reset form
      fetchInterns()
    } catch {
      setModalError("Terjadi kesalahan.")
    } finally {
      setModalLoading(false)
    }
  }

  // FILTER
  const filteredInterns = interns.filter(intern => {
    const statusMatch =
      filterStatus === "SEMUA" ? true : intern.status === filterStatus

    const searchMatch =
      search === ""
        ? true
        : intern.name.toLowerCase().includes(search.toLowerCase()) ||
          (intern.profile?.university ?? "").toLowerCase().includes(search.toLowerCase())

    return statusMatch && searchMatch
  })

  return (
    <main className="min-h-fit bg-white p-5">
      <div className="mx-auto max-w-4xl space-y-4">

        {/* HEADER - Tanpa Logo, Menggunakan Hijau Instansi */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-2xl font-extrabold text-[#2d5a1b] tracking-tight leading-tight">Intern</h1>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">Kelola data intern dan monitoring status magang.</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => { setModalError(""); setShowModal(true) }}
            className="bg-[#2d5a1b] hover:bg-[#204013] text-white text-xs h-8 px-3 gap-1.5 shadow-none"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Intern
          </Button>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-100 bg-white p-3 md:flex-row md:items-center md:justify-between">
          
          {/* TOGGLE DIVISI */}
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 rounded-lg p-0.5">
            <button
              onClick={() => setFilterDivisi("SAYA")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                filterDivisi === "SAYA"
                  ? "bg-white text-[#2d5a1b] shadow-sm border border-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Divisi Saya
            </button>

            <button
              onClick={() => setFilterDivisi("SEMUA")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                filterDivisi === "SEMUA"
                  ? "bg-white text-[#2d5a1b] shadow-sm border border-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Semua Divisi
            </button>
          </div>

          {/* CARI & FILTER STATUS */}
          <div className="flex flex-1 items-center gap-2 justify-end w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-400" />
              <Input
                placeholder="Cari nama/kampus..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs border-zinc-200 focus-visible:ring-zinc-300 focus-visible:ring-1 shadow-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-600 focus:border-zinc-300 focus:outline-none transition-colors"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>
        </div>

        {/* LIST INTERN */}
        <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
            <span className="text-xs font-semibold text-[#2d5a1b] tracking-wide">Daftar Data Intern</span>
            <span className="text-[11px] text-zinc-400 font-medium">{filteredInterns.length} orang</span>
          </div>

          {loading ? (
            <InternSkeleton />
          ) : filteredInterns.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-12 text-zinc-300">
              <Users className="h-6 w-6" />
              <p className="text-xs">Tidak ada data intern.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {filteredInterns.map((intern) => (
                <div
                  key={intern.id}
                  className="flex flex-col gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-medium text-zinc-900">{intern.name}</h2>
                    <p className="text-xs text-zinc-400">{intern.profile?.university ?? "-"}</p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="rounded border border-zinc-100 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                      {intern.division?.name ?? "-"}
                    </span>

                    <InternStatusBadge status={intern.status} />

                    <Link
                      href={`/admin/intern/${intern.id}`}
                      className="inline-flex h-6 items-center justify-center rounded border border-zinc-200 bg-white px-2 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL TAMBAH INTERN - Menggunakan Shadcn Dialog */}
      <Dialog
        open={showModal}
        onOpenChange={open => {
          setShowModal(open)
          if (!open) setModalError("")
        }}
      >
        <DialogContent className="sm:max-w-sm rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-[#2d5a1b]">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50 border border-zinc-100">
                <Plus className="h-3.5 w-3.5 text-[#2d5a1b]" />
              </div>
              Tambah Akun Intern
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleTambahIntern} className="space-y-3.5 mt-1">
        {/* Input Nama */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-600">Nama Lengkap</label>
          <Input
            placeholder="Masukkan nama lengkap"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full h-8 border border-zinc-200 bg-white rounded-lg px-3 text-xs placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
            required
          />
        </div>

        {/* Input Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-600">Email</label>
          <Input
            type="email"
            placeholder="contoh@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full h-8 border border-zinc-200 bg-white rounded-lg px-3 text-xs placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
            required
          />
        </div>

        {/* Input Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-600">Password Awal</label>
          <Input
            type="password"
            placeholder="Masukkan password awal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full h-8 border border-zinc-200 bg-white rounded-lg px-3 text-xs placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
            required
          />
        </div>

        {/* Input Divisi */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-600">Divisi</label>
          <select
            value={form.divisionId}
            onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
            className="w-full h-8 border border-zinc-200 bg-white rounded-lg px-2 text-xs text-zinc-700 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
            required
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
              <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3 shadow-none">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{modalError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-zinc-200 shadow-none"
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white shadow-none"
                disabled={modalLoading}
              >
                {modalLoading ? "Menyimpan..." : "Tambah Intern"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}