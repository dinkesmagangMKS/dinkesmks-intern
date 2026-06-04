"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Briefcase,
  CalendarRange,
  Phone,
  Lock,
  Camera,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react"
import imageCompression from "browser-image-compression"
import { sanitizeFileName, uploadFile } from "@/lib/supabase"
import { validatePassword } from "@/utils/password"

// Helpers

function formatTanggal(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  })
}

// Info Row

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-2.5 py-3 border-b border-zinc-50">
      <div className="flex h-6 w-6 items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-zinc-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-zinc-400">{label}</p>
        <p className="text-sm text-zinc-800 mt-0.5 font-medium truncate">{value || "-"}</p>
      </div>
    </div>
  )
}

// Skeleton

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {/* Avatar area */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-100 p-4">
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      {/* Info */}
      <div className="rounded-lg border border-zinc-100 p-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <Skeleton className="h-4 w-4 rounded shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Page

export default function InternProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    university: "",
    major: "",
    jobdesk: "",
    phone: "",
    start_date: "",
    end_date: ""
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")
  const [editMessage, setEditMessage] = useState("")

  const passwordValidation = validatePassword(form.new_password)

  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    setEditForm({
      university: user.profile?.university ?? "",
      major: user.profile?.major ?? "",
      jobdesk: user.profile?.jobdesk ?? "",
      phone: user.profile?.phone ?? "",
      start_date: user.profile?.start_date?.split("T")[0] ?? "",
      end_date: user.profile?.end_date?.split("T")[0] ?? ""
    })
  }, [user])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        const data = await res.json()
        setUser(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Auto-clear message
  useEffect(() => {
    if (!passwordMessage) return
    const t = setTimeout(() => setPasswordMessage(""), 4000)
    return () => clearTimeout(t)
  }, [passwordMessage])

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (form.new_password !== form.confirm_password) {
      setPasswordError("Password baru dan konfirmasi tidak sama.")
      return
    }
    if (form.new_password.length < 8) {
      setPasswordError("Password minimal 8 karakter.")
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: form.old_password,
          new_password: form.new_password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setPasswordError(data.error); return }
      setForm({ old_password: "", new_password: "", confirm_password: "" })
      setPasswordMessage("Password berhasil diubah! 🔐")
    } catch {
      setPasswordError("Terjadi kesalahan.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError("")

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (!res.ok) {
        setEditError(data.error)
        return
      }
      setIsEditing(false)
      setEditMessage("Profil berhasil diperbarui!")
      // Refresh data
      const refreshed = await fetch("/api/profile")
      const refreshedData = await refreshed.json()
      setUser(refreshedData)
    } catch {
      setEditError("Terjadi kesalahan.")
    } finally {
      setEditLoading(false)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoUploading(true)
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
      })
      const fileName = `photos/${sanitizeFileName(file.name)}`
      const photoUrl = await uploadFile(compressed, fileName)

      // Update ke database langsung
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: photoUrl })
      })

      if (res.ok) {
        // Refresh user data
        const refreshed = await fetch("/api/profile")
        const refreshedData = await refreshed.json()
        setUser(refreshedData)
      }
    } catch {
      console.error("Gagal upload foto")
    } finally {
      setPhotoUploading(false)
    }
  }

  const profile = user?.profile
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto space-y-4">

        {/*  HEADER  */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 leading-tight">Profil</h1>
            <p className="text-xs text-zinc-400">Informasi akunmu selama magang.</p>
          </div>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/*  FOTO PROFIL + IDENTITAS  */}
            <div className="rounded-lg border border-zinc-100 p-4">
              <div className="flex items-center gap-3">
                {/* Avatar + tombol ganti foto */}
                <div className="relative shrink-0">
                  {profile?.photo_url ? (
                    <Image
                      src={profile.photo_url}
                      alt={user?.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-lg font-semibold">
                      {initials}
                    </div>
                  )}

                  <label className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-zinc-900 border-2 border-white hover:bg-zinc-700 transition-colors">
                    {photoUploading ? (
                      <div className="h-2.5 w-2.5 animate-spin rounded-full border border-white border-t-transparent" />
                    ) : (
                      <Camera className="h-2.5 w-2.5 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                      disabled={photoUploading}
                    />
                  </label>
                </div>

                <div>
                  <p className="text-base font-semibold text-zinc-900 leading-tight">{user?.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white">
                      {user?.role ?? "INTERN"}
                    </span>
                    {user?.division?.name && (
                      <span className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-500">
                        <Building2 className="h-2.5 w-2.5" />
                        {user.division.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/*  INFO LENGKAP  */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-700">Informasi</span>
                <button
                  onClick={() => { setIsEditing(!isEditing); setEditError("") }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  {isEditing ? "Batal" : "Edit"}
                </button>
              </div>

              {editMessage && (
                <div className="flex items-center gap-2 mx-4 mt-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  {editMessage}
                </div>
              )}

              {!isEditing ? (
                // VIEW MODE
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
                  <InfoRow icon={Mail}          label="Email"       value={user?.email} />
                  <InfoRow icon={GraduationCap} label="Universitas" value={profile?.university} />
                  <InfoRow icon={BookOpen}      label="Jurusan"     value={profile?.major} />
                  <InfoRow icon={Briefcase}     label="Jobdesk"     value={profile?.jobdesk} />
                  <InfoRow icon={Phone}         label="No. HP"      value={profile?.phone} />
                  <InfoRow
                    icon={CalendarRange}
                    label="Periode Magang"
                    value={
                      profile?.start_date && profile?.end_date
                        ? `${formatTanggal(profile.start_date)} – ${formatTanggal(profile.end_date)}`
                        : null
                    }
                  />
                </div>
              ) : (
                // EDIT MODE
                <form onSubmit={handleEdit} className="p-4 space-y-3">
                  {[
                    { id: "university", label: "Universitas", placeholder: "Nama universitas" },
                    { id: "major",      label: "Jurusan",     placeholder: "Program studi" },
                    { id: "jobdesk",    label: "Jobdesk",     placeholder: "Tugas utama" },
                    { id: "phone",      label: "No. HP",      placeholder: "08xx" },
                  ].map(f => (
                    <div key={f.id} className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">{f.label}</Label>
                      <Input
                        value={editForm[f.id as keyof typeof editForm]}
                        onChange={e => setEditForm({ ...editForm, [f.id]: e.target.value })}
                        placeholder={f.placeholder}
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1"
                      />
                    </div>
                  ))}

                  {/* Periode — disabled kalau FINISHED */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Tanggal Mulai</Label>
                      <Input
                        type="date"
                        value={editForm.start_date}
                        onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                        disabled={profile?.finished_early_at !== null && profile?.finished_early_at !== undefined}
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Tanggal Selesai</Label>
                      <Input
                        type="date"
                        value={editForm.end_date}
                        onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                        disabled={profile?.finished_early_at !== null && profile?.finished_early_at !== undefined}
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {profile?.finished_early_at && (
                    <p className="text-[11px] text-zinc-400">
                      Periode magang tidak bisa diubah karena sudah ditandai selesai.
                    </p>
                  )}

                  {editError && (
                    <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <AlertDescription className="text-xs">{editError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    disabled={editLoading}
                    className="w-full h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white"
                  >
                    {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </form>
              )}
            </div>

            {/*  GANTI PASSWORD  */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-medium text-zinc-700">Ganti Password</span>
              </div>

              <form onSubmit={handlePassword} className="p-4 space-y-3">
                {passwordMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    {passwordMessage}
                  </div>
                )}

                {[
                  { id: "old_password",     label: "Password Lama",         placeholder: "Masukkan password lama" },
                  { id: "new_password",     label: "Password Baru",         placeholder: "Minimal 8 karakter" },
                  { id: "confirm_password", label: "Konfirmasi Password Baru", placeholder: "Ulangi password baru" },
                ].map(f => (
                  <div key={f.id} className="space-y-1">
                    <Label className="text-xs font-medium text-zinc-600">{f.label}</Label>
                    <Input
                      type="password"
                      placeholder={f.placeholder}
                      value={form[f.id as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                      className="h-8 text-sm border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1"
                      required
                    />
                  </div>
                ))}

                {form.new_password && !passwordValidation.valid && (
                  <ul className="space-y-0.5 mt-1">
                    {passwordValidation.errors.map(err => (
                      <li key={err} className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-zinc-300 shrink-0" />
                        {err}
                      </li>
                    ))}
                  </ul>
                )}

                {form.new_password && passwordValidation.valid && (
                  <p className="text-[11px] text-zinc-400 mt-1">Password kuat</p>
                )}

                {passwordError && (
                  <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <AlertDescription className="text-xs">{passwordError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="sm"
                  disabled={passwordLoading}
                  className="w-full h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white gap-1.5"
                >
                  <Lock className="h-3 w-3" />
                  {passwordLoading ? "Menyimpan..." : "Ubah Password"}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  )
}