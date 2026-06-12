"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import imageCompression from "browser-image-compression"
import { sanitizeFileName, uploadFile } from "@/lib/supabase"
import { validatePassword } from "@/utils/password"

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
  const [message, setMessage] = useState("")

  const passwordValidation = validatePassword(form.new_password)

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
      useWebWorker: true
    })

    const fileName = `photos/${sanitizeFileName(file.name)}`
    const photoUrl = await uploadFile(compressed, fileName)
    return photoUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setMessage("")

    if (form.new_password.length < 8) {
      setMessage("Password minimal 8 karakter")
      setLoading(false)
      return
    }

    if (form.new_password !== form.confirm_password) {
      setMessage("Password baru dan konfirmasi password tidak sama")
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          university: form.university,
          major: form.major,
          jobdesk: form.jobdesk,
          phone: form.phone,
          start_date: form.start_date,
          end_date: form.end_date,
          old_password: form.old_password,
          password: form.new_password,
          photo_url: photoUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal submit onboarding")
      }

      setMessage("Onboarding berhasil!")
      router.push("/intern/dashboard")
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        
        {/* HEADER — Warna teks diubah ke hijau instansi */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2d5a1b]">
            Lengkapi Profil
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Lengkapi data diri untuk melanjutkan ke dashboard intern.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* FOTO — Header seksi warna hijau */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#2d5a1b]">
                Foto Profil
              </h2>

              <p className="text-sm text-zinc-500">
                Upload foto profil formal atau semi formal.
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setPhoto(e.target.files[0])
                }
              }}
              className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#2d5a1b] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#204013] transition-colors"
            />
          </section>

          {/* DATA DIRI — Header seksi warna hijau */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#2d5a1b]">
                Data Diri
              </h2>

              <p className="text-sm text-zinc-500">
                Informasi dasar peserta magang.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <input
                type="text"
                name="university"
                placeholder="Universitas"
                value={form.university}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
              />

              <input
                type="text"
                name="major"
                placeholder="Jurusan"
                value={form.major}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
              />

              <input
                type="text"
                name="jobdesk"
                placeholder="Jobdesk"
                value={form.jobdesk}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
              />

              <input
                type="text"
                name="phone"
                placeholder="Nomor HP"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
              />
            </div>
          </section>

          {/* PERIODE — Header seksi warna hijau */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#2d5a1b]">
                Periode Magang
              </h2>

              <p className="text-sm text-zinc-500">
                Tentukan tanggal mulai dan selesai magang.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Tanggal Mulai
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Tanggal Selesai
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
                />
              </div>
            </div>
          </section>

          {/* PASSWORD — Header seksi warna hijau */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#2d5a1b]">
                Password
              </h2>

              <p className="text-sm text-zinc-500">
                Ganti password default akun anda.
              </p>
            </div>

            <div className="space-y-4">

              <input
                type="password"
                name="old_password"
                placeholder="Password Lama"
                value={form.old_password}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
              />

              <input
                type="password"
                name="new_password"
                placeholder="Password Baru"
                value={form.new_password}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
              />

              <input
                type="password"
                name="confirm_password"
                placeholder="Konfirmasi Password Baru"
                value={form.confirm_password}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm placeholder-zinc-400 outline-none transition-all duration-200 hover:border-[#5a8a2d] focus:border-[#2d5a1b] focus:ring-1 focus:ring-[#2d5a1b] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f0fdf4_inset_!important]"
              />
            </div>

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
              <p className="text-[11px] text-[#2d5a1b] font-bold mt-1">Password kuat</p>
            )}
          </section>

          {/* MESSAGE */}
          {message && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 font-medium text-center">
              {message}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2d5a1b] py-3 text-sm font-bold text-white transition-all hover:bg-[#204013] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
          >
            {loading ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </div>
    </main>
  )
}