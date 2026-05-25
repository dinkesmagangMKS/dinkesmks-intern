"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  CheckCircle2,
  AlertCircle,
  Info,
  LogOut,
  BookOpen,
  Clock,
  CalendarCheck,
  FileText,
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

// Skeleton

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      {/* Kehadiran card */}
      <div className="rounded-lg border border-zinc-100 p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-28" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5">
            <Skeleton className="h-2.5 w-10 mb-1.5" />
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </div>
      {/* Logbook card */}
      <div className="rounded-lg border border-zinc-100 p-4 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

// Main Page

export default function InternDashboardPage() {
  const router = useRouter()

  const [data, setData] = useState<{
    todaySession: any
    todayAttendance: any
    totalHadir: number
    totalIzin: number
    totalAbsen: number
    logbookTerakhir: any
  } | null>(null)
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
      const [dashRes, profileRes] = await Promise.all([
        fetch("/api/dashboard/intern"),
        fetch("/api/profile"),
      ])
      const dashData = await dashRes.json()
      const profileData = await profileRes.json()
      setData(dashData)
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
      setCheckInMessage("Berhasil check in! 🎉")
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

  const {
    todaySession, todayAttendance,
    totalHadir, totalIzin, totalAbsen,
    logbookTerakhir,
  } = data ?? {
    todaySession: null, todayAttendance: null,
    totalHadir: 0, totalIzin: 0, totalAbsen: 0,
    logbookTerakhir: null,
  }

  const firstName = user?.name?.split(" ")[0] ?? "Kamu"
  const initials  = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto space-y-4">

        {loading ? <DashboardSkeleton /> : (
          <>
            {/* GREETING */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold text-zinc-900">
                  Halo, {firstName}!
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long",
                  })}
                </p>
              </div>

              {/* Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-sm font-semibold shrink-0">
                {initials}
              </div>
            </div>

            {/* SUCCESS MESSAGE */}
            {checkInMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                {checkInMessage}
              </div>
            )}

            {/* CARD KEHADIRAN HARI INI */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                  <CalendarCheck className="h-3 w-3 text-zinc-400" />
                  Kehadiran Hari Ini
                </span>
              </div>

              <div className="p-4">
                {/* Tidak ada sesi */}
                {!todaySession && (
                  <div className="flex items-center gap-2 text-zinc-400 py-2">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <p className="text-xs">Tidak ada sesi absensi hari ini.</p>
                  </div>
                )}

                {/* Ada sesi, belum absen */}
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
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1 font-mono tracking-widest uppercase"
                        maxLength={6}
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={checkInLoading}
                        className="h-8 px-3 text-xs bg-zinc-900 hover:bg-zinc-800 text-white shrink-0"
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

                {/* Sudah hadir */}
                {todayAttendance?.status === "HADIR" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white">
                        HADIR
                      </span>
                      <span className="text-xs text-zinc-400">
                        Clock in pukul{" "}
                        <span className="font-medium text-zinc-700">
                          {formatJam(todayAttendance.clock_in_at)}
                        </span>
                      </span>
                    </div>

                    {todayAttendance.clock_out_at ? (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <ClockIcon className="h-3 w-3" />
                        Clock out pukul{" "}
                        <span className="font-medium text-zinc-700">
                          {formatJam(todayAttendance.clock_out_at)}
                        </span>
                        <span className="text-zinc-200 mx-0.5">·</span>
                        {hitungDurasi(todayAttendance.clock_in_at, todayAttendance.clock_out_at)}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setClockOutError(""); setShowClockOutModal(true) }}
                        className="h-7 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-1.5"
                      >
                        <LogOut className="h-3 w-3" />
                        Clock Out
                      </Button>
                    )}
                  </div>
                )}

                {/* Izin */}
                {todayAttendance?.status === "IZIN" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                        IZIN
                      </span>
                      <span className="text-xs text-zinc-400">Izin diajukan</span>
                    </div>
                    {todayAttendance.reason && (
                      <p className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-100 rounded px-2.5 py-1.5">
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
                { label: "Hadir",  value: totalHadir,  cls: "text-zinc-900" },
                { label: "Izin",   value: totalIzin,   cls: "text-zinc-400" },
                { label: "Absen",  value: totalAbsen,  cls: "text-zinc-300" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2.5">
                  <p className="text-[11px] text-zinc-400">{s.label}</p>
                  <p className={`text-xl font-semibold mt-0.5 ${s.cls}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* CARD LOGBOOK TERAKHIR */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-zinc-400" />
                  Logbook Terakhir
                </span>
                <button
                  onClick={() => router.push("/intern/logbook")}
                  className="text-[11px] text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  Lihat semua →
                </button>
              </div>

              <div className="p-4">
                {logbookTerakhir ? (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-zinc-400">
                      {formatTanggal(logbookTerakhir.date)}
                    </p>
                    <p className="text-sm text-zinc-800 leading-snug line-clamp-3">
                      {logbookTerakhir.description}
                    </p>
                    {logbookTerakhir.documentation && (
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1">
                        <FileText className="h-2.5 w-2.5" />
                        Ada foto dokumentasi
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      <p className="text-xs">Belum ada logbook nih.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push("/intern/logbook")}
                      className="h-7 text-xs bg-zinc-900 hover:bg-zinc-800 text-white gap-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      Isi Sekarang
                    </Button>
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
              className="flex-1 h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white"
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