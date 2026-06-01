"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

function formatDurasi(menit: number): string {
  if (!menit) return "-"
  const jam = Math.floor(menit / 60)
  const sisaMenit = menit % 60
  return `${jam}j ${sisaMenit}m`
}

function formatJam(menit: number): string {
  if (!menit) return "-"
  const jam = Math.floor(menit / 60).toString().padStart(2, "0")
  const sisaMenit = (menit % 60).toString().padStart(2, "0")
  return `${jam}:${sisaMenit}`
}

function formatTanggal(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    FINISHED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  }
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    PENDING: "Pending",
    FINISHED: "Selesai",
  }
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${styles[status] ?? styles.PENDING}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default function InternDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [intern, setIntern] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [finishLoading, setFinishLoading] = useState(false)

  const [fetchError, setFetchError] = useState("")
  const [finishError, setFinishError] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetPassword, setResetPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState("")
  const [resetMessage, setResetMessage] = useState("")

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
    fetchIntern()
  }, [id])

  const handleFinish = async () => {
    setFinishLoading(true)
    try {
      const response = await fetch(`/api/interns/${id}/finish`, {
        method: "PATCH",
      })
      if (!response.ok) {
        const data = await response.json()
        setFinishError(data.error ?? "Terjadi kesalahan.")
        return
      }
      setShowModal(false)
      router.push("/admin/intern")
    } catch {
      setFinishError("Terjadi kesalahan.")
    } finally {
      setFinishLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/interns/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const data = await response.json()
        setDeleteError(data.error)
        return
      }

      router.push("/admin/intern")
    } catch {
      setDeleteError("Terjadi kesalahan.")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError("")
    try {
      const res = await fetch(`/api/interns/${id}/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: resetPassword })
      })
      const data = await res.json()
      if (!res.ok) {
        setResetError(data.error)
        return
      }
      setShowResetModal(false)
      setResetPassword("")
      setResetMessage("Password berhasil direset. Intern akan diminta ganti password saat login.")
    } catch {
      setResetError("Terjadi kesalahan.")
    } finally {
      setResetLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-zinc-200"
            />
          ))}
        </div>
      </main>
    )
  }

  if (fetchError || !intern) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="text-sm text-red-600">
              {fetchError || "Data intern tidak ditemukan."}
            </p>
            <Link
              href="/admin/intern"
              className="mt-3 inline-block text-sm font-medium text-zinc-700 underline underline-offset-2"
            >
              Kembali ke daftar intern
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const isFinished = intern.status === "FINISHED"

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-5xl space-y-5">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Link
            href="/admin/intern"
            className="transition hover:text-zinc-700"
          >
            Intern
          </Link>
          <span>/</span>
          <span className="text-zinc-700">{intern.name}</span>
        </div>

        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Detail Intern
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Profil dan statistik kehadiran.
            </p>
          </div>

          {!isFinished && (
            <button
              onClick={() => {
                setShowModal(true)
                setFinishError("")
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              <span>⚠</span>
              Tandai Selesai
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setResetError(""); setShowResetModal(true) }}
            className="h-8 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-1.5"
          >
            <KeyRound className="h-3 w-3" />
            Reset Password
          </Button>
          
          {intern.status === "PENDING" && (
            <button
              onClick={() => {
                setShowDeleteModal(true)
                setDeleteError("")
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
            >
              Hapus Intern
            </button>
          )}
        </div>

        {resetMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            {resetMessage}
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-start">

            {/* AVATAR */}
            <div className="shrink-0">
              {intern.profile?.photo_url ? (
                <img
                  src={intern.profile.photo_url}
                  alt={intern.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-100">
                  <span className="text-2xl font-bold text-zinc-400">
                    {intern.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1">
              {/* Nama + status */}
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-zinc-900">
                  {intern.name}
                </h2>
                <StatusBadge status={intern.status} />
              </div>

              <p className="mt-0.5 text-sm text-zinc-500">
                {intern.email}
              </p>

              {/* Grid info */}
              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">

                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Universitas
                  </p>
                  <p className="mt-0.5 text-zinc-700">
                    {intern.profile?.university || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Jurusan
                  </p>
                  <p className="mt-0.5 text-zinc-700">
                    {intern.profile?.major || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Divisi
                  </p>
                  <p className="mt-0.5 text-zinc-700">
                    {intern.division?.name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Jobdesk
                  </p>
                  <p className="mt-0.5 text-zinc-700">
                    {intern.profile?.jobdesk || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Nomor HP
                  </p>
                  <p className="mt-0.5 text-zinc-700">
                    {intern.profile?.phone || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Periode Magang
                  </p>
                  <p className="mt-0.5 text-zinc-700">
                    {formatTanggal(intern.profile?.start_date)} —{" "}
                    {formatTanggal(intern.profile?.end_date)}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wide">
            Statistik Kehadiran
          </h3>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

            {/* Hadir */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-400">Hadir</p>
              <p className="mt-1.5 text-3xl font-bold text-zinc-900">
                {intern.stats?.totalHadir ?? 0}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">hari</p>
            </div>

            {/* Izin */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-400">Izin</p>
              <p className="mt-1.5 text-3xl font-bold text-amber-600">
                {intern.stats?.totalIzin ?? 0}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">hari</p>
            </div>

            {/* Absen */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-400">Absen</p>
              <p className="mt-1.5 text-3xl font-bold text-red-500">
                {intern.stats?.totalAbsen ?? 0}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">hari</p>
            </div>

            {/* Total Sesi */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-400">Total Sesi</p>
              <p className="mt-1.5 text-3xl font-bold text-zinc-900">
                {intern.stats?.totalSesi ?? 0}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">sesi kerja</p>
            </div>

          </div>

          {/* Rata-rata */}
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">

            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Rata-rata durasi kerja</p>
              <p className="text-sm font-semibold text-zinc-900">
                {formatDurasi(intern.stats?.avgDurasi)}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Rata-rata jam masuk</p>
              <p className="text-sm font-semibold text-zinc-900">
                {formatJam(intern.stats?.avgClockIn)}
              </p>
            </div>

          </div>
        </div>

        {/* FINISHED NOTICE */}
        {isFinished && (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500">
              <span className="font-medium text-zinc-700">Intern telah selesai.</span>{" "}
              {intern.profile?.finished_early_at
                ? `Ditandai selesai pada ${formatTanggal(intern.profile.finished_early_at)}.`
                : "Periode magang sudah berakhir."}
            </p>
          </div>
        )}

      </div>

      {/* MODAL KONFIRMASI */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 md:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <span className="text-lg">⚠</span>
            </div>

            <h2 className="text-base font-semibold text-zinc-900">
              Tandai Intern Selesai?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Tindakan ini akan menghapus seluruh foto dokumentasi logbook
              dari storage secara permanen. Data teks logbook tetap tersimpan.
              Tindakan ini <strong className="text-zinc-700">tidak dapat dibatalkan</strong>.
            </p>

            {finishError && (
              <p className="mt-3 text-sm text-red-500">{finishError}</p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setShowModal(false)
                  setFinishError("")
                }}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Batal
              </button>
              <button
                onClick={handleFinish}
                disabled={finishLoading}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {finishLoading ? "Memproses..." : "Ya, Tandai Selesai"}
              </button>
            </div>

          </div>
        </div>
      )}

      <Dialog
        open={showResetModal}
        onOpenChange={open => {
          setShowResetModal(open)
          if (!open) { setResetError(""); setResetPassword("") }
        }}
      >
        <DialogContent className="sm:max-w-sm rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100">
                <KeyRound className="h-3.5 w-3.5 text-zinc-700" />
              </div>
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Intern akan diminta ganti password saat login berikutnya.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-3 mt-1">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-zinc-600">
                Password Sementara
              </Label>
              <Input
                type="password"
                placeholder="Minimal 8 karakter"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1"
                required
              />
            </div>

            {resetError && (
              <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{resetError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-zinc-200"
                onClick={() => setShowResetModal(false)}
                disabled={resetLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white"
                disabled={resetLoading}
              >
                {resetLoading ? "Mereset..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DELETE */}
      {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 md:items-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-base font-semibold text-zinc-900">
            Hapus Intern?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Akun intern akan dihapus permanen dari sistem.
            Tindakan ini <strong className="text-zinc-700">tidak dapat dibatalkan</strong>.
          </p>

          {deleteError && (
            <p className="mt-3 text-sm text-red-500">{deleteError}</p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteError("")
              }}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    )}
    </main>
  )
}