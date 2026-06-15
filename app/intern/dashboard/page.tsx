"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import {
  CheckCircle2,
  AlertCircle,
  Info,
  LogOut,
  BookOpen,
  Clock,
  CalendarCheck,
  FileImage,
  ClockIcon,
  History,
} from "lucide-react"

// Types & Interfaces
interface DashboardData {
  todaySession: any
  todayAttendance: any
  totalHadir: number
  totalIzin: number
  totalAbsen: number
  logbookTerakhir: any
  history: any[]
}

interface InternDashboardProps {
  setTab?: (tab: string) => void
}

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

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    HADIR:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    IZIN:   "bg-amber-50 text-amber-700 border-amber-200",
    ALPHA:  "bg-rose-50 text-rose-600 border-rose-200",
  }
  return (
    <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 rounded ${cls[status] ?? cls.ALPHA}`}>
      {status}
    </Badge>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="rounded-lg border border-zinc-100 p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5">
            <Skeleton className="h-2.5 w-10 mb-1.5" />
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-100 p-4 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="rounded-lg border border-zinc-100 p-4 flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-md shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function InternDashboardPage({ setTab }: InternDashboardProps) {
  const router = useRouter()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [code, setCode] = useState("")
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [checkInError, setCheckInError] = useState("")
  const [checkInMessage, setCheckInMessage] = useState("")

  const [showClockOutModal, setShowClockOutModal] = useState(false)
  const [clockOutLoading, setClockOutLoading] = useState(false)
  const [clockOutError, setClockOutError] = useState("")

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const [dashRes, profileRes, attendanceRes] = await Promise.all([
        fetch("/api/dashboard/intern"),
        fetch("/api/profile"),
        fetch("/api/attendance/me").catch(() => null)
      ])
      
      const dashData = await dashRes.json()
      const profileData = await profileRes.json()
      const attendanceData = attendanceRes ? await attendanceRes.json() : null

      setData({
        ...dashData,
        history: attendanceData?.history ?? []
      })
      setUser(profileData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  useEffect(() => {
    if (!checkInMessage) return
    const t = setTimeout(() => setCheckInMessage(""), 4000)
    return () => clearTimeout(t)
  }, [checkInMessage])

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckInLoading(true)
    setCheckInError("")
    try {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const result = await res.json()
      if (!res.ok) { setCheckInError(result.error); return }
      setCode("")
      setCheckInMessage("Berhasil check in!")
      fetchDashboard()
    } catch {
      setCheckInError("Terjadi kesalahan.")
    } finally {
      setCheckInLoading(false)
    }
  }

  const handleClockOut = async () => {
    setClockOutLoading(true)
    setClockOutError("")
    try {
      const res = await fetch("/api/attendance/clock-out", { method: "PATCH" })
      const result = await res.json()
      if (!res.ok) { setClockOutError(result.error); return }
      setShowClockOutModal(false)
      fetchDashboard()
    } catch {
      setClockOutError("Terjadi kesalahan.")
    } finally {
      setClockOutLoading(false)
    }
  }

  // Fallback Destructuring yang lebih aman
  const {
    todaySession, todayAttendance,
    totalHadir, totalIzin, totalAbsen,
    logbookTerakhir, history
  } = data ?? {
    todaySession: null, todayAttendance: null,
    totalHadir: 0, totalIzin: 0, totalAbsen: 0,
    logbookTerakhir: null, history: []
  }

  const firstName = user?.name?.split(" ")[0] ?? "Kamu"

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto max-w-4xl space-y-4">

        {loading ? <DashboardSkeleton /> : (
          <>
            {/* GREETING */}
            <div className="py-1">
              <h1 className="text-2xl font-extrabold text-[#2d5a1b] tracking-tight leading-tight">
                Halo, {firstName}!
              </h1>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            </div>

            {/* SUCCESS MESSAGE */}
            {checkInMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                {checkInMessage}
              </div>
            )}

            {/* CARD KEHADIRAN HARI INI */}
            <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-bold text-[#2d5a1b] tracking-wide flex items-center gap-1.5">
                  <CalendarCheck className="h-3 w-3 text-[#2d5a1b]" />
                  Kehadiran Hari Ini
                </span>
              </div>

              <div className="p-4">
                {!todaySession && (
                  <div className="flex items-center gap-2 text-zinc-400 py-2">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-xs">Tidak ada sesi absensi hari ini.</p>
                  </div>
                )}

                {todaySession && !todayAttendance && (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-400">
                      Sesi aktif — masukkan kode untuk hadir
                    </p>
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
                        disabled={checkInLoading}
                        className="h-8 px-3 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white shrink-0 font-medium"
                      >
                        {checkInLoading ? "..." : "Hadir"}
                      </Button>
                    </form>

                    {checkInError && (
                      <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <AlertDescription className="text-xs">{checkInError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {todayAttendance?.status === "HADIR" && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-50/50 p-4 rounded-lg border border-zinc-100">
                    <div className="flex flex-col flex-1 w-full">
                      <div className="grid grid-cols-2 gap-4 items-stretch sm:flex sm:flex-row sm:items-center sm:gap-6">
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
                        onClick={() => { setClockOutError(""); setShowClockOutModal(true) }}
                        className="h-8 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-1.5 w-full sm:w-auto sm:ml-auto shrink-0 font-medium mt-2 sm:mt-0"
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
                      <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        IZIN
                      </span>
                      <span className="text-xs text-zinc-400">Izin diajukan</span>
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

            {/* STAT CARDS */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Hadir",  value: totalHadir,   cls: "text-[#2d5a1b]" },
                { label: "Izin",   value: totalIzin,    cls: "text-amber-600" },
                { label: "Absen",  value: totalAbsen,   cls: "text-red-600" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2.5">
                  <p className="text-[11px] text-zinc-400">{s.label}</p>
                  <p className={`text-xl font-semibold mt-0.5 ${s.cls}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* CARD RIWAYAT PRESENSI TERAKHIR */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden bg-white">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-bold text-[#2d5a1b] tracking-wide flex items-center gap-1.5">
                  <History className="h-3 w-3 text-[#2d5a1b]" />
                  Riwayat Kehadiran Terakhir
                </span>
                <button
                  type="button"
                  onClick={() => setTab ? setTab("absen") : router.push("/intern/attendance")}
                  className="text-sm sm:text-[11px] text-zinc-400 hover:text-[#2d5a1b] font-medium transition-colors p-1"
                >
                  <span className="hidden sm:inline">Lihat Detail →</span>
                  <span className="sm:hidden text-base font-bold">→</span>
                </button>
              </div>

              {!history || history.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-6 text-zinc-300">
                  <p className="text-xs">Belum ada riwayat kehadiran.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full default-scrollbar">
                  <div className="divide-y divide-zinc-100 min-w-[600px]">
                    <div className="grid grid-cols-5 px-4 py-2 text-[11px] font-bold text-zinc-400 bg-zinc-50/50">
                      <span>Tanggal</span>
                      <span>Status</span>
                      <span>Clock In</span>
                      <span>Clock Out</span>
                      <span>Durasi</span>
                    </div>

                    {history.slice(0, 3).map((item: any, i: number) => (
                      <div
                        key={i}
                        className="grid grid-cols-5 gap-y-1 px-4 py-3 hover:bg-zinc-50/80 transition-colors text-xs items-center"
                      >
                        <span className="text-zinc-600 font-medium">
                          {formatTanggal(item.session?.date || item.date)}
                        </span>
                        <span><StatusBadge status={item.status} /></span>
                        <span className="text-zinc-500 font-mono">{formatJam(item.clock_in_at)}</span>
                        <span className="text-zinc-500 font-mono">{formatJam(item.clock_out_at)}</span>
                        <span className="text-zinc-600 font-medium">{hitungDurasi(item.clock_in_at, item.clock_out_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CARD LOGBOOK TERAKHIR */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden bg-white">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-bold text-[#2d5a1b] tracking-wide flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-[#2d5a1b]" />
                  Logbook Terakhir
                </span>
                <button
                  type="button"
                  onClick={() => setTab ? setTab("riwayat") : router.push("/intern/logbook")}
                  className="text-sm sm:text-[11px] text-zinc-400 hover:text-[#2d5a1b] font-medium transition-colors p-1"
                >
                  <span className="hidden sm:inline">Lihat semua →</span>
                  <span className="sm:hidden text-base font-bold">→</span>
                </button>
              </div>

              <div className="p-4">
                {logbookTerakhir ? (
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {logbookTerakhir.documentation ? (
                        <Image
                          src={logbookTerakhir.documentation}
                          alt="Dokumentasi"
                          width={50}
                          height={50}
                          className="w-10 h-10 object-cover rounded-md border border-zinc-100"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-zinc-100 border border-zinc-100 flex items-center justify-center">
                          <FileImage className="h-4 w-4 text-zinc-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-zinc-400">
                        {formatTanggal(logbookTerakhir.date)}
                      </p>
                      <p className="text-xs text-zinc-700 mt-0.5 leading-relaxed whitespace-pre-line line-clamp-3">
                        {logbookTerakhir.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      <p className="text-xs">Belum ada logbook nih.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab ? setTab("isi") : router.push("/intern/logbook")}
                      className="h-7 px-3 inline-flex items-center justify-center rounded text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white gap-1 transition-colors font-medium"
                    >
                      <BookOpen className="h-3 w-3" />
                      Isi Sekarang
                    </button>
                  </div>
                )}
              </div>
            </div>

          </>
        )}

      </div>

      {/* MODAL CLOCK OUT */}
      <Dialog
        open={showClockOutModal}
        onOpenChange={open => {
          setShowClockOutModal(open)
          if (!open) setClockOutError("")
        }}
      >
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

          {clockOutError && (
            <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">{clockOutError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs border-zinc-200"
              onClick={() => setShowClockOutModal(false)}
              disabled={clockOutLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white font-medium"
              onClick={handleClockOut}
              disabled={clockOutLoading}
            >
              {clockOutLoading ? "Proses..." : "Clock Out"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}