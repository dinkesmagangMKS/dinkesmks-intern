"use client"

import { useEffect, useState } from "react"
import type { InternWithStatus } from "@/types"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function InternPage() {
  const [loading, setLoading] = useState(true)
  const [interns, setInterns] = useState<InternWithStatus[]>([])
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([])

  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    divisionId: ""
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")

  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!showModal) return

    const fetchDivisions = async () => {
      const response = await fetch("/api/divisions")
      const data = await response.json()
      setDivisions(data)
    }

    fetchDivisions()
  }, [showModal])

  const handleTambahIntern = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalLoading(true)
    setModalError("")

    try {
      const response = await fetch("/api/interns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (!response.ok) {
        setModalError(data.error)
        return
      }

      setShowModal(false)
      fetchInterns()  // refresh list
    } catch {
      setModalError("Terjadi kesalahan.")
    } finally {
      setModalLoading(false)
    }
  }

  const [filterStatus, setFilterStatus] = useState<
    "SEMUA" | "ACTIVE" | "PENDING" | "FINISHED"
  >("SEMUA")

  const [filterDivisi, setFilterDivisi] = useState<
    "SAYA" | "SEMUA"
  >("SAYA")

  // FETCH DATA
  const fetchInterns = async () => {
    try {
      setLoading(true)
      const query = filterDivisi === "SEMUA" ? "?divisi=semua" : ""
      const response = await fetch(`/api/interns${query}`)
      const data = await response.json()
      setInterns(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
    useEffect(() => {
      fetchInterns()
    }, [filterDivisi])  // saat filter divisi berubah


  // FILTER
  const filteredInterns = interns.filter(intern => {
    const statusMatch =
      filterStatus === "SEMUA" ? true : intern.status === filterStatus

    const searchMatch =
      search === ""
        ? true
        : intern.name.toLowerCase().includes(search.toLowerCase()) ||
          (intern.profile?.university ?? "").toLowerCase().includes(search.toLowerCase())

    return statusMatch && searchMatch
  })

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              Intern
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Kelola data intern dan monitoring status magang.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            + Tambah Intern
          </button>
        </div>

        {/* FILTER */}
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 md:flex-row md:items-center md:justify-between">

          {/* TOGGLE DIVISI */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterDivisi("SAYA")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                filterDivisi === "SAYA"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Divisi Saya
            </button>

            <button
              onClick={() => setFilterDivisi("SEMUA")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                filterDivisi === "SEMUA"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Semua Divisi
            </button>
          </div>

          <Input
            placeholder="Cari nama atau universitas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-xs border-zinc-200 focus-visible:ring-zinc-400 focus-visible:ring-1 w-full md:w-56"
          />

          {/* FILTER STATUS */}
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as
                  | "SEMUA"
                  | "ACTIVE"
                  | "PENDING"
                  | "FINISHED"
              )
            }
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 focus:border-zinc-900 focus:outline-none"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="FINISHED">Finished</option>
          </select>
        </div>

        {/* LIST INTERN */}
        <div className="rounded-2xl border border-zinc-200 bg-white">
          {loading ? (
            <div className="p-6 text-sm text-zinc-500">
              Memuat data intern...
            </div>
          ) : filteredInterns.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500">
              Tidak ada data intern.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredInterns.map((intern) => (
                <div
                  key={intern.id}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-zinc-900">
                      {intern.name}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      {intern.profile?.university ?? "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {intern.division?.name ?? "-"}
                    </span>

                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-medium ${
                        intern.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : intern.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {intern.status}
                    </span>

                    <Link
                      href={`/admin/intern/${intern.id}`}
                      className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL DUMMY */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              
              <h2 className="text-xl font-semibold text-zinc-900">Tambah Intern</h2>
              <form
                onSubmit={handleTambahIntern}
                className="mt-6 space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Nama Lengkap
                  </label>

                  <input
                    placeholder="Masukkan nama lengkap"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-200 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="contoh@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-200 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Password Awal
                  </label>

                  <input
                    type="password"
                    placeholder="Masukkan password awal"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-200 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">
                    Division
                  </label>

                  <select
                    value={form.divisionId}
                    onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 focus:border-zinc-900 focus:outline-none"
                    required
                  >
                    <option value="">Pilih Divisi</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>

                {modalError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {modalError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-2xl border border-zinc-300 bg-white py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="flex-1 rounded-2xl bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {modalLoading
                      ? "Menyimpan..."
                      : "Tambah Intern"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </div>
    </main>
  )
}