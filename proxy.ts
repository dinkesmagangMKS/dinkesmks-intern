import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "ims_token"

function decodeToken(token: string) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = parts[1]
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=")
    const decoded = atob(padded)
    const parsed = JSON.parse(decoded)

    // Cek kadaluarsa token
    const currentTime = Math.floor(Date.now() / 1000)
    if (parsed.exp && parsed.exp < currentTime) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  // 1. Jika tidak ada token
  if (!token) {
    // Jika mengakses route terproteksi, arahkan ke login
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Jika mengakses /login tanpa token, biarkan lanjut
    return NextResponse.next()
  }

  // 2. Ada token, decode payload-nya
  const payload = decodeToken(token)

  // Jika token tidak valid / expired
  if (!payload || !payload.role) {
    if (pathname !== "/login") {
      const response = NextResponse.redirect(new URL("/login", request.url))
      // Hapus cookie yang tidak valid/expired
      response.cookies.delete(COOKIE_NAME)
      return response
    }
    return NextResponse.next()
  }

  const { role, isFirstLogin } = payload

  // 3. Jika mengakses /login tapi sudah login, arahkan ke dashboard masing-masing
  if (pathname === "/login") {
    if (role === "INTERN") {
      if (isFirstLogin) {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
      return NextResponse.redirect(new URL("/intern/dashboard", request.url))
    } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  // 4. Proteksi route silang (Cross-access protection)
  // Admin/Super Admin tidak boleh masuk ke /intern atau /onboarding
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    if (pathname.startsWith("/intern") || pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  // Intern tidak boleh masuk ke /admin
  if (role === "INTERN") {
    if (pathname.startsWith("/admin")) {
      if (isFirstLogin) {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
      return NextResponse.redirect(new URL("/intern/dashboard", request.url))
    }
    
    // Jika intern sudah bukan first login, jangan biarkan masuk onboarding
    if (pathname.startsWith("/onboarding") && !isFirstLogin) {
      return NextResponse.redirect(new URL("/intern/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Jalankan proxy untuk route terproteksi dan halaman login
  matcher: [
    "/admin/:path*",
    "/intern/:path*",
    "/onboarding/:path*",
    "/login"
  ]
}