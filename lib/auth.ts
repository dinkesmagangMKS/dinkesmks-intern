import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import type { JwtPayload } from "@/types"
import { getEnv } from "./env"

const COOKIE_NAME = "ims_token"

// BUAT TOKEN
export function signToken(payload: JwtPayload): string {
  const { JWT_SECRET } = getEnv()
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" })
}

// VERIFIKASI TOKEN
export function verifyToken(token: string): JwtPayload {
  const { JWT_SECRET } = getEnv()
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

// COOKIE HELPERS
// Simpan token ke cookie — dipanggil saat login berhasil
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,    // tidak bisa diakses JavaScript di browser
    secure: process.env.NODE_ENV === "production",  // https only di production
    sameSite: "strict", // tidak dikirim dari domain lain
    maxAge: 60 * 60 * 8 // 8 jam dalam detik
  })
}

// Hapus cookie — dipanggil saat logout
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Ambil dan verifikasi token dari cookie sekaligus
// Dipakai di API route untuk tahu siapa yang request
export async function getSessionUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  try {
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    // Token ada tapi tidak valid / expired
    return null
  }
}