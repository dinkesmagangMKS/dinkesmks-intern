"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Download, Loader2, CalendarCheck, ClockIcon, History, LogOut, Info } from "lucide-react"

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

function formatJam(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function formatTanggal(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString("id-ID", {
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

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    HADIR: "bg-emerald-50 text-emerald-700 border-emerald-200",
    IZIN:  "bg-amber-50 text-amber-700 border-amber-200",
    ALPHA: "bg-rose-50 text-rose-600 border-rose-200",
  }
  return (
    <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 rounded ${cls[status] ?? cls.ALPHA}`}>
      {status}
    </Badge>
  )
}

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
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-zinc-50">
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-14 rounded" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface AttendanceData {
  todaySession: { expires_at: string } | null
  todayAttendance: { status: string; clock_in_at: string | null; clock_out_at: string | null; reason?: string } | null
  history: any[]
}

export default function InternAttendancePage() {
  const [data, setData] = useState<AttendanceData>({
    todaySession: null,
    todayAttendance: null,
    history: [],
  })
  
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date | null>(null) // Menghindari hydration mismatch
  const [code, setCode] = useState("")
  const [reason, setReason] = useState("")
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showClockOutModal, setShowClockOutModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/attendance/me")
      const result = await res.json()
      setData({
        todaySession: result.todaySession ?? null,
        todayAttendance: result.todayAttendance ?? null,
        history: result.history ?? [],
      })
    } catch (e) {
      console.error("Gagal memuat data absensi:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData() 
    setCurrentTime(new Date()) // Set waktu client setelah komponen termount sempurna
  }, [])

  useEffect(() => {
    if (!message && !error) return
    const t = setTimeout(() => {
      setMessage("")
      setError("")
    }, 4000)
    return () => clearTimeout(t)
  }, [message, error])

  const handleExport = async () => {
    setExportLoading(true)
    setError("")
    setMessage("")
    try {
      const res = await fetch("/api/attendance/export")
      
      if (!res.ok) {
        const result = await res.json().catch(() => null)
        throw new Error(result?.error ?? "Gagal mengekspor absensi.")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rekap-absensi-${new Date().toISOString().slice(0,10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMessage("PDF rekap absensi berhasil diunduh!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunduh PDF.")
    } finally {
      setExportLoading(false)
    }
  }

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
      setMessage("Berhasil melakukan check-in!")
      fetchData()
    } catch {
      setError("Terjadi kesalahan sistem.")
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
      setMessage("Clock out berhasil. Selamat beristirahat!")
      fetchData()
    } catch {
      setError("Terjadi kesalahan sistem.")
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
        body: JSON.stringify({ 
          status: "IZIN",
          reason: reason 
        }),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error); return }
      setShowLeaveModal(false)
      setReason("")
      setMessage("Permohonan izin berhasil dikirim!")
      fetchData()
    } catch {
      setError("Terjadi kesalahan sistem.")
    } finally {
      setActionLoading(false)
    }
  }

  const { todaySession, todayAttendance, history } = data

  // Pengecekan status kadaluwarsa sesi absensi yang aman
  const isSessionExpired = currentTime && todaySession 
    ? currentTime > new Date(todaySession.expires_at) 
    : false

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto space-y-4">

        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2d5a1b] tracking-tight leading-tight">Absensi</h1>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">Kelola kehadiran harian magang kamu.</p>
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-xs text-emerald-800">
            {message}
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="border-red-100 bg-red-50/70 py-2.5 px-3">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* CARD KEHADIRAN HARI INI */}
            <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-bold text-[#2d5a1b] tracking-wide flex items-center gap-1.5">
                  <CalendarCheck className="h-3 w-3 text-[#2d5a1b]" />
                  Kehadiran Hari Ini
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  {currentTime ? currentTime.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) : "---"}
                </span>
              </div>

              <div className="p-4">
                {!todaySession && (
                  <div className="flex items-center gap-2 text-zinc-400 py-2">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-xs">Tidak ada sesi absensi aktif untuk hari ini.</p>
                  </div>
                )}

                {todaySession && !todayAttendance && isSessionExpired && (
                  <p className="text-xs text-rose-500 py-2 font-medium">Sesi absensi hari ini telah berakhir/kadaluwarsa.</p>
                )}

                {todaySession && !todayAttendance && !isSessionExpired && (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-400">Sesi aktif — masukkan kode untuk hadir</p>
                    <form onSubmit={handleCheckIn} className="flex gap-2">
                      <Input
                        placeholder="Kode absensi"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-[#2d5a1b] focus-visible:ring-1 font-mono tracking-widest uppercase"
                        maxLength={6}
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={actionLoading}
                        className="h-8 px-3 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white shrink-0 font-medium cursor-pointer"
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
                      className="h-8 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-1.5 w-full md:w-auto font-medium"
                    >
                      Ajukan Form Izin
                    </Button>
                  </div>
                )}

                {todayAttendance?.status === "HADIR" && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-50/50 p-4 rounded-lg border border-zinc-100">
                    <div className="flex flex-col flex-1 w-full">
                      <div className="grid grid-cols-2 gap-4 items-stretch sm:flex sm:flex-row sm:items-center sm:gap-6">
                        
                        {/* KOLOM KIRI: Check In */}
                        <div className="flex flex-col justify-between h-full sm:h-auto space-y-1">
                          <div>
                            <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 tracking-wide">
                              HADIR
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 flex flex-col gap-0.5 pl-0.5">
                            <span className="text-[11px] text-zinc-400 font-medium">Clock In</span>
                            <span className="font-semibold text-zinc-700 font-mono text-sm">
                              {formatJam(todayAttendance.clock_in_at)}
                            </span>
                          </div>
                        </div>

                        {/* KOLOM KANAN: Clock Out */}
                        <div className="flex flex-col justify-between h-full sm:h-auto space-y-1 sm:border-l sm:border-zinc-200 sm:pl-6">
                          <div>
                            <span className="inline-flex items-center rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 tracking-wide">
                              SELESAI
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 flex flex-col gap-0.5 pl-0.5">
                            <span className="text-[11px] text-zinc-400 font-medium">Clock Out</span>
                            <span className="font-semibold text-zinc-700 font-mono text-sm">
                              {todayAttendance.clock_out_at ? formatJam(todayAttendance.clock_out_at) : "--:--"}
                            </span>
                          </div>
                        </div>

                      </div>

                      {todayAttendance.clock_out_at && (
                        <div className="mt-3 pt-2 border-t border-zinc-200/60 flex items-center gap-1.5 pl-0.5 sm:border-t-0 sm:mt-2">
                          <ClockIcon className="h-3.5 w-3.5 text-[#2d5a1b] shrink-0" />
                          <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">Total durasi kerja:</span>
                          <span className="text-xs font-bold text-[#2d5a1b]">
                            {hitungDurasi(todayAttendance.clock_in_at, todayAttendance.clock_out_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {!todayAttendance.clock_out_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setError(""); setShowClockOutModal(true) }}
                        className="h-8 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-1.5 cursor-pointer w-full sm:w-auto sm:ml-auto shrink-0 font-medium mt-2 sm:mt-0"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Clock Out
                      </Button>
                    )}
                  </div>
                )}

                {todayAttendance?.status === "IZIN" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={todayAttendance.status} />
                      <span className="text-xs text-zinc-400">
                        Izin diajukan
                      </span>
                    </div>
                    {todayAttendance.reason && (
                      <p className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-100 rounded px-2.5 py-1.5 leading-relaxed">
                        {todayAttendance.reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* TABEL RIWAYAT */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden bg-white">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-bold text-[#2d5a1b] tracking-wide flex items-center gap-1.5">
                  <History className="h-3 w-3 text-[#2d5a1b]" />
                  Riwayat Kehadiran
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={exportLoading || history.length === 0}
                  className="h-6 px-2 text-[11px] border-zinc-200 text-zinc-600 hover:bg-zinc-100 gap-1.5 cursor-pointer"
                >
                  {exportLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  {exportLoading ? "Mengekspor..." : "Export PDF"}
                </Button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-10 text-zinc-300 text-xs">
                  Belum ada rekapitulasi data absensi.
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-zinc-50/50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                        <th className="px-4 py-2.5">Tanggal</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Clock In</th>
                        <th className="px-4 py-2.5">Clock Out</th>
                        <th className="px-4 py-2.5">Durasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 text-xs">
                      {history.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="px-4 py-3 font-medium text-zinc-700 whitespace-nowrap">
                            {formatTanggal(item.session?.date || item.date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-500 whitespace-nowrap">
                            {formatJam(item.clock_in_at)}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-500 whitespace-nowrap">
                            {formatJam(item.clock_out_at)}
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-500 whitespace-nowrap">
                            {hitungDurasi(item.clock_in_at, item.clock_out_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL CLOCK OUT */}
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
          <div className="flex gap-2 mt-2">
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
              className="flex-1 h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white"
              onClick={handleClockOut}
              disabled={actionLoading}
            >
              {actionLoading ? "Proses..." : "Clock Out"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL LEAVE FORM */}
      <Dialog
        open={showLeaveModal}
        onOpenChange={(open: boolean) => {
          setShowLeaveModal(open)
          if (!open) { setReason(""); setError(""); }
        }}
      >
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-zinc-900">Form Perizinan</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Berikan alasan atau keterangan perizinan kamu dengan jelas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLeave} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-zinc-600">Alasan / Keterangan Izin</Label>
              <Textarea
                placeholder="Contoh: Melaksanakan sidang seminar hasil penelitian di kampus utama."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="text-xs border-zinc-200 focus-visible:ring-[#2d5a1b] min-h-24 resize-none"
                required
              />
            </div>
            
            <div className="flex gap-2 pt-1">
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
                className="flex-1 h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white"
                disabled={actionLoading}
              >
                {actionLoading ? "Mengirim..." : "Kirim Form"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}