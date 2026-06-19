"use client"

import { useEffect, useState, startTransition } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import {
  CalendarDays,
  Plus,
  AlertCircle,
  Users,
  X,
  Hash,
  Clock,
  Trash2
} from "lucide-react"

// Types Definition untuk skalabilitas & type safety data analitik
interface Attendance {
  status: "HADIR" | "IZIN" | "ALPHA"
  clock_in_at: string | null
  user?: {
    name: string
  }
}

interface AttendanceSession {
  id: string
  date?: string
  createdAt: string
  code: string
  status: "AKTIF" | "EXPIRED" | "DITUTUP"
  totalIntern: number
  attendances?: Attendance[]
}

// Helpers 
function formatTanggal(date: string | undefined): string {
  if (!date) return "-"
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return "-"
  return parsedDate.toLocaleDateString("id-ID", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  })
}

function formatJam(date: string | null): string {
  if (!date) return "-"
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return "-"
  return parsedDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function StatusBadge({ status }: { status: AttendanceSession["status"] }) {
  const cls: Record<string, string> = {
    AKTIF:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    EXPIRED: "bg-amber-50 text-amber-700 border-amber-200",
    DITUTUP: "bg-zinc-50 text-zinc-400 border-zinc-200",
  }
  return (
    <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 shadow-none ${cls[status] ?? cls.DITUTUP}`}>
      {status}
    </Badge>
  )
}

function AttendanceStatusBadge({ status }: { status: Attendance["status"] }) {
  const cls: Record<string, string> = {
    HADIR: "bg-emerald-50 text-emerald-700 border-emerald-200",
    IZIN:  "bg-amber-50 text-amber-700 border-amber-200",
    ALPHA: "bg-red-50 text-red-600 border-red-200",
  }
  return (
    <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 shadow-none ${cls[status] ?? cls.ALPHA}`}>
      {status}
    </Badge>
  )
}

