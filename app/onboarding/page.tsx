"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setMessage("")

    try {
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
          password: form.new_password,
          photo_url: null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal submit onboarding")
      }

      setMessage("Onboarding berhasil!")
      router.push("/intern/dashboard")
      console.log(result)
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Lengkapi Profil
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Lengkapi data diri untuk melanjutkan ke dashboard intern.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* FOTO */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
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
              className="block w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
            />
          </section>

          {/* DATA DIRI */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
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
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />

              <input
                type="text"
                name="major"
                placeholder="Jurusan"
                value={form.major}
                onChange={handleChange}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />

              <input
                type="text"
                name="jobdesk"
                placeholder="Jobdesk"
                value={form.jobdesk}
                onChange={handleChange}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />

              <input
                type="text"
                name="phone"
                placeholder="Nomor HP"
                value={form.phone}
                onChange={handleChange}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </section>

          {/* PERIODE */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* PASSWORD */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
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
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />

              <input
                type="password"
                name="new_password"
                placeholder="Password Baru"
                value={form.new_password}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />

              <input
                type="password"
                name="confirm_password"
                placeholder="Konfirmasi Password Baru"
                value={form.confirm_password}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </section>

          {/* MESSAGE */}
          {message && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
              {message}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </div>
    </main>
  )
}