import { NextResponse } from "next/server"
import { getSessionUser, signToken, setAuthCookie } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request:Request) {
  try {
    const { 
      university, 
      major,
      jobdesk,
      phone, 
      start_date,
      end_date,
      old_password,
      password,
      photo_url,
    } = await request.json()

    const user = await getSessionUser()
    if (!user || user.role !== "INTERN" || !user.isFirstLogin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = user.userId

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    if (!university || !major || !jobdesk || !start_date || !end_date || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      )
    }

    const passwordMatch = await bcrypt.compare(old_password, existingUser!.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Password lama tidak sesuai" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({ 
        where: { id: userId },
        data: {
          password: hashedPassword,
          is_first_login: false
        }
      }),
      prisma.internProfile.create({ 
        data: {
          user_id: userId,
          university,
          major,
          jobdesk,
          phone, 
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          photo_url,
        }
      })
    ])

    // Setelah transaction berhasil, update token
    const newToken = signToken({
      userId: user.userId,
      role: user.role,
      isFirstLogin: false
    })
    await setAuthCookie(newToken)

    return NextResponse.json({ success: true })
  } catch(error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    )
  }
}