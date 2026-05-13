'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      const data = await response.json()

      console.log("Response:", response.ok, data)  // tambah ini
      
      if (!response.ok) {
        setError(data.error)
        return
      }

      router.push("/login")

    } catch {
      setError("Terjadi kesalahan. Periksa koneksi internetmu.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <main>
      <h1>Hello Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}