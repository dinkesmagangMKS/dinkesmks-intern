import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "ims_token"

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  // Tidak ada token maka paksa ke login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Ada token = lanjut
  // Verifikasi detail (role, dll) dilakukan di masing-masing API route
  return NextResponse.next()
}

export const config = {
  // Middleware hanya jalan di route ini
  matcher: [
    "/admin/:path*",
    "/intern/:path*",
    "/onboarding/:path*"
  ]
}