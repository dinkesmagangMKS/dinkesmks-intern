"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

import {
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
  Check,
  X,
} from "lucide-react"
import imageCompression from "browser-image-compression"
import { sanitizeFileName, uploadFile } from "@/lib/supabase"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// TypeScript Interfaces untuk kebersihan kode
interface UserProfile {
  university?: string
  major?: string
  jobdesk?: string
  phone?: string
  start_date?: string
  end_date?: string
  photo_url?: string
  finished_early_at?: string | null
}

interface UserData {
  name: string
  email: string
  role?: string
  division?: {
    name: string
  }
  profile?: UserProfile
}

function formatTanggal(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  })
}

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-2.5 py-3 border-b border-zinc-50">
      <div className="flex h-6 w-6 items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-zinc-700 mt-0.5 font-semibold truncate">{value || "-"}</p>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3 rounded-lg border border-zinc-100 p-4">
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
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

export default function InternProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const [showPasswordModal, setShowPasswordModal] = useState(false)

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
  const [photoUploading, setPhotoUploading] = useState(false)

  // Validasi objek kriteria dinamis (Sinkronisasi Onboard)
  const pwd = form.new_password
  const criteria = {
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
  }

  const isPasswordValid = criteria.minLength && criteria.hasUppercase && criteria.hasLowercase && criteria.hasNumber

  // Sinkronisasi form edit saat data user berhasil dimuat
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

  // Fetch data awal
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

  // Auto-clear password success message
  useEffect(() => {
    if (!passwordMessage) return
    const t = setTimeout(() => setPasswordMessage(""), 4000)
    return () => clearTimeout(t)
  }, [passwordMessage])

  // Auto-clear profil edit success message
  useEffect(() => {
    if (!editMessage) return
    const t = setTimeout(() => setEditMessage(""), 4000)
    return () => clearTimeout(t)
  }, [editMessage])

  const handleTriggerPasswordModal = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (!isPasswordValid) {
      setPasswordError("Password baru belum memenuhi kriteria standar keamanan.")
      return
    }

    if (form.new_password !== form.confirm_password) {
      setPasswordError("Password baru dan konfirmasi password tidak sama.")
      return
    }

    setShowPasswordModal(true)
  }

  const handleConfirmPassword = async () => {
    setPasswordError("")
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
      if (!res.ok) { 
        setPasswordError(data.error || "Gagal memperbarui password.")
        setShowPasswordModal(false) 
        return 
      }
      
      setForm({ old_password: "", new_password: "", confirm_password: "" })
      setPasswordMessage("Password berhasil diubah!")
      setShowPasswordModal(false)
    } catch {
      setPasswordError("Terjadi kesalahan jaringan.")
      setShowPasswordModal(false)
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
        setEditError(data.error || "Gagal memperbarui profil.")
        return
      }
      setIsEditing(false)
      setEditMessage("Profil berhasil diperbarui!")
      
      if (data.user) {
        setUser(data.user)
      } else {
        const refreshed = await fetch("/api/profile")
        const refreshedData = await refreshed.json()
        setUser(refreshedData)
      }
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

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: photoUrl })
      })

      if (res.ok) {
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

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <Label className="text-xs font-medium text-zinc-600">
      {children} <span className="text-red-500 font-bold">*</span>
    </Label>
  )

  const passwordInputClasses = "h-8 text-sm border-zinc-200 focus-visible:ring-1 focus-visible:ring-[#2d5a1b] focus-visible:border-[#2d5a1b] focus:bg-[#f4f9f1] autofill:shadow-[inset_0_0_0_1000px_#f4f9f1] transition-all"

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto space-y-4 max-w-4xl">

        {/* HEADER */}
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2d5a1b] tracking-tight leading-tight">Profil</h1>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">Informasi akunmu selama magang.</p>
          </div>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* FOTO PROFIL + IDENTITAS */}
            <div className="rounded-lg border border-zinc-100 p-4 bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {profile?.photo_url ? (
                    <Image
                      src={profile.photo_url}
                      alt={user?.name || "Avatar"}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover border border-zinc-200"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-lg font-bold">
                      {initials}
                    </div>
                  )}

                  <label className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#2d5a1b] border-2 border-white hover:bg-[#204013] transition-colors shadow-sm">
                    {photoUploading ? (
                      <div className="h-2 w-2 animate-spin rounded-full border border-white border-t-transparent" />
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
                  <p className="text-base font-bold text-zinc-800 leading-tight">{user?.name}</p>
                  <p className="text-xs font-medium text-zinc-400 mt-0.5">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded bg-[#2d5a1b] px-2 py-0.5 text-[10px] font-bold text-white tracking-wide">
                      {user?.role ?? "INTERN"}
                    </span>
                    {user?.division?.name && (
                      <span className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 shadow-sm">
                        <Building2 className="h-2.5 w-2.5 text-[#2d5a1b]" />
                        {user.division.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* INFO LENGKAP */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#2d5a1b] tracking-wide">Informasi Akun</span>
                <button
                  onClick={() => { setIsEditing(!isEditing); setEditError("") }}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-[#2d5a1b] transition-colors cursor-pointer"
                >
                  {isEditing ? "Batal" : "Edit Profil"}
                </button>
              </div>

              {editMessage && (
                <div className="flex items-center gap-2 mx-4 mt-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-xs text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  {editMessage}
                </div>
              )}

              {!isEditing ? (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
                  <InfoRow icon={Mail}           label="Email"       value={user?.email} />
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
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-[#2d5a1b] focus-visible:ring-1"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Tanggal Mulai</Label>
                      <Input
                        type="date"
                        value={editForm.start_date}
                        onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                        disabled={profile?.finished_early_at !== null && profile?.finished_early_at !== undefined}
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-[#2d5a1b] focus-visible:ring-1 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-zinc-600">Tanggal Selesai</Label>
                      <Input
                        type="date"
                        value={editForm.end_date}
                        onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                        disabled={profile?.finished_early_at !== null && profile?.finished_early_at !== undefined}
                        className="h-8 text-sm border-zinc-200 focus-visible:ring-[#2d5a1b] focus-visible:ring-1 disabled:opacity-50"
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
                    className="w-full h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white font-medium shadow-sm transition-colors cursor-pointer"
                  >
                    {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </form>
              )}
            </div>

            {/* GANTI PASSWORD */}
            <div className="rounded-lg border border-zinc-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="text-xs font-bold text-[#2d5a1b] tracking-wide">Keamanan Akun</span>
              </div>

              <form onSubmit={handleTriggerPasswordModal} className="p-4 space-y-3">
                {passwordMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-xs text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    {passwordMessage}
                  </div>
                )}

                <div className="space-y-1">
                  <RequiredLabel>Password Lama</RequiredLabel>
                  <Input
                    type="password"
                    placeholder="Masukkan password lama"
                    value={form.old_password}
                    onChange={e => setForm({ ...form, old_password: e.target.value })}
                    className={passwordInputClasses}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <RequiredLabel>Password Baru</RequiredLabel>
                  <Input
                    type="password"
                    placeholder="Masukkan password baru Anda"
                    value={form.new_password}
                    onChange={e => setForm({ ...form, new_password: e.target.value })}
                    className={passwordInputClasses}
                    required
                  />
                  
                  {/* BLOK KRITERIA PASSWORD INTERAKTIF (ONBOARD SYNC) */}
                  {form.new_password && (
                    <div className="mt-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 space-y-1.5 text-left">
                      <div className="flex items-center justify-between border-b border-zinc-200/60 pb-1.5 mb-1">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          Kriteria Password
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isPasswordValid ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                          {isPasswordValid ? "Memenuhi Syarat" : "Belum Sesuai"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-medium text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          {criteria.minLength ? <Check className="h-3 w-3 text-emerald-600 stroke-[3]" /> : <X className="h-3 w-3 text-zinc-300" />}
                          <span className={criteria.minLength ? "text-emerald-600" : ""}>Minimal 8 karakter</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {criteria.hasUppercase ? <Check className="h-3 w-3 text-emerald-600 stroke-[3]" /> : <X className="h-3 w-3 text-zinc-300" />}
                          <span className={criteria.hasUppercase ? "text-emerald-600" : ""}>Harus ada huruf besar (A-Z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {criteria.hasLowercase ? <Check className="h-3 w-3 text-emerald-600 stroke-[3]" /> : <X className="h-3 w-3 text-zinc-300" />}
                          <span className={criteria.hasLowercase ? "text-emerald-600" : ""}>Harus ada huruf kecil (a-z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {criteria.hasNumber ? <Check className="h-3 w-3 text-emerald-600 stroke-[3]" /> : <X className="h-3 w-3 text-zinc-300" />}
                          <span className={criteria.hasNumber ? "text-emerald-600" : ""}>Harus mengandung angka (0-9)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <RequiredLabel>Konfirmasi Password Baru</RequiredLabel>
                  <Input
                    type="password"
                    placeholder="Sama dengan kolom di atas"
                    value={form.confirm_password}
                    onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                    className={passwordInputClasses}
                    required
                  />
                  {form.confirm_password && (
                    <p className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${form.new_password === form.confirm_password ? "text-emerald-600" : "text-red-500"}`}>
                      {form.new_password === form.confirm_password ? "✓ Password terverifikasi cocok" : "✕ Password tidak sesuai"}
                    </p>
                  )}
                </div>

                {passwordError && (
                  <Alert variant="destructive" className="border-red-100 bg-red-50 py-2 px-3">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <AlertDescription className="text-xs">{passwordError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="sm"
                  className="w-full h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white font-medium gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Lock className="h-3 w-3" />
                  Ubah Password
                </Button>
              </form>
            </div>

            {/* MODAL SHADCN DIALOG KONFIRMASI PASSWORD */}
            <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
              <DialogContent className="sm:max-w-xs rounded-xl p-5">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2d5a1b]/10">
                      <Lock className="h-3.5 w-3.5 text-[#2d5a1b]" />
                    </div>
                    Ubah Password Akun?
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-400 mt-1">
                    Anda akan memperbarui password akses akun ini. Pastikan Anda mengingat password baru yang telah dibuat ya.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs border-zinc-200 cursor-pointer"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={passwordLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white font-medium cursor-pointer"
                    onClick={handleConfirmPassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Proses..." : "Ya, Ubah"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </main>
  )
}