"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  Users,
  CalendarCheck,
  Hash,
  AlertCircle,
  Plus,
  Building2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Helpers

function getSessionStatus(session: any): "AKTIF" | "EXPIRED" | "DITUTUP" {
  if (session.closed_at) return "DITUTUP"
  if (new Date() > new Date(session.expires_at)) return "EXPIRED"
  return "AKTIF"
}

// Progress Bar

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-zinc-900 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// Status Badge

function SessionStatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    AKTIF:   "bg-zinc-900 text-white border-zinc-900",
    EXPIRED: "bg-zinc-100 text-zinc-500 border-zinc-200",
    DITUTUP: "bg-white text-zinc-400 border-zinc-200",
  }
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${cls[status] ?? cls.DITUTUP}`}>
      {status}
    </span>
  )
}

// Skeleton

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5">
            <Skeleton className="h-2.5 w-16 mb-1.5" />
            <Skeleton className="h-6 w-10" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-100 p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="rounded-lg border border-zinc-100 overflow-hidden">
        <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
          <Skeleton className="h-3 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-zinc-50 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Page

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    totalInternAktif: number
    hadirHariIni: number
    izinHariIni: number
    belumHadir: number
    todaySession: any
    rekapDivisi: { divisi: string; total: number; hadir: number }[]
    listInternHariIni: { id: string; name: string; division: string; statusHariIni: string; reason: string | null }[]
    role: string
    divisionId: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")

  const [showIzinModal, setShowIzinModal] = useState(false)
  const [selectedIntern, setSelectedIntern] = useState<{ name: string; reason: string } | null>(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/dashboard/admin")
      const result = await res.json()
      setData(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleCreateSession = async () => {
    setCreateLoading(true)
    setCreateError("")
    try {
      const res = await fetch("/api/attendance/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toLocaleDateString("en-CA") }),
      })
      const result = await res.json()
      if (!res.ok) { setCreateError(result.error); return }
      fetchDashboard()
    } catch {
      setCreateError("Terjadi kesalahan.")
    } finally {
      setCreateLoading(false)
    }
  }

  const {
    totalInternAktif, hadirHariIni, izinHariIni, belumHadir,
    todaySession, rekapDivisi, listInternHariIni, role, divisionId
  } = data ?? {
    totalInternAktif: 0, hadirHariIni: 0, izinHariIni: 0, belumHadir: 0,
    todaySession: null, rekapDivisi: [], listInternHariIni: [], role: "", divisionId: null
  }

  const sessionStatus = todaySession ? getSessionStatus(todaySession) : null

  return (
    <main className="min-h-fit bg-white p-5">
      <div className="mx-auto max-w-4xl space-y-4">

        {loading ? <DashboardSkeleton /> : (
          <>
            {/* HEADER */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-zinc-900 leading-tight">Dashboard</h1>
                <p className="text-xs text-zinc-400">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {[
                { label: "Total Intern", value: totalInternAktif, cls: "text-zinc-900" },
                { label: "Hadir",        value: hadirHariIni,     cls: "text-zinc-900" },
                { label: "Izin",         value: izinHariIni,      cls: "text-zinc-400" },
                { label: "Belum Hadir",  value: belumHadir,       cls: "text-zinc-300" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2.5">
                  <p className="text-[11px] text-zinc-400">{s.label}</p>
                  <p className={`text-xl font-semibold mt-0.5 ${s.cls}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* SESI HARI INI */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                  <CalendarCheck className="h-3 w-3 text-zinc-400" />
                  Sesi Hari Ini
                </span>
              </div>

              <div className="p-4">
                {!todaySession ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="text-xs text-zinc-400 flex-1">
                      Belum ada sesi absensi untuk hari ini.
                    </p>
                    <div className="space-y-1.5">
                      <Button
                        size="sm"
                        disabled={createLoading}
                        onClick={handleCreateSession}
                        className="h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {createLoading ? "Membuat..." : "Buat Sesi"}
                      </Button>
                      {createError && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {createError}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Kode */}
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 shrink-0">
                        <Hash className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-400">Kode Absensi</p>
                        <p className="font-mono text-lg font-bold tracking-widest text-zinc-900 leading-tight">
                          {todaySession.code}
                        </p>
                      </div>
                    </div>

                    {/* Status + info */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <SessionStatusBadge status={sessionStatus!} />
                      {sessionStatus === "AKTIF" && todaySession.expires_at && (
                        <span className="text-[11px] text-zinc-400">
                          Expire{" "}
                          {new Date(todaySession.expires_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* REKAP PER DIVISI */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-zinc-400" />
                  Rekap per Divisi
                </span>
                <span className="text-[11px] text-zinc-400">{rekapDivisi.length} divisi</span>
              </div>

              {rekapDivisi.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-zinc-300">
                  Belum ada data rekap.
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {rekapDivisi.map((item) => {
                    const pct = item.total === 0 ? 0 : Math.round((item.hadir / item.total) * 100)
                    return (
                      <div key={item.divisi} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-zinc-700">{item.divisi}</span>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                            <span>
                              <span className="font-semibold text-zinc-700">{item.hadir}</span>
                              <span className="text-zinc-300 mx-0.5">/</span>
                              {item.total}
                            </span>
                            <span className="text-zinc-300">·</span>
                            <span>{pct}%</span>
                          </div>
                        </div>
                        <ProgressBar value={item.hadir} max={item.total} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* LIST INTERN HARI INI — hanya ADMIN */}
            {role === "ADMIN" && (
              <div className="rounded-lg border border-zinc-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                  <span className="text-xs font-medium text-zinc-700">
                    Intern Divisi — Hari Ini
                  </span>
                </div>

                {listInternHariIni.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-zinc-300">
                    Belum ada intern aktif.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-50">
                    {listInternHariIni.map(intern => (
                      <div key={intern.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition-colors">
                        <span className="text-sm font-medium text-zinc-800">{intern.name}</span>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${
                            intern.statusHariIni === "HADIR"
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : intern.statusHariIni === "IZIN"
                              ? "bg-zinc-100 text-zinc-500 border-zinc-200"
                              : "bg-white text-zinc-400 border-zinc-200"
                          }`}>
                            {intern.statusHariIni === "HADIR" && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"/></svg>
                            )}
                            {intern.statusHariIni === "IZIN" && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            )}
                            {intern.statusHariIni}
                          </span>

                          {intern.statusHariIni === "IZIN" && (
                            <button
                              onClick={() => {
                                setSelectedIntern({ name: intern.name, reason: intern.reason ?? "-" })
                                setShowIzinModal(true)
                              }}
                              className="text-[11px] text-zinc-400 border border-zinc-200 rounded px-1.5 py-0.5 hover:text-zinc-900 hover:border-zinc-400 transition-colors"
                            >
                              Lihat alasan
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        open={showIzinModal}
        onOpenChange={open => {
          setShowIzinModal(open)
          if (!open) setSelectedIntern(null)
        }}
      >
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-zinc-900">
              Alasan Izin
            </DialogTitle>
          </DialogHeader>
          {selectedIntern && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500">{selectedIntern.name}</p>
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2.5 text-sm text-zinc-700 leading-relaxed">
                {selectedIntern.reason || "-"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}