"use client"

import React from "react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

import {
  Lock,
  Camera,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react"
import imageCompression from "browser-image-compression"
import { sanitizeFileName, uploadFile } from "@/lib/supabase"
import { validatePassword } from "@/utils/password"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Definisikan Interface Tipe Data untuk Keamanan TypeScript
interface UserProfile {
  photo_url?: string
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
        {Array.from({ length: 2 }).map((_, i) => (
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

export default function AdminProfilePage() {
  // Menggunakan interface daripada 'any'
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
  const [photoUploading, setPhotoUploading] = useState(false)

  const passwordValidation = validatePassword(form.new_password)
  const strengthMessage = form.new_password
    ? (passwordValidation.valid ? "Kuat" : "Belum memenuhi semua kriteria")
    : ""

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

  useEffect(() => {
    if (!passwordMessage) return
    const t = setTimeout(() => setPasswordMessage(""), 4000)
    return () => clearTimeout(t)
  }, [passwordMessage])

  const handleTriggerPasswordModal = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (form.new_password !== form.confirm_password) {
      setPasswordError("Password baru dan konfirmasi tidak sama.")
      return
    }
    if (!passwordValidation.valid) {
      setPasswordError("Password baru belum memenuhi semua kriteria keamanan.")
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
        setPasswordError(data.error || "Gagal mengubah password.")
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
      } else {
        setPasswordError("Gagal memperbarui foto profil di server.")
      }
    } catch {
      setPasswordError("Gagal memproses atau mengunggah foto.")
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

  // Class utility yang sekarang dipasang di komponen Input
  const passwordInputClasses = "h-8 text-sm border-zinc-200 focus-visible:ring-1 focus-visible:ring-[#2d5a1b] focus-visible:border-[#2d5a1b] focus:bg-[#f4f9f1] autofill:shadow-[inset_0_0_0_1000px_#f4f9f1] transition-all"

  return (
    <main className="min-h-screen bg-white p-5">
      <div className="mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2d5a1b] tracking-tight leading-tight">Profil Admin</h1>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">Informasi kendali akun administrator sistem.</p>
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
                      alt={user?.name ?? "Admin"}
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
                      {user?.role ?? "ADMIN"}
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
                    placeholder="Minimal 8 karakter"
                    value={form.new_password}
                    onChange={e => setForm({ ...form, new_password: e.target.value })}
                    className={passwordInputClasses}
                    required
                  />
                  {strengthMessage && (
                    <p className={`text-[11px] font-medium mt-1 ${strengthMessage.includes("Kuat") ? "text-emerald-600" : "text-red-500"}`}>
                      {strengthMessage}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <RequiredLabel>Konfirmasi Password Baru</RequiredLabel>
                  <Input
                    type="password"
                    placeholder="Ulangi password baru"
                    value={form.confirm_password}
                    onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                    className={passwordInputClasses}
                    required
                  />
                  {form.confirm_password && (
                    <p className={`text-[11px] font-medium mt-1 ${form.new_password === form.confirm_password ? "text-emerald-600" : "text-red-500"}`}>
                      {form.new_password === form.confirm_password ? "✓ Password cocok" : "Password tidak sama"}
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

            {/* MODAL SHADCN DIALOG */}
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