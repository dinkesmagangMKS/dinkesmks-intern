"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  User,
  Lock,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react"
import { validatePassword } from "@/utils/password"

// Skeleton
function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-zinc-100 p-4">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-16 rounded mt-1" />
        </div>
      </div>
      <div className="rounded-lg border border-zinc-100 p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-8 w-full rounded-md mt-1" />
      </div>
    </div>
  )
}

// Main Page
export default function AdminProfilePage() {
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
  const passwordValidation = validatePassword(form.new_password)

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


  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <main className="min-h-fit bg-white p-5">
      <div className="mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex items-center gap-2.5">
          {/* Ikon logo header dihapus sesuai permintaan */}
          <div>
            <h1 className="text-base font-semibold text-[#2d5a1b] leading-tight">Profil</h1>
            <p className="text-xs text-zinc-400">Informasi dan pengaturan akunmu.</p>
          </div>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* INFO AKUN */}
            <div className="rounded-lg border border-zinc-100 p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 text-[#2d5a1b] text-base font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{user?.name}</p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center rounded bg-[#2d5a1b] px-2 py-0.5 text-[11px] font-medium text-white">
                    {user?.role ?? "ADMIN"}
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

            {/* GANTI PASSWORD */}
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
                  { id: "old_password",     label: "Password Lama",            placeholder: "Masukkan password lama" },
                  { id: "new_password",     label: "Password Baru",            placeholder: "Minimal 8 karakter" },
                  { id: "confirm_password", label: "Konfirmasi Password Baru", placeholder: "Ulangi password baru" },
                ].map(f => (
                  <div key={f.id} className="space-y-1">
                    <Label className="text-xs font-medium text-zinc-600">{f.label}</Label>
                    <Input
                      type="password"
                      placeholder={f.placeholder}
                      value={form[f.id as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                      className="h-8 text-sm border-zinc-200 focus-visible:ring-[#2d5a1b] focus-visible:ring-1"
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
                  className="w-full h-8 text-xs bg-[#2d5a1b] hover:bg-[#204013] text-white gap-1.5"
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