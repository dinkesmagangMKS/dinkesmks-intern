"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Clock,
  LogOut,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  ClockIcon,
} from "lucide-react"

// Helpers

function formatJam(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function formatTanggal(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
}

function hitungDurasi(clockIn: string | null, clockOut: string | null): string {
  if (!clockIn || !clockOut) return "-"
  const diff = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}j ${m}m`
}

// Status Badge

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    HADIR:  "bg-zinc-900 text-white border-zinc-900",
    IZIN:   "bg-zinc-100 text-zinc-500 border-zinc-200",
    ALPHA:  "bg-white text-zinc-400 border-zinc-200",
  }
  return (
    <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 ${cls[status] ?? cls.ALPHA}`}>
      {status}
    </Badge>
  )
}

// Skeleton

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-100 p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="rounded-lg border border-zinc-100 overflow-hidden">
        <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
          <Skeleton className="h-3 w-28" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-zinc-50">
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-14 rounded" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Page

export default function InternAttendancePage() {
  const [data, setData] = useState<{
    todaySession: any
    todayAttendance: any
    history: any[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState("")
  const [reason, setReason] = useState("")
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showClockOutModal, setShowClockOutModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/attendance/me")
      const result = await res.json()
      setData(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Auto-clear message
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(""), 4000)
    return () => clearTimeout(t)
  }, [message])

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setError("")
    try {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error); return }
      setCode("")
      setMessage("Berhasil check in! 🎉")
      fetchData()
    } catch {
      setError("Terjadi kesalahan.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleClockOut = async () => {
    setActionLoading(true)
    setError("")
    try {
      const res = await fetch("/api/attendance/clock-out", { method: "PATCH" })
      const result = await res.json()
      if (!res.ok) { setError(result.error); return }
      setShowClockOutModal(false)
      setMessage("Clock out berhasil. Sampai besok! 👋")
      fetchData()
    } catch {
      setError("Terjadi kesalahan.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setError("")
    try {
      const res = await fetch("/api/attendance/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error); return }
      setShowLeaveModal(false)
      setReason("")
      setMessage("Izin berhasil diajukan! ✅")
      fetchData()
    } catch {
      setError("Terjadi kesalahan.")
    } finally {
      setActionLoading(false)
    }
  }

  const { todaySession, todayAttendance, history } = data ?? {
    todaySession: null, todayAttendance: null, history: [],
  }

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto space-y-4">

        {/*  HEADER  */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <CalendarDays className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 leading-tight">Absensi</h1>
            <p className="text-xs text-zinc-400">Catat kehadiran harianmu di sini.</p>
          </div>
        </div>

        

        {/*  SUCCESS MESSAGE  */}
        {message && (
          <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            {message}
          </div>
        )}

        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {/*  CARD SESI HARI INI  */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-medium text-zinc-700">Sesi Hari Ini</span>
                <span className="text-[11px] text-zinc-400">
                  {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                </span>
              </div>

              <div className="p-4">
                {/* Tidak ada sesi */}
                {!todaySession && (
                  <div className="flex items-center gap-2 text-zinc-400 py-4">
                    <Info className="h-4 w-4 shrink-0" />
                    <p className="text-sm">Tidak ada sesi absensi hari ini.</p>
                  </div>
                )}

                {/* Sesi ada tapi sudah expired */}
                {todaySession && !todayAttendance && new Date() > new Date(todaySession.expires_at) && (
                  <div className="flex items-center gap-2 text-zinc-400 py-4">
                    <Info className="h-4 w-4 shrink-0" />
                    <p className="text-sm">Sesi absensi hari ini sudah berakhir.</p>
                  </div>
                )}

                {/* Ada sesi, belum absen */}
                {todaySession && !todayAttendance && new Date() <= new Date(todaySession.expires_at) && (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-400">
                      Sesi aktif · Masukkan kode untuk hadir
                    </p>

                    <form onSubmit={handleCheckIn} className="flex gap-2">
                      <Input
                        placeholder="Kode absensi"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1 font-mono tracking-widest"
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={actionLoading}
                        className="h-8 px-3 text-xs bg-zinc-900 hover:bg-zinc-800 text-white shrink-0"
                      >
                        {actionLoading ? "..." : "Hadir"}
                      </Button>
                    </form>

                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-zinc-100" />
                      <span className="text-[11px] text-zinc-300">atau</span>
                      <div className="h-px flex-1 bg-zinc-100" />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setError(""); setShowLeaveModal(true) }}
                      className="h-8 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-1.5"
                    >
                      <FileText className="h-3 w-3" />
                      Ajukan Izin
                    </Button>

                    {error && (
                      <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Sudah hadir */}
                {todayAttendance?.status === "HADIR" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="HADIR" />
                      <span className="text-xs text-zinc-400">
                        Clock in pukul{" "}
                        <span className="font-medium text-zinc-700">
                          {formatJam(todayAttendance.clock_in_at)}
                        </span>
                      </span>
                    </div>

                    {todayAttendance.clock_out_at ? (
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <ClockIcon className="h-3 w-3" />
                        Clock out pukul{" "}
                        <span className="font-medium text-zinc-700">
                          {formatJam(todayAttendance.clock_out_at)}
                        </span>
                        <span className="text-zinc-300">·</span>
                        {hitungDurasi(todayAttendance.clock_in_at, todayAttendance.clock_out_at)}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setError(""); setShowClockOutModal(true) }}
                        className="h-8 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-1.5"
                      >
                        <LogOut className="h-3 w-3" />
                        Clock Out
                      </Button>
                    )}

                    {error && (
                      <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Izin */}
                {todayAttendance?.status === "IZIN" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="IZIN" />
                      <span className="text-xs text-zinc-400">Izin diajukan</span>
                    </div>
                    {todayAttendance.reason && (
                      <div className="rounded-md bg-zinc-50 border border-zinc-100 px-3 py-2 text-xs text-zinc-500 leading-relaxed">
                        <span className="text-zinc-400 font-medium">Alasan: </span>
                        {todayAttendance.reason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/*  RIWAYAT KEHADIRAN  */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-medium text-zinc-700">Riwayat Kehadiran</span>
                <span className="text-[11px] text-zinc-400">{history.length} catatan</span>
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-10 text-zinc-300">
                  <Clock className="h-6 w-6" />
                  <p className="text-xs">Belum ada riwayat kehadiran.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {/* Table header */}
                  <div className="hidden md:grid grid-cols-5 px-4 py-2 text-[11px] font-medium text-zinc-400">
                    <span>Tanggal</span>
                    <span>Status</span>
                    <span>Clock In</span>
                    <span>Clock Out</span>
                    <span>Durasi</span>
                  </div>

                  {history.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="grid grid-cols-2 md:grid-cols-5 gap-y-1 px-4 py-3 hover:bg-zinc-50 transition-colors text-xs"
                    >
                      <span className="text-zinc-600 col-span-2 md:col-span-1 font-medium">
                        {formatTanggal(item.session.date)}
                      </span>
                      <span><StatusBadge status={item.status} /></span>
                      <span className="text-zinc-400">{formatJam(item.clock_in_at)}</span>
                      <span className="text-zinc-400">{formatJam(item.clock_out_at)}</span>
                      <span className="text-zinc-400">{hitungDurasi(item.clock_in_at, item.clock_out_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/*  MODAL CLOCK OUT  */}
      <Dialog open={showClockOutModal} onOpenChange={setShowClockOutModal}>
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100">
                <LogOut className="h-3.5 w-3.5 text-zinc-700" />
              </div>
              Konfirmasi Clock Out
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Yakin mau clock out sekarang? Pastikan kamu sudah selesai kerja ya.
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
              onClick={() => setShowClockOutModal(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white"
              onClick={handleClockOut}
              disabled={actionLoading}
            >
              {actionLoading ? "Proses..." : "Clock Out"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/*  MODAL IZIN  */}
      <Dialog
        open={showLeaveModal}
        onOpenChange={open => {
          setShowLeaveModal(open)
          if (!open) { setReason(""); setError("") }
        }}
      >
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100">
                <FileText className="h-3.5 w-3.5 text-zinc-700" />
              </div>
              Ajukan Izin
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Tulis alasan izinmu dengan jelas ya.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLeave} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-zinc-600">Alasan Izin</Label>
              <Textarea
                placeholder="Contoh: Sakit, ada keperluan keluarga, dll."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1 min-h-20 resize-none"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-zinc-200"
                onClick={() => setShowLeaveModal(false)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white"
                disabled={actionLoading}
              >
                {actionLoading ? "Mengirim..." : "Ajukan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}