function SessionSkeleton() {
  return (
    <div className="divide-y divide-zinc-50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-10 rounded" />
            <Skeleton className="h-6 w-12 rounded" />
            <Skeleton className="h-6 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [loading, setLoading] = useState(true)
  
  // State Modals Control
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)
  
  const [createLoading, setCreateLoading] = useState(false)
  const [closeLoading, setCloseLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState("")

  // Evaluasi jam operasional dinamis (Batas Jam 16:00 WITA)
  const checkOperationalHours = () => new Date().getHours() >= 16
  const isPastOperationalHours = checkOperationalHours()

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/attendance/session")
      if (!res.ok) throw new Error("Gagal mengambil data")
      const data = await res.json()
      setSessions(data)
    } catch (e) {
      console.error(e)
      setError("Gagal memuat daftar sesi absensi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  const handleCreate = async () => {
    // Validasi waktu operasional secara real-time saat tombol ditekan
    if (checkOperationalHours()) {
      setError("Waktu operasional pembuatan sesi telah berakhir.")
      return
    }

    setCreateLoading(true)
    setError("")
    try {
      const res = await fetch("/api/attendance/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toLocaleDateString("en-CA") // Format YYYY-MM-DD aman untuk server-side
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Gagal membuat sesi"); return }
      setShowCreateModal(false)
      fetchSessions()
    } catch {
      setError("Terjadi kesalahan jaringan.")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSession) return
    setDeleteLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/attendance/session/${selectedSession.id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Gagal menghapus sesi")
        return
      }
      setShowDeleteModal(false)
      setSelectedSession(null)
      fetchSessions()
    } catch {
      setError("Terjadi kesalahan sistem.")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleClose = async () => {
    if (!selectedSession) return
    setCloseLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/attendance/session/${selectedSession.id}`, { method: "PATCH" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Gagal menutup sesi")
        return
      }
      setShowCloseModal(false)
      setSelectedSession(null)
      fetchSessions()
    } catch {
      setError("Terjadi kesalahan internal.")
    } finally {
      setCloseLoading(false)
    }
  }

  return (
    <main className="min-h-fit bg-white p-5">
      <div className="mx-auto max-w-4xl space-y-4">

        {/* HEADER RESPONSIVE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1 border-b border-zinc-50 pb-3 sm:pb-1">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-extrabold text-[#2d5a1b] tracking-tight leading-tight">Absensi</h1>
            <p className="text-xs font-medium text-zinc-500 max-w-sm sm:max-w-none">
              Kelola sesi dan pantau kehadiran intern.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => { setError(""); setShowCreateModal(true) }}
            className="bg-[#2d5a1b] hover:bg-[#204013] text-white text-xs h-8 px-3 gap-1.5 shadow-none rounded-lg cursor-pointer w-full sm:w-auto justify-center font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Sesi
          </Button>
        </div>

        {/* ERROR GLOBAL */}
        {error && !showCreateModal && !showCloseModal && !showDeleteModal && (
          <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3 shadow-none">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* LIST SESI */}
        <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
            <span className="text-xs font-bold text-[#2d5a1b] tracking-wide">Daftar Sesi</span>
            <span className="text-[11px] text-zinc-400 font-medium">{sessions.length} sesi</span>
          </div>

          {loading ? (
            <SessionSkeleton />
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-12 text-zinc-300">
              <Clock className="h-6 w-6" />
              <p className="text-xs">Belum ada sesi absensi.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {sessions.map((session) => {
                const total  = session.totalIntern ?? 0
                const hadir  = session.attendances?.filter((a) => a.status === "HADIR").length ?? 0
                const isAktif = session.status === "AKTIF"

                return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3.5 px-4 py-3.5 hover:bg-zinc-50 transition-colors md:flex-row md:items-center md:justify-between"
                  >
                    {/* Info kiri */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-900">
                        {formatTanggal(session.date ?? session.createdAt)}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <Hash className="h-2.5 w-2.5" />
                        <span className="font-mono tracking-widest text-zinc-600 font-medium">
                          {session.code}
                        </span>
                      </div>
                    </div>

                    {/* Actions kanan & Responsivitas Layout Kursor */}
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={session.status} />

                        {/* Hadir/Total */}
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 border border-zinc-100 rounded px-2 py-0.5 bg-white">
                          <Users className="h-2.5 w-2.5 text-zinc-400" />
                          <span>
                            <span className="font-semibold text-zinc-700">{hadir}</span>
                            <span className="text-zinc-300 mx-0.5">/</span>
                            {total}
                          </span>
                        </div>
                      </div>

                      {/* TOMBOL AKSI */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            startTransition(() => {
                              setSelectedSession(session)
                              setShowDetailModal(true)
                            })
                          }}
                          className="h-8 sm:h-7 px-2.5 text-[11px] border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 shadow-none rounded-md cursor-pointer flex-1 sm:flex-none justify-center font-medium"
                        >
                          Detail
                        </Button>

                        {isAktif && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSession(session)
                              setError("")
                              setShowCloseModal(true)
                            }}
                            className="h-8 sm:h-7 px-2.5 text-[11px] border-zinc-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 gap-1 shadow-none rounded-md cursor-pointer flex-1 sm:flex-none justify-center font-medium"
                          >
                            <X className="h-2.5 w-2.5" />
                            Tutup
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSession(session)
                            setError("")
                            setShowDeleteModal(true)
                          }}
                          className="h-8 sm:h-7 px-2.5 text-[11px] border-zinc-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 gap-1 shadow-none rounded-md cursor-pointer flex-1 sm:flex-none justify-center font-medium"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* MODAL KONFIRMASI BUAT SESI */}
      <Dialog
        open={showCreateModal}
        onOpenChange={open => {
          setShowCreateModal(open)
          if (!open) setError("")
        }}
      >
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-[#2d5a1b]">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50 border border-zinc-100">
                <Plus className="h-3.5 w-3.5 text-[#2d5a1b]" />
              </div>
              Buat Sesi Absensi
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Sesi baru akan dibuat untuk hari ini. Kode absensi akan digenerate otomatis oleh sistem.
            </DialogDescription>
          </DialogHeader>

          {/* Alert Proteksi Jam Operasional */}
          {isPastOperationalHours ? (
            <Alert variant="destructive" className="border-red-100 bg-red-50 py-2.5 px-3 shadow-none flex items-start gap-2">
              <Clock className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <AlertDescription className="text-xs text-red-700 font-medium leading-normal">
                Sesi gagal dibuat. Batas waktu pembuatan operasional harian maksimum adalah pukul **16.00 WITA**.
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3 shadow-none">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs border-zinc-200 shadow-none rounded-lg cursor-pointer font-medium"
              onClick={() => setShowCreateModal(false)}
              disabled={createLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white shadow-none rounded-lg cursor-pointer font-medium"
              onClick={handleCreate}
              disabled={createLoading || isPastOperationalHours}
            >
              {createLoading ? "Membuat..." : "Buat Sesi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL TUTUP SESI */}
      <Dialog
        open={showCloseModal}
        onOpenChange={open => {
          setShowCloseModal(open)
          if (!open) { setError(""); setSelectedSession(null); }
        }}
      >
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 border border-amber-100">
                <X className="h-3.5 w-3.5 text-amber-600" />
              </div>
              Tutup Sesi Absensi
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1 leading-normal">
              Apakah Anda yakin ingin menutup sesi absensi tanggal <strong>{selectedSession && formatTanggal(selectedSession.date)}</strong> secara manual? Sesi yang ditutup tidak dapat diaktifkan kembali.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3 shadow-none">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs border-zinc-200 shadow-none rounded-lg cursor-pointer font-medium"
              onClick={() => setShowCloseModal(false)}
              disabled={closeLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-none rounded-lg cursor-pointer font-medium"
              onClick={handleClose}
              disabled={closeLoading}
            >
              {closeLoading ? "Memproses..." : "Ya, Tutup"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL HAPUS SESI */}
      <Dialog
        open={showDeleteModal}
        onOpenChange={open => {
          setShowDeleteModal(open)
          if (!open) { setError(""); setSelectedSession(null); }
        }}
      >
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-red-600">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 border border-red-100">
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </div>
              Hapus Sesi Absensi
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1 leading-normal">
              Tindakan ini bersifat permanen. Seluruh data rekap log kehadiran intern pada tanggal <strong>{selectedSession && formatTanggal(selectedSession.date)}</strong> akan terhapus dari basis data.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3 shadow-none">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs border-zinc-200 shadow-none rounded-lg cursor-pointer font-medium"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white shadow-none rounded-lg cursor-pointer font-medium"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DETAIL SESI */}
      <Dialog
        open={showDetailModal}
        onOpenChange={open => {
          setShowDetailModal(open)
          if (!open) setSelectedSession(null)
        }}
      >
        <DialogContent className="sm:max-w-md rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-[#2d5a1b]">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-50 border border-zinc-100">
                <CalendarDays className="h-3.5 w-3.5 text-[#2d5a1b]" />
              </div>
              Detail Sesi
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 mt-1">
              {/* Info Sesi */}
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Tanggal</span>
                  <span className="text-xs font-medium text-zinc-700">
                    {formatTanggal(selectedSession.date ?? selectedSession.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Kode</span>
                  <span className="font-mono text-sm font-semibold tracking-widest text-[#2d5a1b]">
                    {selectedSession.code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Status</span>
                  <StatusBadge status={selectedSession.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Kehadiran</span>
                  <span className="text-xs font-medium text-zinc-700">
                    {selectedSession.attendances?.filter((a) => a.status === "HADIR").length ?? 0}
                    {" / "}
                    {selectedSession.totalIntern ?? 0} hadir
                  </span>
                </div>
              </div>

              {/* List Kehadiran */}
              <div>
                <p className="text-xs font-semibold text-[#2d5a1b] mb-2">Rekap Kehadiran</p>

                {!selectedSession.attendances?.length ? (
                  <p className="text-xs text-zinc-300 text-center py-4">Belum ada data kehadiran.</p>
                ) : (
                  <div className="rounded-lg border border-zinc-100 overflow-hidden bg-white">
                    <div className="grid grid-cols-4 px-3 py-2 bg-zinc-50 border-b border-zinc-100 text-[11px] font-medium text-zinc-400">
                      <span className="col-span-2">Nama</span>
                      <span>Status</span>
                      <span>Clock In</span>
                    </div>
                    <div className="divide-y divide-zinc-50 max-h-56 overflow-y-auto">
                      {selectedSession.attendances.map((a, i) => (
                        <div key={i} className="grid grid-cols-4 px-3 py-2.5 text-xs hover:bg-zinc-50 transition-colors">
                          <span className="col-span-2 font-medium text-zinc-800 truncate pr-2">
                            {a.user?.name ?? "-"}
                          </span>
                          <span><AttendanceStatusBadge status={a.status} /></span>
                          <span className="text-zinc-400 font-medium">{formatJam(a.clock_in_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}