"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  AlertCircle, 
  BookOpen, 
  CalendarDays, 
  CheckCircle2, 
  ChevronRight, 
  FileImage, 
  KeyRound, 
  Clock, 
  User, 
  Building2, 
  GraduationCap 
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

function formatDurasi(menit: number): string {
  if (!menit) return "-"
  const jam = Math.floor(menit / 60)
  const sisaMenit = menit % 60
  return jam > 0 ? `${jam} Jam ${sisaMenit} Menit` : `${sisaMenit} Menit`
}

function formatJam(menit: number): string {
  if (!menit) return "-"
  const jam = Math.floor(menit / 60).toString().padStart(2, "0")
  const sisaMenit = (menit % 60).toString().padStart(2, "0")
  return `${jam}:${sisaMenit}`
}

function formatTanggal(date: string | null): string {
  if (!date) return "-"
  try {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return "-"
  }
}

function formatJamMonitoring(date: string | null): string {
  if (!date) return "-"
  try {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit", 
      minute: "2-digit"
    })
  } catch {
    return "-"
  }
}

function hitungDurasi(clockIn: string | null, clockOut: string | null): string {
  if (!clockIn || !clockOut) return "-"
  try {
    const diff = new Date(clockOut).getTime() - new Date(clockIn).getTime()
    if (diff < 0) return "-"
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return h > 0 ? `${h} Jam ${m} Menit` : `${m} Menit`
  } catch {
    return "-"
  }
}


