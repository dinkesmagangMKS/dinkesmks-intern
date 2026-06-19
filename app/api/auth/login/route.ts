import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signToken, setAuthCookie } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    //Ambil data dari request body
    const { email, password } = await request.json()

    //Validasi input — jangan sampai query DB dengan data kosong
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      )
    }

    //Cari user di database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    //User tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      )
    }

    //Cek password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      )
    }

    //Buat JWT token
    const token = signToken({
      userId: user.id,
      role: user.role,
      isFirstLogin: user.is_first_login,
      divisionId: user.division_id
    })

    //Simpan ke HTTP-only cookie
    await setAuthCookie(token)

    //Kembalikan response sukses + info untuk redirect
    return NextResponse.json({
      role: user.role,
      isFirstLogin: user.is_first_login
    })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    )
  }
}