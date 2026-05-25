"use client"

import { useEffect, useState } from "react"

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

// Helpers 
function formatTanggal(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  })
}

function formatJam(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

// Status Badge 

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    AKTIF:    "bg-zinc-900 text-white border-zinc-900",
    EXPIRED:  "bg-zinc-100 text-zinc-500 border-zinc-200",
    DITUTUP:  "bg-white text-zinc-400 border-zinc-200",
  }
  return (
    <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 ${cls[status] ?? cls.EXPIRED}`}>
      {status}
    </Badge>
  )
}

function AttendanceStatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    HADIR: "bg-zinc-900 text-white border-zinc-900",
    IZIN:  "bg-zinc-100 text-zinc-500 border-zinc-200",
    ALPHA: "bg-white text-zinc-400 border-zinc-200",
  }
  return (
    <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 ${cls[status] ?? cls.ALPHA}`}>
      {status}
    </Badge>
  )
}

// Skeleton

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

// Main Page 

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [closeLoading, setCloseLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/attendance/session")
      const data = await res.json()
      setSessions(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  const handleCreate = async () => {
    setCreateLoading(true)
    setError("")
    try {
      const res = await fetch("/api/attendance/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toLocaleDateString("en-CA")
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setShowCreateModal(false)
      fetchSessions()
    } catch {
      setError("Terjadi kesalahan.")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDelete = async (sessionId: string) => {
    setDeleteLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/attendance/session/${sessionId}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }
      fetchSessions()
    } catch {
      setError("Terjadi kesalahan.")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleClose = async (sessionId: string) => {
    setCloseLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/attendance/session/${sessionId}`, { method: "PATCH" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }
      fetchSessions()
    } catch {
      setError("Terjadi kesalahan.")
    } finally {
      setCloseLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto max-w-4xl space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-900 leading-tight">Absensi</h1>
              <p className="text-xs text-zinc-400">Kelola sesi dan pantau kehadiran intern.</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => { setError(""); setShowCreateModal(true) }}
            className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs h-8 px-3 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Sesi
          </Button>
        </div>

        {/* ERROR GLOBAL */}
        {error && !showCreateModal && (
          <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* LIST SESI */}
        <div className="rounded-lg border border-zinc-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
            <span className="text-xs font-medium text-zinc-700">Daftar Sesi</span>
            <span className="text-[11px] text-zinc-400">{sessions.length} sesi</span>
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
              {sessions.map((session: any) => {
                const total  = session.totalIntern ?? 0
                const hadir  = session.attendances?.filter((a: any) => a.status === "HADIR").length ?? 0
                const isAktif = session.status === "AKTIF"

                return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors md:flex-row md:items-center md:justify-between"
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

                    {/* Actions kanan */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={session.status} />

                      {/* Hadir/Total */}
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 border border-zinc-100 rounded px-2 py-0.5 bg-white">
                        <Users className="h-2.5 w-2.5" />
                        <span>
                          <span className="font-semibold text-zinc-700">{hadir}</span>
                          <span className="text-zinc-300 mx-0.5">/</span>
                          {total}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session)
                          setShowDetailModal(true)
                        }}
                        className="h-6 px-2 text-[11px] border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        Detail
                      </Button>

                      {isAktif && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={closeLoading}
                          onClick={() => handleClose(session.id)}
                          className="h-6 px-2 text-[11px] border-zinc-200 text-zinc-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 gap-1"
                        >
                          <X className="h-2.5 w-2.5" />
                          Tutup
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteLoading}
                        onClick={() => handleDelete(session.id)}
                        className="h-6 px-2 text-[11px] border-zinc-200 text-zinc-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 gap-1"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                        Hapus
                      </Button>
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
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100">
                <Plus className="h-3.5 w-3.5 text-zinc-700" />
              </div>
              Buat Sesi Absensi
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Sesi baru akan dibuat untuk hari ini. Kode absensi akan digenerate otomatis.
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
              className="flex-1 h-8 text-xs border-zinc-200"
              onClick={() => setShowCreateModal(false)}
              disabled={createLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white"
              onClick={handleCreate}
              disabled={createLoading}
            >
              {createLoading ? "Membuat..." : "Buat Sesi"}
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
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100">
                <CalendarDays className="h-3.5 w-3.5 text-zinc-700" />
              </div>
              Detail Sesi
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 mt-1">
              {/* Info sesi */}
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Tanggal</span>
                  <span className="text-xs font-medium text-zinc-700">
                    {formatTanggal(selectedSession.date ?? selectedSession.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Kode</span>
                  <span className="font-mono text-sm font-semibold tracking-widest text-zinc-900">
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
                    {selectedSession.attendances?.filter((a: any) => a.status === "HADIR").length ?? 0}
                    {" / "}
                    {selectedSession.totalIntern ?? 0} hadir
                  </span>
                </div>
              </div>

              {/* List kehadiran */}
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-2">Rekap Kehadiran</p>

                {!selectedSession.attendances?.length ? (
                  <p className="text-xs text-zinc-300 text-center py-4">Belum ada data kehadiran.</p>
                ) : (
                  <div className="rounded-lg border border-zinc-100 overflow-hidden">
                    <div className="grid grid-cols-4 px-3 py-2 bg-zinc-50 border-b border-zinc-100 text-[11px] font-medium text-zinc-400">
                      <span className="col-span-2">Nama</span>
                      <span>Status</span>
                      <span>Clock In</span>
                    </div>
                    <div className="divide-y divide-zinc-50 max-h-56 overflow-y-auto">
                      {selectedSession.attendances.map((a: any, i: number) => (
                        <div key={i} className="grid grid-cols-4 px-3 py-2.5 text-xs hover:bg-zinc-50">
                          <span className="col-span-2 font-medium text-zinc-800 truncate pr-2">
                            {a.user?.name ?? "-"}
                          </span>
                          <span><AttendanceStatusBadge status={a.status} /></span>
                          <span className="text-zinc-400">{formatJam(a.clock_in_at)}</span>
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