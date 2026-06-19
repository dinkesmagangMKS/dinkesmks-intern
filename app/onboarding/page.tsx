"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import imageCompression from "browser-image-compression"
import { sanitizeFileName, uploadFile } from "@/lib/supabase"
import { validatePassword } from "@/utils/password"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    university: "",
    major: "",
    jobdesk: "",
    phone: "",
    start_date: "",
    end_date: "",
    old_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "error" | "success" | ""; message: string }>({
    type: "",
    message: "",
  })

  const passwordValidation = validatePassword(form.new_password)
  const strengthMessage = form.new_password
    ? (passwordValidation.valid ? "Kuat" : "Belum memenuhi semua kriteria keamanan")
    : ""

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleUploadPhoto = async (file: File): Promise<string> => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    })

    const fileName = `photos/${sanitizeFileName(file.name)}`
    return await uploadFile(compressed, fileName)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: "", message: "" })

    if (!passwordValidation.valid) {
      setStatus({ type: "error", message: "Password baru belum memenuhi kriteria standar keamanan." })
      setLoading(false)
      return
    }

    if (form.new_password !== form.confirm_password) {
      setStatus({ type: "error", message: "Password baru dan konfirmasi password tidak sama." })
      setLoading(false)
      return
    }

    try {
      let photoUrl = null
      if (photo !== null) {
        photoUrl = await handleUploadPhoto(photo)
      }

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university: form.university,
          major: form.major,
          jobdesk: form.jobdesk,
          phone: form.phone || null, // Dikirim null jika kosong
          start_date: form.start_date,
          end_date: form.end_date,
          old_password: form.old_password,
          password: form.new_password,
          photo_url: photoUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirimkan data onboarding.")
      }

      setStatus({ type: "success", message: "Onboarding berhasil! Mengalihkan halaman..." })
      
      setTimeout(() => {
        router.push("/intern/dashboard")
      }, 1500)
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Terjadi kesalahan sistem." })
      setLoading(false)
    }
  }

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-semibold text-zinc-600">
      {children} <span className="text-red-500 font-bold">*</span>
    </label>
  )

  const inputClasses = "w-full h-10 rounded-xl border-2 border-zinc-200 bg-white px-4 text-sm placeholder-zinc-400 outline-none transition-all duration-200 focus:bg-[#f4f9f1] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-sm"

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/50">
        
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2d5a1b]">
            Lengkapi Profil Intern
          </h1>
          <p className="mt-1 text-xs font-medium text-zinc-400">
            Silakan masukkan data riwayat instansi dan perbarui kredensial akun magang Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* FOTO PROFIL */}
          <div className="space-y-2">
            <div>
              <h2 className="text-sm font-bold text-[#2d5a1b]">Foto Resmi Profil</h2>
              <p className="text-xs text-zinc-400">Gunakan format gambar standar (JPG, PNG) maksimum 5MB.</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setPhoto(e.target.files[0])
              }}
              className="block w-full rounded-xl border-2 border-zinc-100 bg-zinc-50/50 p-2 text-xs text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#2d5a1b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#204013] transition-colors cursor-pointer"
            />
          </div>

          <hr className="border-zinc-100" />

          {/* DATA DIRI */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#2d5a1b]">Data Akademik & Instansi</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <FieldLabel>Universitas / Institusi</FieldLabel>
                <input type="text" name="university" required placeholder="Contoh: Universitas Hasanuddin" value={form.university} onChange={handleChange} className={inputClasses} />
              </div>
              <div className="space-y-1">
                <FieldLabel>Program Studi / Jurusan</FieldLabel>
                <input type="text" name="major" required placeholder="Contoh: Teknik Informatika" value={form.major} onChange={handleChange} className={inputClasses} />
              </div>
              <div className="space-y-1">
                <FieldLabel>Posisi / Jobdesk Magang</FieldLabel>
                <input type="text" name="jobdesk" required placeholder="Contoh: Data Analyst Intern" value={form.jobdesk} onChange={handleChange} className={inputClasses} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600">Nomor WhatsApp (Opsional)</label>
                <input type="text" name="phone" placeholder="Contoh: 081234567xxx" value={form.phone} onChange={handleChange} className={inputClasses} />
              </div>
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* PERIODE MAGANG */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#2d5a1b]">Durasi Penugasan Kontrak</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <FieldLabel>Tanggal Mulai Magang</FieldLabel>
                <input type="date" name="start_date" required value={form.start_date} onChange={handleChange} className={inputClasses} />
              </div>
              <div className="space-y-1">
                <FieldLabel>Tanggal Selesai Magang</FieldLabel>
                <input type="date" name="end_date" required value={form.end_date} onChange={handleChange} className={inputClasses} />
              </div>
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* PRIVASI & AKSES */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#2d5a1b]">Keamanan Otentikasi</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <FieldLabel>Password Default (Dari Admin)</FieldLabel>
                <input type="password" name="old_password" required placeholder="Masukkan password sementara Anda" value={form.old_password} onChange={handleChange} className={inputClasses} />
              </div>
              
              <div className="space-y-1">
                <FieldLabel>Buat Password Baru</FieldLabel>
                <input type="password" name="new_password" required placeholder="Gunakan minimal 8 karakter unik" value={form.new_password} onChange={handleChange} className={inputClasses} />
                {strengthMessage && (
                  <p className={`text-[11px] font-medium mt-1 ${strengthMessage.includes("Kuat") ? "text-emerald-600" : "text-red-500"}`}>
                    {strengthMessage}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <FieldLabel>Konfirmasi Ulang Password Baru</FieldLabel>
                <input type="password" name="confirm_password" required placeholder="Sama dengan kolom di atas" value={form.confirm_password} onChange={handleChange} className={inputClasses} />
                {form.confirm_password && (
                  <p className={`text-[11px] font-medium mt-1 ${form.new_password === form.confirm_password ? "text-emerald-600" : "text-red-500"}`}>
                    {form.new_password === form.confirm_password ? "✓ Password terverifikasi cocok" : "Password tidak sesuai"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* VISUAL FEEDBACK ALERT */}
          {status.message && (
            <Alert variant={status.type === "error" ? "destructive" : "default"} className={`py-2 px-3 border ${status.type === "error" ? "border-red-100 bg-red-50" : "border-emerald-100 bg-emerald-50/50"}`}>
              {status.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              <AlertDescription className={`text-xs ${status.type === "error" ? "text-red-800" : "text-emerald-800"}`}>
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-xl bg-[#2d5a1b] text-sm font-bold text-white transition-all hover:bg-[#204013] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses Profil...
              </>
            ) : (
              "Selesaikan Aktivasi Akun"
            )}
          </button>
        </form>
      </div>
    </main>
  )
}