function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    FINISHED: "bg-zinc-50 text-zinc-400 border-zinc-200",
  }
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    PENDING: "Pending",
    FINISHED: "Selesai",
  }
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${cls[status] ?? cls.PENDING}`}>
      {labels[status] ?? status}
    </span>
  )
}

function AttendanceBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    HADIR: "bg-emerald-50 text-emerald-700 border-emerald-200",
    IZIN: "bg-amber-50 text-amber-700 border-amber-200",
    ABSEN: "bg-red-50 text-red-600 border-red-200",
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${cls[status] ?? cls.ABSEN}`}>
      {status === "HADIR" && <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"/></svg>}
      {status === "IZIN" && <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
      {status === "HADIR" ? "Hadir" : status === "IZIN" ? "Izin" : "Absen"}
    </span>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="rounded-lg border border-zinc-100 p-6 space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


export default function InternDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [intern, setIntern] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showIzinModal, setShowIzinModal] = useState(false)
  const [showLogbookModal, setShowLogbookModal] = useState(false)

  const [finishLoading, setFinishLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const [fetchError, setFetchError] = useState("")
  const [finishError, setFinishError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetMessage, setResetMessage] = useState("")

  const [resetPassword, setResetPassword] = useState("")
  const [activeTab, setActiveTab] = useState<"absensi" | "logbook">("absensi")
  const [selectedIzin, setSelectedIzin] = useState<{ name: string; reason: string } | null>(null)
  const [selectedLogbook, setSelectedLogbook] = useState<any>(null)

  useEffect(() => {
    const fetchIntern = async () => {
      try {
        const response = await fetch(`/api/interns/${id}`)
        if (!response.ok) throw new Error("Gagal memuat data")
        const data = await response.json()
        setIntern(data)
      } catch (err) {
        console.error(err)
        setFetchError("Gagal memuat data intern.")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchIntern()
  }, [id])

  const handleFinish = async () => { /* ... */ }
  const handleDelete = async () => { /* ... */ }
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true); setResetError(""); setResetMessage("")
    setTimeout(() => { // Mock success for demo
      setResetLoading(false); setShowResetModal(false); setResetPassword("")
      setResetMessage("Password berhasil direset. Intern akan diminta ganti password saat login.")
    }, 1000)
  }

  if (loading) {
    return (
      <main className="min-h-fit bg-white p-5">
        <div className="mx-auto max-w-6xl">
          <DetailSkeleton />
        </div>
      </main>
    )
  }

  if (fetchError || !intern) {
    return (
      <main className="min-h-fit bg-white p-5">
        <div className="mx-auto max-w-6xl rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{fetchError || "Data intern tidak ditemukan."}</p>
            <Link href="/admin/intern" className="text-xs text-red-600 underline mt-1 inline-block">
              Kembali ke daftar intern
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const isFinished = intern.status === "FINISHED"

  return (
    <main className="min-h-fit bg-white p-5">
      <div className="mx-auto max-w-6xl space-y-4">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1">
              <Link href="/admin/intern" className="hover:text-zinc-600 transition-colors">Intern</Link>
              <span>/</span>
              <span className="text-zinc-600 truncate max-w-[200px]">{intern.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#2d5a1b] tracking-tight leading-tight">
              Detail Profil
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={resetLoading || deleteLoading || finishLoading}
              onClick={() => { setResetError(""); setShowResetModal(true) }}
              className="h-8 text-xs border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Reset Password
            </Button>

            {intern.status === "PENDING" && (
              <Button
                variant="outline"
                size="sm"
                disabled={resetLoading || deleteLoading || finishLoading}
                onClick={() => { setShowDeleteModal(true); setDeleteError("") }}
                className="h-8 text-xs border-red-200 text-red-600 bg-white hover:bg-red-50"
              >
                Hapus Akun
              </Button>
            )}

            {!isFinished && (
              <Button
                size="sm"
                disabled={resetLoading || deleteLoading || finishLoading}
                onClick={() => { setShowModal(true); setFinishError("") }}
                className="h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white"
              >
                Tandai Selesai
              </Button>
            )}
          </div>
        </div>

        {resetMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-2 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">{resetMessage}</span>
          </div>
        )}

        {/* CARD PROFIL UTAMA */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 flex flex-col md:flex-row gap-5">
          <div className="shrink-0">
            {intern.profile?.photo_url ? (
              <img
                src={intern.profile.photo_url}
                alt={intern.name}
                className="h-16 w-16 rounded-lg object-cover border border-zinc-100 bg-zinc-50"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                <User className="h-6 w-6" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-0.5">
              <h2 className="text-lg font-bold text-zinc-900 truncate">{intern.name}</h2>
              <StatusBadge status={intern.status} />
            </div>
            <p className="text-xs text-zinc-500 truncate">{intern.email}</p>
            
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Lembaga</p>
                <p className="text-sm font-medium text-zinc-800 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="truncate">{intern.profile?.university || "-"}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Program Studi</p>
                <p className="text-sm font-medium text-zinc-800 mt-0.5 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="truncate">{intern.profile?.major || "-"}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Divisi Kerja</p>
                <p className="text-sm font-medium text-zinc-800 mt-0.5 truncate">{intern.division?.name || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Fokus Jobdesk</p>
                <p className="text-sm font-medium text-zinc-800 mt-0.5 truncate">{intern.profile?.jobdesk || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Kontak</p>
                <p className="text-sm font-medium text-zinc-800 mt-0.5">{intern.profile?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Durasi Kontrak</p>
                <p className="text-sm font-medium text-zinc-800 mt-0.5">
                  {formatTanggal(intern.profile?.start_date)} — {formatTanggal(intern.profile?.end_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isFinished && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 flex items-center gap-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            <p className="text-xs text-zinc-600">
              <span className="font-semibold text-zinc-800">Status Penyelesaian:</span>{" "}
              {intern.profile?.finished_early_at
                ? `Berkas diarsipkan lebih awal pada ${formatTanggal(intern.profile.finished_early_at)}.`
                : "Masa kontrak penugasan magang telah berakhir."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
          {/* PANEL STATISTIK */}
          <div className="lg:col-span-1 rounded-lg border border-zinc-100 bg-white overflow-hidden">
            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
              <span className="text-xs font-bold text-[#2d5a1b] tracking-wide">
                Statistik Kehadiran
              </span>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5">
                {[
                  { label: "Hadir", value: intern.stats?.totalHadir ?? 0, cls: "text-[#2d5a1b]" }, 
                  { label: "Izin", value: intern.stats?.totalIzin ?? 0, cls: "text-amber-600" }, 
                  { label: "Absen", value: intern.stats?.totalAbsen ?? 0, cls: "text-red-600" }, 
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2.5 flex items-center justify-between lg:flex-col lg:items-start lg:justify-center">
                    <p className="text-[11px] text-zinc-400">{s.label}</p>
                    <p className={`text-lg font-semibold mt-0.5 ${s.cls}`}>{s.value} <span className="text-xs font-medium text-zinc-400">Hari</span></p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs text-zinc-600">
                <div className="flex justify-between items-center px-1">
                  <span>Total Alokasi Sesi</span>
                  <span className="font-semibold text-zinc-800">{intern.stats?.totalSesi ?? 0} Sesi</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span>Rata-rata Masuk</span>
                  <span className="font-semibold text-zinc-800">{formatJam(intern.stats?.avgClockIn)}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100 px-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" /> Durasi Rata-rata
                  </span>
                  <span className="font-bold text-[#2d5a1b]">{formatDurasi(intern.stats?.avgDurasi)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB RIWAYAT */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex border-b border-zinc-100 gap-6">
              {([
                { key: "absensi", label: "Riwayat Absensi" },
                { key: "logbook", label: "Riwayat Logbook" },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`pb-2.5 text-xs font-bold tracking-wide transition-colors relative ${
                    activeTab === key
                      ? "text-[#2d5a1b]"
                      : "text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  {label}
                  {activeTab === key && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2d5a1b] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === "absensi" && (
              <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                  <span className="text-xs font-bold text-[#2d5a1b] tracking-wide">
                    Log Presensi
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">{intern.riwayatAttendance?.length ?? 0} Record</span>
                </div>

                {!intern.riwayatAttendance?.length ? (
                  <div className="px-4 py-8 text-center text-xs text-zinc-300">
                    Belum ada riwayat absensi.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px] divide-y divide-zinc-50">
                      <div className="grid grid-cols-6 px-4 py-2.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-white border-b border-zinc-50">
                        <span className="col-span-2">Tanggal</span>
                        <span>Status</span>
                        <span>Masuk</span>
                        <span>Keluar</span>
                        <span>Durasi</span>
                      </div>

                      {intern.riwayatAttendance.map((item: any) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-6 px-4 py-3 hover:bg-zinc-50 transition-colors items-center"
                        >
                          <span className="col-span-2 text-xs font-medium text-zinc-800 truncate pr-4">
                            {formatTanggal(item.session?.date)}
                          </span>
                          <div>
                            <AttendanceBadge status={item.status} />
                          </div>
                          <span className="text-xs text-zinc-500">{formatJamMonitoring(item.clock_in_at)}</span>
                          <span className="text-xs text-zinc-500">{formatJamMonitoring(item.clock_out_at)}</span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-zinc-500">{hitungDurasi(item.clock_in_at, item.clock_out_at)}</span>
                            {item.status === "IZIN" && item.reason && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedIzin({ name: intern.name, reason: item.reason })
                                  setShowIzinModal(true)
                                }}
                                className="text-[11px] text-amber-700 border border-amber-200 bg-amber-50/50 rounded px-1.5 py-0.5 hover:bg-amber-50 transition-colors ml-auto"
                              >
                                Alasan
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "logbook" && (
              <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                  <span className="text-xs font-bold text-[#2d5a1b] tracking-wide">
                    Aktivitas Kerja Harian
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">{intern.riwayatLogbook?.length ?? 0} Entri</span>
                </div>

                {!intern.riwayatLogbook?.length ? (
                  <div className="px-4 py-8 text-center text-xs text-zinc-300">
                    Belum ada dokumen logbook.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-50">
                    {intern.riwayatLogbook.map((lb: any) => (
                      <div
                        key={lb.id}
                        onClick={() => {
                          setSelectedLogbook(lb)
                          setShowLogbookModal(true)
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                      >
                        <div className="shrink-0">
                          {lb.documentation ? (
                            <div className="relative h-10 w-10 rounded overflow-hidden border border-zinc-100 bg-zinc-50">
                              <Image
                                src={lb.documentation}
                                alt="Dokumentasi"
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                              <FileImage className="h-4 w-4 text-zinc-300" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-zinc-400 mb-0.5">
                            {formatTanggal(lb.date)}
                          </p>
                          <p className="text-xs font-medium text-zinc-800 line-clamp-1">
                            {lb.description}
                          </p>
                        </div>

                        <ChevronRight className="h-4 w-4 text-zinc-300" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Dialog open={showIzinModal} onOpenChange={open => { setShowIzinModal(open); if (!open) setSelectedIzin(null) }}>
        <DialogContent className="sm:max-w-xs rounded-xl p-5 border-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-zinc-900">Alasan Izin</DialogTitle>
          </DialogHeader>
          {selectedIzin && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500">{selectedIzin.name}</p>
              <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2.5 text-sm text-zinc-700 leading-relaxed">
                {selectedIzin.reason || "-"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showLogbookModal} onOpenChange={open => { setShowLogbookModal(open); if (!open) setSelectedLogbook(null) }}>
        <DialogContent className="sm:max-w-md rounded-xl p-5 border-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-zinc-900">Detail Aktivitas Tugas</DialogTitle>
          </DialogHeader>
          {selectedLogbook && (
            <div className="space-y-3 pt-1">
              <p className="text-xs font-medium text-zinc-500">
                {formatTanggal(selectedLogbook.date)}
              </p>
              <div className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100 whitespace-pre-line">
                {selectedLogbook.description}
              </div>
              {selectedLogbook.documentation && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50 mt-2">
                  <Image
                    src={selectedLogbook.documentation}
                    alt="Lampiran Lembar Kerja"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </main>
  )
}