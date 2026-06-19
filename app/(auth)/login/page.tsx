"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Email atau kata sandi salah.")
        return
      }

      localStorage.setItem("user_role", data.role)

      if (data.role === "INTERN") {
        if (data.isFirstLogin) {
          router.push("/onboarding")
        } else {
          router.push("/intern/dashboard")
        }
      } else {
        router.push("/admin/dashboard")
      }

    } catch {
      setError("Terjadi kesalahan. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/80">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3 flex h-14 w-14 items-center justify-center relative">
            <Image 
              src="/logo.png" 
              alt="Logo Dinas Kesehatan"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            Dinas Kesehatan Kota Makassar
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Sistem Manajemen Magang
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Kolom Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 tracking-wide block text-left">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 border border-zinc-200 bg-white rounded-lg px-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
              placeholder="nama@email.com"
              required
            />
          </div>

          {/* Kolom Kata Sandi */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 tracking-wide block text-left">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 border border-zinc-200 bg-white rounded-lg pl-3 pr-10 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* TULISAN KECIL MERAH DI BAWAH PASSWORD */}
            {error && (
              <div className="flex items-center gap-1.5 text-red-600 text-[11px] mt-1 animate-in fade-in duration-200 text-left">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#2d5a1b] text-white text-xs font-medium rounded-lg hover:bg-[#204013] active:bg-[#18300e] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_2px_4px_0_rgba(45,90,27,0.15)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Masuk"
            )}
          </button>

        </form>
      </div>
    </div>
  )
}