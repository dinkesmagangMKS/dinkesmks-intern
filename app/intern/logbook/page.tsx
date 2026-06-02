"use client"

import { sanitizeFileName, uploadFile } from "@/lib/supabase"
import imageCompression from "browser-image-compression"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dialog"

import {
  BookOpen,
  History,
  ImageIcon,
  X,
  Pencil,
  AlertCircle,
  CheckCircle2,
  FileImage,
  Trash2,
} from "lucide-react"

// Helpers

function formatTanggal(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  })
}

// Skeleton

function RiwayatSkeleton() {
  return (
    <div className="divide-y divide-zinc-50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start justify-between px-4 py-3">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-full max-w-xs" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-6 w-12 rounded ml-4 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// Main Page─

export default function LogbookInternPage() {
  const [tab, setTab] = useState<"isi" | "riwayat">("isi")
  const [logbooks, setLogbooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitMessage, setSubmitMessage] = useState("")

  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLogbook, setSelectedLogbook] = useState<any>(null)
  const [editForm, setEditForm] = useState({ description: "", documentation: "" })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchLogbooks = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/logbooks")
      const data = await res.json()
      setLogbooks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogbooks() }, [])

  // Auto-clear message
  useEffect(() => {
    if (!submitMessage) return
    const t = setTimeout(() => setSubmitMessage(""), 4000)
    return () => clearTimeout(t)
  }, [submitMessage])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setPhoto(file)
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    } else {
      setPhotoPreview(null)
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError("")

    try {
      let photoUrl = null

      if (photo) {
        const compressed = await imageCompression(photo, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        })
        const fileName = `logbooks/${sanitizeFileName(photo.name)}`
        photoUrl = await uploadFile(compressed, fileName)
      }

      const res = await fetch("/api/logbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          description: form.description,
          documentation: photoUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error); return }

      setForm({ date: new Date().toISOString().split("T")[0], description: "" })
      setPhoto(null)
      setPhotoPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setSubmitMessage("Logbook berhasil disimpan! 📝")
      setTab("riwayat")
      fetchLogbooks()
    } catch {
      setSubmitError("Terjadi kesalahan.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError("")

    try {
      const res = await fetch(`/api/logbooks/${selectedLogbook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await res.json()
      if (!res.ok) { setEditError(data.error); return }

      setShowEditModal(false)
      fetchLogbooks()
    } catch {
      setEditError("Terjadi kesalahan.")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    setDeleteError("")
    try {
      const res = await fetch(`/api/logbooks/${selectedLogbook.id}`, {
        method: "DELETE"
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error)
        return
      }
      setShowDeleteModal(false)
      setSelectedLogbook(null)
      fetchLogbooks()
    } catch {
      setDeleteError("Terjadi kesalahan.")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto space-y-4">

        {/*  HEADER  */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 leading-tight">Logbook</h1>
            <p className="text-xs text-zinc-400">Catat aktivitas harianmu selama magang.</p>
          </div>
        </div>

        {/*  SUCCESS MESSAGE  */}
        {submitMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            {submitMessage}
          </div>
        )}

        {/*  TOGGLE TAB  */}
        <div className="flex items-center gap-1 rounded-lg bg-zinc-50 border border-zinc-100 p-1">
          {([
            { key: "isi",     label: "Isi Logbook",  icon: BookOpen  },
            { key: "riwayat", label: "Riwayat",       icon: History   },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === key
                  ? "bg-white text-zinc-900 shadow-sm border border-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>

        {/*  TAB ISI LOGBOOK  */}
        {tab === "isi" && (
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Tanggal */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-zinc-600">Tanggal</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1"
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-zinc-600">Deskripsi Kegiatan</Label>
              <Textarea
                placeholder="Ceritain apa aja yang kamu kerjain hari ini..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1 min-h-25 resize-none"
                required
              />
            </div>

            {/* Upload foto */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-zinc-600">Foto Dokumentasi</Label>

              {!photoPreview ? (
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 cursor-pointer hover:bg-zinc-100 transition-colors">
                  <ImageIcon className="h-5 w-5 text-zinc-300" />
                  <span className="text-xs text-zinc-400">Klik untuk pilih foto</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-zinc-100">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-[10px] text-white">
                    {photo?.name}
                  </div>
                </div>
              )}
            </div>

            {submitError && (
              <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{submitError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={submitLoading}
              className="w-full h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              {submitLoading ? "Menyimpan..." : "Simpan Logbook"}
            </Button>
          </form>
        )}

        {/*  TAB RIWAYAT  */}
        {tab === "riwayat" && (
          <div className="rounded-lg border border-zinc-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
              <span className="text-xs font-medium text-zinc-700">Riwayat Logbook</span>
              <span className="text-[11px] text-zinc-400">{logbooks.length} entri</span>
            </div>

            {loading ? (
              <RiwayatSkeleton />
            ) : logbooks.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-12 text-zinc-300">
                <BookOpen className="h-6 w-6" />
                <p className="text-xs">Belum ada logbook nih.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {logbooks.map((lb: any) => (
                  <div
                    key={lb.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    {/* Foto thumbnail */}
                    <div className="shrink-0 mt-0.5">
                      {lb.documentation ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={lb.documentation}
                          alt="Dokumentasi"
                          className="h-10 w-10 rounded-md object-cover border border-zinc-100"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-zinc-100 border border-zinc-100 flex items-center justify-center">
                          <FileImage className="h-4 w-4 text-zinc-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-zinc-500">
                        {formatTanggal(lb.date)}
                      </p>
                      <p className="text-sm text-zinc-800 mt-0.5 leading-snug line-clamp-2">
                        {lb.description}
                      </p>
                      {lb.documentation && (
                        <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                          <ImageIcon className="h-2.5 w-2.5" />
                          Ada foto
                        </p>
                      )}
                    </div>

                    {/* Tombol edit */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLogbook(lb)
                        setEditForm({ description: lb.description, documentation: lb.documentation ?? "" })
                        setEditError("")
                        setShowEditModal(true)
                      }}
                      className="h-6 px-2 text-[11px] border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 shrink-0 gap-1"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                      Edit
                    </Button>

                    {/* Tombol Hapus */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLogbook(lb)
                        setDeleteError("")
                        setShowDeleteModal(true)
                      }}
                      className="h-6 px-2 text-[11px] border-zinc-200 text-zinc-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shrink-0 gap-1"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/*  MODAL EDIT  */}
      <Dialog
        open={showEditModal}
        onOpenChange={open => {
          setShowEditModal(open)
          if (!open) { setSelectedLogbook(null); setEditError("") }
        }}
      >
        <DialogContent className="sm:max-w-sm rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100">
                <Pencil className="h-3.5 w-3.5 text-zinc-700" />
              </div>
              Edit Logbook
            </DialogTitle>
          </DialogHeader>

          {selectedLogbook && (
            <p className="text-[11px] text-zinc-400 -mt-1">
              {formatTanggal(selectedLogbook.date)}
            </p>
          )}

          <form onSubmit={handleEdit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-zinc-600">Deskripsi</Label>
              <Textarea
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1 min-h-22.5 resize-none"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-zinc-600">URL Foto</Label>
              <Input
                value={editForm.documentation}
                onChange={e => setEditForm({ ...editForm, documentation: e.target.value })}
                placeholder="https://..."
                className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1"
              />
              {editForm.documentation && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editForm.documentation}
                  alt="Preview"
                  className="mt-1.5 w-full max-h-32 object-cover rounded-lg border border-zinc-100"
                  onError={e => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            {editError && (
              <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{editError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-zinc-200"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white"
                disabled={editLoading}
              >
                {editLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteModal}
        onOpenChange={open => {
          setShowDeleteModal(open)
          if (!open) { setSelectedLogbook(null); setDeleteError("") }
        }}
      >
        <DialogContent className="sm:max-w-xs rounded-xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50">
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </div>
              Hapus Logbook?
            </DialogTitle>
          </DialogHeader>

          {selectedLogbook && (
            <p className="text-xs text-zinc-500 -mt-1">
              {formatTanggal(selectedLogbook.date)}
            </p>
          )}

          <p className="text-xs leading-relaxed text-zinc-500">
            Logbook dan foto dokumentasinya akan dihapus permanen.
            Tindakan ini <strong className="text-zinc-700">tidak dapat dibatalkan</strong>.
          </p>

          {deleteError && (
            <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">{deleteError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs border-zinc-200"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}