import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const user = await getSessionUser()

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { new_password } = await request.json()

    if (!new_password) {
      return NextResponse.json(
        { error: "Password baru wajib diisi." },
        { status: 400 }
      )
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 }
      )
    }

    // Cari intern
    const intern = await prisma.user.findUnique({
      where: { id, role: "INTERN" }  // pastikan yang direset adalah intern
    })

    if (!intern) {
      return NextResponse.json(
        { error: "Intern tidak ditemukan." },
        { status: 404 }
      )
    }

    // ADMIN hanya bisa reset intern divisinya sendiri
    if (user.role === "ADMIN" && intern.division_id !== user.divisionId) {
      return NextResponse.json(
        { error: "Kamu hanya bisa reset password intern divisimu sendiri." },
        { status: 403 }
      )
    }

    const hashedPassword = await bcrypt.hash(new_password, 10)

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan." },
      { status: 500 }
    )
  }
}